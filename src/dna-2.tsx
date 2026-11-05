/**
 * ============================================================================
 *  RUMAH PENASARAN — "Golden State Killer & Genetic Genealogy"
 *  File tunggal: src/dna.tsx   (tanpa voice over, hanya subtitle + visual)
 * ============================================================================
 *
 *  DAFTAR PENANDA WAKTU (sinkron dengan voice over 135.96 detik @ 30 fps)
 *  ----------------------------------------------------------------------------
 *  SCENE 1  HOOK            00:00.00 – 00:12.25
 *  SCENE 2  MISTERI 40 THN  00:12.25 – 00:32.00
 *  SCENE 3  SENJATA SAINS   00:32.00 – 00:53.70
 *  SCENE 4  SILSILAH        00:53.70 – 01:19.10
 *  SCENE 5  IDENTITAS       01:19.10 – 01:47.45
 *  SCENE 6  PENUTUP         01:47.45 – 02:15.96
 *
 *  Setiap kejadian visual diberi komentar `// 08.99s` = detik absolut di audio.
 *  Subtitle dibuat dari LINES (awal–akhir tiap kalimat, dari deteksi jeda audio).
 *  Kalau voice over diganti, cukup ubah angka di LINES, SIL, dan SCENES.
 *
 *  REGISTRASI di src/Root.tsx:
 *    import { DnaVideo, DNA_FPS, DNA_WIDTH, DNA_HEIGHT, DNA_DURATION_IN_FRAMES } from "./dna";
 *    <Composition id="Dna" component={DnaVideo} fps={DNA_FPS}
 *      width={DNA_WIDTH} height={DNA_HEIGHT} durationInFrames={DNA_DURATION_IN_FRAMES} />
 *
 *  AUDIO (opsional): taruh WAV di public/ lalu isi VOICE_SRC, mis. "voice-dna.wav".
 *  Biarkan null kalau suara ditambahkan di tempat lain.
 * ============================================================================
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  random,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "800"],
  subsets: ["latin"],
});

/* ------------------------------ KONFIGURASI ------------------------------ */
export const DNA_FPS = 30;
export const DNA_WIDTH = 1080;
export const DNA_HEIGHT = 1920;
const AUDIO_SECONDS = 135.96; // durasi voice over (WAV)
export const DNA_DURATION_IN_FRAMES = Math.ceil(AUDIO_SECONDS * DNA_FPS); // 4079

const VOICE_SRC: string | null = null; // contoh: "voice-dna.wav"
const DEBUG_MARKERS = false; // true = tampilkan waktu, nama scene, dan garis area aman

const FPS = DNA_FPS;
const C = {
  indigo: "#1E1B4B",
  purple: "#4C1D95",
  yellow: "#FBBF24",
  white: "#FFFFFF",
  pink: "#FB7185", // hanya untuk makna buruk / bahaya
} as const;
const SH = "#12103A"; // bayangan siluet (turunan indigo)
const OUTLINE = "rgba(255,255,255,0.25)";

/* -------------------------------- HELPER -------------------------------- */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ez = Easing.bezier(0.22, 1, 0.36, 1);
const prog = (t: number, a: number, d = 0.6) => ez(clamp01((t - a) / d));
const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const spr = (t: number, a: number) =>
  spring({
    frame: Math.max(0, (t - a) * FPS),
    fps: FPS,
    config: { damping: 12, stiffness: 150, mass: 0.7 },
  });

const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split("*").map((p, i) =>
      i % 2 === 1 ? (
        <span key={i} style={{ color: C.yellow }}>
          {p}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

/* ------------------------- SUBTITLE (dari voice over) ------------------------- */
// Interval hening hasil deteksi audio [mulai, selesai] dalam detik.
// Dipakai agar pergantian potongan subtitle jatuh tepat di jeda napas narator.
const SIL: [number, number][] = [
  [5.72, 6.05], [8.44, 8.99], [9.36, 9.56], [11.44, 13.07], [17.24, 17.57],
  [21.59, 21.79], [24.73, 25.02], [26.53, 26.75], [26.8, 27.27], [29.35, 29.73],
  [31.43, 32.58], [35.96, 36.25], [36.44, 36.66], [40.44, 40.91], [45.63, 45.85],
  [48.98, 49.42], [51.11, 51.5], [53.24, 54.23], [58.21, 58.65], [61.22, 61.6],
  [63.87, 64.5], [66.96, 67.29], [69.81, 70.29], [73.69, 73.93], [75.08, 75.79],
  [76.7, 77.03], [78.83, 79.38], [81.88, 82.08], [82.3, 82.54], [84.43, 85.15],
  [90.0, 90.26], [90.58, 90.9], [93.12, 93.89], [98.93, 99.33], [99.63, 99.89],
  [104.53, 104.78], [104.95, 105.46], [107.16, 107.76], [108.79, 109.21],
  [109.38, 109.8], [113.25, 113.71], [119.62, 120.15], [122.08, 122.63],
  [124.29, 124.61], [125.53, 126.08], [126.88, 127.73], [128.2, 128.5],
  [133.17, 133.43], [133.59, 134.18], [134.43, 134.7],
];

type Line = { s: number; e: number; chunks: string[] };
// `*kata*` = kuning. Maksimal 7 kata per potongan layar.
const LINES: Line[] = [
  // ---- BAGIAN 1 — HOOK
  { s: 0.23, e: 8.44, chunks: ["Kok bisa ya, seorang *pembunuh berantai*", "yang berhasil menghindari polisi", "selama *40 tahun*", "justru tertangkap gara-gara", "*DNA sepupu jauhnya*?"] },
  { s: 8.99, e: 11.44, chunks: ["Padahal, dia sendiri", "tidak pernah mengunggah *DNA*", "ke internet."] },
  // ---- BAGIAN 2 — MISTERI 40 TAHUN
  { s: 13.07, e: 17.24, chunks: ["Namanya *Joseph James DeAngelo*,", "dijuluki *Golden State Killer*."] },
  { s: 17.57, e: 21.59, chunks: ["Selama bertahun-tahun, dia melakukan", "puluhan pemerkosaan dan pembunuhan", "di *California*."] },
  { s: 21.79, e: 24.73, chunks: ["Dia memakai *sarung tangan*,", "menutupi wajah,", "dan menghindari meninggalkan *jejak*."] },
  { s: 25.02, e: 31.43, chunks: ["Namun, polisi menyimpan", "satu *bukti penting*:", "*DNA* dari lokasi kejahatan."] },
  // ---- BAGIAN 3 — SENJATA SAINS
  { s: 32.58, e: 35.96, chunks: ["Masalahnya, *DNA* itu", "tidak cocok dengan", "database kepolisian."] },
  { s: 36.25, e: 40.44, chunks: ["Lalu, penyidik menggunakan teknologi", "bernama *Genetic Genealogy*."] },
  { s: 40.91, e: 48.98, chunks: ["Berbeda dari metode *STR*", "yang biasa digunakan", "untuk identifikasi forensik,", "teknologi *SNP* membaca", "*ratusan ribu* variasi genetik."] },
  { s: 49.42, e: 53.24, chunks: ["Hasilnya bisa menunjukkan", "*hubungan keluarga*,", "bahkan dengan kerabat", "yang *sangat jauh*."] },
  // ---- BAGIAN 4 — MEMBONGKAR SILSILAH
  { s: 54.23, e: 58.21, chunks: ["*DNA pelaku* kemudian dibandingkan", "dengan data dari situs", "*silsilah genetik*."] },
  { s: 58.65, e: 61.22, chunks: ["Dan muncullah *kecocokan*", "dengan beberapa kerabat jauh."] },
  { s: 61.6, e: 63.87, chunks: ["Di sinilah pekerjaan", "*detektif* dimulai."] },
  { s: 64.5, e: 69.81, chunks: ["Mereka menelusuri *pohon keluarga*", "ke generasi sebelumnya,", "lalu memetakan keturunannya", "hingga *generasi sekarang*."] },
  { s: 70.29, e: 75.08, chunks: ["*Ratusan nama* diperiksa", "berdasarkan *usia*, *jenis kelamin*,", "dan *riwayat tempat tinggal*."] },
  { s: 75.79, e: 78.83, chunks: ["Sedikit demi sedikit,", "daftar *tersangka* semakin menyempit."] },
  // ---- BAGIAN 5 — IDENTITAS TERBONGKAR
  { s: 79.38, e: 84.43, chunks: ["Satu nama akhirnya", "menarik perhatian:", "*Joseph James DeAngelo*."] },
  { s: 85.15, e: 90.0, chunks: ["Namun, *kecocokan DNA kerabat*", "belum cukup untuk membuktikan", "bahwa dialah *pelakunya*."] },
  { s: 90.26, e: 93.12, chunks: ["Penyidik membutuhkan", "*sampel DNA langsung*."] },
  { s: 93.89, e: 98.93, chunks: ["Mereka kemudian mengumpulkan", "*barang yang dibuang* DeAngelo", "untuk mendapatkan *sampel biologisnya*."] },
  { s: 99.33, e: 104.53, chunks: ["Hasil pemeriksaan menunjukkan", "*kecocokan* dengan DNA", "dari tempat kejadian perkara."] },
  { s: 105.46, e: 107.16, chunks: ["Pada *April 2018*,", "dia akhirnya *ditangkap*."] },
  // ---- BAGIAN 6 — PENUTUP
  { s: 107.76, e: 113.25, chunks: ["Yang menarik,", "*DeAngelo* tidak perlu", "mengunggah DNA-nya sendiri."] },
  { s: 113.71, e: 119.62, chunks: ["*Informasi genetik kerabatnya*", "justru membantu membuka *identitas*", "yang selama puluhan tahun tersembunyi."] },
  { s: 120.15, e: 126.88, chunks: ["Inilah kekuatan *Genetic Genealogy*:", "menggabungkan *ilmu genetika*,", "*sejarah keluarga*,", "dan *investigasi*."] },
  { s: 127.73, e: 133.17, chunks: ["Ternyata, sebuah *rahasia keluarga*", "bisa membantu memecahkan", "*misteri kejahatan* puluhan tahun."] },
  { s: 133.43, e: 135.96, chunks: ["Besok penasaran *apa lagi*?"] },
];

type Cue = { a: number; b: number; text: string };
// Sebar potongan secara proporsional terhadap jumlah huruf, jeda hening dilewati.
const placeChunks = (ln: Line): Cue[] => {
  const sil = SIL.filter(([a, b]) => a >= ln.s && b <= ln.e);
  const silTotal = sil.reduce((s, [a, b]) => s + (b - a), 0);
  const speech = ln.e - ln.s - silTotal;
  const w = ln.chunks.map((c) => c.replace(/\*/g, "").length + 1);
  const wSum = w.reduce((s, x) => s + x, 0);
  let acc = 0;
  const starts = ln.chunks.map((_, i) => {
    let rem = (acc / wSum) * speech;
    acc += w[i];
    let cursor = ln.s;
    for (const [a, b] of sil) {
      const seg = a - cursor;
      if (rem < seg) break;
      rem -= seg;
      cursor = b;
    }
    return cursor + rem;
  });
  return ln.chunks.map((text, i) => ({
    a: starts[i],
    b: i < starts.length - 1 ? starts[i + 1] : ln.e + 0.25,
    text,
  }));
};
const CUES: Cue[] = LINES.flatMap(placeChunks);

const Subtitle: React.FC<{ t: number }> = ({ t }) => {
  const cue = CUES.find((c) => t >= c.a && t < c.b);
  if (!cue) return null;
  const o = prog(t, cue.a, 0.18);
  return (
    <div
      style={{
        position: "absolute", left: 60, top: 1305, width: 860, height: 190,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(30,27,75,0.78)", borderRadius: 28, padding: "18px 30px",
          textAlign: "center", fontWeight: 600, fontSize: 54, lineHeight: 1.2,
          color: C.white, opacity: o, transform: `translateY(${(1 - o) * 10}px)`,
        }}
      >
        <Rich text={cue.text} />
      </div>
    </div>
  );
};

/* ------------------------------ KOMPONEN DASAR ------------------------------ */
const Pop: React.FC<{
  t: number; at: number; until?: number; dy?: number;
  style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ t, at, until, dy = 28, style, children }) => {
  if (t < at || (until !== undefined && t > until + 0.5)) return null;
  const i = prog(t, at, 0.55);
  const o = until !== undefined ? 1 - prog(t, until, 0.4) : 1;
  return (
    <div
      style={{
        position: "absolute", opacity: i * o,
        transform: `translateY(${(1 - i) * dy}px) scale(${0.94 + 0.06 * i})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      background: C.purple, border: "2px solid rgba(255,255,255,0.14)", borderRadius: 36,
      boxShadow: "0 20px 60px rgba(0,0,0,0.35)", boxSizing: "border-box", ...style,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{ text: string; bg?: string; fg?: string; size?: number }> = ({
  text, bg = C.yellow, fg = C.indigo, size = 34,
}) => (
  <div
    style={{
      display: "inline-block", background: bg, color: fg, fontWeight: 600, fontSize: size,
      padding: `${size * 0.25}px ${size * 0.6}px`, borderRadius: 999, whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

/* ------------------------------ MASKOT: KEPO ------------------------------ */
type Expr = "curious" | "shock" | "think" | "understand";
const Kepo: React.FC<{ t: number; expr: Expr; size?: number; style?: React.CSSProperties }> = ({
  t, expr, size = 220, style,
}) => {
  const bob = Math.sin(t * 3) * 5;
  const tilt = expr === "curious" ? 14 : expr === "think" ? Math.sin(t * 6) * 10 : 0;
  const glow = expr === "understand" ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
  const eyeR = expr === "shock" ? 28 : 22;
  const px = expr === "think" ? 8 : expr === "curious" ? 6 : 0;
  const py = expr === "think" ? -10 : 0;
  const pr = expr === "shock" ? 5 : 9;
  return (
    <svg
      viewBox="0 0 200 300" width={size} height={size * 1.5}
      style={{ overflow: "visible", transform: `translateY(${bob}px)`, ...style }}
    >
      <g
        transform={`rotate(${tilt} 100 100)`}
        style={{ filter: glow > 0 ? `drop-shadow(0 0 ${16 * glow}px ${C.yellow})` : undefined }}
      >
        {expr === "understand" ? (
          <>
            <path d="M100 10 L100 62" stroke={C.yellow} strokeWidth={14} strokeLinecap="round" />
            <circle cx="100" cy="86" r="8" fill={C.yellow} />
          </>
        ) : (
          <>
            <path
              d="M78 40 Q78 8 104 8 Q130 8 130 34 Q130 50 108 60 Q100 66 100 76"
              fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round"
            />
            <circle cx="100" cy="92" r="8" fill={C.yellow} />
          </>
        )}
      </g>
      <ellipse cx="100" cy="185" rx="78" ry="85" fill={C.yellow} />
      <ellipse cx="60" cy="140" rx="12" ry="22" fill={C.white} opacity={0.35} transform="rotate(-20 60 140)" />
      <rect x="68" y="262" width="64" height="34" rx="10" fill={C.purple} stroke={OUTLINE} strokeWidth={3} />
      <path d="M72 274 H128 M72 284 H128" stroke={C.white} strokeOpacity={0.4} strokeWidth={3} />
      {expr === "understand" ? (
        <>
          <path d="M46 180 Q68 150 90 180" fill="none" stroke={C.indigo} strokeWidth={8} strokeLinecap="round" />
          <path d="M110 180 Q132 150 154 180" fill="none" stroke={C.indigo} strokeWidth={8} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="68" cy="175" r={eyeR} fill={C.white} />
          <circle cx="132" cy="175" r={eyeR} fill={C.white} />
          <circle cx={68 + px} cy={175 + py} r={pr} fill={C.indigo} />
          <circle cx={132 + px} cy={175 + py} r={pr} fill={C.indigo} />
        </>
      )}
      {expr === "curious" && <path d="M88 226 Q100 236 112 226" fill="none" stroke={C.indigo} strokeWidth={6} strokeLinecap="round" />}
      {expr === "shock" && <ellipse cx="100" cy="232" rx="12" ry="16" fill={C.indigo} />}
      {expr === "think" && <path d="M90 230 L112 225" stroke={C.indigo} strokeWidth={6} strokeLinecap="round" />}
      {expr === "understand" && <path d="M80 222 Q100 250 120 222 Z" fill={C.indigo} />}
    </svg>
  );
};

const LogoMark: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <path d="M50 8 L94 46 L82 46 L82 92 L18 92 L18 46 L6 46 Z" fill={C.yellow} />
    <text x="50" y="78" textAnchor="middle" fontSize="52" fontWeight={800} fill={C.indigo} fontFamily={fontFamily}>?</text>
  </svg>
);

/* ------------------------------ ILUSTRASI ------------------------------ */
const Helix: React.FC<{
  t: number; w?: number; h?: number; n?: number; amp?: number; speed?: number;
  glow?: number; style?: React.CSSProperties;
}> = ({ t, w = 600, h = 200, n = 24, amp = 70, speed = 2, glow = 0, style }) => {
  const rungs: React.ReactNode[] = [];
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = 12 + (i / (n - 1)) * (w - 24);
    const ph = t * speed + i * 0.5;
    const s = Math.sin(ph);
    const y1 = h / 2 + s * amp;
    const y2 = h / 2 - s * amp;
    rungs.push(
      <line key={`r${i}`} x1={x} y1={y1} x2={x} y2={y2} stroke={C.white}
        strokeOpacity={0.15 + 0.35 * Math.abs(s)} strokeWidth={4} />,
    );
    const r = 8 + 3 * Math.cos(ph);
    dots.push(<circle key={`a${i}`} cx={x} cy={y1} r={r} fill={C.yellow} />);
    dots.push(<circle key={`b${i}`} cx={x} cy={y2} r={16 - r} fill={C.white} />);
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
      style={{ overflow: "visible", filter: glow > 0 ? `drop-shadow(0 0 ${22 * glow}px ${C.yellow})` : undefined, ...style }}>
      {rungs}
      {dots}
    </svg>
  );
};

const House: React.FC<{ t: number; size?: number; style?: React.CSSProperties }> = ({ t, size = 300, style }) => (
  <svg viewBox="0 0 300 240" width={size} height={size * 0.8} style={{ overflow: "visible", ...style }}>
    <rect x="215" y="40" width="26" height="60" fill={C.purple} stroke={OUTLINE} strokeWidth={3} />
    <polygon points="20,112 150,12 280,112" fill={C.purple} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
    <rect x="45" y="105" width="210" height="125" fill={C.purple} stroke={OUTLINE} strokeWidth={3} />
    <rect x="75" y="135" width="56" height="56" rx="6" fill={C.yellow} opacity={0.85 + 0.15 * Math.sin(t * 7)} />
    <path d="M103 135 V191 M75 163 H131" stroke={C.purple} strokeWidth={4} />
    <rect x="170" y="160" width="50" height="70" rx="6" fill={C.indigo} />
    <circle cx="210" cy="197" r="3.5" fill={C.yellow} />
  </svg>
);

type PKind = "suspect" | "older" | "detective" | "scientist" | "relative";
const Person: React.FC<{
  kind: PKind; t: number; size?: number; shadow?: boolean; style?: React.CSSProperties;
}> = ({ kind, t, size = 200, shadow = false, style }) => {
  const dark = shadow || kind === "suspect";
  const sway = Math.sin(t * 2) * 2;
  const skin = dark ? SH : "rgba(255,255,255,0.92)";
  const bodyMap: Record<PKind, string> = {
    suspect: SH, older: "rgba(255,255,255,0.82)", detective: C.purple,
    scientist: C.white, relative: C.yellow,
  };
  const legMap: Record<PKind, string> = {
    suspect: SH, older: C.purple, detective: "#2A2570", scientist: C.purple, relative: C.purple,
  };
  const body = dark ? SH : bodyMap[kind];
  const legs = dark ? SH : legMap[kind];
  return (
    <svg viewBox="0 0 200 420" width={size} height={size * 2.1} style={{ overflow: "visible", ...style }}>
      <g transform={`translate(0 ${sway})`}>
        <rect x="62" y="262" width="32" height="130" rx="12" fill={legs} stroke={OUTLINE} strokeWidth={3} />
        <rect x="106" y="262" width="32" height="130" rx="12" fill={legs} stroke={OUTLINE} strokeWidth={3} />
        <ellipse cx="74" cy="396" rx="26" ry="12" fill={SH} />
        <ellipse cx="126" cy="396" rx="26" ry="12" fill={SH} />
        <path d="M54 130 L32 250" stroke={body} strokeWidth={28} strokeLinecap="round" fill="none" />
        <path d="M146 130 L168 250" stroke={body} strokeWidth={28} strokeLinecap="round" fill="none" />
        <path d="M48 118 Q100 98 152 118 L164 276 L36 276 Z" fill={body} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
        <circle cx="30" cy="256" r="14" fill={kind === "suspect" ? SH : skin} />
        <circle cx="170" cy="256" r="14" fill={kind === "suspect" ? SH : skin} />
        {kind === "scientist" && <path d="M100 118 V276 M70 122 L100 170 L130 122" stroke={OUTLINE} strokeWidth={3} fill="none" />}
        {kind === "detective" && <rect x="36" y="196" width="128" height="12" fill={SH} />}
        {kind === "older" && <path d="M82 112 L100 134 L118 112" fill="none" stroke={C.purple} strokeWidth={5} />}
        {kind === "relative" && <path d="M58 66 Q58 20 100 20 Q142 20 142 66 L148 150 L52 150 Z" fill={SH} />}
        <rect x="88" y="96" width="24" height="24" fill={skin} />
        <circle cx="100" cy="64" r="38" fill={skin} stroke={OUTLINE} strokeWidth={3} />
        {kind === "suspect" && (
          <>
            <path d="M60 58 Q100 0 140 58 Z" fill="#0B0A24" />
            <rect x="64" y="68" width="72" height="34" rx="12" fill="#0B0A24" />
          </>
        )}
        {kind === "older" && (
          <>
            <ellipse cx="66" cy="72" rx="9" ry="16" fill={C.white} opacity={0.5} />
            <ellipse cx="134" cy="72" rx="9" ry="16" fill={C.white} opacity={0.5} />
            <path d="M72 38 Q100 26 128 38" fill="none" stroke={C.white} strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" />
            <circle cx="86" cy="66" r="4" fill={C.indigo} />
            <circle cx="114" cy="66" r="4" fill={C.indigo} />
            <path d="M88 86 H112" stroke={C.indigo} strokeWidth={4} strokeLinecap="round" />
          </>
        )}
        {kind === "detective" && (
          <>
            <ellipse cx="100" cy="40" rx="56" ry="10" fill={SH} />
            <path d="M68 40 Q70 6 100 6 Q130 6 132 40 Z" fill={SH} />
            <rect x="69" y="30" width="62" height="8" fill={C.yellow} />
            <circle cx="86" cy="68" r="4" fill={C.indigo} />
            <circle cx="114" cy="68" r="4" fill={C.indigo} />
            <path d="M90 86 H110" stroke={C.indigo} strokeWidth={4} strokeLinecap="round" />
            <g transform="rotate(10 178 252)">
              <rect x="150" y="214" width="54" height="72" rx="6" fill={C.white} />
              <rect x="150" y="214" width="26" height="10" rx="3" fill={C.yellow} />
              <path d="M160 242 H196 M160 256 H190" stroke={C.purple} strokeWidth={4} />
            </g>
          </>
        )}
        {kind === "scientist" && (
          <>
            <path d="M62 58 Q100 8 138 58 Q100 38 62 58 Z" fill={SH} />
            <circle cx="86" cy="66" r="11" fill="none" stroke={C.indigo} strokeWidth={3} />
            <circle cx="114" cy="66" r="11" fill="none" stroke={C.indigo} strokeWidth={3} />
            <path d="M97 66 H103" stroke={C.indigo} strokeWidth={3} />
            <path d="M90 88 Q100 94 110 88" fill="none" stroke={C.indigo} strokeWidth={4} strokeLinecap="round" />
            <rect x="160" y="190" width="18" height="74" rx="9" fill="rgba(255,255,255,0.5)" stroke={C.white} strokeWidth={3} />
            <rect x="163" y="224" width="12" height="37" rx="6" fill={C.yellow} />
          </>
        )}
        {kind === "relative" && (
          <>
            <path d="M62 52 Q100 14 138 52 Q100 40 62 52 Z" fill={SH} />
            <circle cx="86" cy="68" r="4" fill={C.indigo} />
            <circle cx="114" cy="68" r="4" fill={C.indigo} />
            <path d="M90 86 Q100 94 110 86" fill="none" stroke={C.indigo} strokeWidth={4} strokeLinecap="round" />
            <rect x="42" y="196" width="116" height="72" rx="8" fill={C.purple} stroke={C.white} strokeOpacity={0.6} strokeWidth={3} />
            <rect x="52" y="205" width="96" height="54" rx="4" fill={C.yellow} opacity={0.8 + 0.2 * Math.sin(t * 4)} />
            <path d="M62 222 H138 M62 236 H118" stroke={C.purple} strokeWidth={4} />
            <rect x="34" y="268" width="132" height="10" rx="5" fill={C.white} opacity={0.7} />
          </>
        )}
      </g>
    </svg>
  );
};

/* ikon sederhana */
const CloudUp: React.FC<{ size?: number; slash?: number; ok?: boolean }> = ({ size = 260, slash = 0, ok = false }) => (
  <svg viewBox="0 0 100 80" width={size} height={size * 0.8} style={{ overflow: "visible" }}>
    <path d="M25 62 Q8 62 8 46 Q8 32 24 30 Q28 10 50 10 Q72 10 76 30 Q92 32 92 46 Q92 62 75 62 Z"
      fill={C.purple} stroke={C.white} strokeOpacity={0.6} strokeWidth={2.5} />
    {ok ? (
      <path d="M36 40 L46 50 L66 28" fill="none" stroke={C.yellow} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M50 54 L50 28 M38 38 L50 26 L62 38" fill="none" stroke={C.yellow} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    )}
    {slash > 0 && (
      <line x1="6" y1="74" x2={6 + 88 * slash} y2={74 - 70 * slash} stroke={C.pink} strokeWidth={8} strokeLinecap="round" />
    )}
  </svg>
);

const DbIcon: React.FC<{ size?: number }> = ({ size = 240 }) => (
  <svg viewBox="0 0 100 110" width={size} height={size * 1.1} style={{ overflow: "visible" }}>
    <path d="M12 20 V90 Q12 104 50 104 Q88 104 88 90 V20" fill={C.purple} stroke={C.white} strokeOpacity={0.6} strokeWidth={2.5} />
    <path d="M12 48 Q12 62 50 62 Q88 62 88 48 M12 74 Q12 88 50 88 Q88 88 88 74" fill="none" stroke={C.white} strokeOpacity={0.5} strokeWidth={2.5} />
    <ellipse cx="50" cy="20" rx="38" ry="14" fill="#6D3FC4" stroke={C.white} strokeOpacity={0.6} strokeWidth={2.5} />
  </svg>
);

const Magnifier: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.white }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
    <circle cx="40" cy="40" r="28" fill="rgba(255,255,255,0.08)" stroke={color} strokeWidth={8} />
    <line x1="62" y1="62" x2="90" y2="90" stroke={color} strokeWidth={12} strokeLinecap="round" />
  </svg>
);

const TubeIcon: React.FC<{ size?: number; glow?: number }> = ({ size = 120, glow = 0 }) => (
  <svg viewBox="0 0 60 140" width={size * 0.43} height={size}
    style={{ overflow: "visible", filter: glow > 0 ? `drop-shadow(0 0 ${20 * glow}px ${C.yellow})` : undefined }}>
    <rect x="12" y="8" width="36" height="120" rx="18" fill="rgba(255,255,255,0.18)" stroke={C.white} strokeWidth={3} />
    <rect x="16" y="64" width="28" height="60" rx="14" fill={C.yellow} />
    <rect x="8" y="2" width="44" height="14" rx="6" fill={C.white} />
  </svg>
);

const TrashIcon: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg viewBox="0 0 100 110" width={size} height={size * 1.1} style={{ overflow: "visible" }}>
    <rect x="38" y="6" width="24" height="12" rx="4" fill={C.white} opacity={0.8} />
    <rect x="12" y="16" width="76" height="12" rx="5" fill={C.white} opacity={0.9} />
    <path d="M22 32 L28 100 Q28 106 34 106 H66 Q72 106 72 100 L78 32 Z" fill={C.purple} stroke={C.white} strokeOpacity={0.7} strokeWidth={3} />
    <path d="M40 44 V92 M50 44 V92 M60 44 V92" stroke={C.white} strokeOpacity={0.4} strokeWidth={3} />
  </svg>
);

const CuffIcon: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg viewBox="0 0 160 100" width={size} height={size * 0.625} style={{ overflow: "visible" }}>
    <circle cx="40" cy="55" r="30" fill="none" stroke={C.white} strokeWidth={12} />
    <circle cx="120" cy="55" r="30" fill="none" stroke={C.white} strokeWidth={12} />
    <rect x="66" y="48" width="28" height="14" rx="7" fill={C.yellow} />
    <rect x="30" y="8" width="20" height="16" rx="4" fill={C.yellow} />
    <rect x="110" y="8" width="20" height="16" rx="4" fill={C.yellow} />
  </svg>
);

const Padlock: React.FC<{ size?: number; open?: number }> = ({ size = 260, open = 0 }) => (
  <svg viewBox="0 0 120 150" width={size} height={size * 1.25} style={{ overflow: "visible" }}>
    <path d="M30 70 V45 Q30 12 60 12 Q90 12 90 45 V70" fill="none" stroke={C.white} strokeWidth={14} strokeLinecap="round"
      transform={`translate(${open * 14} ${-open * 22}) rotate(${open * 22} 90 70)`} />
    <rect x="14" y="66" width="92" height="76" rx="16" fill={C.yellow} />
    <circle cx="60" cy="98" r="9" fill={C.indigo} />
    <rect x="56" y="102" width="8" height="22" rx="3" fill={C.indigo} />
  </svg>
);

const MiniTree: React.FC<{ size?: number; color?: string }> = ({ size = 160, color = C.yellow }) => (
  <svg viewBox="0 0 160 130" width={size} height={size * 0.8125} style={{ overflow: "visible" }}>
    <path d="M80 22 L40 66 M80 22 L120 66 M40 66 L20 112 M40 66 L60 112 M120 66 L100 112 M120 66 L140 112"
      stroke={color} strokeOpacity={0.7} strokeWidth={5} fill="none" />
    {[[80, 22], [40, 66], [120, 66], [20, 112], [60, 112], [100, 112], [140, 112]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i === 0 ? 14 : 11} fill={i === 0 ? color : C.white} />
    ))}
  </svg>
);

/* ------------------------------ LATAR ------------------------------ */
const STARS = Array.from({ length: 48 }, (_, i) => ({
  x: random(`sx${i}`) * 1080, y: random(`sy${i}`) * 1920,
  r: 1.5 + random(`sr${i}`) * 3.5, p: random(`sp${i}`) * 6,
}));

const Backdrop: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 28%, ${C.purple} 0%, ${C.indigo} 72%)` }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {STARS.map((s, i) => (
        <circle key={i} cx={(s.x + t * (2 + (i % 4) * 1.5)) % 1080} cy={s.y} r={s.r} fill={i % 5 === 0 ? C.yellow : C.white}
          opacity={0.12 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.p))} />
      ))}
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(30,27,75,0) 60%, rgba(30,27,75,0.55) 100%)" }} />
  </AbsoluteFill>
);

/* ============================== SCENE 1 — HOOK ============================== */
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const ringP = lin(t, 4.4, 5.4); // "selama 40 tahun"
  const R = 150;
  const circ = 2 * Math.PI * R;
  const expr: Expr = t < 6.0 ? "curious" : t < 8.9 ? "shock" : "think";
  const slash = lin(t, 9.9, 10.4);
  const l1 = lin(t, 9.4, 10.2);
  const l2 = lin(t, 9.6, 10.3);
  return (
    <>
      {/* 00.40s cincin 40 tahun */}
      <Pop t={t} at={0.4} until={6.0} style={{ left: 360, top: 40, width: 360, height: 360 }}>
        <svg viewBox="0 0 360 360" width={360} height={360}>
          <circle cx="180" cy="180" r={R} fill={C.purple} stroke="rgba(255,255,255,0.15)" strokeWidth={22} />
          <circle cx="180" cy="180" r={R} fill="none" stroke={C.yellow} strokeWidth={22} strokeLinecap="round"
            strokeDasharray={`${circ * ringP} ${circ}`} transform="rotate(-90 180 180)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 140, fontWeight: 800, color: C.yellow, lineHeight: 1 }}>{Math.round(ringP * 40)}</div>
          <div style={{ fontSize: 36, fontWeight: 600, color: C.white }}>TAHUN</div>
        </div>
      </Pop>
      {/* 00.30s rumah malam */}
      <Pop t={t} at={0.3} until={6.0} style={{ left: 20, top: 470 }}>
        <House t={t} size={290} />
      </Pop>
      {/* 06.40s pelaku (siluet) & sepupu */}
      <Pop t={t} at={6.4} style={{ left: 70, top: 120 }}>
        <Person kind="suspect" t={t} size={190} />
      </Pop>
      <Pop t={t} at={6.5} style={{ left: 820, top: 120 }}>
        <Person kind="relative" t={t} size={190} />
      </Pop>
      <Pop t={t} at={6.8} style={{ left: 60, top: 560 }}><Chip text="Pelaku?" bg={C.purple} fg={C.white} size={32} /></Pop>
      <Pop t={t} at={7.0} style={{ left: 780, top: 560 }}><Chip text="Sepupu jauh" size={32} /></Pop>
      {/* 06.60–08.80s DNA mengalir ke pelaku */}
      <Pop t={t} at={6.6} until={8.8} style={{ left: 280, top: 190 }}>
        <Helix t={t} w={520} h={220} amp={80} glow={0.7} />
      </Pop>
      {/* 08.99s awan unggah DNA: sepupu ya, pelaku tidak */}
      <Pop t={t} at={9.0} style={{ left: 400, top: 60 }}>
        <CloudUp size={280} slash={slash} />
      </Pop>
      <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {t >= 9.4 && (
          <line x1={810} y1={300} x2={lerp(810, 690, l1)} y2={lerp(300, 190, l1)}
            stroke={C.yellow} strokeWidth={8} strokeLinecap="round" />
        )}
        {t >= 9.6 && (
          <line x1={280} y1={300} x2={lerp(280, 400, l2)} y2={lerp(300, 190, l2)}
            stroke={C.pink} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 14" />
        )}
        {t >= 10.4 && (
          <g opacity={prog(t, 10.4, 0.3)} stroke={C.pink} strokeWidth={10} strokeLinecap="round">
            <line x1={318} y1={190} x2={358} y2={230} />
            <line x1={358} y1={190} x2={318} y2={230} />
          </g>
        )}
      </svg>
      {/* 00.50s Kepo */}
      <Pop t={t} at={0.5} style={{ left: 430, top: 440 }}>
        <Kepo t={t} expr={expr} size={200} />
      </Pop>
    </>
  );
};

/* ============================== SCENE 2 — MISTERI ============================== */
const PINS: [number, number][] = [
  [100, 60], [125, 105], [150, 150], [185, 185], [215, 215], [140, 40], [105, 90], [175, 205],
];
const CLUES: { label: string; at: number; kind: "glove" | "mask" | "foot" }[] = [
  { label: "Sarung tangan", at: 22.0, kind: "glove" },
  { label: "Wajah tertutup", at: 22.85, kind: "mask" },
  { label: "Tanpa jejak", at: 23.6, kind: "foot" },
];
const ClueIcon: React.FC<{ kind: "glove" | "mask" | "foot" }> = ({ kind }) => (
  <svg viewBox="0 0 100 100" width={64} height={64}>
    {kind === "glove" && (
      <>
        <rect x="25" y="46" width="50" height="44" rx="14" fill={C.white} />
        {[25, 38, 51, 64].map((x) => <rect key={x} x={x} y="12" width="11" height="44" rx="5" fill={C.white} />)}
        <rect x="14" y="52" width="18" height="12" rx="6" fill={C.white} transform="rotate(-35 20 58)" />
      </>
    )}
    {kind === "mask" && (
      <>
        <circle cx="50" cy="50" r="38" fill={C.white} opacity={0.9} />
        <rect x="14" y="38" width="72" height="20" rx="8" fill={SH} />
        <ellipse cx="36" cy="48" rx="7" ry="5" fill={C.white} />
        <ellipse cx="64" cy="48" rx="7" ry="5" fill={C.white} />
        <rect x="22" y="60" width="56" height="28" rx="12" fill={SH} />
      </>
    )}
    {kind === "foot" && (
      <>
        <ellipse cx="34" cy="62" rx="14" ry="22" fill={C.white} opacity={0.4} />
        <ellipse cx="66" cy="38" rx="14" ry="22" fill={C.white} opacity={0.4} />
        <line x1="12" y1="88" x2="88" y2="12" stroke={C.yellow} strokeWidth={8} strokeLinecap="round" />
      </>
    )}
  </svg>
);

const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const sweep = Math.sin(t * 1.7) * 150;
  return (
    <>
      {/* 13.10s kartu identitas */}
      <Pop t={t} at={13.1} until={24.8} style={{ left: 90, top: 0, width: 900 }}>
        <Card style={{ padding: "24px 30px", textAlign: "center" }}>
          <div style={{ fontSize: 50, fontWeight: 800, color: C.white }}>Joseph James DeAngelo</div>
          <div style={{ marginTop: 8 }}><Chip text="Golden State Killer" size={34} /></div>
        </Card>
      </Pop>
      {/* 13.80s rumah & siluet */}
      <Pop t={t} at={13.8} until={24.8} style={{ left: 20, top: 540 }}><House t={t} size={260} /></Pop>
      <Pop t={t} at={13.9} until={24.8} style={{ left: 800, top: 540 }}><House t={t} size={260} /></Pop>
      <Pop t={t} at={14.2} until={24.8} style={{ left: 440, top: 440 }}><Person kind="suspect" t={t} size={150} /></Pop>
      {/* 17.60s peta California + titik kejadian */}
      <Pop t={t} at={17.6} until={24.8} style={{ left: 60, top: 220 }}>
        <svg viewBox="0 0 320 300" width={320} height={300}>
          <path d="M60 10 L150 10 L150 70 L250 190 L268 236 L240 252 L205 236 L160 216 L110 160 L85 110 L55 70 Z"
            fill={C.purple} stroke={C.white} strokeOpacity={0.6} strokeWidth={3} strokeLinejoin="round" />
          {PINS.map(([x, y], i) => {
            const k = prog(t, 18.0 + i * 0.45, 0.35);
            return (
              <g key={i} opacity={k}>
                <circle cx={x} cy={y} r={10 + 8 * pulse} fill={C.yellow} opacity={0.25} />
                <circle cx={x} cy={y} r={7} fill={C.yellow} />
              </g>
            );
          })}
        </svg>
      </Pop>
      {/* 22.40 / 23.30 / 24.10s petunjuk */}
      {CLUES.map((c, i) => (
        <Pop key={c.label} t={t} at={c.at} until={24.8} style={{ left: 600, top: 220 + i * 105, width: 410 }}>
          <Card style={{ height: 90, display: "flex", alignItems: "center", gap: 20, padding: "0 24px" }}>
            <ClueIcon kind={c.kind} />
            <div style={{ fontSize: 34, fontWeight: 600, color: C.white }}>{c.label}</div>
          </Card>
        </Pop>
      ))}
      {/* 25.00s garis polisi */}
      <Pop t={t} at={25.0} dy={0} style={{ left: -60, top: 60, width: 1200, height: 64, transform: "rotate(-4deg)" }}>
        <div style={{ width: "100%", height: "100%", background: `repeating-linear-gradient(45deg, ${C.yellow} 0 28px, ${C.indigo} 28px 56px)`, opacity: 0.95 }} />
      </Pop>
      {/* 25.30s kantong bukti berisi DNA */}
      <Pop t={t} at={25.3} style={{ left: 120, top: 150, width: 640 }}>
        <Card style={{ height: 430, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(76,29,149,0.85)" }}>
          <div style={{ position: "absolute", left: 24, right: 24, top: 36, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.35)" }} />
          <Helix t={t} w={540} h={240} amp={90} glow={t > 29.7 ? 1 : 0.35} />
        </Card>
      </Pop>
      <Pop t={t} at={27.3} style={{ left: 150, top: 180 }}><Chip text="Bukti penting" size={34} /></Pop>
      {/* 27.40s kaca pembesar menyisir */}
      <Pop t={t} at={27.4} style={{ left: 330, top: 280 }}>
        <div style={{ transform: `translateX(${sweep}px)` }}><Magnifier size={150} color={C.yellow} /></div>
      </Pop>
      <Pop t={t} at={29.8} style={{ left: 150, top: 510 }}><Chip text="DNA" bg={C.white} size={34} /></Pop>
      <Pop t={t} at={25.6} style={{ left: 800, top: 440 }}>
        <Kepo t={t} expr={t < 29.7 ? "think" : "shock"} size={190} />
      </Pop>
    </>
  );
};

/* ============================== SCENE 3 — SAINS ============================== */
const strHeights = Array.from({ length: 13 }, (_, i) => 70 + random(`str${i}`) * 150);
const snpHeights = Array.from({ length: 118 }, (_, i) => 30 + random(`snp${i}`) * 210);

const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const snpFill = lin(t, 46.0, 48.6);
  const rings: { r: number; at: number; angles: number[] }[] = [
    { r: 90, at: 49.5, angles: [210, 330] },
    { r: 170, at: 50.2, angles: [20, 150, 260] },
    { r: 250, at: 50.9, angles: [30, 110, 200, 320] },
  ];
  const cx = 540;
  const cy = 350;
  const farX = cx + 250 * Math.cos((320 * Math.PI) / 180);
  const farY = cy + 250 * Math.sin((320 * Math.PI) / 180);
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <>
      {/* 32.60s database polisi tidak cocok */}
      <Pop t={t} at={32.6} until={36.0} style={{ left: 120, top: 40 }}><DbIcon size={280} /></Pop>
      <Pop t={t} at={32.9} until={36.0} style={{ left: 150, top: 400 }}><Chip text="Database polisi" size={34} /></Pop>
      <Pop t={t} at={33.0} until={36.0} style={{ left: 560, top: 90 }}><Helix t={t} w={440} h={200} amp={70} glow={0.6} /></Pop>
      <Pop t={t} at={34.4} until={36.0} style={{ left: 420, top: 90 }}>
        <div style={{ fontSize: 130, fontWeight: 800, color: C.pink, lineHeight: 1 }}>≠</div>
      </Pop>
      <Pop t={t} at={34.9} until={36.0} style={{ left: 640, top: 340 }}><Chip text="Tidak cocok" bg={C.pink} size={36} /></Pop>
      {/* 36.30s Genetic Genealogy + ilmuwan forensik */}
      <Pop t={t} at={36.3} until={40.6} style={{ left: 40, top: 60, width: 720 }}>
        <Card style={{ padding: "30px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: C.yellow }}>Genetic Genealogy</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", marginTop: 26 }}>
            <MiniTree size={200} />
            <div style={{ fontSize: 80, fontWeight: 800, color: C.white }}>+</div>
            <Helix t={t} w={250} h={160} n={12} amp={50} />
          </div>
        </Card>
      </Pop>
      <Pop t={t} at={36.5} until={40.6} style={{ left: 810, top: 110 }}><Person kind="scientist" t={t} size={190} /></Pop>
      {/* 40.91s STR vs SNP */}
      <Pop t={t} at={40.9} until={49.0} style={{ left: 40, top: 40, width: 480 }}>
        <Card style={{ height: 600, padding: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: C.white }}>STR</div>
          <div style={{ fontSize: 30, fontWeight: 500, color: C.white, opacity: 0.85 }}>Identifikasi forensik</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 300, marginTop: 70 }}>
            {strHeights.map((h, i) => (
              <div key={i} style={{ width: 22, height: h * prog(t, 41.4 + i * 0.12, 0.4), background: C.white, borderRadius: 6 }} />
            ))}
          </div>
          <div style={{ marginTop: 28 }}><Chip text="Sedikit penanda" bg={C.white} size={30} /></div>
        </Card>
      </Pop>
      <Pop t={t} at={45.0} until={49.0} style={{ left: 505, top: 280, width: 70 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.yellow, textAlign: "center" }}>VS</div>
      </Pop>
      <Pop t={t} at={45.85} until={49.0} style={{ left: 560, top: 40, width: 480 }}>
        <Card style={{ height: 600, padding: 24, border: `3px solid ${C.yellow}` }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: C.yellow }}>SNP</div>
          <div style={{ fontSize: 30, fontWeight: 500, color: C.white, opacity: 0.85 }}>Genetic Genealogy</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 1.2, height: 300, marginTop: 70 }}>
            {snpHeights.map((h, i) => (
              <div key={i} style={{ width: 2.4, flexShrink: 0, height: i / snpHeights.length < snpFill ? h : 0, background: C.yellow, borderRadius: 1 }} />
            ))}
          </div>
          <div style={{ marginTop: 28 }}><Chip text="Ratusan ribu variasi" size={30} /></div>
        </Card>
      </Pop>
      {/* 49.50s lingkaran kekerabatan */}
      <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {rings.map((rg) => {
          const k = prog(t, rg.at, 0.6);
          return (
            <g key={rg.r} opacity={k}>
              <circle cx={cx} cy={cy} r={rg.r * k} fill="none" stroke={C.white} strokeOpacity={0.25} strokeWidth={3} strokeDasharray="10 12" />
              {rg.angles.map((a, i) => {
                const x = cx + rg.r * Math.cos((a * Math.PI) / 180);
                const y = cy + rg.r * Math.sin((a * Math.PI) / 180);
                const far = rg.r === 250 && a === 320;
                return (
                  <g key={i}>
                    <line x1={cx} y1={cy} x2={x} y2={y} stroke={C.white} strokeOpacity={0.15} strokeWidth={3} />
                    <circle cx={x} cy={y} r={far ? 24 : 18} fill={far && t > 51.4 ? C.yellow : C.white} opacity={0.9} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {t >= 49.4 && (
          <g opacity={prog(t, 49.4, 0.5)}>
            <circle cx={cx} cy={cy} r={46} fill={C.purple} stroke={C.white} strokeOpacity={0.5} strokeWidth={3} />
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.yellow} fontFamily={fontFamily}>?</text>
          </g>
        )}
        {t >= 51.4 && (
          <circle cx={farX} cy={farY} r={30 + 22 * pulse} fill="none" stroke={C.yellow} strokeWidth={4} opacity={0.6 * (1 - pulse)} />
        )}
      </svg>
      <Pop t={t} at={51.6} style={{ left: farX - 90, top: farY - 100 }}><Chip text="Kerabat jauh" size={30} /></Pop>
      <Pop t={t} at={49.6} style={{ left: 30, top: 520 }}>
        <Kepo t={t} expr={t < 51.5 ? "think" : "shock"} size={170} />
      </Pop>
    </>
  );
};

/* ============================== SCENE 4 — SILSILAH ============================== */
const TREE_NODES = (() => {
  const W = 880;
  const out: { l: number; i: number; x: number; y: number; path: boolean; at: number }[] = [];
  const pathKeys = new Set(["3-1", "2-0", "1-0", "0-0", "3-4", "2-2", "1-1"]);
  const pathAt: Record<number, number> = { 3: 64.6, 2: 65.4, 1: 66.1, 0: 66.7 };
  const otherAt: Record<number, number> = { 1: 67.3, 2: 67.35, 3: 68.0, 4: 68.7 };
  for (let l = 0; l <= 4; l++) {
    for (let i = 0; i < Math.pow(2, l); i++) {
      const path = pathKeys.has(`${l}-${i}`);
      out.push({
        l, i, path,
        x: 100 + (i + 0.5) * (W / Math.pow(2, l)),
        y: 70 + l * 140,
        at: path ? pathAt[l] : otherAt[l],
      });
    }
  }
  return out;
})();

const GRID_N = 180;
const KEEP = 97;
const dotRemoveAt = (i: number) => {
  if (i === KEEP) return 999;
  const r = random(`dot${i}`);
  if (r < 0.36) return 71.9 + r * 0.4; // setelah "usia"
  if (r < 0.64) return 73.0 + (r - 0.36) * 0.5; // setelah "jenis kelamin"
  if (r < 0.9) return 74.3 + (r - 0.64) * 0.6; // setelah "riwayat tempat tinggal"
  return 76.0 + (r - 0.9) * 25; // 76.0 – 78.5 menyempit
};

const SITE_ROWS = [1, 3, 4];
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const scan = lin(t, 54.6, 57.6);
  const dotExpr: Expr = t < 78.3 ? "think" : "shock";
  return (
    <>
      {/* 54.23s DNA pelaku dibandingkan dengan situs silsilah */}
      <Pop t={t} at={54.3} until={58.5} style={{ left: 20, top: 150, width: 400 }}>
        <Card style={{ height: 380, padding: 24, textAlign: "center" }}>
          <Chip text="DNA pelaku" size={34} />
          <div style={{ marginTop: 50 }}><Helix t={t} w={340} h={180} n={16} amp={60} glow={0.5} /></div>
        </Card>
      </Pop>
      <Pop t={t} at={54.5} until={61.4} style={{ left: 470, top: 40, width: 570 }}>
        <Card style={{ height: 650, padding: 24, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            {[0, 1, 2].map((d) => <div key={d} style={{ width: 16, height: 16, borderRadius: 8, background: C.white, opacity: 0.4 }} />)}
            <div style={{ marginLeft: 12, fontSize: 30, fontWeight: 600, color: C.white }}>Silsilah Genetik</div>
          </div>
          {[0, 1, 2, 3, 4, 5].map((r) => {
            const hit = SITE_ROWS.includes(r);
            const hitAt = 59.0 + SITE_ROWS.indexOf(r) * 0.6;
            const on = hit && t > hitAt;
            return (
              <div key={r} style={{
                display: "flex", alignItems: "center", gap: 18, height: 78, padding: "0 16px", marginBottom: 12,
                borderRadius: 20, background: on ? "rgba(251,191,36,0.18)" : "rgba(255,255,255,0.07)",
                border: on ? `3px solid ${C.yellow}` : "3px solid transparent",
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: C.white, opacity: 0.85 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 200, height: 12, borderRadius: 6, background: C.white, opacity: 0.35 }} />
                  <div style={{ width: 130, height: 12, borderRadius: 6, background: C.white, opacity: 0.2, marginTop: 10 }} />
                </div>
                {on && <Chip text="Cocok" size={26} />}
              </div>
            );
          })}
          <div style={{
            position: "absolute", left: 0, right: 0, top: 80 + scan * 520, height: 6, background: C.yellow,
            opacity: t < 57.8 ? 0.9 : 0, boxShadow: `0 0 24px ${C.yellow}`,
          }} />
        </Card>
      </Pop>
      {/* 58.65s kerabat jauh muncul */}
      <Pop t={t} at={58.7} until={61.4} style={{ left: 90, top: 170 }}><Person kind="relative" t={t} size={200} /></Pop>
      {/* 61.60s detektif + papan bukti */}
      <Pop t={t} at={61.7} until={64.1} style={{ left: 30, top: 200 }}><Person kind="detective" t={t} size={220} /></Pop>
      <Pop t={t} at={61.7} until={64.1} style={{ left: 300, top: 40, width: 740 }}>
        <Card style={{ height: 520 }}>
          <svg width={740} height={520} style={{ position: "absolute", inset: 0 }}>
            <path d="M120 120 L370 100 L620 140 M120 120 L200 340 L420 360 L620 140 M370 100 L420 360"
              stroke={C.yellow} strokeWidth={4} fill="none" strokeDasharray="1000"
              strokeDashoffset={1000 * (1 - lin(t, 62.3, 63.6))} />
          </svg>
          {[[60, 70], [310, 50], [560, 90], [140, 290], [360, 310]].map(([x, y], i) => (
            <div key={i} style={{
              position: "absolute", left: x, top: y, width: 120, height: 100, borderRadius: 12, background: C.white,
              opacity: prog(t, 61.9 + i * 0.25, 0.3), transform: `rotate(${(i % 2 ? 1 : -1) * 3}deg)`,
            }}>
              <div style={{ margin: 12, height: 44, borderRadius: 6, background: C.purple, opacity: 0.7 }} />
              <div style={{ margin: "0 12px", height: 8, borderRadius: 4, background: C.indigo, opacity: 0.4 }} />
            </div>
          ))}
        </Card>
      </Pop>
      <Pop t={t} at={62.6} until={64.1} style={{ left: 760, top: 480 }}><Magnifier size={150} color={C.yellow} /></Pop>
      {/* 64.50–69.80s pohon keluarga */}
      {t >= 64.4 && t < 70.4 && (
        <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - prog(t, 69.95, 0.35) }}>
          {TREE_NODES.filter((n) => n.l > 0).map((n) => {
            const p = TREE_NODES.find((q) => q.l === n.l - 1 && q.i === Math.floor(n.i / 2));
            if (!p) return null;
            const k = prog(t, n.at, 0.6);
            return (
              <line key={`e${n.l}-${n.i}`} x1={p.x} y1={p.y} x2={lerp(p.x, n.x, k)} y2={lerp(p.y, n.y, k)}
                stroke={n.path ? C.yellow : C.white} strokeOpacity={n.path ? 1 : 0.35}
                strokeWidth={n.path ? 7 : 3.5} strokeLinecap="round" />
            );
          })}
          {TREE_NODES.map((n) => {
            const k = prog(t, n.at + 0.3, 0.4);
            const r = (n.path ? 26 : 20 - n.l * 1.8) * k;
            return <circle key={`n${n.l}-${n.i}`} cx={n.x} cy={n.y} r={Math.max(0, r)} fill={n.path ? C.yellow : C.white} opacity={n.path ? 1 : 0.85} />;
          })}
        </svg>
      )}
      <Pop t={t} at={65.6} until={69.9} style={{ left: 600, top: 28 }}><Chip text="Leluhur bersama" size={28} /></Pop>
      <Pop t={t} at={69.0} until={69.9} style={{ left: 380, top: 665 }}><Chip text="Generasi sekarang" size={30} /></Pop>
      {/* 70.10s ratusan nama → disaring */}
      {t >= 70.0 && (
        <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {Array.from({ length: GRID_N }, (_, i) => {
            const rm = dotRemoveAt(i);
            const born = prog(t, 70.1 + ((i % 20) + Math.floor(i / 20)) * 0.012, 0.3);
            const gone = i === KEEP ? 0 : prog(t, rm, 0.35);
            const x = 70 + (i % 20) * 47 + 23;
            const y = 40 + Math.floor(i / 20) * 47 + 23;
            const star = i === KEEP;
            const fin = star ? prog(t, 78.3, 0.5) : 0;
            const r = (star ? 14 + 12 * fin : 14) * born * (1 - gone);
            if (r <= 0.2) return null;
            return (
              <circle key={i} cx={x} cy={y} r={r} fill={star && t > 78.2 ? C.yellow : C.white}
                opacity={star ? 1 : 0.85}
                style={star && fin > 0 ? { filter: `drop-shadow(0 0 ${18 * fin}px ${C.yellow})` } : undefined} />
            );
          })}
        </svg>
      )}
      <Pop t={t} at={71.3} style={{ left: 70, top: 540 }}><Chip text="Usia" size={34} /></Pop>
      <Pop t={t} at={72.3} style={{ left: 250, top: 540 }}><Chip text="Jenis kelamin" size={34} /></Pop>
      <Pop t={t} at={73.7} style={{ left: 560, top: 540 }}><Chip text="Tempat tinggal" size={34} /></Pop>
      <Pop t={t} at={70.4} style={{ left: 900, top: 545 }}><Kepo t={t} expr={dotExpr} size={130} /></Pop>
    </>
  );
};

/* ============================== SCENE 5 — IDENTITAS ============================== */
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const e1 = lin(t, 94.5, 96.3);
  const e2 = lin(t, 96.8, 98.4);
  const matchAt = (i: number) => 101.0 + i * 0.28;
  return (
    <>
      {/* 79.40s satu nama menarik perhatian */}
      <Pop t={t} at={79.4} until={84.9} style={{ left: 130, top: 40, width: 820 }}>
        <Card style={{ height: 560, display: "flex", alignItems: "center", gap: 36, padding: "0 40px" }}>
          <Person kind="older" t={t} size={210} style={{ marginTop: 40 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 30, fontWeight: 600, color: C.white, opacity: 0.8 }}>Tersangka</div>
            <div style={{ fontSize: 58, fontWeight: 800, color: C.yellow, lineHeight: 1.1, marginTop: 8 }}>Joseph James DeAngelo</div>
            {[260, 200, 230].map((w, i) => (
              <div key={i} style={{ width: w, height: 12, borderRadius: 6, background: C.white, opacity: 0.25, marginTop: 20 }} />
            ))}
          </div>
        </Card>
      </Pop>
      <Pop t={t} at={82.4} until={84.9} style={{ left: 760, top: 400 }}><Magnifier size={170} color={C.yellow} /></Pop>
      {/* 85.20s DNA kerabat belum cukup */}
      <Pop t={t} at={85.2} until={90.0} style={{ left: 40, top: 70, width: 400 }}>
        <Card style={{ height: 400, padding: 24, textAlign: "center" }}>
          <Chip text="DNA kerabat" size={32} />
          <div style={{ marginTop: 40 }}><Helix t={t} w={340} h={200} n={16} amp={64} /></div>
        </Card>
      </Pop>
      <Pop t={t} at={85.6} until={90.0} style={{ left: 640, top: 70, width: 400 }}>
        <Card style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Person kind="older" t={t} size={150} shadow />
        </Card>
      </Pop>
      <Pop t={t} at={86.4} until={90.0} style={{ left: 465, top: 130 }}>
        <div style={{ fontSize: 150, fontWeight: 800, color: C.pink, lineHeight: 1 }}>≠</div>
      </Pop>
      <Pop t={t} at={87.4} until={90.0} style={{ left: 380, top: 520 }}><Chip text="Belum cukup" bg={C.pink} size={40} /></Pop>
      {/* 90.26s butuh sampel langsung */}
      <Pop t={t} at={90.3} until={93.5} style={{ left: 60, top: 160 }}><Person kind="detective" t={t} size={220} /></Pop>
      <Pop t={t} at={90.6} until={93.5} style={{ left: 480, top: 70 }}>
        <TubeIcon size={400} glow={0.5 + 0.5 * Math.sin(t * 6)} />
      </Pop>
      <Pop t={t} at={91.2} until={93.5} style={{ left: 640, top: 250 }}><Chip text="Sampel langsung" size={38} /></Pop>
      {/* 93.90s barang buangan → sampel biologis */}
      <Pop t={t} at={93.9} until={99.1} style={{ left: 30, top: 270 }}><House t={t} size={360} /></Pop>
      <Pop t={t} at={94.0} until={99.1} style={{ left: 560, top: 360 }}><TrashIcon size={210} /></Pop>
      <Pop t={t} at={94.4} until={99.1} style={{ left: 400, top: 620 }}><Chip text="Barang buangan" size={34} /></Pop>
      {t >= 94.5 && t < 99.4 && e1 < 1 && (
        <div style={{
          position: "absolute", left: lerp(220, 640, e1), top: lerp(520, 400, e1) - 130 * Math.sin(Math.PI * e1),
          width: 46, height: 60, borderRadius: 10, background: C.white, opacity: 0.95,
          transform: `rotate(${e1 * 220}deg)`,
        }} />
      )}
      <Pop t={t} at={96.8} until={99.1} style={{ left: 820, top: 40 }}><TubeIcon size={230} glow={0.8} /></Pop>
      <Pop t={t} at={97.2} until={99.1} style={{ left: 760, top: 300 }}><Chip text="Sampel biologis" size={32} /></Pop>
      {t >= 96.8 && t < 99.4 && e2 < 1 && (
        <div style={{
          position: "absolute", left: lerp(640, 850, e2), top: lerp(420, 100, e2) - 90 * Math.sin(Math.PI * e2),
          width: 40, height: 40, borderRadius: 20, background: C.yellow, boxShadow: `0 0 30px ${C.yellow}`,
        }} />
      )}
      {/* 99.40s pencocokan DNA */}
      <Pop t={t} at={99.4} until={105.1} style={{ left: 120, top: 10 }}><Chip text="Sampel DeAngelo" size={30} bg={C.white} /></Pop>
      <Pop t={t} at={99.5} until={105.1} style={{ left: 120, top: 70 }}><Helix t={t} w={840} h={180} n={34} amp={60} /></Pop>
      <Pop t={t} at={99.9} until={105.1} style={{ left: 120, top: 330 }}><Chip text="Lokasi kejahatan" size={30} bg={C.white} /></Pop>
      <Pop t={t} at={100.0} until={105.1} style={{ left: 120, top: 390 }}><Helix t={t} w={840} h={180} n={34} amp={60} /></Pop>
      {t >= 100.8 && t < 105.6 && (
        <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - prog(t, 105.0, 0.4) }}>
          {Array.from({ length: 8 }, (_, i) => {
            const x = 190 + i * 100;
            const k = prog(t, matchAt(i), 0.35);
            return (
              <g key={i} opacity={k}>
                <line x1={x} y1={265} x2={x} y2={395} stroke={C.yellow} strokeWidth={4} strokeDasharray="8 8" />
                <circle cx={x} cy={330} r={20} fill={C.yellow} />
                <path d={`M${x - 9} ${330} L${x - 2} ${338} L${x + 10} ${322}`} fill="none" stroke={C.indigo} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
        </svg>
      )}
      <Pop t={t} at={103.0} until={105.1} style={{ left: 300, top: 600 }}>
        <div style={{
          fontSize: 92, fontWeight: 800, color: C.yellow, border: `8px solid ${C.yellow}`, borderRadius: 24,
          padding: "0 36px", transform: "rotate(-6deg)", letterSpacing: 4,
        }}>COCOK</div>
      </Pop>
      {/* 105.50s April 2018 ditangkap */}
      <Pop t={t} at={105.5} style={{ left: 250, top: 20, width: 580 }}>
        <Card style={{ height: 540, overflow: "hidden", textAlign: "center" }}>
          <div style={{ background: C.yellow, color: C.indigo, fontSize: 70, fontWeight: 800, padding: "18px 0" }}>APRIL</div>
          <div style={{ fontSize: 180, fontWeight: 800, color: C.white, marginTop: 40, lineHeight: 1 }}>2018</div>
        </Card>
      </Pop>
      <div style={{
        position: "absolute", left: 560, top: 360, opacity: t > 106.2 ? 1 : 0,
        transform: `scale(${0.4 + 0.6 * spr(t, 106.2)}) rotate(-10deg)`, filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.5))",
      }}>
        <CuffIcon size={300} />
      </div>
      <Pop t={t} at={105.7} style={{ left: 20, top: 520 }}><Kepo t={t} expr="shock" size={150} /></Pop>
    </>
  );
};

/* ============================== SCENE 6 — PENUTUP ============================== */
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const reveal = prog(t, 116.6, 1.2); // identitas terbuka
  const open = prog(t, 129.0, 0.8);
  const stage: Expr = t < 113.7 ? "curious" : t < 127.7 ? "think" : "understand";
  const flow = lin(t, 113.9, 116.6);
  return (
    <>
      {/* 107.76s pelaku tidak unggah, kerabat tetap ada di basis data */}
      <Pop t={t} at={107.8} until={113.6} style={{ left: 70, top: 150 }}><Person kind="older" t={t} size={200} /></Pop>
      <Pop t={t} at={107.9} until={113.6} style={{ left: 810, top: 150 }}><Person kind="relative" t={t} size={200} /></Pop>
      <Pop t={t} at={108.8} until={113.6} style={{ left: 295, top: 120 }}>
        <CloudUp size={140} slash={lin(t, 109.4, 109.9)} />
      </Pop>
      <Pop t={t} at={109.8} until={113.6} style={{ left: 645, top: 120 }}><CloudUp size={140} ok /></Pop>
      <Pop t={t} at={110.2} until={113.6} style={{ left: 60, top: 600 }}><Chip text="Tidak unggah" bg={C.pink} size={30} /></Pop>
      <Pop t={t} at={110.6} until={113.6} style={{ left: 760, top: 600 }}><Chip text="Ada di basis data" size={30} /></Pop>
      {/* 113.70s informasi genetik kerabat membuka identitas */}
      <Pop t={t} at={113.8} until={119.8} style={{ left: 120, top: 30 }}>
        <Helix t={t} w={840} h={170} n={32} amp={55} glow={0.6} />
      </Pop>
      <Pop t={t} at={114.0} until={119.8} style={{ left: 340, top: 260, width: 400 }}>
        <Card style={{ height: 470, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ opacity: 1 - reveal * 0.0 }}>
            <Person kind="older" t={t} size={170} shadow={reveal < 0.5} />
          </div>
          <div style={{
            position: "absolute", inset: 0, background: C.indigo, opacity: 0.88 * (1 - reveal),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 220, fontWeight: 800, color: C.yellow,
          }}>?</div>
        </Card>
      </Pop>
      <Pop t={t} at={117.2} until={119.8} style={{ left: 410, top: 740 - 20 }}><Chip text="Identitas terbuka" size={30} /></Pop>
      <div style={{ position: "absolute", left: 120 + 840 * flow, top: 100, width: 0, height: 0 }} />
      {/* 120.15s tiga pilar */}
      <Pop t={t} at={120.2} until={127.5} style={{ left: 190, top: 80 }}><Chip text="Genetic Genealogy" size={44} /></Pop>
      {[
        { at: 122.7, label: "Ilmu genetika", icon: <Helix t={t} w={200} h={130} n={10} amp={42} /> },
        { at: 124.6, label: "Sejarah keluarga", icon: <MiniTree size={170} /> },
        { at: 126.1, label: "Investigasi", icon: <Magnifier size={130} color={C.yellow} /> },
      ].map((p, i) => (
        <Pop key={p.label} t={t} at={p.at} until={127.5} style={{ left: 30 + i * 345, top: 230, width: 300 }}>
          <Card style={{ height: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <div style={{ height: 140, display: "flex", alignItems: "center" }}>{p.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: C.white, textAlign: "center" }}>{p.label}</div>
          </Card>
        </Pop>
      ))}
      {[0, 1].map((i) => (
        <Pop key={i} t={t} at={i === 0 ? 124.6 : 126.1} until={127.5} style={{ left: 325 + i * 345, top: 360 }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: C.yellow, lineHeight: 1 }}>+</div>
        </Pop>
      ))}
      {/* 127.73s rahasia keluarga memecahkan misteri */}
      <Pop t={t} at={127.8} until={133.3} style={{ left: 390, top: 30 }}><Padlock size={300} open={open} /></Pop>
      <Pop t={t} at={128.6} until={133.3} style={{ left: 40, top: 300 }}><MiniTree size={260} /></Pop>
      <Pop t={t} at={128.6} until={133.3} style={{ left: 790, top: 300 }}><House t={t} size={250} /></Pop>
      <Pop t={t} at={131.4} until={133.3} style={{ left: 250, top: 560 }}>
        <div style={{
          fontSize: 76, fontWeight: 800, color: C.yellow, border: `8px solid ${C.yellow}`, borderRadius: 24,
          padding: "0 30px", transform: "rotate(-4deg)", letterSpacing: 2,
        }}>TERPECAHKAN</div>
      </Pop>
      {/* 133.30s penutup + ajakan follow */}
      <Pop t={t} at={133.3} style={{ left: 390, top: 20 }}><Kepo t={t} expr="understand" size={300} /></Pop>
      <Pop t={t} at={133.6} style={{ left: 190, top: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.yellow, color: C.indigo, borderRadius: 999, padding: "16px 40px", fontSize: 40, fontWeight: 800 }}>
          <LogoMark size={52} />Follow @rumahpenasaran
        </div>
      </Pop>
      {/* Kepo pendamping selama adegan 6 */}
      <Pop t={t} at={108.0} until={127.6} style={{ left: 440, top: 570 }}><Kepo t={t} expr={stage} size={130} /></Pop>
    </>
  );
};

/* ------------------------------ DAFTAR SCENE ------------------------------ */
type Head = { a: number; b: number; text: string };
type SceneDef = { id: string; a: number; b: number; heads: Head[]; Comp: React.FC<{ t: number }> };

const SCENES: SceneDef[] = [
  {
    id: "01 HOOK", a: 0, b: 12.25, Comp: Scene1,
    heads: [
      { a: 0, b: 8.7, text: "Kok bisa *pembunuh* lolos *40 tahun*?" },
      { a: 8.7, b: 12.25, text: "Tapi dia *tidak pernah* unggah DNA" },
    ],
  },
  {
    id: "02 MISTERI 40 TAHUN", a: 12.25, b: 32.0, Comp: Scene2,
    heads: [
      { a: 12.25, b: 24.9, text: "Misteri *40 tahun* di California" },
      { a: 24.9, b: 32.0, text: "Satu *bukti penting*: DNA" },
    ],
  },
  {
    id: "03 SENJATA SAINS", a: 32.0, b: 53.7, Comp: Scene3,
    heads: [
      { a: 32.0, b: 36.1, text: "DNA-nya *tidak cocok* di database" },
      { a: 36.1, b: 40.8, text: "Teknologi baru: *Genetic Genealogy*" },
      { a: 40.8, b: 49.2, text: "*STR* vs *SNP*" },
      { a: 49.2, b: 53.7, text: "Kerabat *sangat jauh* terdeteksi" },
    ],
  },
  {
    id: "04 SILSILAH", a: 53.7, b: 79.1, Comp: Scene4,
    heads: [
      { a: 53.7, b: 61.5, text: "Cocokkan dengan *situs silsilah*" },
      { a: 61.5, b: 70.1, text: "Telusuri *pohon keluarga*" },
      { a: 70.1, b: 79.1, text: "Persempit *daftar tersangka*" },
    ],
  },
  {
    id: "05 IDENTITAS", a: 79.1, b: 107.45, Comp: Scene5,
    heads: [
      { a: 79.1, b: 85.0, text: "Satu nama *menonjol*" },
      { a: 85.0, b: 93.7, text: "Kecocokan kerabat *belum cukup*" },
      { a: 93.7, b: 105.2, text: "Ambil *sampel* dari barang buangan" },
      { a: 105.2, b: 107.45, text: "*April 2018*: ditangkap" },
    ],
  },
  {
    id: "06 PENUTUP", a: 107.45, b: AUDIO_SECONDS, Comp: Scene6,
    heads: [
      { a: 107.45, b: 119.9, text: "Tak perlu *unggah DNA* sendiri" },
      { a: 119.9, b: 127.6, text: "*Genetika* + *keluarga* + *investigasi*" },
      { a: 127.6, b: 133.3, text: "Rahasia keluarga, *misteri terpecahkan*" },
      { a: 133.3, b: AUDIO_SECONDS, text: "Follow biar penasaranmu *terjawab*" },
    ],
  },
];

const Headline: React.FC<{ t: number; heads: Head[] }> = ({ t, heads }) => {
  const h = heads.find((x) => t >= x.a && t < x.b);
  if (!h) return null;
  const i = prog(t, h.a, 0.5);
  const o = i * (1 - prog(t, h.b - 0.25, 0.25));
  return (
    <div
      style={{
        position: "absolute", left: 60, top: 255, width: 960, height: 190, display: "flex",
        alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 800,
        fontSize: 68, lineHeight: 1.1, color: C.white, opacity: o, transform: `translateY(${(1 - i) * 24}px)`,
      }}
    >
      <div><Rich text={h.text} /></div>
    </div>
  );
};

const Brand: React.FC<{ idx: number }> = ({ idx }) => (
  <>
    <div style={{ position: "absolute", left: 60, top: 120, display: "flex", alignItems: "center", gap: 16 }}>
      <LogoMark size={64} />
      <div style={{ color: C.white, fontWeight: 600, fontSize: 30 }}>Rumah Penasaran</div>
    </div>
    <div style={{ position: "absolute", right: 60, top: 146, display: "flex", gap: 10 }}>
      {SCENES.map((s, i) => (
        <div key={s.id} style={{
          width: i === idx ? 34 : 12, height: 12, borderRadius: 6,
          background: i === idx ? C.yellow : "rgba(255,255,255,0.3)",
        }} />
      ))}
    </div>
  </>
);

/* ------------------------------ KOMPOSISI UTAMA ------------------------------ */
export const DnaVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = Math.max(0, SCENES.findIndex((s) => t >= s.a && t < s.b));
  return (
    <AbsoluteFill style={{ backgroundColor: C.indigo, fontFamily, overflow: "hidden" }}>
      {VOICE_SRC ? <Audio src={staticFile(VOICE_SRC)} /> : null}
      <Backdrop t={t} />
      <Brand idx={idx} />
      {SCENES.map((sc) => {
        if (t < sc.a - 0.01 || t > sc.b + 0.5) return null;
        const inOp = sc.a === 0 ? 1 : prog(t, sc.a, 0.35);
        const outOp = sc.b >= AUDIO_SECONDS ? 1 : 1 - prog(t, sc.b, 0.4);
        return (
          <AbsoluteFill key={sc.id} style={{ opacity: inOp * outOp }}>
            <Headline t={t} heads={sc.heads} />
            <div style={{ position: "absolute", left: 0, top: 470, width: 1080, height: 760 }}>
              <sc.Comp t={t} />
            </div>
          </AbsoluteFill>
        );
      })}
      <Subtitle t={t} />
      {DEBUG_MARKERS && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, height: 1000, border: "2px dashed rgba(251,191,36,0.5)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1305, height: 190, border: "2px dashed rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", left: 20, top: 20, fontSize: 28, fontWeight: 600, color: C.yellow }}>
            {SCENES[idx].id} · {t.toFixed(2)}s · f{frame}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export default DnaVideo;
