import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const VOICE_ID = "laras";
const MODEL = "simba-3.0";
const LANGUAGE = "id-ID"; // kosong = tanpa param language
const SPEECH_OVERRIDES: Record<string, string> = {}; // kata -> ejaan TTS; subtitle tetap teks asli

const API = "https://api.speechify.ai/v1/audio/stream";
const FPS = 30;
const SCRIPT_FILE = "scripts/vo-script.json";
const MANIFEST_FILE = "scripts/vo-manifest.json";
const TIMING_FILE = "src/vo-timing.json";
const OUT_DIR = "public/vo/iklanstadion";
const MAX_RATE = 1.15;
const TRIM_FILTER =
  "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse";

type VoScript = {
  fps: number;
  scenes: { no: string; from: number; dur: number; lines: string[] }[];
};

type Timing = {
  key: string;
  scene: string;
  idx: number;
  text: string;
  file: string;
  from: number;
  durationInFrames: number;
  cueFrom: number;
  cueTo: number;
  rate: number;
};

type Manifest = Record<string, { hash: string; trimmed?: boolean }>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const toTtsText = (text: string): string => {
  let t = text.replace(/\*/g, "");
  for (const [word, spelling] of Object.entries(SPEECH_OVERRIDES)) {
    t = t.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), spelling);
  }
  return t;
};

const hashOf = (ttsText: string): string =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify({ voice: VOICE_ID, model: MODEL, language: LANGUAGE, text: ttsText }))
    .digest("hex");

const requestAudio = async (input: string): Promise<Buffer> => {
  const body: Record<string, string> = { input, voice_id: VOICE_ID, model: MODEL };
  if (LANGUAGE) body.language = LANGUAGE;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SPEECHIFY_API_KEY}`,
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 3) {
      throw new Error(`Speechify ${res.status}: ${await res.text()}`);
    }
    console.log(`  HTTP ${res.status}, retry ${attempt}/2 setelah ${2 ** attempt} detik`);
    await sleep(2 ** attempt * 1000);
  }
};

/** Jalankan command, coba `remotion ffprobe/ffmpeg` lalu binary biasa. */
const runTool = (name: "ffprobe" | "ffmpeg", args: string[]): string => {
  const r = spawnSync("npx", ["remotion", name, ...args], { encoding: "utf8" });
  if (r.status === 0) return r.stdout ?? "";
  const f = spawnSync(name, args, { encoding: "utf8" });
  if (f.status === 0) return f.stdout ?? "";
  throw new Error(`${name} gagal: ${f.stderr || r.stderr || r.error?.message}`);
};

const durationOf = (file: string): number => {
  const out = runTool("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    file,
  ]);
  const sec = Number(out.trim().split("\n").pop());
  if (!Number.isFinite(sec) || sec <= 0) throw new Error(`Gagal membaca durasi ${file}`);
  return sec;
};

/** Potong hening awal/akhir, ganti file asli. */
const trimSilence = (file: string): void => {
  const tmp = file.replace(/\.mp3$/, ".trim.mp3");
  runTool("ffmpeg", ["-y", "-i", file, "-af", TRIM_FILTER, tmp]);
  fs.renameSync(tmp, file);
};

async function main() {
  if (!process.env.SPEECHIFY_API_KEY) throw new Error("SPEECHIFY_API_KEY belum ada di .env");

  const script: VoScript = JSON.parse(fs.readFileSync(SCRIPT_FILE, "utf8"));
  const fps = script.fps || FPS;
  const manifest: Manifest = fs.existsSync(MANIFEST_FILE)
    ? JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8"))
    : {};
  const saveManifest = () =>
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + "\n");
  const force = process.argv.includes("--force");

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const timing: Timing[] = [];

  for (const scene of script.scenes) {
    const audio = [];
    for (const [i, text] of scene.lines.entries()) {
      const idx = i + 1;
      const key = `${scene.no}-${idx}`;
      const name = `s${scene.no}-${idx}.mp3`;
      const path = `${OUT_DIR}/${name}`;
      const hash = hashOf(toTtsText(text));

      if (force || !fs.existsSync(path) || manifest[key]?.hash !== hash) {
        console.log(`[${key}] request TTS...`);
        fs.writeFileSync(path, await requestAudio(toTtsText(text)));
        manifest[key] = { hash };
        saveManifest();
      } else {
        console.log(`[${key}] skip request (hash sama)`);
      }

      if (!manifest[key]?.trimmed) {
        trimSilence(path);
        manifest[key] = { ...manifest[key], hash, trimmed: true };
        saveManifest();
        console.log(`[${key}] hening dipotong`);
      }

      const sec = durationOf(path);
      const audioFrames = Math.ceil(sec * fps);
      audio.push({ key, idx, text, name, sec, audioFrames });
      console.log(`  ${key} ${sec.toFixed(3)}s = ${audioFrames} frame`);
    }

    // rate per scene
    const n = audio.length;
    const available = scene.dur - 6 - 6 - 5 * (n - 1);
    const audioTotal = audio.reduce((a, b) => a + b.audioFrames, 0);
    const rate = Math.max(1, Math.ceil((audioTotal / available) * 100) / 100);
    if (rate > MAX_RATE) {
      console.error(
        `STOP: scene ${scene.no} butuh percepatan ${rate}x (> ${MAX_RATE}x). ` +
          `Audio total ${audioTotal} frame, tersedia ${available} frame, ` +
          `durasi audio ${(audioTotal / fps).toFixed(2)}s.`,
      );
      process.exit(1);
    }

    // jadwal scene
    const items = audio.map((a) => {
      const eff = Math.ceil(a.audioFrames / rate);
      return { ...a, eff };
    });
    let start = scene.from + 6;
    const sceneTiming: Timing[] = items.map((a, i) => {
      const end = start + a.eff;
      const next = items[i + 1];
      const nextStart = end + 5;
      const cueTo = next ? Math.min(end + 6, nextStart) : end + 6;
      const item: Timing = {
        key: a.key,
        scene: scene.no,
        idx: a.idx,
        text: a.text,
        file: `vo/iklanstadion/${a.name}`,
        from: start,
        durationInFrames: a.eff + 2,
        cueFrom: start,
        cueTo,
        rate,
      };
      start = nextStart;
      return item;
    });

    // validasi scene
    const limit = scene.from + scene.dur - 6;
    const last = sceneTiming[sceneTiming.length - 1];
    const lastEnd = last.from + last.durationInFrames - 2;
    if (lastEnd > limit) {
      console.error(
        `STOP: scene ${scene.no} kelebihan ${lastEnd - limit} frame (end ${lastEnd} > batas ${limit}).`,
      );
      process.exit(1);
    }
    for (let i = 1; i < sceneTiming.length; i++) {
      const prevEnd = sceneTiming[i - 1].from + sceneTiming[i - 1].durationInFrames - 2;
      if (sceneTiming[i].from < prevEnd) {
        console.error(
          `STOP: overlap di scene ${scene.no} antara ${sceneTiming[i - 1].key} dan ${sceneTiming[i].key}.`,
        );
        process.exit(1);
      }
    }

    console.log(`scene ${scene.no}: rate ${rate}x, ${audioTotal}/${available} frame`);
    timing.push(...sceneTiming);
  }

  fs.writeFileSync(TIMING_FILE, JSON.stringify(timing, null, 2) + "\n");
  console.log(`OK: ${timing.length} kalimat -> ${TIMING_FILE}`);
}

main().catch((e) => {
  console.error(String(e?.message ?? e));
  process.exit(1);
});
