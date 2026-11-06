/**
 * kurs.tsx — "Ketika Emas, Perak, Perunggu, dan Kerikil Bertukar Nilai"
 * Rumah Penasaran | @rumahpenasaran
 *
 * Format  : 1080 x 1920 (Reels), 30 fps, 3210 frame (107 dtk; VO = 106,96 dtk)
 * Palet   : #1E1B4B indigo, #4C1D95 ungu, #FBBF24 kuning, #FFFFFF putih,
 *           #FB7185 merah muda (khusus makna buruk: melemah / kehilangan nilai).
 *           Warna emas/perak/perunggu/kerikil diturunkan dari 4 warna tsb (mix), bukan warna baru.
 * Font    : Poppins (ExtraBold judul, SemiBold subtitle, Medium pendukung)
 * Aman    : konten utama y 350–1250, subtitle y 1305–1495.
 *
 * Daftarkan di Root.tsx:
 *   import { Kurs, KURS_DURATION, KURS_FPS, KURS_WIDTH, KURS_HEIGHT } from "./kurs";
 *   <Composition id="Kurs" component={Kurs} durationInFrames={KURS_DURATION}
 *     fps={KURS_FPS} width={KURS_WIDTH} height={KURS_HEIGHT} />
 *
 * Voice over (opsional, untuk render final): taruh wav di /public lalu isi VOICE_OVER_SRC.
 * Semua timing di bawah (CUES = subtitle, penanda adegan = konstanta detik di tiap Scene)
 * disinkronkan dengan jeda suara pada file VO yang dilampirkan.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "800"],
  subsets: ["latin"],
});

/* ───────────────────────── KONFIGURASI ───────────────────────── */
export const KURS_FPS = 30;
export const KURS_WIDTH = 1080;
export const KURS_HEIGHT = 1920;
export const KURS_DURATION = 3210;
const VOICE_OVER_SRC = ""; // contoh: "kurs-vo.wav" (file di /public). Kosong = tanpa audio.

/* ───────────────────────── PALET ───────────────────────── */
const INDIGO = "#1E1B4B";
const PURPLE = "#4C1D95";
const YELLOW = "#FBBF24";
const WHITE = "#FFFFFF";
const PINK = "#FB7185";

const hex2rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** campur warna a dengan b; p = porsi b (0..1) */
const mix = (a: string, b: string, p: number) => {
  const A = hex2rgb(a);
  const B = hex2rgb(b);
  return (
    "#" +
    A.map((v, i) =>
      Math.round(v * (1 - p) + B[i] * p)
        .toString(16)
        .padStart(2, "0"),
    ).join("")
  );
};

const GOLD = YELLOW;
const GOLD_D = mix(YELLOW, INDIGO, 0.3);
const SILVER = mix(WHITE, PURPLE, 0.1);
const SILVER_D = mix(WHITE, PURPLE, 0.45);
const BRONZE = mix(YELLOW, INDIGO, 0.42);
const BRONZE_D = mix(YELLOW, INDIGO, 0.68);
const PEBBLE = mix(WHITE, INDIGO, 0.52);
const PEBBLE_D = mix(WHITE, INDIGO, 0.72);
const CARD = PURPLE;
const CARD_EDGE = mix(PURPLE, WHITE, 0.2);

type Kind = "gold" | "silver" | "bronze" | "pebble";
type Mood = "normal" | "wow" | "happy";
type KMood = "penasaran" | "kaget" | "mikir" | "paham";

const KIND_COLOR: Record<Kind, string> = { gold: GOLD, silver: SILVER, bronze: BRONZE, pebble: PEBBLE };
const KIND_NAME: Record<Kind, string> = { gold: "Emas", silver: "Perak", bronze: "Perunggu", pebble: "Kerikil" };
const KIND_CODE: Record<Kind, string> = { gold: "Euro · EUR", silver: "Dolar Australia · AUD", bronze: "Dolar Amerika · USD", pebble: "Rupiah · IDR" };
const KIND_PHASE: Record<Kind, number> = { gold: 0, silver: 1.3, bronze: 2.6, pebble: 3.9 };

/* ───────────────────────── UTIL ANIMASI ───────────────────────── */
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const backOut = Easing.out(Easing.back(1.8));
const ramp = (t: number, a: number, d = 0.5) => easeOut(clamp01((t - a) / d));
const pop = (t: number, a: number, d = 0.5) => backOut(clamp01((t - a) / d));
/** 0→1 saat masuk (a), 1→0 saat keluar (b) */
const between = (t: number, a: number, b: number, f = 0.35) => ramp(t, a, f) * (1 - ramp(t, b - f, f));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const T = (size: number, weight: 500 | 600 | 800, color: string = WHITE): React.CSSProperties => ({
  fontFamily,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.15,
});
const ctr = (x: number, y: number): React.CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  transform: "translate(-50%,-50%)",
});

/* ───────────────────────── PRIMITIF UI ───────────────────────── */
const Pop: React.FC<{
  t: number;
  at: number;
  dur?: number;
  dy?: number;
  from?: number;
  o?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ t, at, dur = 0.5, dy = 24, from = 0.6, o = 1, style, children }) => {
  if (t < at) return null;
  const p = pop(t, at, dur);
  const a = clamp01((t - at) / 0.2) * o;
  return (
    <div
      style={{
        ...style,
        opacity: a,
        transform: `${style?.transform ?? ""} translateY(${(1 - p) * dy}px) scale(${from + (1 - from) * p})`,
      }}
    >
      {children}
    </div>
  );
};

const Fade: React.FC<{ o: number; children?: React.ReactNode }> = ({ o, children }) =>
  o <= 0.003 ? null : <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;

const TriIcon: React.FC<{ up: boolean; color: string; size?: number }> = ({ up, color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={up ? "M12 3 L22 21 L2 21 Z" : "M12 21 L22 3 L2 3 Z"} fill={color} />
  </svg>
);
const BarIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="2" y="9" width="20" height="6" rx="3" fill={color} />
  </svg>
);
const CrossIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M18 18 L82 82 M82 18 L18 82" stroke={color} strokeWidth={14} strokeLinecap="round" />
  </svg>
);
const Spark: React.FC<{ size: number; color?: string }> = ({ size, color = YELLOW }) => (
  <svg width={size} height={size} viewBox="-14 -14 28 28">
    <path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill={color} />
  </svg>
);

const Pill: React.FC<{ text: string; bg?: string; color?: string; size?: number; icon?: React.ReactNode }> = ({
  text,
  bg = YELLOW,
  color = INDIGO,
  size = 30,
  icon,
}) => (
  <div
    style={{
      ...T(size, 800, color),
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.3,
      padding: `${size * 0.28}px ${size * 0.7}px`,
      borderRadius: 999,
      background: bg,
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    {text}
  </div>
);

/* ───────────────────────── TOKEN (Emas/Perak/Perunggu/Kerikil) ───────────────────────── */
const FACE_Y: Record<Kind, number> = { gold: 46, silver: 50, bronze: 50, pebble: 54 };
const LEG_Y: Record<Kind, number> = { gold: 74, silver: 92, bronze: 90, pebble: 78 };
const EDGE_X: Record<Kind, number> = { gold: 6, silver: 10, bronze: 12, pebble: 16 };

const Token: React.FC<{ kind: Kind; size: number; face?: boolean; mood?: Mood; glow?: boolean }> = ({
  kind,
  size,
  face = false,
  mood = "normal",
  glow = false,
}) => {
  const fy = FACE_Y[kind];
  const ex = EDGE_X[kind];
  const ly = LEG_Y[kind];
  return (
    <svg
      width={size}
      height={(size * 112) / 120}
      viewBox="-10 0 120 112"
      style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 16px ${YELLOW})` : undefined }}
    >
      {face && (
        <g stroke={INDIGO} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d={`M38 ${ly} L35 ${ly + 14}`} />
          <path d={`M62 ${ly} L65 ${ly + 14}`} />
          <path d={`M${ex} ${fy + 16} L${ex - 11} ${fy + 27}`} />
          <path d={`M${100 - ex} ${fy + 16} L${100 - ex + 11} ${fy + 27}`} />
        </g>
      )}
      {kind === "gold" && (
        <>
          <rect x={6} y={26} width={88} height={52} rx={14} fill={GOLD_D} />
          <rect x={6} y={20} width={88} height={52} rx={14} fill={GOLD} />
          <rect x={16} y={27} width={38} height={8} rx={4} fill={WHITE} opacity={0.5} />
        </>
      )}
      {kind === "silver" && (
        <>
          <circle cx={50} cy={56} r={40} fill={SILVER_D} />
          <circle cx={50} cy={50} r={40} fill={SILVER} />
          <circle cx={50} cy={50} r={31} fill="none" stroke={SILVER_D} strokeWidth={3} strokeDasharray="2 5" strokeLinecap="round" />
          <path d="M22 36 Q30 22 46 18" stroke={WHITE} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8} />
        </>
      )}
      {kind === "bronze" && (
        <>
          <circle cx={50} cy={56} r={38} fill={BRONZE_D} />
          <circle cx={50} cy={50} r={38} fill={BRONZE} />
          <circle cx={50} cy={50} r={29} fill="none" stroke={BRONZE_D} strokeWidth={3} />
          <path d="M24 38 Q31 24 46 20" stroke={YELLOW} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
        </>
      )}
      {kind === "pebble" && (
        <>
          <path d="M20 66 C12 46 28 24 52 26 C76 22 92 44 84 64 C78 82 36 86 20 66 Z" fill={PEBBLE_D} transform="translate(0 5)" />
          <path d="M20 66 C12 46 28 24 52 26 C76 22 92 44 84 64 C78 82 36 86 20 66 Z" fill={PEBBLE} />
          <ellipse cx={38} cy={38} rx={11} ry={6} fill={WHITE} opacity={0.3} transform="rotate(-20 38 38)" />
        </>
      )}
      {face && (
        <>
          {[38, 62].map((x) => (
            <g key={x}>
              <circle cx={x} cy={fy} r={9.5} fill={WHITE} stroke={INDIGO} strokeWidth={2.5} />
              <circle cx={x + 1} cy={fy + 1} r={4.5} fill={INDIGO} />
            </g>
          ))}
          {mood === "wow" ? (
            <ellipse cx={50} cy={fy + 19} rx={4.5} ry={5.5} fill={INDIGO} />
          ) : mood === "happy" ? (
            <path d={`M40 ${fy + 15} Q50 ${fy + 28} 60 ${fy + 15} Z`} fill={INDIGO} />
          ) : (
            <path d={`M42 ${fy + 16} Q50 ${fy + 22} 58 ${fy + 16}`} stroke={INDIGO} strokeWidth={3} strokeLinecap="round" fill="none" />
          )}
        </>
      )}
    </svg>
  );
};

/** Karakter + label, ditempatkan dengan titik tengah (x,y) di koordinat stage */
const CharCard: React.FC<{
  kind: Kind;
  x: number;
  y: number;
  size: number;
  t: number;
  at: number;
  mood?: Mood;
  o?: number;
  showCode?: boolean;
  glow?: boolean;
  lift?: number;
}> = ({ kind, x, y, size, t, at, mood = "normal", o = 1, showCode = true, glow = false, lift = 0 }) => {
  const bob = Math.sin(t * 3 + KIND_PHASE[kind]) * 5 + lift;
  return (
    <Pop t={t} at={at} o={o} style={ctr(x, y)}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ transform: `translateY(${bob}px)` }}>
          <Token kind={kind} size={size} face mood={mood} glow={glow} />
        </div>
        <div style={{ ...T(Math.max(34, size * 0.2), 800), textAlign: "center" }}>{KIND_NAME[kind]}</div>
        {showCode && <div style={{ ...T(Math.max(22, size * 0.125), 600, YELLOW), textAlign: "center", whiteSpace: "nowrap" }}>{KIND_CODE[kind]}</div>}
      </div>
    </Pop>
  );
};

/** Sekumpulan benda yang muncul satu per satu (bisa berkurang / bertambah / membesar) */
const Group: React.FC<{
  kind: Kind;
  count: number;
  size: number;
  cols: number;
  t: number;
  at: number;
  stagger?: number;
  baseCount?: number;
  addAt?: number;
  keep?: number;
  removeAt?: number;
  growAt?: number;
  growTo?: number;
}> = ({ kind, count, size, cols, t, at, stagger = 0.1, baseCount = count, addAt = at, keep = count, removeAt = 1e9, growAt = 1e9, growTo = 1 }) => {
  const cell = size * 0.8;
  const gap = 6;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: cols * (cell + gap), gap, justifyContent: "center", alignItems: "center" }}>
      {Array.from({ length: count }, (_, i) => {
        const start = i < baseCount ? at + i * stagger : addAt + (i - baseCount) * 0.06;
        const a = pop(t, start, 0.4);
        const gone = i >= keep ? ramp(t, removeAt + (i - keep) * 0.07, 0.35) : 0;
        const g = i < keep ? 1 + (growTo - 1) * ramp(t, growAt, 0.5) : 1;
        return (
          <div key={i} style={{ width: cell, height: cell, position: "relative", opacity: Math.min(1, a) * (1 - gone), transform: `scale(${a * (1 - gone) * g})` }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
              <Token kind={kind} size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Angka besar yang berubah pada waktu tertentu */
const Num: React.FC<{ t: number; items: [number, string, string][]; unit: string }> = ({ t, items, unit }) => {
  let cur = items[0];
  for (const it of items) if (t >= it[0]) cur = it;
  const dt = t - cur[0];
  const first = cur === items[0];
  const sc = !first && dt < 0.5 ? 1 + 0.4 * Math.sin((Math.PI * dt) / 0.5) : 1;
  return (
    <div style={{ width: 170, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...T(92, 800, cur[2]), transform: `scale(${sc})` }}>{cur[1]}</div>
      <div style={{ ...T(26, 500, WHITE), opacity: 0.85 }}>{unit}</div>
    </div>
  );
};

/** Satu baris papan harga: [benda] = [kelompok benda] [angka] */
const Row: React.FC<{
  t: number;
  at: number;
  y: number;
  h: number;
  left: Kind;
  leftSize?: number;
  nums: [number, string, string][];
  unit: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ t, at, y, h, left, leftSize = 100, nums, unit, badge, children }) => (
  <Pop t={t} at={at} dy={40} from={0.92} style={{ position: "absolute", left: 60, top: y, width: 960, height: h }}>
    <div
      style={{
        width: "100%",
        height: "100%",
        background: CARD,
        border: `3px solid ${CARD_EDGE}`,
        borderRadius: 36,
        display: "flex",
        alignItems: "center",
        padding: "0 26px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Token kind={left} size={leftSize} />
        <div style={T(28, 600)}>1 {KIND_NAME[left]}</div>
      </div>
      <div style={{ ...T(70, 800, YELLOW), width: 54, textAlign: "center" }}>=</div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>{children}</div>
      <Num t={t} items={nums} unit={unit} />
    </div>
    {badge && <div style={{ position: "absolute", top: -18, right: 34 }}>{badge}</div>}
  </Pop>
);

/* ───────────────────────── KEPO (maskot) ───────────────────────── */
const Kepo: React.FC<{ size: number; mood: KMood; t: number }> = ({ size, mood, t }) => {
  const tilt = mood === "penasaran" ? -14 : mood === "mikir" ? Math.sin(t * 6) * 10 : 0;
  const er = mood === "kaget" ? 19 : 15;
  const look = mood === "mikir" ? [-5, -6] : [0, 0];
  const eyeSquint = mood === "paham";
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 200 230" style={{ overflow: "visible" }}>
      <g transform={`rotate(${tilt} 100 82)`} style={mood === "paham" ? { filter: `drop-shadow(0 0 10px ${YELLOW})` } : undefined}>
        {mood === "paham" ? (
          <>
            <path d="M100 8 L100 52" stroke={YELLOW} strokeWidth={10} strokeLinecap="round" />
            <circle cx={100} cy={70} r={6.5} fill={YELLOW} />
          </>
        ) : (
          <>
            <path d="M80 30 C80 4 122 4 122 30 C122 46 100 46 100 60" stroke={YELLOW} strokeWidth={9} strokeLinecap="round" fill="none" />
            <circle cx={100} cy={74} r={5.5} fill={YELLOW} />
          </>
        )}
      </g>
      <rect x={74} y={194} width={52} height={22} rx={8} fill={mix(YELLOW, INDIGO, 0.55)} />
      <circle cx={100} cy={142} r={60} fill={YELLOW} />
      <ellipse cx={76} cy={108} rx={16} ry={9} fill={WHITE} opacity={0.3} transform="rotate(-30 76 108)" />
      {[74, 126].map((x) =>
        eyeSquint ? (
          <path key={x} d={`M${x - 14} 140 Q${x} 124 ${x + 14} 140`} stroke={INDIGO} strokeWidth={7} strokeLinecap="round" fill="none" />
        ) : (
          <g key={x}>
            <circle cx={x} cy={136} r={er} fill={WHITE} />
            <circle cx={x + look[0]} cy={136 + look[1]} r={mood === "kaget" ? 4.5 : 7} fill={INDIGO} />
          </g>
        ),
      )}
      {mood === "kaget" && <ellipse cx={100} cy={178} rx={8} ry={11} fill={INDIGO} />}
      {mood === "mikir" && <path d="M90 178 L112 173" stroke={INDIGO} strokeWidth={5} strokeLinecap="round" />}
      {mood === "penasaran" && <path d="M88 176 Q100 186 112 176" stroke={INDIGO} strokeWidth={5} strokeLinecap="round" fill="none" />}
      {mood === "paham" && <path d="M84 170 Q100 192 116 170 Z" fill={INDIGO} />}
    </svg>
  );
};

type KepoSeg = { a: number; b: number; x: number; y: number; size: number; mood: (t: number) => KMood };
const KEPO: KepoSeg[] = [
  { a: 0.2, b: 8.3, x: 140, y: 790, size: 170, mood: () => "penasaran" },
  { a: 37.5, b: 44.9, x: 540, y: 700, size: 250, mood: (t) => (t < 38.4 ? "kaget" : t < 41.45 ? "mikir" : "paham") },
  { a: 67.7, b: 72.6, x: 120, y: 800, size: 140, mood: () => "mikir" },
  { a: 98.4, b: 107.6, x: 540, y: 640, size: 300, mood: (t) => (t < 103.8 ? "penasaran" : "paham") },
];

const KepoLayer: React.FC<{ t: number }> = ({ t }) => (
  <>
    {KEPO.map((k, i) => {
      const o = between(t, k.a, k.b, 0.3);
      if (o <= 0.003) return null;
      const p = pop(t, k.a, 0.5);
      return (
        <div key={i} style={{ ...ctr(k.x, k.y), opacity: o, transform: `translate(-50%,-50%) translateY(${Math.sin(t * 4 + i) * 5}px) scale(${0.6 + 0.4 * p})` }}>
          <Kepo size={k.size} mood={k.mood(t)} t={t} />
        </div>
      );
    })}
  </>
);

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 8 L94 46 L82 46 L82 92 L18 92 L18 46 L6 46 Z" fill={YELLOW} strokeLinejoin="round" />
    <text x={50} y={81} textAnchor="middle" style={{ fontFamily, fontWeight: 800, fontSize: 46 }} fill={INDIGO}>
      ?
    </text>
  </svg>
);

/* ───────────────────────── LATAR & HEADER ───────────────────────── */
const Background: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 20%, ${mix(INDIGO, PURPLE, 0.55)} 0%, ${INDIGO} 62%)` }}>
    <div style={{ position: "absolute", left: -200, top: 120, width: 700, height: 700, borderRadius: 999, background: `radial-gradient(circle, ${YELLOW}22 0%, transparent 65%)` }} />
    {Array.from({ length: 30 }, (_, i) => {
      const x = (i * 173 + 61) % 1080;
      const y = (i * 331 + 97) % 1750;
      const r = 2 + (i % 3);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: 99, background: WHITE, opacity: 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.6 + i)) }} />;
    })}
  </AbsoluteFill>
);

const CHIPS: [number, number, string][] = [
  [8.4, 28.1, "Dunia Analogi"],
  [28.1, 54.7, "Kerikil Menguat"],
  [54.7, 78.6, "Perunggu Menguat"],
  [78.7, 98.3, "Rahasianya"],
];

const Header: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: 56, top: 262, display: "flex", alignItems: "center", gap: 16 }}>
      <Logo size={78} />
      <div>
        <div style={T(34, 800)}>Rumah Penasaran</div>
        <div style={T(24, 500, YELLOW)}>@rumahpenasaran</div>
      </div>
    </div>
    {CHIPS.map(([a, b, label], i) => {
      const o = between(t, a, b, 0.3);
      if (o <= 0.003) return null;
      return (
        <div key={i} style={{ position: "absolute", right: 56, top: 276, opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
          <div style={{ ...T(30, 600), background: CARD, border: `2px solid ${CARD_EDGE}`, borderRadius: 999, padding: "10px 26px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 99, background: YELLOW }} />
            {label}
          </div>
        </div>
      );
    })}
  </>
);

/* ───────────────────────── SUBTITLE (sinkron VO) ───────────────────────── */
type Cue = { s: number; e: number; text: string };
/** [[kata kunci]] = kuning. Maks 7 kata per layar. */
const CUES: Cue[] = [
  // BAGIAN 1 — HOOK
  { s: 0.2, e: 2.85, text: "Kok bisa ya, [[Rupiah melemah]] terhadap Dolar," },
  { s: 2.85, e: 4.6, text: "tetapi [[Euro]] justru tidak ikut" },
  { s: 4.6, e: 5.9, text: "[[melemah]] terhadap Dolar?" },
  { s: 6.36, e: 7.1, text: "Biar nggak [[pusing]]," },
  { s: 7.22, e: 8.5, text: "coba kita bikin [[pasar sendiri]]!" },
  // BAGIAN 2 — MEMBANGUN DUNIA ANALOGI
  { s: 8.82, e: 10.6, text: "Bayangkan ada [[empat benda]]." },
  { s: 10.82, e: 12.9, text: "Satu batang emas mewakili [[Euro]]." },
  { s: 13.0, e: 15.3, text: "Satu koin perak mewakili [[Dolar Australia]]." },
  { s: 15.5, e: 17.6, text: "Satu keping perunggu mewakili [[Dolar Amerika]]." },
  { s: 17.78, e: 20.0, text: "Dan satu butir kerikil mewakili [[Rupiah]]." },
  { s: 20.22, e: 21.5, text: "Di pasar ini, satu [[emas]]" },
  { s: 21.5, e: 23.5, text: "bisa ditukar dengan [[empat perunggu]]." },
  { s: 23.72, e: 25.2, text: "Satu perak dengan [[dua perunggu]]." },
  { s: 25.44, e: 27.6, text: "Sedangkan satu perunggu dengan [[sepuluh kerikil]]." },
  // BAGIAN 3 — KETIKA KERIKIL MENGUAT
  { s: 28.08, e: 30.25, text: "Suatu hari, [[kerikil]] mendadak semakin berharga!" },
  { s: 30.3, e: 31.75, text: "Kalau [[sebelumnya]] satu perunggu" },
  { s: 31.75, e: 33.7, text: "bisa ditukar dengan [[sepuluh kerikil]]," },
  { s: 33.74, e: 35.25, text: "sekarang cukup [[lima kerikil]]." },
  { s: 35.3, e: 37.4, text: "Artinya, kerikil [[menguat dua kali lipat]]." },
  { s: 37.64, e: 38.35, text: "Tapi [[tunggu]]!" },
  { s: 38.4, e: 39.87, text: "Apakah [[emas dan perak]] ikut berubah" },
  { s: 39.87, e: 41.2, text: "nilainya [[terhadap perunggu]]?" },
  { s: 41.48, e: 41.95, text: "[[Tidak!]]" },
  { s: 41.96, e: 43.2, text: "Karena [[hubungan keduanya]]" },
  { s: 43.2, e: 44.6, text: "di pasar global [[belum berubah]]." },
  { s: 44.96, e: 46.7, text: "Namun, kalau ditukar ke [[kerikil]]," },
  { s: 46.7, e: 48.1, text: "nilainya ikut [[berubah]]." },
  { s: 48.28, e: 52.6, text: "Satu emas sekarang setara [[dua puluh kerikil]]." },
  { s: 52.72, e: 54.6, text: "Satu perak setara [[sepuluh kerikil]]." },
  // BAGIAN 4 — KETIKA PERUNGGU MENGUAT GLOBAL
  { s: 54.66, e: 55.95, text: "Sekarang situasinya [[berbeda]]." },
  { s: 56.1, e: 57.5, text: "Bayangkan [[perunggu]] mendadak diburu" },
  { s: 57.5, e: 59.0, text: "semua orang di [[seluruh dunia]]." },
  { s: 59.1, e: 60.45, text: "Satu emas yang tadinya [[bernilai empat perunggu]]," },
  { s: 60.45, e: 61.45, text: "sekarang cuma [[dua]]." },
  { s: 61.68, e: 63.5, text: "Satu perak yang tadinya [[dua perunggu]]," },
  { s: 63.66, e: 64.7, text: "sekarang cuma [[satu]]." },
  { s: 64.82, e: 66.5, text: "Sementara satu [[perunggu]] kini bernilai" },
  { s: 66.5, e: 67.6, text: "[[dua puluh kerikil]]." },
  { s: 67.76, e: 68.95, text: "[[Perhatikan baik-baik]]!" },
  { s: 69.0, e: 70.8, text: "Emas dan perak [[sama-sama]] kehilangan" },
  { s: 70.8, e: 72.4, text: "[[setengah nilainya]] terhadap perunggu." },
  { s: 72.76, e: 74.9, text: "Tetapi [[perbandingan]] emas dan perak" },
  { s: 74.9, e: 75.8, text: "[[tetap sama]]!" },
  { s: 75.9, e: 77.5, text: "Satu [[emas]] tetap bisa ditukar" },
  { s: 77.5, e: 78.6, text: "dengan [[dua perak]]." },
  // BAGIAN 5 — MEMBONGKAR RAHASIANYA
  { s: 78.78, e: 81.0, text: "Inilah alasan mengapa [[pasangan mata uang]]" },
  { s: 81.0, e: 82.3, text: "bisa bergerak [[berbeda]]." },
  { s: 82.3, e: 85.05, text: "Kita selalu [[membandingkan]] dua mata uang sekaligus," },
  { s: 85.05, e: 87.6, text: "bukan menilai [[kekuatannya]] secara sendirian." },
  { s: 87.82, e: 90.4, text: "Dalam forex, hubungan ini disebut [[cross-rate]]." },
  { s: 90.5, e: 92.28, text: "Dan kalau harga di berbagai [[jalur]]" },
  { s: 92.28, e: 93.74, text: "pertukaran [[tidak seimbang]]," },
  { s: 93.74, e: 96.34, text: "pelaku pasar bisa memanfaatkan [[selisihnya]]" },
  { s: 96.34, e: 98.1, text: "melalui [[triangular arbitrage]]." },
  // BAGIAN 6 — PENUTUP
  { s: 98.6, e: 100.55, text: "Jadi, ketika melihat [[grafik forex]]," },
  { s: 100.55, e: 103.7, text: "jangan cuma bertanya [[siapa yang menguat]]." },
  { s: 103.84, e: 105.4, text: "Tanyakan juga: [[menguat terhadap siapa]]?" },
  { s: 105.48, e: 107.0, text: "Besok [[penasaran]] apa lagi?" },
];

const Subtitle: React.FC<{ t: number }> = ({ t }) => {
  let cue: Cue | undefined;
  for (const c of CUES) if (t >= c.s && t < c.e + 0.15) cue = c;
  if (!cue) return null;
  const a = clamp01((t - cue.s) / 0.12);
  const parts = cue.text.split(/(\[\[.*?\]\])/g).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 0, top: 1305, width: 1080, height: 190, display: "flex", alignItems: "center", justifyContent: "center", opacity: a }}>
      <div
        style={{
          ...T(54, 600),
          lineHeight: 1.22,
          maxWidth: 960,
          textAlign: "center",
          background: "rgba(30,27,75,0.8)",
          borderRadius: 32,
          padding: "20px 38px",
          transform: `translateY(${(1 - a) * 10}px)`,
        }}
      >
        {parts.map((p, i) =>
          p.startsWith("[[") ? (
            <span key={i} style={{ color: YELLOW }}>
              {p.slice(2, -2)}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </div>
    </div>
  );
};

/* ───────────────────────── LANTAI ISOMETRIK & GERAI ───────────────────────── */
const Floor: React.FC = () => {
  const Tp = [540, 250];
  const R = [1010, 520];
  const B = [540, 790];
  const L = [70, 520];
  const pt = (a: number[], b: number[], p: number) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
  const lines: React.ReactNode[] = [];
  for (let k = 1; k <= 5; k++) {
    const p = k / 6;
    const a1 = pt(Tp, L, p);
    const a2 = pt(R, B, p);
    const b1 = pt(Tp, R, p);
    const b2 = pt(L, B, p);
    lines.push(<line key={`a${k}`} x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} />);
    lines.push(<line key={`b${k}`} x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} />);
  }
  return (
    <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
      <polygon points={`${L} ${B} ${B[0]},${B[1] + 30} ${L[0]},${L[1] + 30}`} fill={mix(PURPLE, INDIGO, 0.55)} />
      <polygon points={`${R} ${B} ${B[0]},${B[1] + 30} ${R[0]},${R[1] + 30}`} fill={mix(PURPLE, INDIGO, 0.75)} />
      <polygon points={`${Tp} ${R} ${B} ${L}`} fill={PURPLE} stroke={CARD_EDGE} strokeWidth={3} />
      <g stroke={CARD_EDGE} strokeWidth={2} opacity={0.6}>
        {lines}
      </g>
    </svg>
  );
};

const Stall: React.FC<{
  kind: Kind;
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  h: number;
  t: number;
  at: number;
  label: string;
  charSize: number;
}> = ({ kind, cx, cy, hw, hh, h, t, at, label, charSize }) => {
  const base = KIND_COLOR[kind];
  const top = `${cx},${cy - h - hh} ${cx + hw},${cy - h} ${cx},${cy - h + hh} ${cx - hw},${cy - h}`;
  const left = `${cx - hw},${cy - h} ${cx},${cy - h + hh} ${cx},${cy + hh} ${cx - hw},${cy}`;
  const right = `${cx + hw},${cy - h} ${cx},${cy - h + hh} ${cx},${cy + hh} ${cx + hw},${cy}`;
  return (
    <Pop t={t} at={at} dy={50} from={0.8} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 900, transformOrigin: `${cx}px ${cy}px` }}>
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <polygon points={left} fill={mix(base, INDIGO, 0.4)} />
        <polygon points={right} fill={mix(base, INDIGO, 0.6)} />
        <polygon points={top} fill={mix(base, INDIGO, 0.12)} stroke={mix(base, WHITE, 0.3)} strokeWidth={2} />
      </svg>
      <div style={ctr(cx, cy - h - charSize * 0.5)}>
        <div style={{ transform: `translateY(${Math.sin(t * 3 + cx) * 4}px)` }}>
          <Token kind={kind} size={charSize} face />
        </div>
      </div>
      <div style={{ ...ctr(cx, cy + hh + 34), ...T(28, 600), whiteSpace: "nowrap" }}>{label}</div>
    </Pop>
  );
};

/* ───────────────────────── ADEGAN 1: HOOK (0 – 8,6 dtk) ───────────────────────── */
const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - ramp(t, 8.2, 0.4);
  if (t > 8.7) return null;
  const zoom = 0.94 + 0.16 * ramp(t, 5.8, 2.6);
  const boardsO = 1 - ramp(t, 5.6, 0.4);
  return (
    <Fade o={o}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 58%", opacity: 1 - 0.45 * ramp(t, 6.2, 0.5) }}>
        <Floor />
        <Stall kind="gold" cx={230} cy={520} hw={90} hh={45} h={70} t={t} at={0.05} label="Gerai Emas" charSize={110} />
        <Stall kind="silver" cx={540} cy={360} hw={90} hh={45} h={60} t={t} at={0.15} label="Gerai Perak" charSize={110} />
        <Stall kind="bronze" cx={540} cy={640} hw={130} hh={65} h={80} t={t} at={0.25} label="Alun-alun Perunggu" charSize={130} />
        <Stall kind="pebble" cx={850} cy={520} hw={90} hh={45} h={70} t={t} at={0.35} label="Gerai Kerikil" charSize={110} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: boardsO }}>
        <Pop t={t} at={0.9} dy={-30} style={{ position: "absolute", left: 50, top: 20, width: 450, height: 170 }}>
          <div style={{ height: "100%", background: CARD, border: `3px solid ${PINK}`, borderRadius: 34, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={T(40, 800)}>IDR / USD</div>
            <Pill text="melemah" bg={PINK} icon={<TriIcon up={false} color={INDIGO} size={30} />} size={34} />
          </div>
        </Pop>
        <Pop t={t} at={2.9} dy={-30} style={{ position: "absolute", left: 580, top: 20, width: 450, height: 170 }}>
          <div style={{ height: "100%", background: CARD, border: `3px solid ${YELLOW}`, borderRadius: 34, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={T(40, 800)}>EUR / USD</div>
            <Pill text="stabil" bg={YELLOW} icon={<BarIcon color={INDIGO} size={30} />} size={34} />
          </div>
        </Pop>
      </div>
      <Pop t={t} at={6.36} dy={30} style={{ ...ctr(540, 120), textAlign: "center" }}>
        <div style={T(92, 800)}>Pasar</div>
        <div style={{ ...T(92, 800, YELLOW), marginTop: 4 }}>Empat Nilai</div>
      </Pop>
    </Fade>
  );
};

/* ───────────────────────── ADEGAN 2: DUNIA ANALOGI (8,4 – 28,1 dtk) ───────────────────────── */
const CELLS: Record<Kind, [number, number, number]> = {
  gold: [300, 250, 10.82],
  silver: [780, 250, 13.0],
  bronze: [300, 620, 15.5],
  pebble: [780, 620, 17.78],
};
const Sec2: React.FC<{ t: number }> = ({ t }) => {
  const o = between(t, 8.4, 28.1, 0.3);
  if (o <= 0.003) return null;
  const charO = 1 - ramp(t, 19.9, 0.4);
  const kinds: Kind[] = ["gold", "silver", "bronze", "pebble"];
  return (
    <Fade o={o}>
      {charO > 0.003 && (
        <div style={{ position: "absolute", inset: 0, opacity: charO }}>
          {kinds.map((k, i) => {
            const [x, y, at] = CELLS[k];
            const slotAt = 8.9 + i * 0.25;
            const slotO = t >= at ? 0 : 1;
            return (
              <React.Fragment key={k}>
                {slotO > 0 && (
                  <Pop t={t} at={slotAt} style={ctr(x, y - 20)}>
                    <div style={{ width: 190, height: 190, borderRadius: 999, border: `5px dashed ${CARD_EDGE}`, display: "flex", alignItems: "center", justifyContent: "center", ...T(90, 800, CARD_EDGE) }}>?</div>
                  </Pop>
                )}
                <CharCard kind={k} x={x} y={y} size={200} t={t} at={at} mood={t > at + 0.4 ? "happy" : "wow"} />
              </React.Fragment>
            );
          })}
        </div>
      )}
      <Row t={t} at={20.22} y={30} h={250} left="gold" leftSize={130} nums={[[21.5, "4", YELLOW]]} unit="perunggu">
        <Group kind="bronze" count={4} size={96} cols={4} t={t} at={21.5} stagger={0.18} />
      </Row>
      <Row t={t} at={23.72} y={310} h={250} left="silver" leftSize={130} nums={[[24.2, "2", YELLOW]]} unit="perunggu">
        <Group kind="bronze" count={2} size={96} cols={4} t={t} at={24.2} stagger={0.2} />
      </Row>
      <Row t={t} at={25.44} y={590} h={250} left="bronze" leftSize={130} nums={[[26.3, "10", YELLOW]]} unit="kerikil">
        <Group kind="pebble" count={10} size={70} cols={5} t={t} at={26.3} stagger={0.12} />
      </Row>
    </Fade>
  );
};

/* ───────────────────────── ADEGAN 3: KERIKIL MENGUAT (28,1 – 54,8 dtk) ───────────────────────── */
const Sec3: React.FC<{ t: number }> = ({ t }) => {
  const o = between(t, 28.0, 54.9, 0.25);
  if (o <= 0.003) return null;
  const pebbleO = between(t, 28.0, 37.6, 0.3);
  const qBadge =
    t < 41.48 ? (
      <Pill text="?" size={34} />
    ) : (
      <Pill text="TETAP" bg={WHITE} size={30} />
    );
  const sparks: [number, number, number][] = [
    [-170, -120, 0],
    [170, -90, 0.7],
    [-190, 40, 1.4],
    [180, 70, 2.1],
  ];
  return (
    <Fade o={o}>
      {/* papan harga */}
      <Row
        t={t}
        at={28.1}
        y={10}
        h={142}
        left="bronze"
        leftSize={90}
        nums={[
          [28.1, "10", WHITE],
          [33.74, "5", YELLOW],
        ]}
        unit="kerikil"
        badge={t >= 35.3 ? <Pop t={t} at={35.3}><Pill text="MENGUAT 2×" icon={<TriIcon up color={INDIGO} size={26} />} /></Pop> : null}
      >
        <Group kind="pebble" count={10} size={56} cols={5} t={t} at={28.5} stagger={0.08} keep={5} removeAt={33.74} growAt={33.9} growTo={1.2} />
      </Row>
      <Row t={t} at={37.64} y={162} h={142} left="gold" leftSize={90} nums={[[37.64, "4", WHITE]]} unit="perunggu" badge={t >= 38.4 ? <Pop t={t} at={t < 41.48 ? 38.4 : 41.48}>{qBadge}</Pop> : null}>
        <Group kind="bronze" count={4} size={76} cols={4} t={t} at={37.8} stagger={0.05} />
      </Row>
      <Row t={t} at={37.9} y={314} h={142} left="silver" leftSize={90} nums={[[37.9, "2", WHITE]]} unit="perunggu" badge={t >= 38.4 ? <Pop t={t} at={t < 41.48 ? 38.6 : 41.7}>{qBadge}</Pop> : null}>
        <Group kind="bronze" count={2} size={76} cols={4} t={t} at={38.0} stagger={0.05} />
      </Row>

      {/* kerikil menguat */}
      {pebbleO > 0.003 && (
        <div style={{ position: "absolute", inset: 0, opacity: pebbleO }}>
          {sparks.map(([dx, dy, ph], i) => (
            <Pop key={i} t={t} at={28.5 + ph * 0.3} style={ctr(540 + dx, 690 + dy)}>
              <div style={{ opacity: 0.5 + 0.5 * Math.sin(t * 5 + ph * 3), transform: `rotate(${t * 40}deg)` }}>
                <Spark size={46} />
              </div>
            </Pop>
          ))}
          <div style={{ ...ctr(540, 690), transform: `translate(-50%,-50%) scale(${1 + 0.18 * ramp(t, 33.9, 0.6)})` }}>
            <CharCard kind="pebble" x={0} y={0} size={240} t={t} at={28.3} mood={t >= 33.74 ? "happy" : "normal"} glow={t >= 33.74} />
          </div>
        </div>
      )}

      {/* ditukar ke kerikil */}
      <Pop t={t} at={44.96} style={ctr(540, 498)}>
        <Pill text="Kalau ditukar ke kerikil" bg={CARD} color={WHITE} size={30} />
      </Pop>
      <Row t={t} at={48.28} y={535} h={155} left="gold" leftSize={90} nums={[[49.6, "20", YELLOW]]} unit="kerikil">
        <Group kind="pebble" count={20} size={46} cols={10} t={t} at={49.0} stagger={0.05} />
      </Row>
      <Row t={t} at={52.72} y={705} h={155} left="silver" leftSize={90} nums={[[53.6, "10", YELLOW]]} unit="kerikil">
        <Group kind="pebble" count={10} size={46} cols={10} t={t} at={53.2} stagger={0.05} />
      </Row>
    </Fade>
  );
};

/* ───────────────────────── ADEGAN 4: PERUNGGU MENGUAT (54,66 – 78,4 dtk) ───────────────────────── */
const CROWD_COLORS = [WHITE, SILVER, mix(WHITE, YELLOW, 0.5), mix(PURPLE, WHITE, 0.45)];

const Buyer: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
    <path d="M20 60 L6 34 M80 60 L94 34" stroke={INDIGO} strokeWidth={8} strokeLinecap="round" />
    <circle cx={50} cy={56} r={36} fill={color} />
    {[38, 62].map((x) => (
      <g key={x}>
        <circle cx={x} cy={50} r={8} fill={WHITE} stroke={INDIGO} strokeWidth={2.5} />
        <circle cx={x} cy={51} r={3.5} fill={INDIGO} />
      </g>
    ))}
    <ellipse cx={50} cy={72} rx={6} ry={7} fill={INDIGO} />
  </svg>
);

const Sec4: React.FC<{ t: number }> = ({ t }) => {
  const o = between(t, 54.6, 78.5, 0.25);
  if (o <= 0.003) return null;
  const crowdO = between(t, 54.6, 67.6, 0.4);
  const halfO = between(t, 68.9, 72.7, 0.3);
  const ratioO = between(t, 72.7, 78.5, 0.3);
  const jump = t > 75.9 && t < 76.7 ? -Math.abs(Math.sin(((t - 75.9) / 0.8) * Math.PI * 2)) * 26 : 0;
  const eqScale = t > 75.9 ? 1 + 0.35 * Math.max(0, Math.sin(((t - 75.9) / 0.8) * Math.PI)) : 1;
  return (
    <Fade o={o}>
      {/* papan harga: kondisi baru */}
      <Row
        t={t}
        at={54.9}
        y={10}
        h={142}
        left="gold"
        leftSize={90}
        nums={[
          [54.9, "4", WHITE],
          [60.4, "2", PINK],
        ]}
        unit="perunggu"
        badge={t >= 69.2 ? <Pop t={t} at={69.2}><Pill text="½ nilai" bg={PINK} size={28} /></Pop> : null}
      >
        <Group kind="bronze" count={4} size={76} cols={4} t={t} at={55.1} stagger={0.05} keep={2} removeAt={60.4} />
      </Row>
      <Row
        t={t}
        at={55.2}
        y={162}
        h={142}
        left="silver"
        leftSize={90}
        nums={[
          [55.2, "2", WHITE],
          [63.66, "1", PINK],
        ]}
        unit="perunggu"
        badge={t >= 69.5 ? <Pop t={t} at={69.5}><Pill text="½ nilai" bg={PINK} size={28} /></Pop> : null}
      >
        <Group kind="bronze" count={2} size={76} cols={4} t={t} at={55.4} stagger={0.05} keep={1} removeAt={63.66} />
      </Row>
      <Row
        t={t}
        at={55.5}
        y={314}
        h={142}
        left="bronze"
        leftSize={90}
        nums={[
          [55.5, "10", WHITE],
          [66.0, "20", YELLOW],
        ]}
        unit="kerikil"
        badge={t >= 66.0 ? <Pop t={t} at={66.0}><Pill text="MENGUAT" icon={<TriIcon up color={INDIGO} size={24} />} size={28} /></Pop> : null}
      >
        <Group kind="pebble" count={20} size={44} cols={10} t={t} at={55.7} stagger={0.04} baseCount={10} addAt={66.0} />
      </Row>

      {/* alun-alun perunggu: pembeli mengerumuni */}
      {crowdO > 0.003 && (
        <div style={{ position: "absolute", left: 0, top: 490, width: 1080, height: 400, overflow: "hidden", opacity: crowdO }}>
          {Array.from({ length: 12 }, (_, i) => {
            const th = (i / 12) * Math.PI * 2 + 0.3;
            const p = ramp(t, 56.1 + i * 0.12, 1.7);
            const rx = lerp(780, 350, p);
            const ry = lerp(360, 125, p);
            const x = 540 + Math.cos(th) * rx;
            const y = 205 + Math.sin(th) * ry + Math.sin(t * 7 + i) * 5 * p;
            return (
              <div key={i} style={{ ...ctr(x, y), opacity: clamp01((t - 56.0) / 0.3), zIndex: Math.round(y) }}>
                <Buyer color={CROWD_COLORS[i % 4]} size={96} />
              </div>
            );
          })}
          <div style={{ ...ctr(540, 205), zIndex: 999 }}>
            <Pop t={t} at={54.8}>
              <Token kind="bronze" size={200} face mood={t < 56.4 ? "normal" : t < 59 ? "wow" : "happy"} glow={t > 58.9} />
            </Pop>
          </div>
          {t > 58.0 && (
            <Pop t={t} at={58.0} style={{ ...ctr(540, 30), zIndex: 1000 }}>
              <Pill text="DIBURU!" size={36} icon={<TriIcon up color={INDIGO} size={30} />} />
            </Pop>
          )}
        </div>
      )}

      {/* emas & perak kehilangan setengah nilai */}
      {halfO > 0.003 && (
        <div style={{ position: "absolute", inset: 0, opacity: halfO }}>
          <CharCard kind="gold" x={390} y={690} size={190} t={t} at={69.0} mood="wow" showCode={false} />
          <CharCard kind="silver" x={750} y={690} size={190} t={t} at={69.5} mood="wow" showCode={false} />
          <Pop t={t} at={69.2} style={ctr(470, 560)}>
            <Pill text="½" bg={PINK} size={50} />
          </Pop>
          <Pop t={t} at={69.5} style={ctr(830, 560)}>
            <Pill text="½" bg={PINK} size={50} />
          </Pop>
        </div>
      )}

      {/* perbandingan tetap 1 : 2 */}
      {ratioO > 0.003 && (
        <div style={{ position: "absolute", inset: 0, opacity: ratioO }}>
          <Pop t={t} at={72.8} style={ctr(230, 640 + jump)}>
            <Token kind="gold" size={200} face mood="happy" />
          </Pop>
          <Pop t={t} at={73.2} style={{ ...ctr(425, 640), ...T(120, 800, YELLOW), transform: `translate(-50%,-50%) scale(${eqScale})` }}>
            =
          </Pop>
          <Pop t={t} at={73.5} style={ctr(600, 640 + jump)}>
            <Token kind="silver" size={170} face mood="happy" />
          </Pop>
          <Pop t={t} at={73.8} style={ctr(800, 640 + jump)}>
            <Token kind="silver" size={170} face mood="happy" />
          </Pop>
          <Pop t={t} at={74.3} style={ctr(540, 835)}>
            <div style={T(120, 800, YELLOW)}>1 : 2</div>
          </Pop>
        </div>
      )}
    </Fade>
  );
};

/* ───────────────────────── ADEGAN 5: MEMBONGKAR RAHASIA (78,7 – 98,3 dtk) ───────────────────────── */
const LinkLine: React.FC<{ x1: number; x2: number; y: number; t: number; at: number; color?: string }> = ({ x1, x2, y, t, at, color = YELLOW }) => {
  const p = ramp(t, at, 0.6);
  return (
    <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1={x1} y1={y} x2={lerp(x1, x2, p)} y2={y} stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 18" strokeDashoffset={-t * 60} />
    </svg>
  );
};

const NODES = { E: [540, 150], P: [220, 640], B: [860, 640] } as const;
const along = (a: readonly number[], b: readonly number[], p: number): [number, number] => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];

const GeraiNode: React.FC<{ kind: Kind; pos: readonly number[]; name: string; t: number; at: number; warn?: boolean }> = ({ kind, pos, name, t, at, warn = false }) => (
  <Pop t={t} at={at} style={ctr(pos[0], pos[1])}>
    <div style={{ width: 290, height: 120, background: CARD, border: `4px solid ${warn ? PINK : CARD_EDGE}`, borderRadius: 30, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", boxSizing: "border-box" }}>
      <Token kind={kind} size={74} />
      <div style={T(30, 800)}>{name}</div>
    </div>
  </Pop>
);

const Sec5: React.FC<{ t: number }> = ({ t }) => {
  const o = between(t, 78.6, 98.3, 0.25);
  if (o <= 0.003) return null;
  const aO = between(t, 78.7, 82.2, 0.3);
  const bO = between(t, 82.2, 87.7, 0.3);
  const cO = between(t, 87.7, 90.4, 0.3);
  const dO = between(t, 90.4, 98.3, 0.3);

  // jalur benda pada triangular arbitrage
  const [pE1, pP0, pP1, pB0, pB1, pE0] = [
    along(NODES.E, NODES.P, 0.25),
    along(NODES.E, NODES.P, 0.75),
    along(NODES.P, NODES.B, 0.25),
    along(NODES.P, NODES.B, 0.75),
    along(NODES.B, NODES.E, 0.25),
    along(NODES.B, NODES.E, 0.75),
  ];
  const knots: [number, [number, number]][] = [
    [93.74, pE1],
    [94.55, pP0],
    [94.85, pP1],
    [95.65, pB0],
    [95.95, pB1],
    [96.75, pE0],
  ];
  let cp = knots[0][1];
  for (let i = 0; i < knots.length - 1; i++) {
    const [ta, pa] = knots[i];
    const [tb, pb] = knots[i + 1];
    if (t >= ta && t <= tb) {
      const k = Easing.inOut(Easing.quad)(clamp01((t - ta) / (tb - ta)));
      cp = [lerp(pa[0], pb[0], k), lerp(pa[1], pb[1], k)];
    } else if (t > tb) cp = pb;
  }
  const carry: { kind: Kind; n: number } = t < 94.55 ? { kind: "gold", n: 1 } : t < 95.65 ? { kind: "silver", n: 3 } : t < 96.75 ? { kind: "bronze", n: 6 } : { kind: "gold", n: 2 };
  const carrySize = carry.n >= 6 ? 44 : carry.n === 3 ? 52 : 70;
  const sincePop = t < 94.55 ? 0 : t < 95.65 ? t - 94.55 : t < 96.75 ? t - 95.65 : t - 96.75;
  const carrySc = t >= 93.74 ? 1 + 0.25 * Math.max(0, Math.sin(clamp01(sincePop / 0.4) * Math.PI)) : 1;

  return (
    <Fade o={o}>
      {/* 5a — pasangan mata uang bergerak berbeda */}
      <Fade o={aO}>
        <CharCard kind="gold" x={240} y={200} size={170} t={t} at={78.9} showCode={false} />
        <CharCard kind="bronze" x={840} y={200} size={170} t={t} at={78.9} showCode={false} />
        <LinkLine x1={350} x2={730} y={190} t={t} at={79.3} />
        <Pop t={t} at={79.3} style={ctr(540, 130)}>
          <div style={T(40, 800)}>EUR / USD</div>
        </Pop>
        <Pop t={t} at={79.6} style={ctr(540, 255)}>
          <Pill text="stabil" icon={<BarIcon color={INDIGO} size={28} />} size={32} />
        </Pop>
        <CharCard kind="pebble" x={240} y={600} size={170} t={t} at={80.1} showCode={false} />
        <CharCard kind="bronze" x={840} y={600} size={170} t={t} at={80.1} showCode={false} />
        <LinkLine x1={350} x2={730} y={590} t={t} at={80.5} color={PINK} />
        <Pop t={t} at={80.5} style={ctr(540, 530)}>
          <div style={T(40, 800)}>IDR / USD</div>
        </Pop>
        <Pop t={t} at={80.8} style={ctr(540, 655)}>
          <Pill text="melemah" bg={PINK} icon={<TriIcon up={false} color={INDIGO} size={28} />} size={32} />
        </Pop>
      </Fade>

      {/* 5b — selalu membandingkan dua mata uang */}
      <Fade o={bO}>
        <CharCard kind="silver" x={250} y={400} size={200} t={t} at={82.4} showCode={false} />
        <CharCard kind="gold" x={830} y={400} size={200} t={t} at={82.6} showCode={false} o={t > 85.05 ? 0.2 : 1} />
        {t < 85.2 && <LinkLine x1={380} x2={700} y={390} t={t} at={83.0} />}
        {t < 85.2 && (
          <Pop t={t} at={83.0} style={ctr(540, 300)}>
            <Pill text="dibandingkan" size={32} />
          </Pop>
        )}
        <Pop t={t} at={85.05} style={ctr(250, 400)}>
          <CrossIcon color={PINK} size={230} />
        </Pop>
        <Pop t={t} at={85.2} style={ctr(540, 700)}>
          <Pill text="sendirian" bg={PINK} size={40} />
        </Pop>
      </Fade>

      {/* 5c — cross-rate */}
      <Fade o={cO}>
        <Pop t={t} at={87.85} style={ctr(540, 90)}>
          <div style={T(104, 800, YELLOW)}>CROSS-RATE</div>
        </Pop>
        <CharCard kind="gold" x={200} y={380} size={150} t={t} at={88.1} showCode={false} />
        <CharCard kind="bronze" x={540} y={380} size={150} t={t} at={88.3} showCode={false} />
        <CharCard kind="silver" x={880} y={380} size={150} t={t} at={88.5} showCode={false} />
        <LinkLine x1={300} x2={440} y={360} t={t} at={88.6} />
        <LinkLine x1={640} x2={780} y={360} t={t} at={88.8} />
        <Pop t={t} at={88.6} style={ctr(370, 290)}>
          <Pill text="1 : 4" size={30} />
        </Pop>
        <Pop t={t} at={88.8} style={ctr(710, 290)}>
          <Pill text="1 : 2" size={30} />
        </Pop>
        <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M200 580 Q540 840 880 580" stroke={YELLOW} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="4 18" strokeDashoffset={-t * 60} opacity={ramp(t, 89.2, 0.6)} />
        </svg>
        <Pop t={t} at={89.4} style={ctr(540, 700)}>
          <Pill text="Emas : Perak = 1 : 2" size={38} />
        </Pop>
      </Fade>

      {/* 5d — triangular arbitrage */}
      <Fade o={dO}>
        <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
          <polygon
            points={`${NODES.E[0]},${NODES.E[1]} ${NODES.P[0]},${NODES.P[1]} ${NODES.B[0]},${NODES.B[1]}`}
            fill="none"
            stroke={WHITE}
            strokeOpacity={0.4 * ramp(t, 90.7, 0.6)}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeDasharray="4 16"
            strokeLinecap="round"
            strokeDashoffset={-t * 40}
          />
        </svg>
        <GeraiNode kind="gold" pos={NODES.E} name="Gerai Emas" t={t} at={90.6} />
        <GeraiNode kind="silver" pos={NODES.P} name="Gerai Perak" t={t} at={90.9} warn={t >= 92.3 && t < 97} />
        <GeraiNode kind="bronze" pos={NODES.B} name="Gerai Perunggu" t={t} at={91.2} />
        {t >= 92.3 && t < 97.1 && (
          <Pop t={t} at={92.3} style={ctr(220, 745)}>
            <Pill text="Selisih!" bg={PINK} size={34} />
          </Pop>
        )}
        {/* pembawa barang: tiga proses pertukaran */}
        {t >= 91.6 && (
          <Pop t={t} at={91.6} style={{ ...ctr(cp[0], cp[1]), zIndex: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", width: carry.n >= 6 ? 3 * carrySize * 0.8 : "auto", justifyContent: "center", alignItems: "center", gap: 4, transform: `scale(${carrySc})`, filter: `drop-shadow(0 0 10px ${YELLOW})` }}>
              {Array.from({ length: carry.n }, (_, i) => (
                <div key={i} style={{ transform: carry.kind === "gold" && carry.n === 2 && i === 1 ? "scale(0.55)" : undefined }}>
                  <Token kind={carry.kind} size={carrySize} />
                </div>
              ))}
            </div>
          </Pop>
        )}
        <Pop t={t} at={93.74} style={ctr(205, 385)}>
          <Pill text="1 Emas = 3 Perak" bg={CARD} color={WHITE} size={26} />
        </Pop>
        <Pop t={t} at={94.85} style={ctr(540, 585)}>
          <Pill text="3 Perak = 6 Perunggu" bg={CARD} color={WHITE} size={26} />
        </Pop>
        <Pop t={t} at={95.95} style={ctr(875, 385)}>
          <Pill text="6 Perunggu = 1,5 Emas" bg={CARD} color={WHITE} size={26} />
        </Pop>
        <Pop t={t} at={96.85} style={ctr(540, 400)}>
          <Pill text="+0,5 Emas" size={56} icon={<TriIcon up color={INDIGO} size={40} />} />
        </Pop>
        <Pop t={t} at={96.34} style={ctr(540, 840)}>
          <div style={T(46, 800, YELLOW)}>Triangular Arbitrage</div>
        </Pop>
      </Fade>
    </Fade>
  );
};

/* ───────────────────────── ADEGAN 6: PENUTUP (98,4 – 107 dtk) ───────────────────────── */
const Sec6: React.FC<{ t: number }> = ({ t }) => {
  const o = between(t, 98.4, 108, 0.3);
  if (o <= 0.003) return null;
  const kinds: Kind[] = ["gold", "silver", "bronze", "pebble"];
  const xs = [200, 420, 640, 860];
  return (
    <Fade o={o}>
      {kinds.map((k, i) => (
        <CharCard key={k} kind={k} x={xs[i]} y={270} size={150} t={t} at={98.7 + i * 0.25} mood="happy" showCode={false} />
      ))}
      {t >= 100.55 && t < 103.8 && (
        <Pop t={t} at={100.55} style={{ ...ctr(540, 40), textAlign: "center" }}>
          <div style={{ ...T(72, 800), whiteSpace: "nowrap" }}>
            Siapa yang <span style={{ color: YELLOW }}>menguat</span>?
          </div>
        </Pop>
      )}
      {t >= 103.84 && (
        <Pop t={t} at={103.84} style={{ ...ctr(540, 40), textAlign: "center" }}>
          <div style={{ ...T(72, 800), whiteSpace: "nowrap" }}>
            Menguat terhadap <span style={{ color: YELLOW }}>siapa</span>?
          </div>
        </Pop>
      )}
      <Pop t={t} at={105.5} style={ctr(540, 850)}>
        <Pill text="Follow @rumahpenasaran" size={38} />
      </Pop>
    </Fade>
  );
};

/* ───────────────────────── KOMPOSISI UTAMA ───────────────────────── */
export const Kurs: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / KURS_FPS;
  return (
    <AbsoluteFill style={{ fontFamily, overflow: "hidden" }}>
      <Background t={t} />
      {VOICE_OVER_SRC ? <Audio src={staticFile(VOICE_OVER_SRC)} /> : null}
      <Header t={t} />
      <div style={{ position: "absolute", left: 0, top: 350, width: 1080, height: 900 }}>
        <HookScene t={t} />
        <Sec2 t={t} />
        <Sec3 t={t} />
        <Sec4 t={t} />
        <Sec5 t={t} />
        <Sec6 t={t} />
        <KepoLayer t={t} />
      </div>
      <Subtitle t={t} />
    </AbsoluteFill>
  );
};

export default Kurs;
