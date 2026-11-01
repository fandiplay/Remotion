import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

/* VO promo Kand AI. Satu baris per scene; durasinya diukur lalu dibagi ke tiap scene di
   src/kandai-promo/vo.json. File WAV disimpan di public/voice-promo/ agar tidak memanggil API lagi. */

const MODEL = "gemini-3.8-flash-lite-tts";
const VOICE = "Kore";
const STYLE =
  "natural, warm, friendly Indonesian narration, pronunciation clear, calm and encouraging, medium pace, no shouting";

export const LINES = {
  hook: "Pagi lagi. Notifikasi menumpuk, tugas mendesak, uang menipis.",
  chaos: "Uang jajan habis tanpa jejak. Pikiran penuh tanpa tempat cerita. Belajar kehilangan arah. Dan jadwal penting terlewat.",
  discover: "Sampai Raka menemukan KAND AI. Satu asisten untuk semua hal hariannya. Cukup cerita, KAND AI yang merapikan.",
  wallet: "Dompet. Catat pengeluaranmu lewat chat.",
  journal: "Jurnal. Tulis pikiranmu, KAND AI merapikan.",
  learn: "Belajar. Roadmap dan tutor pribadi.",
  reminder: "Pengingat. Jadwal penting takkan terlewat lagi.",
  outro: "Sekarang hidup Raka lebih ringan, teratur, dan tenang. KAND AI, teman tumbuhmu setiap hari. Mulai di kandai.my.id.",
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const OUT = "public/voice-promo";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const wavSeconds = (b) => {
  const i = b.indexOf("data");
  return b.readUInt32LE(i + 4) / b.readUInt32LE(28);
};

async function speak(text) {
  const res = await ai.interactions.create({
    model: MODEL,
    input: [{ type: "text", text, annotations: [{ type: "speech_metadata", style: STYLE }] }],
    response_modalities: ["audio"],
    generation_config: { speech_config: [{ voice: VOICE, language: "id" }] },
  });
  const audio = res.output_audio;
  if (!audio?.data) throw new Error("respons tanpa output_audio");
  return Buffer.from(audio.data, "base64");
}

fs.mkdirSync(OUT, { recursive: true });
const vo = {};

for (const [id, text] of Object.entries(LINES)) {
  const file = `${OUT}/${id}.wav`;
  try {
    let wav;
    if (fs.existsSync(file)) {
      wav = fs.readFileSync(file);
    } else {
      wav = await speak(text);
      fs.writeFileSync(file, wav);
      await sleep(2000);
    }
    vo[id] = Math.round(wavSeconds(wav) * 1000) / 1000;
    console.log(`${id}: ${vo[id]}s`);
  } catch (e) {
    fs.writeFileSync("src/kandai-promo/vo.json", JSON.stringify(vo, null, 2));
    console.error("GAGAL", id, e.message);
    process.exit(1);
  }
}

fs.writeFileSync("src/kandai-promo/vo.json", `${JSON.stringify(vo, null, 2)}\n`);
console.log("Total:", Object.values(vo).reduce((a, b) => a + b, 0).toFixed(1), "detik");
