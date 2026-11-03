/* BGM sintesis sendiri: ambient sinematik D minor, 60 detik stereo 44.1kHz 16-bit. */
import fs from "node:fs";

const RATE = 44100;
const DUR = 60;
const N = RATE * DUR;
const L = new Float64Array(N);
const R = new Float64Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const D3 = 50, A2 = 45, Bb2 = 46, F2 = 41, C3 = 48, D4 = 62;

/* Progresi 4 akord × 7,5 s, resolusi ke D mayor di 54–60. */
const CHORDS = [
  { t: 0, dur: 7.5, root: D3, notes: [D3, A2 + 12, F2 + 24, A2 + 24] }, // Dm
  { t: 7.5, dur: 7.5, root: Bb2, notes: [Bb2, F2 + 12, D3 + 12, F2 + 24] }, // Bb
  { t: 15, dur: 7.5, root: F2, notes: [F2, C3, A2 + 12, C3 + 12] }, // F
  { t: 22.5, dur: 7.5, root: C3, notes: [C3, 55, 60, 64] }, // C
  { t: 30, dur: 7.5, root: D3, notes: [D3, 57, 62, 65] }, // Dm
  { t: 37.5, dur: 7.5, root: Bb2, notes: [Bb2, 53, 58, 62] }, // Bb
  { t: 45, dur: 7.5, root: F2, notes: [F2, 48, 57, 60] }, // F (hangat)
  { t: 52.5, dur: 7.5, root: D3, notes: [D3, 54, 57, 62] }, // D mayor (resolusi)
];

/* Dinamika per detik (envelope global), mengikuti video. */
function energy(t) {
  if (t < 7) return 0.55;
  if (t < 17) return 0.68;
  if (t < 29) return 0.8;
  if (t < 43) return 1.0;
  if (t < 54) return 0.78;
  return 0.7;
}

function fadeEnv(t) {
  const fin = Math.min(1, t / 1.5); // hindari klik di awal
  const fout = Math.min(1, (60 - t) / 3); // fade out 3 detik terakhir
  return fin * fout;
}

/* Low-pass satu kutub (deterministik). */
function lowpass(buf, cutoff) {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / RATE);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += a * (buf[i] - y);
    buf[i] = y;
  }
}

/* ---- Pad: beberapa sine/triangle detune per akord, attack/release lambat ---- */
for (const ch of CHORDS) {
  const s0 = Math.round(ch.t * RATE);
  const len = Math.round(Math.min(ch.dur + 1.5, DUR - ch.t) * RATE);
  for (const [vi, note] of ch.notes.entries()) {
    const f = midi(note);
    const detunes = [-0.18, 0, 0.18];
    const voice = new Float64Array(len);
    detunes.forEach((cents, k) => {
      const freq = f * Math.pow(2, cents / 1200);
      const phase = (vi * 1.7 + k * 2.3) % (2 * Math.PI);
      const tri = k === 1;
      for (let i = 0; i < len; i++) {
        const p = (2 * Math.PI * freq * i) / RATE + phase;
        voice[i] += tri
          ? (2 / Math.PI) * Math.asin(Math.sin(p)) * 0.35
          : Math.sin(p) * 0.3;
      }
    });
    lowpass(voice, 1400 - vi * 120);
    for (let i = 0; i < len; i++) {
      const t = i / RATE;
      const atk = Math.min(1, t / 2.2);
      const rel = Math.min(1, t / ch.dur) >= 1 ? Math.max(0, 1 - (t - ch.dur) / 1.5) : 1;
      const g = atk * rel * 0.055;
      const gs = i / len;
      const pan = 0.5 + 0.25 * Math.sin(vi * 2.1);
      L[s0 + i] += voice[i] * g * (1 - pan * gs * 0.3);
      R[s0 + i] += voice[i] * g * (pan * gs * 0.3 + 0.7);
    }
  }
}

/* ---- Bass sine di nada akar ---- */
for (const ch of CHORDS) {
  const s0 = Math.round(ch.t * RATE);
  const len = Math.round(Math.min(ch.dur, DUR - ch.t) * RATE);
  const f = midi(ch.root - 12);
  for (let i = 0; i < len; i++) {
    const t = i / RATE;
    const atk = Math.min(1, t / 0.35);
    const rel = Math.max(0, 1 - Math.max(0, t - (ch.dur - 0.6)) / 0.6);
    const s = Math.sin(2 * Math.PI * f * t) * atk * rel * 0.16;
    L[s0 + i] += s;
    R[s0 + i] += s;
  }
}

/* ---- Denyut lembut (0–7 s) ---- */
{
  const f = midi(D3 - 24);
  for (let b = 0; b < 7; b++) {
    const s0 = Math.round(b * RATE);
    for (let i = 0; i < RATE * 0.5; i++) {
      const t = i / RATE;
      const e = Math.exp(-t * 3.5) * 0.1 * Math.min(1, t / 0.01);
      const s = Math.sin(2 * Math.PI * f * t) * e;
      L[s0 + i] += s;
      R[s0 + i] += s;
    }
  }
}

/* ---- Arpeggio pluck pentatonik D, mulai detik 7 ---- */
{
  const penta = [62, 65, 67, 69, 72, 74, 77]; // D F G A C D E
  const pattern = [0, 2, 4, 3, 1, 4, 2, 5];
  let step = 0;
  for (let t = 7; t < 57.5; t += 0.375) {
    const e = energy(t);
    if (t < 7 || (t >= 7 && t < 17 && step % 2 === 1)) {
      step++;
      continue; // 7–17: arpeggio ringan (setengah rapat)
    }
    const note = penta[pattern[step % pattern.length]];
    const f = midi(note);
    const s0 = Math.round(t * RATE);
    const len = Math.min(N - s0, Math.round(RATE * 0.9));
    const gain = 0.055 * e;
    const pan = step % 2 === 0 ? 0.35 : 0.65;
    for (let i = 0; i < len; i++) {
      const tt = i / RATE;
      const env = Math.exp(-tt * 6) * Math.min(1, tt / 0.008);
      const s = Math.sin(2 * Math.PI * f * tt) * env * gain;
      L[s0 + i] += s * (1 - pan);
      R[s0 + i] += s * pan;
    }
    step++;
  }
}

/* ---- Reverb sederhana: delay feedback ---- */
function reverb(input, taps) {
  const out = new Float64Array(N);
  for (const [ms, fb, mix] of taps) {
    const d = Math.round((ms / 1000) * RATE);
    for (let rep = 1; rep <= 3; rep++) {
      const off = d * rep;
      const g = mix * Math.pow(fb, rep - 1);
      for (let i = off; i < N; i++) out[i] += input[i - off] * g;
    }
  }
  return out;
}
const wetL = reverb(L, [[83, 0.6, 0.16], [137, 0.55, 0.13]]);
const wetR = reverb(R, [[97, 0.6, 0.16], [151, 0.55, 0.13]]);

/* ---- Mix, normalisasi puncak ke -14 dBFS, tulis WAV ---- */
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / RATE;
  const env = fadeEnv(t);
  L[i] = (L[i] + wetL[i]) * env;
  R[i] = (R[i] + wetR[i]) * env;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const target = Math.pow(10, -14 / 20);
const scale = peak > 0 ? target / peak : 0;
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const l = Math.max(-1, Math.min(1, L[i] * scale));
  const r = Math.max(-1, Math.min(1, R[i] * scale));
  data.writeInt16LE(Math.round(l * 32767), i * 4);
  data.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
}
const h = Buffer.alloc(44);
h.write("RIFF", 0);
h.writeUInt32LE(36 + data.length, 4);
h.write("WAVEfmt ", 8);
h.writeUInt32LE(16, 16);
h.writeUInt16LE(1, 20);
h.writeUInt16LE(2, 22);
h.writeUInt32LE(RATE, 24);
h.writeUInt32LE(RATE * 4, 28);
h.writeUInt16LE(4, 32);
h.writeUInt16LE(16, 34);
h.write("data", 36);
h.writeUInt32LE(data.length, 40);

fs.mkdirSync("public/audio/rumahbaru", { recursive: true });
fs.writeFileSync("public/audio/rumahbaru/bgm.wav", Buffer.concat([h, data]));
console.log(`bgm.wav: ${DUR}s, puncak ${(20 * Math.log10(scale * peak)).toFixed(1)} dBFS`);
