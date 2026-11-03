import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import { CUES } from "../src/rumahbaru-cues.ts";

const VOICE = "Kore";
const STYLE = "narator edukasi sinematik, tenang, jelas, penuh rasa ingin tahu";
const MAX_RATE_WAIT = 120; // detik; di atas ini model dianggap habis

/* Prioritas model (dicocokkan ke ID asli dari ai.models.list()). */
const PREFERRED = [
  "3.8-flash-lite-tts",
  "3.8-flash-tts",
  "3.1-flash-tts",
  "2.5-flash",
  "2.5-pro",
];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toWav(buf) {
  if (buf.slice(0, 4).toString() === "RIFF") return buf;
  const rate = 24000, ch = 1, bits = 16;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + buf.length, 4);
  h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * ch * bits / 8, 28);
  h.writeUInt16LE(ch * bits / 8, 32); h.writeUInt16LE(bits, 34);
  h.write("data", 36); h.writeUInt32LE(buf.length, 40);
  return Buffer.concat([h, buf]);
}

function wavSeconds(b) {
  const byteRate = b.readUInt32LE(28);
  const i = b.indexOf("data");
  const size = Math.min(b.readUInt32LE(i + 4), b.length - i - 8);
  return size / byteRate;
}

/* Buang keheningan awal/akhir, sisakan ~80 ms. */
function trimSilence(wav) {
  const ch = wav.readUInt16LE(22);
  const bits = wav.readUInt16LE(34);
  const rate = wav.readUInt32LE(24);
  const i = wav.indexOf("data");
  const start = i + 8;
  const size = Math.min(wav.readUInt32LE(i + 4), wav.length - start);
  const step = (ch * bits) / 8;
  const frames = Math.floor(size / step);
  const peak = (f) =>
    Math.max(...Array.from({ length: ch }, (_, c) => Math.abs(wav.readInt16LE(start + f * step + c * 2))));
  const threshold = 0.02 * 32768;
  let a = 0;
  while (a < frames && peak(a) < threshold) a++;
  let b = frames - 1;
  while (b > a && peak(b) < threshold) b--;
  if (a > b) return wav;
  const pad = Math.round(0.08 * rate);
  a = Math.max(0, a - pad);
  b = Math.min(frames - 1, b + pad);
  const body = wav.subarray(start + a * step, start + (b + 1) * step);
  const out = Buffer.concat([wav.subarray(0, start), body]);
  out.writeUInt32LE(start - 8 + body.length, 4);
  out.writeUInt32LE(body.length, i + 4);
  return out;
}

/* Model 3.x: style di speechMetadata. Model 2.5: prebuilt voice + style di teks. */
function request(model, text, fmt) {
  const config = { responseModalities: ["AUDIO"] };
  const parts =
    fmt === "metadata"
      ? [{ text, speechMetadata: { style: STYLE } }]
      : [{ text: `${STYLE}. ${text}` }];
  config.speechConfig =
    fmt === "metadata"
      ? { voiceConfig: { voice: VOICE } }
      : { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } };
  return ai.models.generateContent({ model, contents: [{ role: "user", parts }], config });
}

async function bikin(model, text, fmt) {
  const res = await request(model, text, fmt);
  const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("tidak ada audio di respons");
  return trimSilence(toWav(Buffer.from(b64, "base64")));
}

function tidur(s) {
  return new Promise((r) => setTimeout(r, s * 1000));
}

function parseErr(e) {
  const msg = String(e?.message ?? "");
  const status = Number(e?.status ?? (msg.match(/"code":\s*(\d+)/) ?? [])[1] ?? 0);
  const retryDelay = Number((msg.match(/"retryDelay":"([\d.]+)s"/) ?? [])[1] ?? 0);
  const quotaId = (msg.match(/"quotaId":"([^"]+)"/) ?? [])[1] ?? "";
  return { status, retryDelay, quotaId };
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY kosong. Berhenti.");
    process.exit(1);
  }

  const found = [];
  for await (const m of await ai.models.list()) {
    if (/tts/i.test(m.name ?? "")) found.push(String(m.name).replace(/^models\//, ""));
  }
  const models = PREFERRED.map((p) => found.find((n) => n.includes(p))).filter(Boolean);
  if (!models.length) {
    console.error("Tidak ada model TTS di akun ini.");
    process.exit(1);
  }
  console.log(`Model terdeteksi: ${models.join(", ")}`);

  const alive = models.map((id) => ({ id, dead: false }));
  fs.mkdirSync("public/audio/rumahbaru", { recursive: true });

  const timingPath = "src/rumahbaru-timing.json";
  const timing = {}; // dibangun ulang dari file yang benar-benar ada
  const belum = [];

  for (let i = 0; i < CUES.length; i++) {
    const id = `vo-${String(i + 1).padStart(2, "0")}`;
    const out = `public/audio/rumahbaru/${id}.wav`;
    const text = CUES[i].text;

    if (fs.existsSync(out)) {
      timing[id] = Math.round(wavSeconds(fs.readFileSync(out)) * 100) / 100;
      console.log(`${id}: ${timing[id]}s (cache)`);
      continue;
    }

    let done = false;
    for (const m of alive) {
      if (m.dead || done) continue;
      const is25 = m.id.includes("2.5");
      const formats = is25 ? ["prebuilt", "metadata"] : ["metadata", "prebuilt"];

      let skipModel = false;
      for (let f = 0; f < formats.length && !done && !skipModel; f++) {
        const fmt = formats[f];
        let attempt = 0;
        while (!done) {
          try {
            const wav = await bikin(m.id, text, fmt);
            fs.writeFileSync(out, wav);
            timing[id] = Math.round(wavSeconds(wav) * 100) / 100;
            fs.writeFileSync(timingPath, JSON.stringify(timing, null, 2));
            console.log(`${id}: ${timing[id]}s · ${m.id} · ${fmt}`);
            done = true;
          } catch (e) {
            const { status, retryDelay, quotaId } = parseErr(e);
            if (status === 429) {
              if (/PerDay/.test(quotaId) || retryDelay > MAX_RATE_WAIT) {
                m.dead = true;
                console.error(`${id}: ${m.id} habis (${/PerDay/.test(quotaId) ? "PerDay" : `retry ${retryDelay}s`})`);
                skipModel = true;
                break; // model berikutnya
              }
              console.error(`${id}: ${m.id} 429, tunggu ${retryDelay + 3}s lalu model berikutnya`);
              await tidur(retryDelay + 3);
              skipModel = true;
              break; // model berikutnya
            }
            if (status === 400) {
              if (f === 0) {
                console.error(`${id}: ${m.id} format ${fmt} ditolak, coba format lain`);
                break; // format berikutnya
              }
              console.error(`${id}: ${m.id} ditolak semua format, lewati model`);
              break;
            }
            if (status === 500 || status === 503) {
              if (attempt < 2) {
                attempt++;
                console.error(`${id}: ${m.id} ${status}, ulang ${attempt}/2`);
                await tidur(5000 * attempt);
                continue;
              }
              console.error(`${id}: ${m.id} ${status} terus, pindah model`);
              skipModel = true;
              break;
            }
            console.error(`${id}: ${m.id} gagal (${status || "?"}): ${String(e?.message).slice(0, 120)}`);
            break;
          }
        }
      }
    }

    if (!done) belum.push(id);
    await tidur(3);
  }

  const sisa = CUES.map((_, i) => `vo-${String(i + 1).padStart(2, "0")}`).filter(
    (id) => !fs.existsSync(`public/audio/rumahbaru/${id}.wav`),
  );
  if (sisa.length) console.log(`Belum jadi (${sisa.length}): ${sisa.join(", ")}`);
  else console.log("Semua cue selesai.");
}

main().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
