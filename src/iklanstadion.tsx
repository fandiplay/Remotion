/**
 * RUMAH PENASARAN — "Kok Iklan di Stadion Bisa Berbeda di Setiap Negara?"
 * File tunggal: src/iklanstadion.tsx
 *
 * Cara pakai di src/Root.tsx:
 *
 *   import { IklanStadion, IKLAN_STADION_CONFIG } from "./iklanstadion";
 *   <Composition component={IklanStadion} {...IKLAN_STADION_CONFIG} />
 *
 * Spesifikasi: 1080x1920 · 30 fps · 3150 frame (105 detik) · tanpa audio/voice over.
 * Subtitle + penanda (marker) ada di bagian "SKRIP SUBTITLE & MARKER" di bawah.
 * Hanya memakai package: react, remotion, @remotion/google-fonts.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "800"],
  subsets: ["latin"],
});

/* ═══════════════════════════════════════════════════════════════════
 * KONFIGURASI
 * ═══════════════════════════════════════════════════════════════════ */
export const IKLAN_STADION_CONFIG = {
  id: "IklanStadion",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 3150,
} as const;

/** true = tampilkan HUD marker (nama scene + frame) di Studio. Set false saat render final. */
const SHOW_MARKERS = false;

/** Palet identitas (tidak boleh ada warna baru). Pink hanya untuk makna bahaya — tidak dipakai di video ini. */
const C = {
  bg: "#1E1B4B",
  card: "#4C1D95",
  accent: "#FBBF24",
  text: "#FFFFFF",
  bad: "#FB7185",
} as const;

/** Safe area (canvas 1080x1920). */
const SAFE = { top: 250, bottom: 1250, subTop: 1305, subH: 190 } as const;

/* ═══════════════════════════════════════════════════════════════════
 * HELPER
 * ═══════════════════════════════════════════════════════════════════ */
const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.out(Easing.cubic);
const eio = Easing.inOut(Easing.cubic);

/** Tween 0..1 (atau from..to) antara frame a dan b, dengan clamp. */
const tw = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (t: number) => number = eo,
): number => interpolate(f, [a, b], [from, to], { ...clampX, easing });

const useSpr = (delay = 0, damping = 14, stiffness = 110): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping, stiffness },
  });
};

const rnd = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const CROWD = Array.from({ length: 170 }, (_, i) => ({
  x: rnd(i * 3 + 1) * 1080,
  y: 370 + rnd(i * 3 + 2) * 290,
  r: 3 + rnd(i * 3 + 3) * 3,
}));

/** Teks dengan kata kunci kuning: bungkus kata dengan *tanda bintang*. */
const Hl: React.FC<{ text: string; bold?: boolean }> = ({ text, bold }) => (
  <>
    {text.split("*").map((p, i) =>
      i % 2 === 1 ? (
        <span
          key={i}
          style={{ color: C.accent, fontWeight: bold ? 800 : undefined }}
        >
          {p}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

/* ═══════════════════════════════════════════════════════════════════
 * SKRIP SUBTITLE & MARKER
 * Subtitle tampil sesuai cue (frame ABSOLUT). Karena belum ada audio,
 * timing dibagi proporsional dari panjang teks di dalam tiap scene.
 * Kalau nanti ada audio/timestamp asli: isi SUBTITLE_OVERRIDE dengan
 * [{ from, to, text }] — otomatis menggantikan cue otomatis.
 * ═══════════════════════════════════════════════════════════════════ */
type Expr = "penasaran" | "mikir" | "kaget" | "paham";
type Cue = { from: number; to: number; text: string };

type SceneDef = {
  no: string;
  name: string;
  from: number;
  dur: number;
  kepo: Expr;
  lines: string[];
};

const SCENES: SceneDef[] = [
  // ▶ MARKER SCENE 01 — frame 0–180
  {
    no: "01",
    name: "THE HOOK",
    from: 0,
    dur: 180,
    kepo: "penasaran",
    lines: [
      "Kok bisa ya, iklan di papan stadion *berbeda*,",
      "padahal pertandingan yang ditonton sama?",
    ],
  },
  // ▶ MARKER SCENE 02 — frame 180–510
  {
    no: "02",
    name: "THE MYSTERY",
    from: 180,
    dur: 330,
    kepo: "mikir",
    lines: [
      "Rahasianya ada di teknologi *virtual advertising*.",
      "Iklan bisa diganti khusus pada gambar siaran televisi,",
      "tanpa harus mengganti tampilan yang dilihat penonton di *stadion*.",
    ],
  },
  // ▶ MARKER SCENE 03 — frame 510–810
  {
    no: "03",
    name: "THE REVEAL",
    from: 510,
    dur: 300,
    kepo: "kaget",
    lines: [
      "Jadi, orang di tribun bisa melihat iklan *fisik* yang sama.",
      "Sementara penonton di negara berbeda",
      "menerima versi siaran dengan iklan *berbeda*.",
    ],
  },
  // ▶ MARKER SCENE 04 — frame 810–1410 (momen visual utama)
  {
    no: "04",
    name: "LED CHROMA KEY TRICK",
    from: 810,
    dur: 600,
    kepo: "kaget",
    lines: [
      "Salah satu pendekatan yang dikembangkan *Fraunhofer*",
      "memakai trik waktu.",
      "Dalam satu siklus *20 milidetik*,",
      "papan menampilkan iklan selama 18 milidetik,",
      "lalu warna magenta selama dua milidetik.",
      "Kamera diatur untuk menangkap *kilatan* singkat itu.",
    ],
  },
  // ▶ MARKER SCENE 05 — frame 1410–1830
  {
    no: "05",
    name: "DIGITAL REPLACEMENT",
    from: 1410,
    dur: 420,
    kepo: "mikir",
    lines: [
      "Di studio, area *magenta* pada rekaman",
      "diganti dengan iklan yang ditargetkan.",
      "Ini teknik *chroma key*, mirip prinsip green screen,",
      "tetapi warna kuncinya muncul sesaat dari panel LED.",
    ],
  },
  // ▶ MARKER SCENE 06 — frame 1830–2220
  {
    no: "06",
    name: "CAMERA TRACKING",
    from: 1830,
    dur: 390,
    kepo: "mikir",
    lines: [
      "Supaya iklan baru tetap menempel saat kamera bergerak,",
      "sistem *melacak* sudut dan arah kamera.",
      "Pemain yang melintas di depannya",
      "juga harus tetap *natural*.",
    ],
  },
  // ▶ MARKER SCENE 07 — frame 2220–2700
  {
    no: "07",
    name: "NOT JUST ONE METHOD",
    from: 2220,
    dur: 480,
    kepo: "paham",
    lines: [
      "Ada *pendekatan* lain.",
      "Platform seperti Supponor memproses sinyal siaran",
      "dengan perangkat lunak berbasis *AI* dan machine learning,",
      "lalu menampilkan pesan yang disesuaikan untuk pasar tertentu.",
      "Jadi, tidak semua sistem memakai trik yang *sama*.",
    ],
  },
  // ▶ MARKER SCENE 08 — frame 2700–3150
  {
    no: "08",
    name: "CONCLUSION",
    from: 2700,
    dur: 450,
    kepo: "paham",
    lines: [
      "Intinya, yang berubah bukan stadionnya,",
      "melainkan gambar *siaran* yang kamu tonton.",
      "Satu pertandingan bisa punya beberapa versi iklan.",
      "Besok penasaran apa lagi?",
      "*Follow* Rumah Penasaran.",
    ],
  },
];

const buildCues = (s: SceneDef): Cue[] => {
  const lead = 8;
  const span = Math.round(s.dur * 0.9);
  const lens = s.lines.map((l) => l.replace(/\*/g, "").length);
  const total = lens.reduce((a, b) => a + b, 0);
  let t = s.from + lead;
  return s.lines.map((text, i) => {
    const d = Math.round((lens[i] / total) * span);
    const cue = { from: t, to: t + d, text };
    t += d;
    return cue;
  });
};

/** Isi dengan cue timestamp asli jika sudah ada audio. null = pakai cue otomatis. */
const SUBTITLE_OVERRIDE: Cue[] | null = null;

const CUES: Cue[] = SUBTITLE_OVERRIDE ?? SCENES.flatMap(buildCues);

/* ═══════════════════════════════════════════════════════════════════
 * IKLAN ILUSTRATIF (bukan logo/merek asli)
 * ═══════════════════════════════════════════════════════════════════ */
type AdKey = "A" | "B" | "C" | "KEY";

const ADS: Record<
  AdKey,
  { text: string; fill: string; fg: string; stroke: string; dash?: string }
> = {
  A: { text: "ALPHA", fill: C.accent, fg: C.bg, stroke: C.accent },
  B: { text: "NUSA", fill: C.card, fg: C.text, stroke: C.text },
  C: { text: "SAKURA", fill: C.bg, fg: C.accent, stroke: C.accent },
  KEY: { text: "MAGENTA", fill: C.text, fg: C.bg, stroke: C.bg, dash: "10 6" },
};

type RectProps = { x: number; y: number; w: number; h: number };

const AdPlate: React.FC<RectProps & { ad: AdKey; opacity?: number }> = ({
  ad,
  x,
  y,
  w,
  h,
  opacity = 1,
}) => {
  const a = ADS[ad];
  const fs = ad === "KEY" ? h * 0.4 : h * 0.52;
  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h * 0.12}
        fill={a.fill}
        stroke={a.stroke}
        strokeWidth={Math.max(2, h * 0.04)}
        strokeDasharray={a.dash}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={fontFamily}
        fontWeight={800}
        fontSize={fs}
        fill={a.fg}
        letterSpacing={h * 0.04}
      >
        {a.text}
      </text>
    </g>
  );
};

const AdLayer: React.FC<
  RectProps & { ad: AdKey; prev?: AdKey; mix?: number }
> = ({ ad, prev, mix = 1, ...rect }) => (
  <g>
    {prev && mix < 1 ? <AdPlate ad={prev} {...rect} /> : null}
    <AdPlate ad={ad} {...rect} opacity={prev ? mix : 1} />
  </g>
);

/* ═══════════════════════════════════════════════════════════════════
 * KOMPONEN VISUAL
 * ═══════════════════════════════════════════════════════════════════ */

/** Logo Rumah Penasaran (SVG original). */
const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={46} fill={C.accent} />
    <text
      x={50}
      y={53}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily={fontFamily}
      fontWeight={800}
      fontSize={66}
      fill={C.bg}
    >
      ?
    </text>
  </svg>
);

const TopLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const o =
    tw(frame, 0, 20, 0, 1, Easing.linear) *
    tw(frame, 3120, 3150, 1, 0, Easing.linear);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 84,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: o,
      }}
    >
      <LogoMark size={56} />
      <span
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: 1,
          color: C.text,
        }}
      >
        RUMAH PENASARAN
      </span>
    </div>
  );
};

/** Karakter Kepo — satu desain, empat ekspresi. */
const Face: React.FC<{ expr: Expr }> = ({ expr }) => {
  const ink = C.bg;
  const cheeks = (
    <>
      <circle cx={72} cy={248} r={16} fill={C.accent} opacity={0.55} />
      <circle cx={228} cy={248} r={16} fill={C.accent} opacity={0.55} />
    </>
  );
  const stroke = {
    fill: "none",
    stroke: ink,
    strokeWidth: 7,
    strokeLinecap: "round" as const,
  };
  if (expr === "kaget") {
    return (
      <g>
        {cheeks}
        <circle cx={105} cy={205} r={28} fill={C.text} stroke={ink} strokeWidth={6} />
        <circle cx={195} cy={205} r={28} fill={C.text} stroke={ink} strokeWidth={6} />
        <circle cx={105} cy={205} r={9} fill={ink} />
        <circle cx={195} cy={205} r={9} fill={ink} />
        <path d="M78 152 Q105 128 132 150" {...stroke} />
        <path d="M168 150 Q195 128 222 152" {...stroke} />
        <ellipse cx={150} cy={278} rx={20} ry={26} fill={ink} />
      </g>
    );
  }
  if (expr === "mikir") {
    return (
      <g>
        {cheeks}
        <circle cx={105} cy={205} r={19} fill={ink} />
        <circle cx={195} cy={205} r={19} fill={ink} />
        <circle cx={111} cy={198} r={6} fill={C.text} />
        <circle cx={201} cy={198} r={6} fill={C.text} />
        <path d="M80 172 L130 180" {...stroke} />
        <path d="M168 160 Q195 146 224 160" {...stroke} />
        <path d="M122 276 Q137 266 150 276 T180 276" {...stroke} />
      </g>
    );
  }
  if (expr === "paham") {
    return (
      <g>
        {cheeks}
        <path d="M80 214 Q105 182 130 214" {...stroke} strokeWidth={9} />
        <path d="M170 214 Q195 182 220 214" {...stroke} strokeWidth={9} />
        <path d="M112 254 Q150 312 188 254 Z" fill={ink} />
      </g>
    );
  }
  // penasaran
  return (
    <g>
      {cheeks}
      <circle cx={105} cy={205} r={22} fill={ink} />
      <circle cx={195} cy={205} r={22} fill={ink} />
      <circle cx={113} cy={196} r={7} fill={C.text} />
      <circle cx={203} cy={196} r={7} fill={C.text} />
      <path d="M80 166 Q105 154 130 166" {...stroke} />
      <path d="M168 158 Q196 136 224 156" {...stroke} />
      <ellipse cx={150} cy={272} rx={13} ry={10} fill={ink} />
    </g>
  );
};

const Kepo: React.FC<{
  expr: Expr;
  x: number;
  y: number;
  w: number;
  delay?: number;
  glyph?: "?" | "!";
  glow?: boolean;
  wiggle?: number;
}> = ({ expr, x, y, w, delay = 10, glyph = "?", glow = false, wiggle = 1 }) => {
  const frame = useCurrentFrame();
  const s = useSpr(delay, 12, 120);
  const h = (w * 400) / 300;
  const bob = Math.sin(frame / 16) * 5;
  const rot = Math.sin(frame / 9) * 7 * wiggle;
  const pulse = 0.35 + 0.25 * Math.sin(frame / 8);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 160 + bob}px) scale(${0.7 + 0.3 * s})`,
        transformOrigin: "50% 100%",
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 -40 300 400"
        style={{ overflow: "visible", display: "block" }}
      >
        {/* kaki */}
        <ellipse cx={105} cy={338} rx={40} ry={16} fill={C.accent} />
        <ellipse cx={195} cy={338} rx={40} ry={16} fill={C.accent} />
        {/* badan */}
        <ellipse cx={150} cy={225} rx={115} ry={120} fill={C.text} />
        {/* antena */}
        <g transform={`rotate(${rot} 150 108)`}>
          <line
            x1={150}
            y1={108}
            x2={150}
            y2={42}
            stroke={C.text}
            strokeWidth={8}
            strokeLinecap="round"
          />
          {glow ? (
            <circle cx={150} cy={22} r={50} fill={C.accent} opacity={pulse} />
          ) : null}
          <circle cx={150} cy={22} r={32} fill={C.accent} />
          <text
            x={150}
            y={25}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={fontFamily}
            fontWeight={800}
            fontSize={46}
            fill={C.bg}
          >
            {glyph}
          </text>
        </g>
        <Face expr={expr} />
      </svg>
    </div>
  );
};

/** Ring "pop" saat Kepo muncul (pengganti bunyi pop — penanda visual). */
const PopRing: React.FC<{ cx: number; cy: number; at: number }> = ({
  cx,
  cy,
  at,
}) => {
  const f = useCurrentFrame();
  const p = tw(f, at, at + 22);
  if (f < at) return null;
  const size = 60 + p * 240;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        borderRadius: size,
        border: `6px solid ${C.accent}`,
        opacity: 1 - p,
      }}
    />
  );
};

/** Stadion malam (SVG original, 1080x1920). */
const Stadium: React.FC<{ ad: AdKey }> = ({ ad }) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", left: 0, top: 0 }}
  >
    <defs>
      <radialGradient id="flood">
        <stop offset="0" stopColor={C.accent} stopOpacity={0.9} />
        <stop offset="1" stopColor={C.accent} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.bg} />
        <stop offset="1" stopColor={C.card} stopOpacity={0.5} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#sky)" />
    {/* tribun */}
    <polygon points="0,330 1080,330 1080,690 0,690" fill={C.card} opacity={0.75} />
    <polygon points="0,330 1080,330 1080,420 0,420" fill={C.bg} opacity={0.5} />
    {CROWD.map((d, i) => (
      <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={C.text} opacity={0.16} />
    ))}
    {/* lampu sorot */}
    {[110, 970].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={250} r={150} fill="url(#flood)" opacity={0.55} />
        <rect x={cx - 46} y={222} width={92} height={50} rx={8} fill={C.text} opacity={0.9} />
        <rect x={cx - 38} y={230} width={76} height={34} rx={6} fill={C.accent} />
      </g>
    ))}
    {/* papan perimeter */}
    <rect x={80} y={680} width={920} height={140} rx={10} fill={C.bg} />
    <AdPlate ad={ad} x={96} y={694} w={888} h={112} />
    {/* lapangan */}
    <polygon points="0,830 1080,830 1080,1920 0,1920" fill={C.card} opacity={0.55} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i}
        x={0}
        y={830 + i * 220}
        width={1080}
        height={110}
        fill={C.text}
        opacity={0.04}
      />
    ))}
    <ellipse cx={540} cy={1380} rx={430} ry={120} fill="none" stroke={C.text} strokeWidth={4} opacity={0.2} />
    <line x1={0} y1={1380} x2={1080} y2={1380} stroke={C.text} strokeWidth={4} opacity={0.2} />
  </svg>
);

/** Cuplikan pertandingan mini (viewBox 400x200). Semua TV memakai pertandingan identik. */
const MiniMatch: React.FC<{
  w: number;
  ad: AdKey;
  prev?: AdKey;
  mix?: number;
  mark?: boolean;
}> = ({ w, ad, prev, mix = 1, mark = false }) => {
  const frame = useCurrentFrame();
  const t = frame / 20;
  const bx = 200 + Math.sin(t) * 70;
  const by = 176 - Math.abs(Math.sin(t * 2)) * 14;
  return (
    <svg
      width={w}
      height={w / 2}
      viewBox="0 0 400 200"
      style={{ display: "block", borderRadius: 12 }}
    >
      <rect width={400} height={200} fill={C.bg} />
      <rect y={0} width={400} height={62} fill={C.card} opacity={0.85} />
      {CROWD.slice(0, 30).map((d, i) => (
        <circle
          key={i}
          cx={(d.x / 1080) * 400}
          cy={6 + ((d.y - 370) / 290) * 50}
          r={1.8}
          fill={C.text}
          opacity={0.28}
        />
      ))}
      <rect y={128} width={400} height={72} fill={C.card} opacity={0.6} />
      <line x1={0} y1={166} x2={400} y2={166} stroke={C.text} strokeWidth={1.5} opacity={0.2} />
      <AdLayer ad={ad} prev={prev} mix={mix} x={24} y={78} w={352} h={44} />
      {mark ? (
        <rect
          x={18}
          y={72}
          width={364}
          height={56}
          rx={8}
          fill="none"
          stroke={C.accent}
          strokeWidth={3}
          strokeDasharray="10 6"
        />
      ) : null}
      <circle cx={130 + Math.sin(t * 0.8) * 14} cy={158} r={9} fill={C.text} />
      <circle cx={270 - Math.sin(t * 0.8) * 14} cy={168} r={9} fill={C.accent} />
      <circle cx={bx} cy={by} r={5} fill={C.text} />
    </svg>
  );
};

const tvH = (w: number): number => (w - 32) / 2 + 84;

const TV: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  ad: AdKey;
  prev?: AdKey;
  mix?: number;
  mark?: boolean;
  opacity?: number;
  tx?: number;
  ty?: number;
  scale?: number;
  labelSize?: number;
  hot?: boolean;
}> = ({
  x,
  y,
  w,
  label,
  ad,
  prev,
  mix,
  mark,
  opacity = 1,
  tx = 0,
  ty = 0,
  scale = 1,
  labelSize = 28,
  hot = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: tvH(w),
      boxSizing: "border-box",
      padding: 12,
      background: C.card,
      border: `4px solid ${hot ? C.accent : C.text}`,
      borderRadius: 26,
      opacity,
      transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      boxShadow: `0 16px 40px ${C.bg}`,
    }}
  >
    <MiniMatch w={w - 32} ad={ad} prev={prev} mix={mix} mark={mark} />
    <div
      style={{
        height: 52,
        lineHeight: "52px",
        textAlign: "center",
        fontFamily,
        fontWeight: 600,
        fontSize: labelSize,
        letterSpacing: 0.5,
        color: hot ? C.accent : C.text,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  </div>
);

const CamIcon: React.FC<{ x: number; y: number; w: number; opacity?: number }> = ({
  x,
  y,
  w,
  opacity = 1,
}) => (
  <svg
    width={w}
    height={w * 0.8}
    viewBox="0 0 150 120"
    style={{ position: "absolute", left: x, top: y, opacity }}
  >
    <rect x={10} y={20} width={90} height={60} rx={12} fill={C.card} stroke={C.text} strokeWidth={5} />
    <polygon points="100,38 140,22 140,78 100,62" fill={C.text} />
    <circle cx={55} cy={50} r={20} fill={C.bg} stroke={C.accent} strokeWidth={5} />
    <circle cx={55} cy={50} r={7} fill={C.accent} />
    <line x1={55} y1={80} x2={35} y2={112} stroke={C.text} strokeWidth={5} strokeLinecap="round" />
    <line x1={55} y1={80} x2={75} y2={112} stroke={C.text} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

const ServerIcon: React.FC<{ x: number; y: number; w: number; scale: number }> = ({
  x,
  y,
  w,
  scale,
}) => {
  const f = useCurrentFrame();
  return (
    <svg
      width={w}
      height={w * 0.8}
      viewBox="0 0 200 160"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={20} y={10 + i * 48} width={160} height={40} rx={10} fill={C.card} stroke={C.text} strokeWidth={4} />
          <circle cx={46} cy={30 + i * 48} r={7} fill={C.accent} opacity={0.5 + 0.5 * Math.sin(f / 6 + i * 2)} />
          <rect x={70} y={26 + i * 48} width={90} height={8} rx={4} fill={C.text} opacity={0.5} />
        </g>
      ))}
    </svg>
  );
};

const Player: React.FC<{
  x: number;
  y: number;
  flip?: boolean;
  speed?: number;
  opacity?: number;
}> = ({ x, y, flip = false, speed = 3, opacity = 1 }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / speed) * 28;
  const limb = {
    fill: C.bg,
    stroke: C.text,
    strokeWidth: 4,
  };
  return (
    <svg
      width={100}
      height={220}
      viewBox="0 0 100 220"
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <g transform={`rotate(${-a} 50 120)`}>
        <rect x={40} y={118} width={20} height={92} rx={10} {...limb} />
      </g>
      <g transform={`rotate(${a} 50 120)`}>
        <rect x={40} y={118} width={20} height={92} rx={10} {...limb} />
      </g>
      <g transform={`rotate(${a} 50 58)`}>
        <rect x={42} y={52} width={16} height={60} rx={8} {...limb} />
      </g>
      <rect x={30} y={46} width={40} height={80} rx={16} {...limb} />
      <g transform={`rotate(${-a} 50 58)`}>
        <rect x={42} y={52} width={16} height={60} rx={8} {...limb} />
      </g>
      <circle cx={50} cy={24} r={18} {...limb} />
    </svg>
  );
};

/** Wrapper scene: fade in/out halus. */
const Fade: React.FC<{
  children: React.ReactNode;
  inF?: number;
  outF?: number;
}> = ({ children, inF = 15, outF = 15 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = inF > 0 ? tw(frame, 0, inF, 0, 1, Easing.linear) : 1;
  const b =
    outF > 0
      ? tw(frame, durationInFrames - outF, durationInFrames, 1, 0, Easing.linear)
      : 1;
  return <AbsoluteFill style={{ opacity: a * b }}>{children}</AbsoluteFill>;
};

/** Teks utama (maks 7 kata per tampilan). Pakai *kata* untuk highlight kuning. */
const Title: React.FC<{ lines: string[]; size?: number }> = ({
  lines,
  size = 68,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const out = tw(frame, durationInFrames - 10, durationInFrames, 1, 0, Easing.linear);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 90,
        top: SAFE.top + 12,
        textAlign: "center",
        fontFamily,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        color: C.text,
        textShadow: `0 4px 24px ${C.bg}`,
        opacity: Math.min(1, s * 1.4) * out,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>
          <Hl text={l} bold />
        </div>
      ))}
    </div>
  );
};

const TitleAt: React.FC<{
  from: number;
  dur: number;
  lines: string[];
  size?: number;
}> = ({ from, dur, lines, size }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <Title lines={lines} size={size} />
  </Sequence>
);

const Chip: React.FC<{
  x: number;
  y: number;
  w: number;
  text: string;
  opacity?: number;
  fs?: number;
  solid?: boolean;
}> = ({ x, y, w, text, opacity = 1, fs = 30, solid = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      boxSizing: "border-box",
      padding: "16px 22px",
      borderRadius: 22,
      background: solid ? C.accent : C.card,
      border: `3px solid ${solid ? C.accent : C.text}`,
      color: solid ? C.bg : C.text,
      fontFamily,
      fontWeight: 600,
      fontSize: fs,
      lineHeight: 1.2,
      textAlign: "center",
      opacity,
    }}
  >
    <Hl text={text} />
  </div>
);

/** Garis yang menggambar diri + titik bergerak. */
const FlowLine: React.FC<{
  d: string;
  p: number;
  dot?: { x1: number; y1: number; x2: number; y2: number };
  dotPhase?: number;
}> = ({ d, p, dot, dotPhase = 0 }) => {
  const f = useCurrentFrame();
  const k = (((f + dotPhase) % 60) / 60) as number;
  return (
    <>
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={C.accent}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={1}
        strokeDashoffset={1 - p}
        opacity={0.9}
      />
      {dot && p >= 1 ? (
        <circle
          cx={dot.x1 + (dot.x2 - dot.x1) * k}
          cy={dot.y1 + (dot.y2 - dot.y1) * k}
          r={9}
          fill={C.text}
        />
      ) : null}
    </>
  );
};

const FullSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", left: 0, top: 0 }}
  >
    {children}
  </svg>
);

const Arrow: React.FC<{ x: number; y: number; opacity?: number }> = ({
  x,
  y,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 16,
      top: y,
      width: 0,
      height: 0,
      borderLeft: "16px solid transparent",
      borderRight: "16px solid transparent",
      borderTop: `22px solid ${C.accent}`,
      opacity,
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 01 — THE HOOK  (frame 0–180)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = tw(f, 0, 180, 1, 1.28, eio);
  return (
    <Fade inF={0}>
      {/* slow cinematic zoom menuju papan LED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "540px 760px",
        }}
      >
        <Stadium ad="A" />
      </div>
      <TitleAt from={20} dur={160} lines={["KOK IKLANNYA BISA", "*BERBEDA*?"]} size={76} />
      {/* ▶ MARKER AUDIO (sebelumnya): pop saat Kepo muncul — frame 20 */}
      <PopRing cx={540} cy={1080} at={22} />
      <Kepo expr="penasaran" x={420} y={920} w={240} delay={20} />
    </Fade>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 02 — THE MYSTERY  (frame 180–510)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneMystery: React.FC = () => {
  const f = useCurrentFrame();
  const topIn = tw(f, 5, 35, -120, 0);
  const topO = tw(f, 5, 35);
  const divP = tw(f, 40, 90);
  const lineP = tw(f, 80, 120);
  const camO = tw(f, 50, 70);
  const sL = useSpr(95);
  const sR = useSpr(110);
  const mix1 = tw(f, 150, 185);
  const mix2 = tw(f, 200, 235);
  return (
    <Fade>
      <TitleAt from={0} dur={150} lines={["VIRTUAL ADVERTISING"]} size={64} />
      <TitleAt from={150} dur={180} lines={["SATU STADION,", "BEDA IKLAN."]} size={68} />

      {/* bagian atas: stadion asli */}
      <TV
        x={220}
        y={430}
        w={640}
        label="PAPAN LED ASLI · STADION"
        ad="A"
        opacity={topO}
        ty={topIn}
        labelSize={30}
      />
      {/* garis pemisah split-screen */}
      <div
        style={{
          position: "absolute",
          left: 540 - divP * 450,
          width: divP * 900,
          top: 878,
          height: 4,
          borderRadius: 2,
          background: C.accent,
          opacity: 0.5,
        }}
      />
      <CamIcon x={470} y={838} w={140} opacity={camO} />
      <FullSvg>
        <FlowLine d="M510 920 L300 960" p={lineP} dot={{ x1: 510, y1: 920, x2: 300, y2: 960 }} />
        <FlowLine d="M570 920 L740 960" p={lineP} dot={{ x1: 570, y1: 920, x2: 740, y2: 960 }} dotPhase={20} />
      </FullSvg>

      {/* bagian bawah: dua televisi */}
      <TV
        x={100}
        y={960}
        w={400}
        label="TV INDONESIA"
        ad="B"
        prev="A"
        mix={mix1}
        opacity={Math.min(1, sL * 1.5)}
        tx={(1 - sL) * -320}
      />
      <TV
        x={540}
        y={960}
        w={400}
        label="TV JEPANG"
        ad="C"
        prev="A"
        mix={mix2}
        opacity={Math.min(1, sR * 1.5)}
        tx={(1 - sR) * 320}
      />
      <Kepo expr="mikir" x={60} y={760} w={130} delay={25} />
    </Fade>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 03 — THE REVEAL  (frame 510–810)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneReveal: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = tw(f, 0, 80, 1.45, 1, eio); // camera pan/zoom keluar dari stadion
  const s1 = useSpr(5);
  const s2 = useSpr(50);
  const s3 = useSpr(90);
  const rows: { y: number; label: string; ad: AdKey; who: string; name: string; s: number }[] = [
    { y: 430, label: "TRIBUN STADION", ad: "A", who: "SPONSOR A", name: "ALPHA", s: s1 },
    { y: 708, label: "TV INDONESIA", ad: "B", who: "SPONSOR B", name: "NUSA", s: s2 },
    { y: 986, label: "TV JEPANG", ad: "C", who: "SPONSOR C", name: "SAKURA", s: s3 },
  ];
  return (
    <Fade>
      <TitleAt from={0} dur={300} lines={["STADION SAMA.", "SIARAN BERBEDA."]} size={66} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "280px 560px",
        }}
      >
        {rows.map((r, i) => (
          <React.Fragment key={r.label}>
            <TV
              x={90}
              y={r.y}
              w={380}
              label={r.label}
              ad={r.ad}
              opacity={Math.min(1, r.s * 1.5)}
              tx={i === 0 ? 0 : (1 - r.s) * 200}
              labelSize={26}
            />
            <div
              style={{
                position: "absolute",
                left: 490,
                top: r.y + 66,
                width: 240,
                height: 126,
                boxSizing: "border-box",
                borderRadius: 22,
                background: C.card,
                border: `3px solid ${C.text}`,
                opacity: Math.min(1, r.s * 1.5),
                transform: `translateX(${(1 - r.s) * 120}px)`,
                textAlign: "center",
                fontFamily,
                paddingTop: 14,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 26, color: C.text }}>{r.who}</div>
              <div style={{ fontWeight: 800, fontSize: 48, color: C.accent, lineHeight: 1.2 }}>
                {r.name}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <Kepo expr="kaget" x={770} y={700} w={170} delay={30} />
    </Fade>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 04 — LED CHROMA KEY TRICK  (frame 810–1410)  ★ momen visual utama
 * Tidak ada kilatan/strobo nyata — hanya diagram timeline & penunjuk waktu.
 * ═══════════════════════════════════════════════════════════════════ */
const SceneChroma: React.FC = () => {
  const f = useCurrentFrame();

  // Fase 1 (0–150): panel LED isometrik + zoom
  const zoom = tw(f, 0, 150, 1, 1.6, eio);
  const o1 = tw(f, 0, 15) * (1 - tw(f, 130, 160));

  // Fase 2 (150–390): timeline 20 ms
  const barX = 90;
  const barW = 860;
  const barY = 520;
  const barH = 100;
  const w18 = (barW * 18) / 20;
  const w2 = barW - w18;
  const o2 = tw(f, 150, 175);
  const fill18 = tw(f, 165, 255, 0, 1, Easing.linear) * w18;
  const fill2 = tw(f, 270, 290) * w2;
  const play = (((f - 150) % 100) / 100) * barW;
  const ringO = tw(f, 285, 300);
  const ringS = 1 + 0.08 * Math.sin(f / 10);
  const noteO = tw(f, 300, 320) * (1 - tw(f, 380, 395));

  // Fase 3 (390–600): kamera menangkap frame khusus → monitor studio
  const p3 = tw(f, 390, 430);
  const monO = tw(f, 420, 450);
  const beamP = tw(f, 400, 440);

  return (
    <Fade>
      <TitleAt from={0} dur={150} lines={["TRIK WAKTU", "DI PANEL LED"]} size={66} />
      <TitleAt from={150} dur={150} lines={["18 MS MENAMPILKAN", "IKLAN"]} size={62} />
      <TitleAt from={300} dur={300} lines={["2 MS WARNA KUNCI"]} size={66} />

      {/* fase 1: panel isometrik */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 450,
          width: 1080,
          height: 620,
          opacity: o1,
          perspective: 1600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 520,
            height: 220,
            borderRadius: 14,
            background: C.accent,
            transform: `scale(${zoom}) rotateX(58deg) rotateZ(-38deg)`,
            boxShadow: `0 18px 0 ${C.card}, 0 34px 0 ${C.bg}, 0 60px 60px ${C.bg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              backgroundImage: `repeating-linear-gradient(0deg, ${C.bg}55 0 2px, transparent 2px 14px), repeating-linear-gradient(90deg, ${C.bg}55 0 2px, transparent 2px 14px)`,
            }}
          />
          <span
            style={{
              position: "relative",
              fontFamily,
              fontWeight: 800,
              fontSize: 110,
              letterSpacing: 6,
              color: C.bg,
            }}
          >
            ALPHA
          </span>
        </div>
      </div>
      <Chip x={290} y={1060} w={500} text="PANEL *LED* PERIMETER" opacity={o1} />

      {/* fase 2: timeline */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 436,
          textAlign: "center",
          fontFamily,
          fontWeight: 600,
          fontSize: 38,
          color: C.text,
          opacity: o2,
        }}
      >
        SATU SIKLUS = <span style={{ color: C.accent, fontWeight: 800 }}>20 MILIDETIK</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: barX + play - 14,
          top: 488,
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderTop: `22px solid ${C.text}`,
          opacity: tw(f, 165, 180),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: barX,
          top: barY,
          width: barW,
          height: barH,
          boxSizing: "border-box",
          borderRadius: 20,
          border: `4px solid ${C.text}`,
          background: C.card,
          overflow: "hidden",
          opacity: o2,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: fill18,
            height: "100%",
            background: C.accent,
            display: "flex",
            alignItems: "center",
            paddingLeft: 28,
            fontFamily,
            fontWeight: 800,
            fontSize: 38,
            color: C.bg,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          IKLAN NORMAL
        </div>
        <div
          style={{
            position: "absolute",
            left: w18,
            top: 0,
            width: fill2,
            height: "100%",
            background: C.text,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: barX,
          top: 632,
          fontFamily,
          fontWeight: 600,
          fontSize: 30,
          color: C.accent,
          opacity: tw(f, 245, 262),
        }}
      >
        18 ms
      </div>
      <div
        style={{
          position: "absolute",
          right: 1080 - 850,
          top: 632,
          fontFamily,
          fontWeight: 600,
          fontSize: 30,
          color: C.text,
          textAlign: "right",
          opacity: tw(f, 285, 300),
        }}
      >
        2 ms · WARNA KUNCI
      </div>
      {/* lingkaran penanda bagian 2 ms */}
      <div
        style={{
          position: "absolute",
          left: barX + w18 + w2 / 2 - 60,
          top: barY + barH / 2 - 60,
          width: 120,
          height: 120,
          borderRadius: 60,
          boxSizing: "border-box",
          border: `6px solid ${C.accent}`,
          opacity: ringO,
          transform: `scale(${ringS})`,
        }}
      />
      {/* catatan simbol warna */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 860,
          top: 720,
          boxSizing: "border-box",
          padding: "18px 26px",
          borderRadius: 22,
          background: C.card,
          border: `3px solid ${C.text}`,
          fontFamily,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1.3,
          textAlign: "center",
          color: C.text,
          opacity: noteO,
        }}
      >
        Bidang putih berlabel <span style={{ color: C.accent, fontWeight: 600 }}>MAGENTA</span> = simbol.
        Warna aslinya pada contoh Fraunhofer: magenta.
      </div>

      {/* fase 3: kamera menangkap slot 2 ms → monitor studio */}
      <CamIcon x={90} y={800} w={140} opacity={p3} />
      <FullSvg>
        <FlowLine
          d="M230 850 L907 628"
          p={beamP}
          dot={{ x1: 230, y1: 850, x2: 907, y2: 628 }}
        />
        <FlowLine
          d="M160 930 L160 1050 L400 1050"
          p={tw(f, 430, 470)}
          dot={{ x1: 160, y1: 1050, x2: 400, y2: 1050 }}
          dotPhase={30}
        />
      </FullSvg>
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 900,
          width: 540,
          height: 300,
          boxSizing: "border-box",
          borderRadius: 26,
          border: `4px solid ${C.text}`,
          background: C.card,
          opacity: monO,
          textAlign: "center",
          fontFamily,
        }}
      >
        <div style={{ marginTop: 16, fontWeight: 600, fontSize: 30, color: C.accent }}>
          MONITOR STUDIO
        </div>
        <div
          style={{
            margin: "16px auto 0",
            width: 340,
            height: 120,
            borderRadius: 14,
            background: C.text,
            border: `4px dashed ${C.bg}`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: 4,
            color: C.bg,
          }}
        >
          MAGENTA
        </div>
        <div style={{ marginTop: 14, fontWeight: 500, fontSize: 26, color: C.text }}>
          frame khusus (simbol warna kunci)
        </div>
      </div>
      <Kepo expr="kaget" x={60} y={1085} w={120} delay={20} />
    </Fade>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 05 — DIGITAL REPLACEMENT  (frame 1410–1830)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneReplace: React.FC = () => {
  const f = useCurrentFrame();
  const steps = [
    "KAMERA",
    "GAMBAR DENGAN AREA KUNCI",
    "CHROMA KEY PROCESSING",
    "PENGGANTIAN IKLAN",
    "FEED SIARAN LOKAL",
  ];
  const active = Math.max(0, Math.min(4, Math.floor((f - 40) / 70)));
  const mixNew = tw(f, 250, 290);
  const previewLabels = [
    "REKAMAN KAMERA",
    "REKAMAN KAMERA",
    "AREA KUNCI TERPISAH",
    "IKLAN BARU MASUK",
    "FEED LOKAL",
  ];
  return (
    <Fade>
      <TitleAt from={0} dur={420} lines={["AREA KUNCI", "DIGANTI *DIGITAL*"]} size={68} />
      {steps.map((s, i) => (
        <StepBox key={s} i={i} text={s} active={active === i} reached={active >= i} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x={340} y={552 + i * 152 + 2} opacity={tw(f, 20 + i * 18, 40 + i * 18)} />
      ))}
      {/* pratinjau hasil */}
      <TV
        x={640}
        y={470}
        w={300}
        label={previewLabels[active]}
        labelSize={22}
        ad="B"
        prev="KEY"
        mix={mixNew}
        mark={active >= 2 && active < 3}
        hot
        opacity={tw(f, 20, 45)}
      />
      <Kepo expr="mikir" x={700} y={960} w={180} delay={30} />
    </Fade>
  );
};

const StepBox: React.FC<{
  i: number;
  text: string;
  active: boolean;
  reached: boolean;
}> = ({ i, text, active, reached }) => {
  const s = useSpr(10 + i * 18);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 440 + i * 152,
        width: 540,
        height: 112,
        boxSizing: "border-box",
        borderRadius: 26,
        background: C.card,
        border: `4px solid ${active ? C.accent : C.text}`,
        opacity: Math.min(1, s * 1.5) * (reached ? 1 : 0.6),
        transform: `translateX(${(1 - s) * -160}px) scale(${active ? 1.03 : 1})`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 24px",
        fontFamily,
        fontWeight: 600,
        fontSize: 32,
        lineHeight: 1.15,
        color: active ? C.accent : C.text,
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: 58,
          height: 58,
          borderRadius: 29,
          background: active ? C.accent : C.text,
          color: C.bg,
          fontWeight: 800,
          fontSize: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {i + 1}
      </div>
      <div>{text}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 06 — CAMERA TRACKING  (frame 1830–2220)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneTracking: React.FC = () => {
  const f = useCurrentFrame();
  const panning = f >= 170;
  const panX = tw(f, 170, 300, 0, -110, eio);
  const rotY = tw(f, 170, 300, 0, 24, eio);
  const parX = panX * 0.4;
  const track = tw(f, 170, 195);
  const pulse = 0.6 + 0.4 * Math.sin(f / 7);

  // pemain: lintasan 1 (lari) lalu lintasan 2 (jalan, arah balik)
  const pass1 = tw(f, 20, 165, -130, 900, Easing.linear);
  const pass2 = tw(f, 225, 385, 920, -130, Easing.linear);
  const second = f >= 200;
  const px = second ? pass2 : pass1;

  const corner = (pos: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 30,
        height: 30,
        borderColor: C.accent,
        borderStyle: "solid",
        borderWidth: 0,
        opacity: track,
        ...pos,
      }}
    />
  );

  return (
    <Fade>
      <TitleAt from={0} dur={390} lines={["KAMERA BERGERAK?", "IKLAN TETAP PAS."]} size={64} />

      <div
        style={{
          position: "absolute",
          left: 90,
          top: 450,
          width: 860,
          height: 560,
          boxSizing: "border-box",
          borderRadius: 30,
          border: `4px solid ${C.text}`,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${C.bg} 0%, ${C.card} 100%)`,
        }}
      >
        {/* tribun (parallax ringan) */}
        <div
          style={{
            position: "absolute",
            left: -240,
            top: 0,
            width: 1400,
            height: 100,
            backgroundImage: `repeating-linear-gradient(90deg, ${C.card} 0 40px, ${C.bg} 40px 80px)`,
            opacity: 0.6,
            transform: `translateX(${parX}px)`,
          }}
        />
        {/* lapangan */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 210,
            background: C.card,
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -240,
            width: 1400,
            bottom: 90,
            height: 4,
            background: C.text,
            opacity: 0.2,
            transform: `translateX(${parX * 1.4}px)`,
          }}
        />
        {/* papan iklan virtual */}
        <div style={{ position: "absolute", left: 0, top: 120, width: 860, height: 170, perspective: 900 }}>
          <div
            style={{
              position: "absolute",
              left: 130,
              top: 20,
              width: 600,
              height: 130,
              boxSizing: "border-box",
              borderRadius: 14,
              background: C.card,
              border: `5px solid ${C.text}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontWeight: 800,
              fontSize: 76,
              letterSpacing: 6,
              color: C.text,
              transform: `translateX(${panX}px) rotateY(${rotY}deg)`,
            }}
          >
            NUSA
            {/* kotak & sudut tracking ikut perspektif papan */}
            <div
              style={{
                position: "absolute",
                inset: -12,
                border: `3px dashed ${C.accent}`,
                borderRadius: 18,
                opacity: track * pulse,
              }}
            />
            {corner({ left: -16, top: -16, borderLeftWidth: 6, borderTopWidth: 6 })}
            {corner({ right: -16, top: -16, borderRightWidth: 6, borderTopWidth: 6 })}
            {corner({ left: -16, bottom: -16, borderLeftWidth: 6, borderBottomWidth: 6 })}
            {corner({ right: -16, bottom: -16, borderRightWidth: 6, borderBottomWidth: 6 })}
          </div>
        </div>
        {/* pemain di DEPAN iklan */}
        <Player x={px} y={180} flip={second} speed={second ? 5 : 3} />
        {/* penanda tracking */}
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            padding: "8px 18px",
            borderRadius: 16,
            background: C.accent,
            color: C.bg,
            fontFamily,
            fontWeight: 800,
            fontSize: 26,
            opacity: track,
          }}
        >
          TRACKING
        </div>
      </div>

      <Chip
        x={90}
        y={1040}
        w={670}
        fs={28}
        text={panning ? "KAMERA PAN · *PERSPEKTIF* DIKOREKSI" : "KAMERA DIAM · IKLAN *PAS*"}
      />
      <Chip
        x={90}
        y={1140}
        w={670}
        fs={28}
        text="PEMAIN TETAP DI *DEPAN* IKLAN"
        opacity={tw(f, 225, 245)}
        solid
      />
      <Kepo expr="mikir" x={780} y={1035} w={160} delay={20} wiggle={1.8} />
    </Fade>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 07 — NOT JUST ONE METHOD  (frame 2220–2700)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneMethods: React.FC = () => {
  const f = useCurrentFrame();
  const boxes = ["STADION", "KAMERA SIARAN", "AI & MACHINE LEARNING", "VIRTUAL ADVERTISEMENT"];
  const srv = useSpr(70, 12, 100);
  const branch = tw(f, 200, 250);
  const tvL = useSpr(230);
  const tvR = useSpr(250);
  const expr: Expr = f < 300 ? "mikir" : "paham";
  return (
    <Fade>
      <TitleAt from={0} dur={480} lines={["ADA LEBIH DARI", "SATU METODE"]} size={68} />
      {boxes.map((b, i) => (
        <FlowBox key={b} i={i} text={b} hot={i === 2} />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={i} x={350} y={440 + i * 120 + 92} opacity={tw(f, 20 + i * 20, 40 + i * 20)} />
      ))}
      <ServerIcon x={660} y={680} w={220} scale={0.4 + 0.6 * srv} />
      <FullSvg>
        <FlowLine d="M350 892 V935 H280 V980" p={branch} dot={{ x1: 350, y1: 892, x2: 280, y2: 980 }} />
        <FlowLine d="M350 935 H690 V980" p={branch} dot={{ x1: 350, y1: 935, x2: 690, y2: 980 }} dotPhase={25} />
      </FullSvg>
      <TV
        x={90}
        y={980}
        w={380}
        label="FEED INDONESIA"
        ad="B"
        opacity={Math.min(1, tvL * 1.5)}
        scale={0.8 + 0.2 * tvL}
        labelSize={26}
      />
      <TV
        x={500}
        y={980}
        w={380}
        label="FEED JEPANG"
        ad="C"
        opacity={Math.min(1, tvR * 1.5)}
        scale={0.8 + 0.2 * tvR}
        labelSize={26}
      />
      <Kepo expr={expr} x={715} y={430} w={150} delay={25} />
    </Fade>
  );
};

const FlowBox: React.FC<{ i: number; text: string; hot: boolean }> = ({
  i,
  text,
  hot,
}) => {
  const s = useSpr(10 + i * 20);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 440 + i * 120,
        width: 520,
        height: 90,
        boxSizing: "border-box",
        borderRadius: 24,
        background: C.card,
        border: `4px solid ${hot ? C.accent : C.text}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        fontWeight: 600,
        fontSize: 32,
        color: hot ? C.accent : C.text,
        opacity: Math.min(1, s * 1.5),
        transform: `scale(${0.8 + 0.2 * s})`,
      }}
    >
      {text}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SCENE 08 — CONCLUSION  (frame 2700–3150)
 * ═══════════════════════════════════════════════════════════════════ */
const SceneConclusion: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = tw(f, 0, 180, 1.35, 1, eio); // slow camera pullback
  const sTv = useSpr(25, 16, 90);
  const fl1 = Math.sin(f / 22) * 10;
  const fl2 = Math.cos(f / 26) * 10;
  const fl3 = Math.sin(f / 30 + 1) * 8;
  const closing = f >= 330;
  const kx = tw(f, 330, 375, 420, 120, eio);
  const logoS = useSpr(335, 12, 100);
  const tv3O = tw(f, 320, 345, 1, 0);
  return (
    <Fade outF={30}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "540px 800px",
        }}
      >
        <Stadium ad="A" />
      </div>
      <TitleAt from={0} dur={180} lines={["BUKAN STADIONNYA", "YANG BERUBAH."]} size={64} />
      <TitleAt from={180} dur={150} lines={["BESOK PENASARAN", "APA LAGI?"]} size={68} />
      <TitleAt from={330} dur={120} lines={["FOLLOW", "*@RUMAHPENASARAN*"]} size={60} />

      {/* beberapa TV melayang: pertandingan identik, iklan berbeda */}
      <TV x={80} y={470} w={380} label="TV INDONESIA" ad="B" opacity={Math.min(1, sTv * 1.5)} ty={fl1} labelSize={26} />
      <TV x={560} y={560} w={380} label="TV JEPANG" ad="C" opacity={Math.min(1, sTv * 1.5)} ty={fl2} labelSize={26} />
      <TV x={70} y={960} w={300} label="TV LAIN" ad="A" opacity={Math.min(1, sTv * 1.5) * tv3O} ty={fl3} labelSize={24} />

      <Kepo expr="paham" x={kx} y={920} w={240} delay={15} glyph="!" glow />

      {/* logo penutup */}
      {closing ? (
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 960,
            width: 340,
            textAlign: "center",
            opacity: Math.min(1, logoS * 1.5),
            transform: `scale(${0.5 + 0.5 * logoS})`,
            transformOrigin: "50% 50%",
            fontFamily,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LogoMark size={150} />
          </div>
          <div style={{ marginTop: 14, fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: C.text }}>
            RUMAH
            <br />
            <span style={{ color: C.accent }}>PENASARAN</span>
          </div>
        </div>
      ) : null}
    </Fade>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * SUBTITLE (mengikuti CUES di atas) & HUD MARKER
 * Letak: Y 1305–1495, latar gelap transparan, satu kata kunci kuning.
 * ═══════════════════════════════════════════════════════════════════ */
const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const local = frame - cue.from;
  const o = tw(local, 0, 6, 0, 1, Easing.linear);
  const y = tw(local, 0, 6, 10, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 150,
        top: SAFE.subTop,
        height: SAFE.subH,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: o,
          transform: `translateY(${y}px)`,
          background: `${C.bg}CC`,
          borderRadius: 28,
          padding: "18px 30px",
          fontFamily,
          fontWeight: 600,
          fontSize: 48,
          lineHeight: 1.25,
          color: C.text,
          textAlign: "center",
        }}
      >
        <Hl text={cue.text} bold />
      </div>
    </div>
  );
};

const MarkerHud: React.FC = () => {
  const frame = useCurrentFrame();
  const sc = SCENES.find((s) => frame >= s.from && frame < s.from + s.dur) ?? SCENES[0];
  const cueIdx = CUES.findIndex((c) => frame >= c.from && frame < c.to);
  return (
    <div
      style={{
        position: "absolute",
        right: 24,
        top: 24,
        padding: "8px 14px",
        borderRadius: 12,
        background: C.bg,
        border: `2px solid ${C.accent}`,
        fontFamily,
        fontWeight: 500,
        fontSize: 20,
        color: C.text,
        lineHeight: 1.3,
      }}
    >
      SCENE {sc.no} · {sc.name}
      <br />
      f{frame} (scene f{frame - sc.from}) · cue #{cueIdx}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * ROOT COMPOSITION
 * ═══════════════════════════════════════════════════════════════════ */
const SCENE_COMPONENTS: React.FC[] = [
  SceneHook,
  SceneMystery,
  SceneReveal,
  SceneChroma,
  SceneReplace,
  SceneTracking,
  SceneMethods,
  SceneConclusion,
];

export const IklanStadion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 20%, ${C.card}66 0%, ${C.bg} 70%)`,
      }}
    />
    {SCENES.map((s, i) => {
      const Comp = SCENE_COMPONENTS[i];
      return (
        <Sequence key={s.no} from={s.from} durationInFrames={s.dur} name={`${s.no} ${s.name}`}>
          <Comp />
        </Sequence>
      );
    })}
    <TopLogo />
    <Subtitle />
    {SHOW_MARKERS ? <MarkerHud /> : null}
  </AbsoluteFill>
);

export default IklanStadion;
