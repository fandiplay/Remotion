/* Timeline tunggal dalam frame (30 fps, 2100 frame = 70 detik). Scene & subtitle membaca dari sini. */

export const FPS = 30;
export const DURATION = 2100;

export const SCENE_TIMES = {
  hook: { from: 0, name: "01 Hook" },
  chaos: { from: 240, name: "02 Kekacauan" },
  discover: { from: 690, name: "03 Menemukan KAND AI" },
  wallet: { from: 1020, name: "04 Dompet" },
  journal: { from: 1177, name: "05 Jurnal" },
  learn: { from: 1335, name: "06 Belajar" },
  reminder: { from: 1492, name: "07 Pengingat" },
  outro: { from: 1650, name: "08 Kehidupan Teratur" },
} as const;

/* Subtitle wajib sinkron dengan frame. Satu baris per cue, pendek supaya terbaca di 9:16. */
export type Cue = { text: string; from: number; to: number };

export const SUBTITLES: Cue[] = [
  { text: "Pagi lagi. Notifikasi lagi.", from: 10, to: 66 },
  { text: "Tugas menumpuk, semuanya terasa mendesak.", from: 66, to: 132 },
  { text: "Raka: 'Kepalaku penuh... dan uangku habis.'", from: 132, to: 232 },

  { text: "Uang jajan hilang tanpa jejak.", from: 250, to: 345 },
  { text: "Pikiran menumpuk, tak ada tempat bercerita.", from: 345, to: 455 },
  { text: "Belajar? Buku menumpuk, arahnya kabur.", from: 455, to: 560 },
  { text: "Jadwal bentrok. Ada janji yang terlewat.", from: 560, to: 680 },

  { text: "Lalu Raka menemukan KAND AI.", from: 700, to: 800 },
  { text: "Satu asisten untuk semua hal harianmu.", from: 800, to: 900 },
  { text: "Cukup cerita. KAND AI yang merapikan.", from: 900, to: 1010 },

  { text: "Dompet: atur uang, catat cukup lewat chat.", from: 1030, to: 1120 },
  { text: "Tahu ke mana setiap rupiah pergi.", from: 1120, to: 1170 },

  { text: "Jurnal: tulis pikiran, ringankan kepala.", from: 1187, to: 1275 },
  { text: "Ceritamu tersimpan rapi dan terstruktur.", from: 1275, to: 1328 },

  { text: "Belajar: roadmap pribadi dan tutor siap bantu.", from: 1345, to: 1435 },
  { text: "Kuis ber-XP bikin semangat naik terus.", from: 1435, to: 1485 },

  { text: "Pengingat: jadwal penting takkan terlewat.", from: 1502, to: 1590 },
  { text: "Semua aktivitas ada di satu tempat.", from: 1590, to: 1642 },

  { text: "Sekarang hidup Raka lebih ringan.", from: 1665, to: 1760 },
  { text: "Teratur, tenang, dan tetap berkembang.", from: 1760, to: 1850 },
  { text: "KAND AI - teman tumbuhmu setiap hari.", from: 1850, to: 1975 },
  { text: "Mulai sekarang di kandai.my.id", from: 1975, to: 2098 },
];
