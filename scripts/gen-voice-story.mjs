import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import { STORY } from "../src/story.ts";

const VOICE = "Kore";
const MODEL = "gemini-3.8-flash-tts";
const STYLE = "santai, ramah, seperti bercerita ke teman, intonasi hidup";

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

async function bikin(text) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text, speechMetadata: { style: STYLE } }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { voice: VOICE } },
    },
  });
  const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("tidak ada audio di respons");
  return toWav(Buffer.from(b64, "base64"));
}

fs.mkdirSync("public/audio", { recursive: true });
const timing = {};

for (const f of STORY) {
  for (let i = 0; i < f.bagian.length; i++) {
    const id = `${f.id}-${i + 1}`;
    const out = `public/audio/${id}.wav`;
    try {
      let wav;
      if (fs.existsSync(out)) {
        wav = fs.readFileSync(out);
      } else {
        wav = await bikin(f.bagian[i].narasi);
        fs.writeFileSync(out, wav);
        await sleep(2000);
      }
      timing[id] = Math.round(wavSeconds(wav) * 100) / 100;
      console.log(`${id}: ${timing[id]}s`);
    } catch (e) {
      console.error("GAGAL", id, e.message);
      fs.writeFileSync("src/timing-story.json", JSON.stringify(timing, null, 2));
      process.exit(1);
    }
  }
}

fs.writeFileSync("src/timing-story.json", JSON.stringify(timing, null, 2));
const total = Object.values(timing).reduce((a, b) => a + b, 0);
console.log(`Selesai. Total suara: ${total.toFixed(1)} detik. Hasil di src/timing-story.json`);
