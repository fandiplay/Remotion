// Sintesis sound effect untuk IklanStadion (tanpa API, tanpa dependensi, bebas hak cipta).
// Jalankan dari root project:  node scripts/gen-sfx-iklanstadion.mjs
// Output: public/sfx/*.wav (mono, 44.1 kHz, 16-bit) + src/sfx-meta.json (durasi dalam frame @30fps).
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const FPS = 30;
const TAU = Math.PI * 2;

// RNG deterministik supaya hasil selalu sama
let seed = 1234567;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;

const make = (seconds, fn) => {
  const n = Math.floor(seconds * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i, n);
  return out;
};

// Sinus dengan frekuensi berubah (integrasi fase)
const sweep = (seconds, f, amp) => {
  let ph = 0;
  return make(seconds, (t) => {
    ph += (TAU * f(t)) / SR;
    return Math.sin(ph) * amp(t);
  });
};

// Band-pass state-variable filter untuk noise
const bandNoise = (seconds, fc, q, amp) => {
  let low = 0;
  let band = 0;
  return make(seconds, (t) => {
    const f = 2 * Math.sin((Math.PI * fc(t)) / SR);
    const high = noise() - low - q * band;
    band += f * high;
    low += f * band;
    return band * amp(t);
  });
};

const mix = (...tracks) => {
  const n = Math.max(...tracks.map((t) => t.length));
  const out = new Float32Array(n);
  for (const t of tracks) for (let i = 0; i < t.length; i++) out[i] += t[i];
  return out;
};

const place = (target, src, atSeconds) => {
  const off = Math.floor(atSeconds * SR);
  for (let i = 0; i < src.length && off + i < target.length; i++) target[off + i] += src[i];
};

const finish = (buf) => {
  // fade in 3 ms, fade out 15 ms, normalisasi puncak ke 0.8
  const fi = Math.floor(0.003 * SR);
  const fo = Math.floor(0.015 * SR);
  for (let i = 0; i < fi && i < buf.length; i++) buf[i] *= i / fi;
  for (let i = 0; i < fo && i < buf.length; i++) buf[buf.length - 1 - i] *= i / fo;
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0 ? 0.8 / peak : 1;
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
  return buf;
};

const wav = (buf) => {
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.max(-1, Math.min(1, buf[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};

const bell = (f0, seconds, partials = [1, 2.01, 3.02], decay = 5) =>
  make(seconds, (t) => {
    let s = 0;
    partials.forEach((p, i) => {
      s += Math.sin(TAU * f0 * p * t) * Math.exp(-t * (decay + i * 4)) / (i + 1);
    });
    return s;
  });

const SOUNDS = {
  // gelembung "pop" — Kepo muncul, kartu muncul
  pop: () =>
    mix(
      sweep(0.22, (t) => 250 + 700 * Math.exp(-t * 22), (t) => Math.exp(-t * 26)),
      make(0.22, (t) => noise() * Math.exp(-t * 300) * 0.3),
    ),

  // whoosh — transisi, kartu masuk dari samping
  whoosh: () =>
    bandNoise(
      0.7,
      (t) => 350 + 2200 * Math.sin((Math.PI * t) / 0.7),
      0.35,
      (t) => Math.pow(Math.sin((Math.PI * t) / 0.7), 1.6) * 1.2,
    ),

  // tick halus — kotak langkah, pergantian tahap
  tick: () =>
    mix(
      sweep(0.06, () => 1900, (t) => Math.exp(-t * 90)),
      make(0.06, (t) => noise() * Math.exp(-t * 180) * 0.25),
    ),

  // ding — momen penting (bagian 2 ms, Kepo paham)
  ding: () => bell(1174.7, 1.0, [1, 2.01, 3.02], 5),

  // swap — iklan berganti secara digital (tiga nada naik)
  swap: () => {
    const out = new Float32Array(Math.floor(0.5 * SR));
    [880, 1174.7, 1568].forEach((f, i) => {
      place(out, bell(f, 0.3, [1, 2], 9), i * 0.08);
    });
    return out;
  },

  // charge — pengisian bar timeline 18 ms (3 detik, naik pelan)
  charge: () =>
    mix(
      sweep(
        3.0,
        (t) => 180 * Math.pow(7, t / 3.0),
        (t) => Math.pow(t / 3.0, 1.5) * 0.7,
      ),
      bandNoise(
        3.0,
        (t) => 400 + 3000 * (t / 3.0),
        0.5,
        (t) => Math.pow(t / 3.0, 2) * 0.5,
      ),
    ),

  // zap — sinar kamera menangkap slot 2 ms
  zap: () =>
    mix(
      sweep(0.4, (t) => 300 + 2100 * Math.exp(-t * 10), (t) => Math.exp(-t * 9)),
      bandNoise(0.4, () => 3000, 0.6, (t) => Math.exp(-t * 14) * 0.4),
    ),

  // sparkle — penutup
  sparkle: () => {
    const out = new Float32Array(Math.floor(1.4 * SR));
    for (let i = 0; i < 14; i++) {
      const f = 2200 + rand() * 3200;
      place(out, bell(f, 0.35, [1, 2.7], 14).map((v) => v * (0.4 + rand() * 0.6)), i * 0.07 + rand() * 0.03);
    }
    return out;
  },

  // blip — garis koneksi tersambung
  blip: () => sweep(0.14, (t) => 1000 + 400 * (t / 0.14), (t) => Math.exp(-t * 28)),

  // lock — tracking terkunci (dua beep pendek)
  lock: () => {
    const out = new Float32Array(Math.floor(0.3 * SR));
    for (let i = 0; i < 2; i++) {
      place(out, sweep(0.08, () => 1500, (t) => Math.exp(-t * 30)), i * 0.12);
    }
    return out;
  },

  // power — server menyala
  power: () =>
    mix(
      sweep(0.8, (t) => 120 * Math.pow(4.2, t / 0.8), (t) => Math.min(1, t / 0.15) * Math.exp(-Math.max(0, t - 0.55) * 9)),
      sweep(0.8, (t) => 240 * Math.pow(4.2, t / 0.8), (t) => 0.4 * Math.min(1, t / 0.15) * Math.exp(-Math.max(0, t - 0.55) * 9)),
    ),
};

mkdirSync("public/sfx", { recursive: true });
const meta = {};
for (const [name, build] of Object.entries(SOUNDS)) {
  const buf = finish(build());
  writeFileSync(`public/sfx/${name}.wav`, wav(buf));
  const seconds = buf.length / SR;
  meta[name] = { seconds: Number(seconds.toFixed(3)), frames: Math.ceil(seconds * FPS) };
  console.log(`public/sfx/${name}.wav  ${seconds.toFixed(2)}s  ${meta[name].frames}f`);
}
writeFileSync("src/sfx-meta.json", JSON.stringify(meta, null, 2));
console.log("OK -> src/sfx-meta.json");
