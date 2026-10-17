import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  interpolateColors,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import {
  ArrowRight,
  Bell,
  Bot,
  BookOpen,
  Brain,
  Bus,
  Check,
  GraduationCap,
  Heart,
  MessageCircle,
  PenLine,
  Route,
  Send,
  ShoppingBag,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   KAND AI — Premium product commercial (1080×1920 @ 30fps)
   Semua animasi deterministik berdasarkan frame.
   ──────────────────────────────────────────────────────────── */

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

/* ── Timeline (overlap dihitung: total = 720 frame / 24 detik) ── */
const T = {
  s1: { from: 0, dur: 75 }, //   0 –  75  Hook
  s2: { from: 60, dur: 90 }, //  60 – 150  Reveal
  s3: { from: 130, dur: 175 }, // 130 – 305  Chat & Jurnal
  s4: { from: 285, dur: 150 }, // 285 – 435  Keuangan
  s5: { from: 415, dur: 160 }, // 415 – 575  Belajar
  s6: { from: 555, dur: 165 }, // 555 – 720  Outro & CTA
};
export const KAND_AI_DURATION = 720;
export const KAND_AI_FPS = 30;

/* ── Cue SFX (struktur saja; belum ada aset audio berlisensi) ──
   Taruh file di public/audio/ lalu bungkus <Audio src={staticFile(...)}/>
   di dalam <Sequence from={cue.frame}> kalau sudah ada. */
export const SFX_CUES = [
  { frame: 42, type: "whoosh", note: "chip menyatu ke tengah" },
  { frame: 72, type: "pop", note: "ring pertama muncul" },
  { frame: 98, type: "impact", note: "wordmark KAND AI" },
  { frame: 158, type: "pop", note: "panel chat" },
  { frame: 202, type: "click", note: "pesan user" },
  { frame: 345, type: "pop", note: "transaksi masuk" },
  { frame: 505, type: "click", note: "jawab kuis" },
  { frame: 515, type: "pop", note: "benar +XP" },
  { frame: 600, type: "whoosh", note: "ring menjadi logo" },
  { frame: 643, type: "impact", note: "wordmark outro" },
  { frame: 643 + 32, type: "pop", note: "CTA URL" },
];

/* ── Palet ── */
const C = {
  bg: "#071411",
  bg2: "#0B211A",
  em: "#10B981",
  mint: "#34D399",
  text: "#ECFDF5",
  muted: "#A7B7B0",
  line: "rgba(167,183,176,0.16)",
  dark: "#04130E",
  amber: "#F59E0B",
  sky: "#38BDF8",
  rose: "#F87171",
};

/* ── Helper animasi ── */
const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ip = (
  f: number,
  i: number[],
  o: number[],
  easing?: (t: number) => number,
) => interpolate(f, i, o, { ...clampX, easing });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
type SpCfg = NonNullable<Parameters<typeof spring>[0]["config"]>;
const SOFT: SpCfg = { damping: 16, stiffness: 140, mass: 0.8 };
const BOUNCY: SpCfg = { damping: 10, stiffness: 150, mass: 0.8 };

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg,#0F2D23 0%,#0B211A 100%)",
  border: `1.5px solid ${C.line}`,
  borderRadius: 40,
  boxSizing: "border-box",
};

const fmtRp = (n: number) =>
  "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* Komponen masuk reusable: spring + offset arah + overshoot */
const Pop: React.FC<{
  delay: number;
  x?: number;
  y?: number;
  s?: number;
  rot?: number;
  cfg?: SpCfg;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ delay, x = 0, y = 40, s = 0.92, rot = 0, cfg = SOFT, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: cfg });
  const o = ip(f, [delay, delay + 8], [0, 1]);
  return (
    <div
      style={{
        ...style,
        opacity: o,
        transform: `translate(${x * (1 - p)}px,${y * (1 - p)}px) scale(${lerp(s, 1, p)}) rotate(${rot * (1 - p)}deg)`,
      }}
    >
      {children}
    </div>
  );
};

/* Pembungkus exit per-scene */
const Out: React.FC<{
  at: number;
  len?: number;
  x?: number;
  y?: number;
  s?: number;
  children?: React.ReactNode;
}> = ({ at, len = 14, x = 0, y = 0, s = 1, children }) => {
  const f = useCurrentFrame();
  const t = ip(f, [at, at + len], [0, 1], easeIO);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - t,
        transform: `translate(${x * t}px,${y * t}px) scale(${lerp(1, s, t)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ── Logo mark (SVG, bisa digambar bertahap) ── */
const SQ =
  "M30 10 H70 A20 20 0 0 1 90 30 V70 A20 20 0 0 1 70 90 H30 A20 20 0 0 1 10 70 V30 A20 20 0 0 1 30 10 Z";

const Stroke: React.FC<{ d: string; p: number; w?: number; c: string }> = ({
  d,
  p,
  w = 5,
  c,
}) =>
  p > 0.001 ? (
    <path
      d={d}
      pathLength={1}
      strokeDasharray="1"
      strokeDashoffset={1 - p}
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ) : null;

const Mark: React.FC<{
  size: number;
  frameP?: number;
  kP?: number;
  showFrame?: boolean;
}> = ({ size, frameP = 1, kP = 1, showFrame = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {showFrame && (
      <>
        <path d={SQ} fill={C.em} opacity={0.14 * frameP} />
        <Stroke d={SQ} p={frameP} c={C.mint} />
      </>
    )}
    <Stroke d="M38 30 V70" p={ip(kP, [0, 0.5], [0, 1])} c={C.text} w={6} />
    <Stroke d="M40 52 L63 33" p={ip(kP, [0.3, 0.75], [0, 1])} c={C.text} w={6} />
    <Stroke d="M40 52 L64 70" p={ip(kP, [0.5, 1], [0, 1])} c={C.text} w={6} />
    <circle cx={69} cy={28} r={5.5 * ip(kP, [0.7, 1], [0, 1], easeOut)} fill={C.mint} />
  </svg>
);

/* ── Latar bersama (frame global) ── */
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const dx = Math.sin(f / 80) * 70;
  const dy = Math.cos(f / 100) * 50;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          left: -420 + dx,
          top: -300 + dy,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          right: -460 - dx,
          bottom: -260 - dy,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0) 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "108px 108px",
          backgroundPosition: `${f * 0.25}px ${f * 0.45}px`,
          opacity: 0.35,
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* Wordmark KAND AI (huruf per huruf + riak highlight) */
const Wordmark: React.FC<{
  top: number;
  size: number;
  start: number;
  rippleAt: number;
}> = ({ top, size, start, rippleAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "KAND AI".split("");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {letters.map((ch, i) => {
        if (ch === " ") return <div key={i} style={{ width: size * 0.3 }} />;
        const isAI = i >= 5;
        const p = spring({ frame: f - (start + i * 3), fps, config: SOFT });
        const flash = ip(
          f,
          [rippleAt + i * 2, rippleAt + i * 2 + 5, rippleAt + i * 2 + 12],
          [0, 1, 0],
        );
        const base = isAI ? C.mint : C.text;
        const hot = isAI ? "#FFFFFF" : "#6EE7B7";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              height: size * 1.22,
              padding: "0 4px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: size,
                fontWeight: 800,
                lineHeight: 1.18,
                letterSpacing: 4,
                color: interpolateColors(flash, [0, 1], [base, hot]),
                transform: `translateY(${(1 - p) * 115}%) translateY(${-10 * flash}px)`,
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SCENE 1 — HOOK
   ════════════════════════════════════════════════════════════ */
const S1_CHIPS: {
  Icon: LucideIcon;
  title: string;
  sub: string;
  left: number;
  top: number;
  w: number;
  from: [number, number];
  rot: number;
  tint: string;
}[] = [
  { Icon: MessageCircle, title: "Kepalaku penuh banget…", sub: "Pikiran", left: 60, top: 560, w: 640, from: [-800, 0], rot: -5, tint: C.mint },
  { Icon: Wallet, title: "Uang jajan sisa berapa?", sub: "Keuangan", left: 380, top: 760, w: 640, from: [800, -120], rot: 4, tint: C.amber },
  { Icon: BookOpen, title: "Kuis & tugas besok", sub: "Belajar", left: 70, top: 980, w: 580, from: [-700, 520], rot: 3, tint: C.sky },
  { Icon: PenLine, title: "Belum nulis jurnal", sub: "Cerita hari ini", left: 410, top: 1200, w: 600, from: [700, 700], rot: -4, tint: C.mint },
  { Icon: Bell, title: "3 pengingat", sub: "Hari ini", left: 150, top: 1420, w: 440, from: [0, 900], rot: 6, tint: C.rose },
];

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = "Banyak Hal yang Harus Kamu Urus?".split(" ");
  const conv = ip(f, [42, 68], [0, 1], Easing.in(Easing.back(1.6)));
  const titleOut = ip(f, [38, 52], [0, 1], easeIO);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 150,
          width: 900,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 26px",
          opacity: 1 - titleOut,
          transform: `translateY(${-70 * titleOut}px)`,
        }}
      >
        {words.map((w, i) => {
          const d = 2 + i * 3;
          const p = spring({ frame: f - d, fps, config: { damping: 13, stiffness: 150 } });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: 92,
                fontWeight: 800,
                lineHeight: 1.1,
                color: i === words.length - 1 ? C.mint : C.text,
                opacity: ip(f, [d, d + 5], [0, 1]),
                transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * 4}deg)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: 392,
          textAlign: "center",
          fontSize: 46,
          fontWeight: 600,
          color: C.muted,
          opacity: ip(f, [22, 34], [0, 1]) * (1 - titleOut),
          transform: `translateY(${(1 - ip(f, [22, 34], [0, 1], easeOut)) * 30 - 70 * titleOut}px)`,
        }}
      >
        Pikiran, keuangan, dan belajar.
      </div>

      {S1_CHIPS.map((c, i) => {
        const d = i * 5;
        const p = spring({ frame: f - d, fps, config: { damping: 11, stiffness: 110, mass: 0.9 } });
        const busy = ip(f, [26, 36], [0, 1]) * (1 - ip(f, [40, 46], [0, 1]));
        const jx = Math.sin(f / 5 + i * 1.7) * 6 * busy;
        const jy = Math.cos(f / 6 + i * 2.3) * 6 * busy;
        const ccx = c.left + c.w / 2;
        const ccy = c.top + 70;
        const tx = (540 - ccx) * conv;
        const ty = (780 - ccy) * conv;
        const Icon = c.Icon;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.left,
              top: c.top,
              width: c.w,
              opacity: ip(f, [d, d + 4], [0, 1]) * (1 - ip(f, [64, 72], [0, 1])),
              transform: `translate(${c.from[0] * (1 - p) + jx + tx}px,${c.from[1] * (1 - p) + jy + ty}px) rotate(${c.rot * (1 - conv)}deg) scale(${1 - 0.88 * conv})`,
            }}
          >
            <div
              style={{
                ...cardStyle,
                height: 140,
                borderRadius: 36,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 28px",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 26,
                  background: `${c.tint}26`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={42} color={c.tint} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 700, color: C.text, lineHeight: 1.15, whiteSpace: "nowrap" }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 28, color: C.muted, marginTop: 4 }}>{c.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════
   SCENE 2 — REVEAL
   ════════════════════════════════════════════════════════════ */
const CX = 540;
const CY = 780;

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = ip(f, [0, 62], [0.72, 1], easeOut);
  const exit = ip(f, [66, 88], [0, 1], easeIO);
  const fade = 1 - ip(f, [64, 78], [0, 1]);
  const frameP = ip(f, [10, 38], [0, 1], easeIO);
  const kP = ip(f, [30, 56], [0, 1], easeIO);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${CX}px ${CY}px` }}>
        {/* titik inti dari adegan 1 */}
        <div
          style={{
            position: "absolute",
            left: CX - 35,
            top: CY - 35,
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: C.mint,
            opacity: ip(f, [0, 6], [0, 1]) * (1 - ip(f, [16, 26], [0, 1])) * fade,
            transform: `scale(${ip(f, [0, 22], [1, 0.5], easeOut)})`,
          }}
        />
        {/* ring menyebar */}
        {[0, 1, 2].map((k) => {
          const d = 4 + k * 9;
          const size = ip(f, [d, d + 44], [120, 820 + k * 170], easeOut);
          const o = ip(f, [d, d + 6], [0, 0.55]) * (1 - ip(f, [d + 12, d + 44], [0, 1])) * fade;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: CX - size / 2,
                top: CY - size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                border: `${3 - k * 0.5}px solid ${C.mint}`,
                opacity: o,
              }}
            />
          );
        })}
        {/* partikel */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a0 = random(`a${i}`) * Math.PI * 2;
          const r = 300 + random(`r${i}`) * 230;
          const sz = 6 + random(`z${i}`) * 9;
          const sp = (0.012 + random(`s${i}`) * 0.01) * (i % 2 ? 1 : -1);
          const rr = lerp(r * 2.4, r, ip(f, [0, 38], [0, 1], easeOut));
          const ang = a0 + f * sp;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: CX + Math.cos(ang) * rr - sz / 2,
                top: CY + Math.sin(ang) * rr * 0.9 - sz / 2,
                width: sz,
                height: sz,
                borderRadius: "50%",
                background: i % 3 === 0 ? C.text : C.mint,
                opacity: ip(f, [0, 10], [0, 0.8]) * fade,
              }}
            />
          );
        })}

        {/* mark */}
        <div
          style={{
            position: "absolute",
            left: CX - 130,
            top: CY - 130,
            width: 260,
            height: 260,
            transform: `translate(${-410 * exit}px,${-390 * exit}px) scale(${lerp(1, 0.277, exit)})`,
          }}
        >
          <Mark size={260} frameP={frameP} kP={kP} />
        </div>

        <div style={{ opacity: fade }}>
          <Wordmark top={960} size={156} start={34} rippleAt={62} />
          {/* garis highlight */}
          <div
            style={{
              position: "absolute",
              left: CX - ip(f, [54, 76], [0, 290], easeOut),
              width: ip(f, [54, 76], [0, 580], easeOut),
              top: 1152,
              height: 5,
              borderRadius: 3,
              background: `linear-gradient(90deg, transparent, ${C.mint}, transparent)`,
            }}
          />
          <Pop delay={52} y={40} style={{ position: "absolute", left: 0, width: 1080, top: 1190, textAlign: "center", fontSize: 66, fontWeight: 700, color: C.text }}>
            Satu AI, <span style={{ color: C.mint }}>Banyak Solusi.</span>
          </Pop>
          <Pop delay={62} y={30} style={{ position: "absolute", left: 0, width: 1080, top: 1292, textAlign: "center", fontSize: 42, fontWeight: 500, color: C.muted }}>
            Asisten AI untuk aktivitas harianmu.
          </Pop>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════
   SCENE 3 — TEMAN CERITA & JURNAL
   ════════════════════════════════════════════════════════════ */
const FLAT_Y = 860; // garis penghubung S3 → S4
const USER_MSG = "Hari ini kepalaku penuh banget...";
const AI_MSG = "Cerita pelan-pelan aja. Kita urai satu per satu.";

const bez = (t: number, p0: number[], p1: number[], p2: number[], p3: number[]) => {
  const u = 1 - t;
  const k = (i: number) =>
    u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  return [k(0), k(1)];
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: f - 4, fps, config: { damping: 18, stiffness: 120 } });
  const typed = Math.floor(ip(f, [72, 100], [0, AI_MSG.length]));
  const dots = ip(f, [50, 54], [0, 1]) * (1 - ip(f, [70, 74], [0, 1]));
  const lineP = ip(f, [146, 164], [0, 1], easeIO);
  const cp = ip(f, [98, 114], [0, 1], easeIO);
  const P0 = [180, 858], P1 = [30, 880], P2 = [30, 940], P3 = [180, 975];
  const dot = bez(cp, P0, P1, P2, P3);
  const benefits: [LucideIcon, string][] = [
    [MessageCircle, "Teman berbincang kapan saja"],
    [Brain, "Membantu merapikan pikiran"],
    [PenLine, "Jurnal cerita & perasaan"],
    [Heart, "Informasi kesehatan umum"],
  ];

  return (
    <AbsoluteFill>
      <Out at={148} len={14} x={-80} s={0.96}>
        <Pop delay={10} x={-90} y={0} style={{ position: "absolute", left: 0, width: 1080, top: 150, textAlign: "center", fontSize: 84, fontWeight: 800, color: C.text }}>
          Teman Cerita <span style={{ color: C.mint }}>& Jurnal</span>
        </Pop>

        {/* panel chat tumbuh dari avatar */}
        <div
          style={{
            ...cardStyle,
            position: "absolute",
            left: 70,
            top: 330,
            width: 940,
            height: 580,
            opacity: ip(f, [4, 10], [0, 1]),
            transformOrigin: "60px 60px",
            transform: `scale(${lerp(0.12, 1, grow)})`,
          }}
        >
          <div style={{ position: "absolute", left: 120, top: 28, opacity: ip(f, [24, 32], [0, 1]) }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: C.text }}>KAND AI</div>
            <div style={{ fontSize: 26, color: C.mint, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: C.mint, display: "inline-block" }} />
              online
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, height: 1.5, background: C.line }} />

          {/* pesan user */}
          <Pop delay={28} x={90} y={0} style={{ position: "absolute", right: 36, top: 150, maxWidth: 600 }}>
            <div style={{ background: C.em, color: C.dark, fontSize: 42, fontWeight: 700, lineHeight: 1.3, padding: "24px 34px", borderRadius: "38px 38px 10px 38px" }}>
              {USER_MSG}
            </div>
          </Pop>

          {/* indikator mengetik */}
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 310,
              display: "flex",
              gap: 12,
              padding: "26px 32px",
              background: "#143A2E",
              borderRadius: "38px 38px 38px 10px",
              opacity: dots,
            }}
          >
            {[0, 1, 2].map((k) => (
              <span
                key={k}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: C.muted,
                  transform: `translateY(${Math.sin(f / 3 - k * 1.1) * 7}px)`,
                }}
              />
            ))}
          </div>

          {/* balasan AI (ketik per huruf) */}
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 310,
              maxWidth: 680,
              background: "#143A2E",
              color: C.text,
              fontSize: 42,
              fontWeight: 600,
              lineHeight: 1.3,
              padding: "26px 34px",
              borderRadius: "38px 38px 38px 10px",
              opacity: ip(f, [72, 74], [0, 1]),
            }}
          >
            <span>{AI_MSG.slice(0, typed)}</span>
            <span style={{ opacity: 0 }}>{AI_MSG.slice(typed)}</span>
          </div>
        </div>

        {/* konektor chat → jurnal */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <path
            d={`M${P0[0]} ${P0[1]} C${P1[0]} ${P1[1]}, ${P2[0]} ${P2[1]}, ${P3[0]} ${P3[1]}`}
            fill="none"
            stroke={C.mint}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset={1 - cp}
            pathLength={1}
            opacity={0.8}
          />
          {cp > 0 && cp < 1 && <circle cx={dot[0]} cy={dot[1]} r={10} fill={C.text} />}
        </svg>

        {/* kartu jurnal */}
        <Pop delay={106} y={70} s={0.94} cfg={BOUNCY} style={{ position: "absolute", left: 70, top: 960, width: 940 }}>
          <div style={{ ...cardStyle, height: 270, padding: "34px 40px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <PenLine size={44} color={C.mint} />
              <div style={{ fontSize: 40, fontWeight: 700, color: C.text, flex: 1 }}>Jurnal hari ini</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 30,
                  fontWeight: 700,
                  color: C.dark,
                  background: C.mint,
                  padding: "8px 20px",
                  borderRadius: 40,
                  opacity: ip(f, [138, 144], [0, 1]),
                  transform: `scale(${spring({ frame: f - 138, fps, config: BOUNCY })})`,
                }}
              >
                <Check size={28} strokeWidth={3.5} /> Tersimpan
              </div>
            </div>
            {[85, 58].map((w, k) => (
              <div key={k} style={{ height: 18, borderRadius: 9, background: "rgba(167,183,176,0.16)", marginTop: k === 0 ? 30 : 16 }}>
                <div style={{ height: 18, borderRadius: 9, background: "rgba(167,183,176,0.5)", width: `${w * ip(f, [116 + k * 8, 136 + k * 8], [0, 1], easeOut)}%` }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
              {["Pikiran penuh", "Capek"].map((t, k) => (
                <Pop key={t} delay={128 + k * 6} y={14} s={0.8} cfg={BOUNCY}>
                  <div style={{ fontSize: 30, fontWeight: 600, color: C.mint, background: "rgba(52,211,153,0.14)", padding: "8px 22px", borderRadius: 30 }}>{t}</div>
                </Pop>
              ))}
            </div>
          </div>
        </Pop>

        {/* manfaat */}
        {benefits.map(([Icon, label], i) => (
          <Pop key={label} delay={54 + i * 9} x={-60} y={0} style={{ position: "absolute", left: 90, top: 1320 + i * 100, display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 66, height: 66, borderRadius: 22, background: "rgba(52,211,153,0.14)", display: "grid", placeItems: "center" }}>
              <Icon size={34} color={C.mint} strokeWidth={2.3} />
            </div>
            <div style={{ fontSize: 42, fontWeight: 600, color: C.text }}>{label}</div>
          </Pop>
        ))}
        <Pop delay={92} y={20} style={{ position: "absolute", left: 90, top: 1745, fontSize: 30, color: C.muted }}>
          Bukan pengganti dokter atau tenaga medis.
        </Pop>
      </Out>

      {/* avatar (menerima mark dari adegan 2) */}
      <div style={{ position: "absolute", left: 94, top: 354, opacity: ip(f, [16, 19], [0, 1]) * (1 - ip(f, [148, 162], [0, 1])) }}>
        <Mark size={72} />
      </div>

      {/* garis → grafik keuangan */}
      <div
        style={{
          position: "absolute",
          left: 540 - 450 * lineP,
          width: 900 * lineP,
          top: FLAT_Y - 4,
          height: 8,
          borderRadius: 4,
          background: C.mint,
        }}
      />
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════
   SCENE 4 — KEUANGAN
   ════════════════════════════════════════════════════════════ */
const smooth = (p: number[][]) => {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

const CH_XS = Array.from({ length: 8 }, (_, i) => 94 + (i * 892) / 7);
const CH_YS = [850, 830, 836, 790, 776, 746, 736, 716];

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const e = ip(f, [122, 146], [0, 1], easeIO);
  const pts = CH_XS.map((x, i) => {
    const m = ip(f, [22 + i * 3, 56 + i * 3], [0, 1], easeOut);
    const y0 = lerp(FLAT_Y, CH_YS[i], m);
    return [lerp(x, 101 + (293 * i) / 7, e), lerp(y0, 450, e)];
  });
  const line = smooth(pts);
  const last = pts[pts.length - 1];
  const areaO = ip(f, [30, 60], [0, 1]) * (1 - e);
  const rows: [LucideIcon, string, string, string][] = [
    [Utensils, "Makan", "Rp25.000", C.amber],
    [Bus, "Transportasi", "Rp15.000", C.sky],
    [ShoppingBag, "Belanja", "Rp80.000", C.rose],
  ];
  const wallets: [string, string, string][] = [
    ["Tunai", "Rp250.000", C.em],
    ["Bank", "Rp1.100.000", C.sky],
    ["E-wallet", "Rp430.000", C.amber],
  ];
  const exp = ip(f, [34, 84], [0, 120000], easeOut);

  return (
    <AbsoluteFill>
      <Out at={124} len={12} y={60} s={0.97}>
        <Pop delay={4} y={-60} style={{ position: "absolute", left: 90, width: 900, top: 150, textAlign: "center", fontSize: 88, fontWeight: 800, lineHeight: 1.08, color: C.text }}>
          Keuangan lebih <span style={{ color: C.mint }}>teratur.</span>
        </Pop>

        {/* chat pill → transaksi */}
        <Pop delay={10} x={90} y={0} style={{ position: "absolute", right: 90, top: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.em, color: C.dark, fontSize: 40, fontWeight: 700, padding: "22px 36px", borderRadius: "36px 36px 10px 36px" }}>
            Tadi makan siang 25 ribu <Send size={36} />
          </div>
        </Pop>

        {/* kartu pengeluaran */}
        <Pop delay={18} y={60} style={{ position: "absolute", left: 70, top: 500, width: 940 }}>
          <div style={{ ...cardStyle, height: 400, padding: "36px 44px" }}>
            <div style={{ fontSize: 34, color: C.muted, fontWeight: 600 }}>Pengeluaran hari ini</div>
            <div style={{ fontSize: 104, fontWeight: 800, color: C.text, marginTop: 6, letterSpacing: -2 }}>{fmtRp(exp)}</div>
          </div>
        </Pop>

        {/* anggaran */}
        <Pop delay={40} y={30} style={{ position: "absolute", left: 90, width: 900, top: 930 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 600, color: C.muted }}>
            <span>Anggaran harian</span>
            <span style={{ color: C.mint }}>{Math.round(60 * ip(f, [60, 100], [0, 1], easeOut))}%</span>
          </div>
          <div style={{ height: 26, borderRadius: 13, background: "rgba(167,183,176,0.16)", marginTop: 14 }}>
            <div style={{ height: 26, borderRadius: 13, background: `linear-gradient(90deg,${C.em},${C.mint})`, width: `${60 * ip(f, [60, 100], [0, 1], easeOut)}%` }} />
          </div>
        </Pop>

        {/* dompet */}
        {wallets.map(([n, a, c], i) => (
          <Pop key={n} delay={64 + i * 6} y={50} cfg={BOUNCY} style={{ position: "absolute", left: 70 + i * 321, top: 1040, width: 298 }}>
            <div style={{ ...cardStyle, borderRadius: 32, height: 150, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Wallet size={34} color={c} />
                <span style={{ fontSize: 32, fontWeight: 700, color: C.text }}>{n}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: c, marginTop: 18 }}>{a}</div>
            </div>
          </Pop>
        ))}

        {/* transaksi (baris pertama terbang dari chat pill) */}
        {rows.map(([Icon, label, amt, c], i) => (
          <Pop
            key={label}
            delay={38 + i * 14}
            x={i === 0 ? 120 : 160}
            y={i === 0 ? -760 : 40}
            s={i === 0 ? 0.7 : 0.95}
            cfg={SOFT}
            style={{ position: "absolute", left: 70, top: 1220 + i * 126, width: 940 }}
          >
            <div style={{ ...cardStyle, borderRadius: 34, height: 110, display: "flex", alignItems: "center", gap: 22, padding: "0 30px" }}>
              <div style={{ width: 70, height: 70, borderRadius: 24, background: `${c}26`, display: "grid", placeItems: "center" }}>
                <Icon size={36} color={c} />
              </div>
              <div style={{ fontSize: 42, fontWeight: 700, color: C.text, flex: 1 }}>{label}</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: C.text }}>-{amt}</div>
            </div>
          </Pop>
        ))}

        <Pop delay={78} y={24} style={{ position: "absolute", left: 90, width: 900, top: 1640, textAlign: "center", fontSize: 38, lineHeight: 1.45, fontWeight: 600, color: C.mint }}>
          Catat lewat chat · Banyak dompet
          <br />
          Riwayat transaksi · Dashboard keuangan
        </Pop>
        <Pop delay={86} y={14} style={{ position: "absolute", left: 0, width: 1080, top: 1800, textAlign: "center", fontSize: 28, color: C.muted }}>
          Angka hanya ilustrasi.
        </Pop>
      </Out>

      {/* grafik: dimulai dari garis datar S3, lalu menjadi bar progres S5 */}
      {f >= 10 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.em} stopOpacity={0.32} />
              <stop offset="100%" stopColor={C.em} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${line} L${last[0]} 884 L${pts[0][0]} 884 Z`} fill="url(#chartFill)" opacity={areaO} />
          <path d={line} fill="none" stroke={C.mint} strokeWidth={lerp(8, 22, e)} strokeLinecap="round" strokeLinejoin="round" />
          <circle
            cx={last[0]}
            cy={last[1]}
            r={13 * ip(f, [62, 74], [0, 1]) * (1 - e)}
            fill={C.text}
            stroke={C.mint}
            strokeWidth={5}
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════
   SCENE 5 — BELAJAR DENGAN AI
   ════════════════════════════════════════════════════════════ */
const BAR_Y = 450;

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = ip(f, [100, 126], [0.35, 0.6], easeOut);
  const m = ip(f, [140, 158], [0, 1], easeIO);
  const nodesOut = 1 - ip(f, [134, 144], [0, 1]);
  const barOn = f >= 16 ? 1 : 0;
  const picked = f >= 92;
  const xp = 40 + Math.round(10 * ip(f, [104, 112], [0, 1]));
  const opts = ["Rp500", "Rp5.000", "Rp15.000"];
  const tags: [LucideIcon, string][] = [
    [BookOpen, "Materi"],
    [Bot, "Tutor AI"],
    [Zap, "Kuis & XP"],
    [Route, "Roadmap"],
  ];

  // fill bar → ring (morph)
  const fw = 900 * p;
  const fillStyle: React.CSSProperties = {
    position: "absolute",
    boxSizing: "border-box",
    left: lerp(90, 390, m),
    top: lerp(BAR_Y - 11, 630, m),
    width: lerp(fw, 300, m),
    height: lerp(22, 300, m),
    borderRadius: lerp(11, 150, m),
    border: `${lerp(0, 22, m)}px solid ${C.mint}`,
    background: `rgba(52,211,153,${1 - m})`,
    opacity: barOn,
  };

  return (
    <AbsoluteFill>
      {/* track + node roadmap */}
      <div style={{ opacity: barOn * nodesOut }}>
        <div style={{ position: "absolute", left: 90, top: BAR_Y - 11, width: 900, height: 22, borderRadius: 11, background: "rgba(167,183,176,0.16)" }} />
      </div>
      <div style={fillStyle} />
      <div style={{ opacity: barOn * nodesOut }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const x = 90 + (900 * k) / 4;
          const done = k < 2 || (k === 2 && f >= 114);
          const pop = k === 2 ? spring({ frame: f - 114, fps, config: BOUNCY }) : 1;
          const sc = k === 2 && f >= 114 ? lerp(0.7, 1, pop) : 1;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: x - 26,
                top: BAR_Y - 26,
                width: 52,
                height: 52,
                borderRadius: 26,
                boxSizing: "border-box",
                display: "grid",
                placeItems: "center",
                background: done ? C.mint : C.bg2,
                border: done ? "none" : `4px solid rgba(167,183,176,0.35)`,
                transform: `scale(${sc})`,
                opacity: ip(f, [16 + k * 3, 22 + k * 3], [0, 1]),
              }}
            >
              {done && <Check size={28} color={C.dark} strokeWidth={4} />}
              {!done && k === 4 && <GraduationCap size={26} color={C.muted} />}
            </div>
          );
        })}
      </div>

      <Out at={138} len={12} y={-50}>
        {/* judul: masuk dari kanan, per baris */}
        {["Belajar Jadi", "Lebih Terarah."].map((t, i) => (
          <Pop key={t} delay={18 + i * 6} x={130} y={0} style={{ position: "absolute", left: 0, width: 1080, top: 140 + i * 100, textAlign: "center", fontSize: 88, fontWeight: 800, lineHeight: 1.1, color: i ? C.mint : C.text }}>
            {t}
          </Pop>
        ))}

        <Pop delay={30} y={30} style={{ position: "absolute", left: 90, top: 510 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 600, color: C.text, background: "rgba(167,183,176,0.12)", padding: "14px 26px", borderRadius: 40 }}>
            <BookOpen size={32} color={C.mint} /> Pelajaran 3 · Dasar Menabung
          </div>
        </Pop>
        <div style={{ position: "absolute", right: 90, top: 510, transform: `scale(${1 + 0.18 * ip(f, [100, 106, 114], [0, 1, 0])})` , transformOrigin: "right center", opacity: ip(f, [30, 38], [0, 1]) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 34, fontWeight: 800, color: C.dark, background: C.amber, padding: "12px 26px", borderRadius: 40 }}>
            <Zap size={32} fill={C.dark} /> {xp} XP
          </div>
        </div>

        {/* kartu kuis */}
        <Pop delay={44} y={80} s={0.94} style={{ position: "absolute", left: 70, top: 640, width: 940 }}>
          <div style={{ ...cardStyle, height: 600, position: "relative", padding: "34px 36px" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.mint }}>Kuis · Soal 1/3</div>
            <div style={{ fontSize: 52, fontWeight: 800, color: C.text, marginTop: 14, lineHeight: 1.15 }}>Berapa 10% dari Rp50.000?</div>
            {opts.map((o, i) => {
              const right = i === 1;
              const state = picked ? (right ? "ok" : "dim") : "idle";
              return (
                <Pop key={o} delay={56 + i * 6} x={110} y={0} style={{ position: "absolute", left: 36, right: 36, top: 232 + i * 116 }}>
                  <div
                    style={{
                      height: 100,
                      borderRadius: 28,
                      display: "flex",
                      alignItems: "center",
                      gap: 22,
                      padding: "0 28px",
                      boxSizing: "border-box",
                      background: state === "ok" ? "rgba(16,185,129,0.22)" : "rgba(167,183,176,0.08)",
                      border: `3px solid ${state === "ok" ? C.mint : C.line}`,
                      opacity: state === "dim" ? 0.45 : 1,
                      transform: state === "ok" ? `scale(${1 + 0.03 * spring({ frame: f - 94, fps, config: BOUNCY })})` : undefined,
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 28, display: "grid", placeItems: "center", background: state === "ok" ? C.mint : "rgba(167,183,176,0.16)", color: state === "ok" ? C.dark : C.text, fontSize: 30, fontWeight: 800 }}>
                      {state === "ok" ? <Check size={32} strokeWidth={4} /> : "ABC"[i]}
                    </div>
                    <div style={{ fontSize: 44, fontWeight: 700, color: C.text }}>{o}</div>
                  </div>
                </Pop>
              );
            })}
            {/* ripple ketukan */}
            <div
              style={{
                position: "absolute",
                left: 330 - ip(f, [86, 98], [10, 60]),
                top: 396 + 34 - ip(f, [86, 98], [10, 60]),
                width: ip(f, [86, 98], [20, 120]),
                height: ip(f, [86, 98], [20, 120]),
                borderRadius: "50%",
                border: `4px solid ${C.mint}`,
                opacity: ip(f, [86, 90, 98], [0, 0.8, 0]),
              }}
            />
          </div>
        </Pop>

        {/* feedback */}
        <Pop delay={98} y={30} s={0.5} cfg={BOUNCY} style={{ position: "absolute", right: 70, top: 1210 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 40, fontWeight: 800, color: C.dark, background: C.mint, padding: "16px 34px", borderRadius: 50 }}>
            <Check size={38} strokeWidth={4} /> Benar! +10 XP
          </div>
        </Pop>

        {/* tutor AI */}
        <Pop delay={108} y={60} style={{ position: "absolute", left: 70, top: 1320, width: 940 }}>
          <div style={{ ...cardStyle, height: 170, display: "flex", alignItems: "center", gap: 26, padding: "0 34px" }}>
            <Mark size={84} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.mint }}>Tutor AI</div>
              <div style={{ fontSize: 38, fontWeight: 600, color: C.text, lineHeight: 1.25 }}>Belum paham? Tanya kapan saja.</div>
            </div>
          </div>
        </Pop>

        {/* fitur */}
        <div style={{ position: "absolute", left: 0, width: 1080, top: 1560, display: "flex", justifyContent: "center", gap: 12 }}>
          {tags.map(([Icon, t], i) => (
            <Pop key={t} delay={60 + i * 6} y={24} cfg={BOUNCY}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 32, fontWeight: 700, color: C.mint, background: "rgba(52,211,153,0.12)", padding: "14px 20px", borderRadius: 36 }}>
                <Icon size={32} /> {t}
              </div>
            </Pop>
          ))}
        </div>
      </Out>
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════
   SCENE 6 — OUTRO & CTA
   ════════════════════════════════════════════════════════════ */
const URL_TEXT = "https://kandai.my.id";

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = ip(f, [30, 54], [0, 1], easeOut);
  const cy = lerp(780, 700, t1);
  const D = lerp(300, 187, t1);
  const bw = lerp(22, 11, t1);
  const rad = lerp(150, 44, t1);
  const pulse = 1 + 0.07 * ip(f, [20, 26, 34], [0, 1, 0]);
  const kP = ip(f, [44, 68], [0, 1], easeIO);
  const icons: [LucideIcon, number, number][] = [
    [MessageCircle, -520, -420],
    [Wallet, 560, -300],
    [BookOpen, -540, 420],
    [PenLine, 520, 520],
  ];
  const sweep = ip(f, [128, 156], [0, 1], easeIO);

  return (
    <AbsoluteFill>
      {/* elemen berkumpul kembali */}
      {icons.map(([Icon, dx, dy], i) => {
        const c = ip(f, [i * 2, 20 + i * 1], [0, 1], Easing.bezier(0.5, 0, 0.2, 1));
        const sz = 96;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CX - sz / 2 + dx * (1 - c),
              top: 780 - sz / 2 + dy * (1 - c),
              width: sz,
              height: sz,
              borderRadius: 30,
              background: "#143A2E",
              border: `2px solid ${C.line}`,
              display: "grid",
              placeItems: "center",
              opacity: ip(f, [0, 4], [0, 1]) * (1 - ip(f, [18, 24], [0, 1])),
              transform: `scale(${lerp(1, 0.3, c)}) rotate(${(1 - c) * (i % 2 ? 25 : -25)}deg)`,
            }}
          >
            <Icon size={48} color={C.mint} />
          </div>
        );
      })}

      {/* ring → rounded square (bentuk logo) */}
      <div
        style={{
          position: "absolute",
          boxSizing: "border-box",
          left: CX - D / 2,
          top: cy - D / 2,
          width: D,
          height: D,
          borderRadius: rad,
          border: `${bw}px solid ${C.mint}`,
          background: `rgba(16,185,129,${0.14 * t1})`,
          opacity: ip(f, [16, 19], [0, 1]),
          transform: `scale(${pulse})`,
        }}
      />
      <div style={{ position: "absolute", left: CX - 110, top: 700 - 110, opacity: ip(f, [44, 48], [0, 1]) }}>
        <Mark size={220} showFrame={false} kP={kP} />
      </div>

      <Wordmark top={860} size={150} start={56} rippleAt={80} />
      <div
        style={{
          position: "absolute",
          left: CX - ip(f, [66, 90], [0, 280], easeOut),
          width: ip(f, [66, 90], [0, 560], easeOut),
          top: 1040,
          height: 5,
          borderRadius: 3,
          background: `linear-gradient(90deg, transparent, ${C.mint}, transparent)`,
        }}
      />

      <Pop delay={68} y={40} style={{ position: "absolute", left: 0, width: 1080, top: 1070, textAlign: "center", fontSize: 64, fontWeight: 700, color: C.text }}>
        Satu AI, <span style={{ color: C.mint }}>Banyak Solusi.</span>
      </Pop>
      <Pop delay={80} y={30} style={{ position: "absolute", left: 0, width: 1080, top: 1180, textAlign: "center", fontSize: 54, fontWeight: 600, color: C.muted }}>
        Mulai sekarang.
      </Pop>

      {/* CTA URL */}
      <Pop delay={88} y={70} s={0.8} cfg={{ damping: 11, stiffness: 130, mass: 0.9 }} style={{ position: "absolute", left: 0, width: 1080, top: 1290, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -14,
              borderRadius: 90,
              border: `3px solid ${C.mint}`,
              opacity: 0.35 + 0.25 * Math.sin(f / 9),
              transform: `scale(${1 + 0.02 * Math.sin(f / 9)})`,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "34px 56px",
              borderRadius: 80,
              overflow: "hidden",
              position: "relative",
              background: `linear-gradient(90deg, ${C.em}, ${C.mint})`,
              color: C.dark,
              fontSize: 62,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {URL_TEXT}
            <ArrowRight size={58} strokeWidth={3.5} />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: lerp(-200, 1100, sweep),
                width: 120,
                transform: "skewX(-20deg)",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              }}
            />
          </div>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

/* ════════════════════════════════════════════════════════════
   ROOT COMPOSITION
   ════════════════════════════════════════════════════════════ */
export const KandAI: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily, background: C.bg }}>
      <Background />
      <Sequence from={T.s1.from} durationInFrames={T.s1.dur} name="1 Hook">
        <Scene1 />
      </Sequence>
      <Sequence from={T.s2.from} durationInFrames={T.s2.dur} name="2 Reveal">
        <Scene2 />
      </Sequence>
      <Sequence from={T.s3.from} durationInFrames={T.s3.dur} name="3 Chat & Jurnal">
        <Scene3 />
      </Sequence>
      <Sequence from={T.s4.from} durationInFrames={T.s4.dur} name="4 Keuangan">
        <Scene4 />
      </Sequence>
      <Sequence from={T.s5.from} durationInFrames={T.s5.dur} name="5 Belajar">
        <Scene5 />
      </Sequence>
      <Sequence from={T.s6.from} durationInFrames={T.s6.dur} name="6 Outro CTA">
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};

export default KandAI;
