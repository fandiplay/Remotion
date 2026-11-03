/** Subtitle + naskah VO. Dipisah agar scripts/gen-voice-rumahbaru.mjs bisa membacanya. */

export type Cue = { start: number; end: number; text: string; hl: string[] };

export const CUES: Cue[] = [
  { start: 0.6, end: 3.6, text: "Kenapa sesuatu yang sangat kita inginkan,", hl: ["inginkan"] },
  { start: 3.6, end: 7.1, text: "justru terkadang tidak memberikan kepuasan?", hl: ["kepuasan"] },
  { start: 7.2, end: 9.5, text: "Karena otak punya dua sistem:", hl: ["dua", "sistem"] },
  { start: 9.5, end: 12.8, text: "Wanting: keinginan sebelum mendapatkan.", hl: ["wanting"] },
  { start: 12.8, end: 17.2, text: "Liking: kenikmatan saat mendapatkannya.", hl: ["liking"] },
  { start: 17.3, end: 20.8, text: "Selisihnya disebut Reward Prediction Error.", hl: ["reward", "prediction", "error"] },
  { start: 20.8, end: 24.4, text: "Lebih baik dari harapan: kejutan positif.", hl: ["kejutan", "positif"] },
  { start: 24.4, end: 26.3, text: "Sesuai: netral.", hl: ["netral"] },
  { start: 26.3, end: 29.1, text: "Lebih buruk? Kekecewaan.", hl: ["kekecewaan"] },
  { start: 29.1, end: 31.6, text: "Berproses: aturannya beda.", hl: ["aturannya", "beda"] },
  { start: 31.6, end: 33.4, text: "Goldilocks Rule.", hl: ["goldilocks", "rule"] },
  { start: 33.4, end: 36.3, text: "Tantangan terlalu mudah membuat bosan.", hl: ["mudah", "bosan"] },
  { start: 36.3, end: 38.8, text: "Terlalu sulit memicu kecemasan.", hl: ["sulit", "kecemasan"] },
  { start: 38.8, end: 42.9, text: "Titik optimalnya: sedikit di atas kemampuanmu.", hl: ["optimalnya", "sedikit", "atas"] },
  { start: 43.3, end: 46.4, text: "Jangan langsung kejar kesempurnaan.", hl: ["kesempurnaan"] },
  { start: 46.4, end: 49.6, text: "Pecah tantangan jadi langkah kecil,", hl: ["pecah", "kecil"] },
  { start: 49.6, end: 54.0, text: "lalu naikkan kesulitannya secara bertahap.", hl: ["naikkan", "bertahap"] },
  { start: 54.2, end: 55.9, text: "Kelola ekspektasi,", hl: ["ekspektasi"] },
  { start: 55.9, end: 57.7, text: "atur tantangan,", hl: ["tantangan"] },
  { start: 57.7, end: 59.9, text: "dan bangun kemajuan kecil.", hl: ["kemajuan"] },
];
