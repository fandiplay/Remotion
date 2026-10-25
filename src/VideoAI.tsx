import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import {
  ArrowRight,
  Atom,
  BarChart3,
  Bot,
  Calculator,
  Check,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   KAND AI — VideoAI promo (1080×1920 @ 30fps)

   Style brief
   · Tema     : jurnal + keuangan lewat WhatsApp
   · Perasaan : tenang, personal, meyakinkan
   · Konsep   : satu chat yang tumbuh — pesan menjadi jurnal,
                catatan uang, laporan, lalu ruang belajar
   · Palet    : #050607 / #83f891 / #d7ff4e / #ab87f5 (dari :root kandai.my.id)
   · Font     : Syne (display situs) + DM Sans (body situs)
   · Gerak    : kamera menyusuri chat, bubble mekar menjadi panel,
                gradien mint–lavender bernapas, grain hidup
   · Momen ✦  : bubble laporan mekar jadi dasbor (frame 514–552)
   Semua gerak fungsi murni dari frame.
   ──────────────────────────────────────────────────────────── */

const { fontFamily: DISPLAY } = loadSyne("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});
const { fontFamily: BODY } = loadDMSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const C = {
  bg: "#050607",
  bg2: "#0B0D10",
  panel: "#101317",
  panel2: "#171A20",
  ink: "#FFFFFF",
  muted: "#A7ADB8",
  faint: "#6E7480",
  mint: "#83F891",
  mintD: "#5FE875",
  lime: "#D7FF4E",
  lav: "#AB87F5",
  peach: "#FFCA9B",
  line: "rgba(255,255,255,0.10)",
  mintBg: "rgba(131,248,145,0.12)",
  mintBd: "rgba(131,248,145,0.30)",
  lavBg: "rgba(171,135,245,0.12)",
};

const SH = {
  card: "0 30px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
  mint: "0 12px 40px rgba(95,232,117,0.28)",
};

export const VIDEO_AI_DURATION = 1260;

/* ── Timeline global (frame) ── */
const T = {
  s1: 0,
  s2: 134,
  s3: 326,
  s4: 524,
  s5: 688,
  s6: 846,
  s7: 1026,
  end: VIDEO_AI_DURATION,
};

/* ── Voice-over ── */
const VOICE = [
  { from: 9, file: "audio-ai/vo-01.mp3", frames: 118 },
  { from: 140, file: "audio-ai/vo-02.mp3", frames: 184 },
  { from: 333, file: "audio-ai/vo-03.mp3", frames: 184 },
  { from: 525, file: "audio-ai/vo-04.mp3", frames: 147 },
  { from: 689, file: "audio-ai/vo-05.mp3", frames: 156 },
  { from: 857, file: "audio-ai/vo-06.mp3", frames: 167 },
  { from: 1035, file: "audio-ai/vo-07.mp3", frames: 165 },
] as const;

const SFX = [
  { from: 0, file: "audio/whoosh.mp3", vol: 0.34, dur: 42 },
  { from: 28, file: "audio/pop.mp3", vol: 0.28, dur: 16 },
  { from: 58, file: "audio/pop.mp3", vol: 0.26, dur: 16 },
  { from: 138, file: "audio/whoosh.mp3", vol: 0.24, dur: 36 },
  { from: 336, file: "audio/click.mp3", vol: 0.20, dur: 12 },
  { from: 374, file: "audio/pop.mp3", vol: 0.24, dur: 16 },
  { from: 440, file: "audio/click.mp3", vol: 0.20, dur: 12 },
  { from: 468, file: "audio/pop.mp3", vol: 0.24, dur: 16 },
  { from: 516, file: "audio/impact.mp3", vol: 0.30, dur: 40 },
  { from: 690, file: "audio/whoosh.mp3", vol: 0.28, dur: 42 },
  { from: 842, file: "audio/whoosh.mp3", vol: 0.26, dur: 36 },
  { from: 1022, file: "audio/whoosh.mp3", vol: 0.30, dur: 40 },
  { from: 1036, file: "audio/impact.mp3", vol: 0.32, dur: 40 },
  { from: 1114, file: "audio/pop.mp3", vol: 0.26, dur: 16 },
] as const;

/* ── Helpers ── */
type Ease = (t: number) => number;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ip = (f: number, i: number[], o: number[], easing?: Ease) =>
  interpolate(f, i, o, { ...clamp, ...(easing ? { easing } : {}) });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
const easeIn = Easing.bezier(0.55, 0, 1, 0.45);
type SpCfg = NonNullable<Parameters<typeof spring>[0]["config"]>;
const SOFT: SpCfg = { damping: 18, stiffness: 120, mass: 0.9 };
const POP: SpCfg = { damping: 11, stiffness: 170, mass: 0.65 };

const disp: React.CSSProperties = {
  fontFamily: DISPLAY,
  letterSpacing: "-0.035em",
  lineHeight: 1.06,
};
const body: React.CSSProperties = { fontFamily: BODY };

/* ── Brand bug ── */
const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => (
  <Img
    src={staticFile("kandai/logo.png")}
    style={{ width: size, height: size, objectFit: "contain", ...style }}
  />
);

const BrandBug: React.FC = () => {
  const f = useCurrentFrame();
  const o = ip(f, [8, 26], [0, 1]) * ip(f, [826, 844], [1, 0]);
  const y = ip(f, [8, 26], [14, 0], easeOut);
  return (
    <div
      style={{
        position: "absolute",
        left: 58,
        top: 54,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: o,
        transform: `translateY(${y}px)`,
        zIndex: 30,
      }}
    >
      <Logo size={46} />
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: C.ink,
        }}
      >
        KAND AI
      </span>
    </div>
  );
};

/* ── Background: gradien hidup + partikel + grain ── */
const particles = Array.from({ length: 26 }, (_, i) => {
  const s = (i * 9301 + 49297) % 233280;
  const r = s / 233280;
  const s2 = ((i + 7) * 233 + 911) % 997;
  return {
    x: r * 1080,
    base: (s2 / 997) * 1920,
    size: 2 + ((i * 13) % 4),
    speed: 0.18 + ((i * 7) % 10) / 30,
    drift: 18 + ((i * 11) % 40),
    phase: i * 1.37,
    tint: i % 4 === 0 ? C.lav : i % 3 === 0 ? C.lime : C.mint,
    alpha: 0.10 + ((i * 17) % 14) / 100,
  };
});

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const mintX = 130 + Math.sin(t * 0.42) * 100;
  const mintY = 210 + Math.cos(t * 0.34) * 90;
  const lavX = 980 + Math.cos(t * 0.3) * 90;
  const lavY = 1540 + Math.sin(t * 0.37) * 110;
  const limeY = 1050 + Math.sin(t * 0.26) * 130;
  const glow = 0.9 + Math.sin(t * 0.9) * 0.12;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 38% at 50% 108%, rgba(215,255,78,0.07) 0%, transparent 65%), linear-gradient(180deg,#060708 0%,#080A0D 55%,#050607 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1050,
          height: 1050,
          left: mintX - 525,
          top: mintY - 525,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(131,248,145,${0.20 * glow}) 0%, rgba(131,248,145,0.07) 34%, transparent 68%)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: lavX - 450,
          top: lavY - 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(171,135,245,0.18) 0%, rgba(171,135,245,0.06) 38%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1250,
          height: 420,
          left: -120,
          top: limeY,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(215,255,78,0.075) 0%, transparent 66%)",
          filter: "blur(30px)",
        }}
      />
      {/* partikel naik */}
      {particles.map((p, i) => {
        const y = ((p.base - t * 26 * p.speed) % 2020 + 2020) % 2020 - 50;
        const x = p.x + Math.sin(t * 0.5 + p.phase) * p.drift;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.tint,
              opacity: p.alpha,
              boxShadow: `0 0 8px ${p.tint}`,
            }}
          />
        );
      })}
      {/* grain hidup */}
      <svg
        width={1240}
        height={2080}
        viewBox="0 0 1240 2080"
        style={{
          position: "absolute",
          left: -80 + (f * 3) % 80,
          top: -80 + (f * 2) % 80,
          opacity: 0.075,
          pointerEvents: "none",
        }}
      >
        <filter id="kand-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="1240" height="2080" filter="url(#kand-grain)" opacity="0.9" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 85% at 50% 45%, transparent 42%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/* ── Teks masuk dengan mask + blur berarah ── */
const Reveal: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  y?: number;
}> = ({ delay, children, style, y = 85 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: POP });
  const o = ip(f, [delay, delay + 7], [0, 1]);
  return (
    <span style={{ display: "block", overflow: "hidden", paddingBottom: 14 }}>
      <span
        style={{
          ...style,
          display: "block",
          opacity: o,
          transform: `translateY(${(1 - p) * y}px)`,
          filter: `blur(${(1 - p) * 9}px)`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

const Chip: React.FC<{
  delay?: number;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, icon, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: SOFT });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 24px",
        borderRadius: 999,
        border: `1px solid ${C.mintBd}`,
        background: C.mintBg,
        color: C.mint,
        fontSize: 30,
        fontWeight: 500,
        ...body,
        opacity: ip(f, [delay, delay + 8], [0, 1]),
        transform: `translateY(${(1 - p) * 18}px) scale(${lerp(0.96, 1, p)})`,
        ...style,
      }}
    >
      {icon}
      {children}
    </div>
  );
};

/* ── Phone chat ── */
const Bubble: React.FC<{
  at: number;
  side: "me" | "ai";
  children: React.ReactNode;
}> = ({ at, side, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 130, mass: 0.8 } });
  const o = ip(f, [at, at + 7], [0, 1]);
  const me = side === "me";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: me ? "flex-end" : "flex-start",
        opacity: o,
        transform: `translateY(${(1 - p) * 26}px) scale(${lerp(0.92, 1, p)})`,
        transformOrigin: me ? "right bottom" : "left bottom",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          padding: "20px 24px",
          borderRadius: me ? "28px 28px 8px 28px" : "28px 28px 28px 8px",
          background: me
            ? `linear-gradient(180deg,${C.lime} 0%,${C.mint} 55%,${C.mintD} 100%)`
            : C.panel2,
          color: me ? "#04120A" : C.ink,
          border: me ? "none" : `1px solid ${C.line}`,
          fontSize: 31,
          lineHeight: 1.34,
          fontWeight: me ? 600 : 500,
          ...body,
          boxShadow: me
            ? "0 10px 26px rgba(113,228,100,0.18)"
            : "0 8px 24px rgba(0,0,0,0.35)",
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const o = ip(f, [from, from + 4], [0, 1]) * ip(f, [to - 4, to], [1, 0]);
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", opacity: o, height: 62 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 22px",
          borderRadius: "24px 24px 24px 8px",
          background: C.panel2,
          border: `1px solid ${C.line}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: C.muted,
              opacity: 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(f / 3 + i)),
              transform: `translateY(${Math.sin(f / 3 + i) * 2}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const PhoneWorld: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame: f - 0, fps, config: { damping: 18, stiffness: 85, mass: 1 } });
  const top =
    f < 132
      ? lerp(790, 560, rise)
      : f < 330
        ? ip(f, [132, 184], [560, 466], easeIO)
        : ip(f, [330, 382], [466, 392], easeIO);
  const scale =
    f < 132
      ? lerp(0.9, 1, rise)
      : f < 330
        ? ip(f, [132, 184], [1, 1.025], easeIO)
        : ip(f, [330, 382], [1.025, 1.06], easeIO);
  const rot = lerp(-3 * (1 - rise), 0, 0.4) + ip(f, [330, 382], [0, -1.4], easeIO);
  const scroll =
    f < 330 ? 0 : ip(f, [330, 386], [0, -522], easeIO);
  const exit = ip(f, [510, 542], [0, 1], easeIn);

  const phoneW = 860;
  const phoneH = 1470;

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-70 * exit}px) scale(${1 - 0.08 * exit}) rotate(${rot - 3 * exit}deg)`,
        transformOrigin: "50% 40%",
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (1080 - phoneW) / 2,
          top,
          width: phoneW,
          height: phoneH,
        }}
      >
        {/* halo */}
        <div
          style={{
            position: "absolute",
            left: -160,
            top: -120,
            width: phoneW + 320,
            height: phoneH + 240,
            borderRadius: 260,
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(131,248,145,0.20) 0%, rgba(171,135,245,0.08) 42%, transparent 70%)",
            filter: "blur(28px)",
            transform: `scale(${scale})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 68,
            padding: 3,
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(131,248,145,0.32) 26%, rgba(255,255,255,0.05) 60%, rgba(171,135,245,0.26) 100%)",
            boxShadow: SH.card,
            transform: `scale(${scale})`,
            transformOrigin: "50% 100%",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 65,
              background: C.bg,
              padding: 10,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 56,
                background: "#07090B",
                overflow: "hidden",
                border: `1px solid ${C.line}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* status bar */}
              <div
                style={{
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 34px",
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.ink,
                  ...body,
                }}
              >
                <span>9:41</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 16 }}>
                    {[7, 10, 13, 16].map((h, i) => (
                      <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: C.ink }} />
                    ))}
                  </div>
                  <div style={{ width: 22, height: 14, border: `2px solid ${C.ink}`, borderRadius: 4, padding: 2, boxSizing: "border-box" }}>
                    <div style={{ width: "72%", height: "100%", background: C.ink, borderRadius: 1 }} />
                  </div>
                </div>
              </div>

              {/* chat header */}
              <div
                style={{
                  height: 112,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 30px",
                  background: "rgba(16,19,23,0.94)",
                  borderBottom: `1px solid ${C.line}`,
                }}
              >
                <Logo size={62} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...body, fontSize: 32, fontWeight: 700, color: C.ink }}>KAND AI</div>
                  <div style={{ ...body, fontSize: 23, fontWeight: 500, color: C.mint }}>online</div>
                </div>
                <MessageCircle size={32} color={C.muted} strokeWidth={2} />
              </div>

              {/* chat viewport */}
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at 20% 12%, rgba(131,248,145,0.045) 0%, transparent 42%), radial-gradient(circle at 84% 68%, rgba(171,135,245,0.05) 0%, transparent 44%), #090B0E",
                }}
              >
                <div
                  style={{
                    padding: "26px 24px",
                    transform: `translateY(${scroll}px)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
                    <div
                      style={{
                        ...body,
                        fontSize: 21,
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        color: C.muted,
                        padding: "5px 18px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.055)",
                      }}
                    >
                      Hari ini
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Bubble at={24} side="me">
                      Hari ini lumayan melelahkan 😮‍💨
                    </Bubble>
                    <Typing from={40} to={58} />
                    <Bubble at={58} side="ai">
                      Sudah kusimpan di jurnalmu ✓{"\n"}
                      <span style={{ color: C.muted }}>Mood-nya kutandai campur aduk.</span>
                    </Bubble>

                    {/* mood chips */}
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        paddingLeft: 6,
                        marginTop: 2,
                        opacity: ip(f, [158, 170], [0, 1]),
                        transform: `translateY(${(1 - spring({ frame: f - 158, fps, config: SOFT })) * 16}px)`,
                      }}
                    >
                      {["Senang", "Campur aduk", "Lelah"].map((m, i) => (
                        <div
                          key={m}
                          style={{
                            ...body,
                            fontSize: 23,
                            fontWeight: 500,
                            padding: "8px 16px",
                            borderRadius: 999,
                            color: i === 1 ? "#04120A" : C.muted,
                            background: i === 1 ? C.mint : "rgba(255,255,255,0.06)",
                            border: i === 1 ? "none" : `1px solid ${C.line}`,
                          }}
                        >
                          {m}
                        </div>
                      ))}
                    </div>

                    <div style={{ height: 60 }} />

                    <Bubble at={348} side="me">
                      beli kopi 18rb
                    </Bubble>
                    <Bubble at={372} side="ai">
                      Tercatat ✓{"\n"}
                      <span style={{ color: C.peach }}>Kopi – Rp 18.000</span>
                      {"\n"}
                      <span style={{ color: C.muted }}>Kategori: Makanan</span>
                    </Bubble>
                    <Bubble at={420} side="me">
                      berapa pengeluaran aku minggu ini?
                    </Bubble>
                    <Bubble at={452} side="ai">
                      Minggu ini: <span style={{ color: C.mint, fontWeight: 700 }}>Rp 425.000</span>
                      {"\n"}
                      <span style={{ color: C.muted }}>Turun 12% dari minggu lalu.</span>
                    </Bubble>
                  </div>
                </div>
              </div>

              {/* input bar */}
              <div
                style={{
                  height: 90,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 22px",
                  background: "rgba(16,19,23,0.96)",
                  borderTop: `1px solid ${C.line}`,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 58,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.line}`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 22px",
                    ...body,
                    fontSize: 25,
                    color: C.faint,
                  }}
                >
                  Ketik pesanmu…
                </div>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    background: `linear-gradient(180deg,${C.lime},${C.mintD})`,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 8px 20px rgba(113,228,100,0.26)",
                  }}
                >
                  <ArrowRight size={26} color="#04120A" strokeWidth={2.6} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Headline scene 1 ── */
const S1Head: React.FC = () => {
  const f = useCurrentFrame();
  const out = ip(f, [126, 146], [0, 1], easeIO);
  return (
    <div
      style={{
        position: "absolute",
        left: 62,
        top: 178,
        width: 960,
        zIndex: 6,
        opacity: 1 - out,
        transform: `translateY(${-46 * out}px)`,
      }}
    >
      <Reveal delay={8} style={{ ...disp, fontSize: 88, fontWeight: 800, color: C.ink }}>
        Jurnal &amp;
      </Reveal>
      <Reveal delay={15} style={{ ...disp, fontSize: 88, fontWeight: 800, color: C.ink }}>
        keuanganmu
      </Reveal>
      <Reveal delay={22} style={{ ...disp, fontSize: 88, fontWeight: 800, color: C.mint }}>
        lewat WhatsApp
      </Reveal>
    </div>
  );
};

/* ── Headline scene 2 ── */
const S2Head: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = ip(f, [178, 196], [0, 1], easeIO);
  const line = spring({ frame: f - 14, fps, config: SOFT });
  return (
    <div
      style={{
        position: "absolute",
        left: 62,
        top: 196,
        width: 960,
        zIndex: 6,
        opacity: 1 - out,
        transform: `translateY(${-42 * out}px)`,
      }}
    >
      <Reveal delay={4} style={{ ...disp, fontSize: 86, fontWeight: 800, color: C.ink }}>
        Jurnal harian
      </Reveal>
      <div
        style={{
          height: 8,
          width: 270 * line,
          borderRadius: 99,
          background: `linear-gradient(90deg,${C.mint},${C.lime})`,
          marginTop: 10,
        }}
      />
      <div style={{ marginTop: 30 }}>
        <Chip delay={18} icon={<Sparkles size={26} color={C.mint} strokeWidth={2.2} />}>
          Mood otomatis ditandai
        </Chip>
      </div>
    </div>
  );
};

/* ── Headline scene 3 ── */
const S3Head: React.FC = () => {
  const f = useCurrentFrame();
  const out = ip(f, [178, 196], [0, 1], easeIO);
  return (
    <div
      style={{
        position: "absolute",
        left: 62,
        top: 168,
        width: 960,
        zIndex: 6,
        opacity: 1 - out,
        transform: `translateY(${-42 * out}px)`,
      }}
    >
      <Reveal delay={4} style={{ ...disp, fontSize: 84, fontWeight: 800, color: C.ink }}>
        Uangmu,
      </Reveal>
      <Reveal delay={11} style={{ ...disp, fontSize: 84, fontWeight: 800, color: C.mint }}>
        tercatat
      </Reveal>
    </div>
  );
};

/* ── Scene 4 — Dashboard ── */
const bars = [42, 68, 54, 82, 61, 94, 72];
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const DashboardScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f - 26, fps, config: { damping: 17, stiffness: 95, mass: 0.95 } });
  const exit = ip(f, [156, 176], [0, 1], easeIO);
  const note = spring({ frame: f - 34, fps, config: POP });
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateX(${-240 * exit}px) rotate(${-3 * exit}deg)`,
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 128,
          width: 952,
          zIndex: 7,
          opacity: ip(f, [0, 8], [0, 1]),
        }}
      >
        <Reveal delay={12} style={{ ...disp, fontSize: 78, fontWeight: 800, color: C.ink }}>
          Laporan otomatis
        </Reveal>
        <div style={{ marginTop: 24 }}>
          <Chip delay={22} icon={<FileText size={26} color={C.mint} strokeWidth={2.2} />}>
            Mingguan &amp; bulanan
          </Chip>
        </div>
      </div>

      {/* notifikasi WhatsApp */}
      <div
        style={{
          position: "absolute",
          left: 126,
          top: 366,
          width: 760,
          padding: "18px 22px",
          borderRadius: 30,
          background: "rgba(24,28,34,0.96)",
          border: `1px solid ${C.mintBd}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          display: "flex",
          gap: 16,
          alignItems: "center",
          zIndex: 8,
          opacity: ip(f, [34, 46], [0, 1]),
          transform: `translateY(${(1 - note) * -26}px) scale(${lerp(0.94, 1, note)})`,
        }}
      >
        <Logo size={54} />
        <div>
          <div style={{ ...body, fontSize: 27, fontWeight: 700, color: C.ink }}>
            Laporan mingguan siap
          </div>
          <div style={{ ...body, fontSize: 24, fontWeight: 500, color: C.muted, marginTop: 2 }}>
            Pengeluaran turun 12% minggu ini
          </div>
        </div>
      </div>

      {/* kartu dasbor */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 470,
          width: 952,
          height: 1110,
          borderRadius: 42,
          background: `linear-gradient(160deg,${C.panel} 0%,#0A0C0F 100%)`,
          border: `1px solid ${C.line}`,
          boxShadow: SH.card,
          overflow: "hidden",
          opacity: ip(f, [26, 40], [0, 1]),
          transform: `translateY(${(1 - enter) * 90}px) scale(${lerp(0.9, 1, enter)})`,
          transformOrigin: "50% 10%",
        }}
      >
        <div
          style={{
            height: 86,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 34px",
            borderBottom: `1px solid ${C.line}`,
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <Logo size={40} />
          <span style={{ ...body, fontSize: 27, fontWeight: 600, color: C.ink }}>
            Dasbor KAND AI
          </span>
          <span style={{ ...body, fontSize: 23, color: C.faint, marginLeft: "auto" }}>
            Minggu ini
          </span>
        </div>

        <div style={{ padding: "32px 38px" }}>
          <div style={{ ...body, fontSize: 26, fontWeight: 500, color: C.muted }}>
            Saldo bersih
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 6 }}>
            <div style={{ ...disp, fontSize: 64, fontWeight: 700, color: C.ink }}>
              Rp 5.780.000
            </div>
            <div
              style={{
                ...body,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 23,
                fontWeight: 600,
                color: C.mint,
                padding: "7px 14px",
                borderRadius: 999,
                background: C.mintBg,
                marginBottom: 8,
              }}
            >
              <TrendingDown size={20} strokeWidth={2.4} />
              12%
            </div>
          </div>

          <div style={{ marginTop: 34, ...body, fontSize: 26, fontWeight: 600, color: C.muted }}>
            Pengeluaran mingguan
          </div>
          <div
            style={{
              marginTop: 18,
              height: 250,
              display: "flex",
              alignItems: "flex-end",
              gap: 22,
              padding: "0 8px",
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            {bars.map((h, i) => {
              const p = spring({ frame: f - 34 - i * 3, fps, config: { damping: 16, stiffness: 90 } });
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: "100%",
                      height: h * 2.1 * p,
                      borderRadius: "12px 12px 4px 4px",
                      background:
                        i === 5
                          ? `linear-gradient(180deg,${C.lime},${C.mintD})`
                          : `linear-gradient(180deg,${C.mint},rgba(131,248,145,0.25))`,
                      opacity: i === 5 ? 1 : 0.62,
                      boxShadow: i === 5 ? "0 0 26px rgba(131,248,145,0.28)" : "none",
                    }}
                  />
                  <span style={{ ...body, fontSize: 21, color: C.faint }}>{days[i]}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: <Wallet size={24} color={C.peach} />, label: "Makan & belanja", value: "− Rp 1.240.000", tint: C.peach },
              { icon: <BarChart3 size={24} color={C.lav} />, label: "Transportasi", value: "− Rp 480.000", tint: C.lav },
              { icon: <Check size={24} color={C.mint} />, label: "Gaji bulan ini", value: "+ Rp 7.500.000", tint: C.mint },
            ].map((r, i) => (
              <div
                key={r.label}
                style={{
                  height: 64,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.035)",
                  border: `1px solid ${C.line}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 18px",
                  opacity: ip(f, [48 + i * 5, 58 + i * 5], [0, 1]),
                  transform: `translateX(${(1 - spring({ frame: f - 48 - i * 5, fps, config: SOFT })) * 24}px)`,
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "grid", placeItems: "center" }}>
                  {r.icon}
                </div>
                <span style={{ ...body, fontSize: 26, color: C.ink, flex: 1 }}>{r.label}</span>
                <span style={{ ...body, fontSize: 25, fontWeight: 600, color: r.tint }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};

/* ── Scene 5 — Learning ── */
const LearningScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f - 6, fps, config: { damping: 18, stiffness: 90, mass: 0.95 } });
  const exit = ip(f, [146, 170], [0, 1], easeIn);
  const progress = spring({ frame: f - 30, fps, config: { damping: 20, stiffness: 55, mass: 1 } });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - ip(f, [160, 176], [0, 1]),
        transform: `translateY(${-90 * exit}px) scale(${1 - 0.04 * exit})`,
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 128,
          width: 952,
          zIndex: 7,
          opacity: ip(f, [0, 8], [0, 1]),
        }}
      >
        <Reveal delay={2} style={{ ...disp, fontSize: 78, fontWeight: 800, color: C.ink }}>
          Belajar sampai ngerti
        </Reveal>
        <div style={{ marginTop: 24 }}>
          <Chip delay={14} icon={<Bot size={26} color={C.mint} strokeWidth={2.2} />}>
            Materi · latihan · tutor AI
          </Chip>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 390,
          width: 940,
          height: 1160,
          borderRadius: 44,
          background: `linear-gradient(145deg, rgba(30,32,40,0.97), rgba(11,13,17,0.99))`,
          border: `1px solid ${C.line}`,
          boxShadow: "0 40px 110px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
          padding: "34px 38px",
          boxSizing: "border-box",
          transform: `translateX(${(1 - enter) * 900}px) rotate(${lerp(5, -2, enter)}deg)`,
          opacity: ip(f, [6, 20], [0, 1]),
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={48} />
          <span style={{ ...body, fontSize: 27, fontWeight: 700, color: C.ink }}>KAND AI</span>
          <span style={{ ...body, fontSize: 26, color: C.faint }}>•</span>
          <span style={{ ...body, fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", color: C.mint }}>
            BELAJAR
          </span>
        </div>

        <div style={{ ...disp, fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 26 }}>
          Belajar hari ini
        </div>

        <div
          style={{
            marginTop: 24,
            padding: "22px 24px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.line}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...body, fontSize: 25, fontWeight: 500, color: C.muted }}>Satu langkah kecil tiap hari</span>
            <span style={{ ...body, fontSize: 25, fontWeight: 700, color: C.mint }}>Terus berkembang!</span>
          </div>
          <div style={{ height: 12, borderRadius: 99, background: "rgba(255,255,255,0.08)", marginTop: 16, overflow: "hidden" }}>
            <div
              style={{
                width: `${64 * progress}%`,
                height: "100%",
                borderRadius: 99,
                background: `linear-gradient(90deg,${C.mintD},${C.lime})`,
                boxShadow: "0 0 20px rgba(131,248,145,0.5)",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              icon: <Calculator size={34} color={C.mint} strokeWidth={2} />,
              title: "Matematika",
              sub: "Pahami konsep lewat latihan",
              tint: C.mintBg,
            },
            {
              icon: <Atom size={34} color={C.lav} strokeWidth={2} />,
              title: "Sains & konsep",
              sub: "Belajar dengan langkah kecil",
              tint: C.lavBg,
            },
            {
              icon: <Bot size={34} color={C.peach} strokeWidth={2} />,
              title: "Tutor AI",
              sub: "Tanya saat ada yang membingungkan",
              tint: "rgba(255,202,155,0.12)",
            },
          ].map((s, i) => {
            const p = spring({ frame: f - 24 - i * 7, fps, config: SOFT });
            return (
              <div
                key={s.title}
                style={{
                  height: 138,
                  borderRadius: 26,
                  background: "rgba(255,255,255,0.035)",
                  border: `1px solid ${C.line}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 24px",
                  opacity: ip(f, [24 + i * 7, 34 + i * 7], [0, 1]),
                  transform: `translateY(${(1 - p) * 26}px)`,
                }}
              >
                <div style={{ width: 66, height: 66, borderRadius: 20, background: s.tint, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...body, fontSize: 31, fontWeight: 700, color: C.ink }}>{s.title}</div>
                  <div style={{ ...body, fontSize: 25, fontWeight: 500, color: C.muted, marginTop: 3 }}>{s.sub}</div>
                </div>
                <ArrowRight size={28} color={C.faint} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 6 — CTA ── */
const CTAScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = spring({ frame: f - 38, fps, config: POP });
  const exit = ip(f, [170, 190], [0, 1], easeIn);
  const rings = f / 30;

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `scale(${1 + 0.05 * exit})`,
        zIndex: 4,
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => {
        const s = 0.72 + 0.22 * ((rings * 0.18 + i / 3) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 920,
              width: 860 * s,
              height: 860 * s,
              marginLeft: (1080 - 860 * s) / 2,
              borderRadius: "50%",
              border: `1px solid rgba(131,248,145,${0.18 - i * 0.045})`,
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 420,
          left: 0,
          width: 1080,
          textAlign: "center",
          zIndex: 6,
          opacity: ip(f, [0, 8], [0, 1]),
        }}
      >
        <Reveal delay={20} style={{ ...disp, fontSize: 112, fontWeight: 800, color: C.mint }}>
          Mulai gratis
        </Reveal>
        <Reveal
          delay={26}
          style={{ ...body, fontSize: 40, fontWeight: 500, color: C.ink, marginTop: 26, lineHeight: 1.3 }}
        >
          Tanpa aplikasi baru. Catatanmu privat.
        </Reveal>
      </div>

      <div
        style={{
          position: "absolute",
          top: 742,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          zIndex: 6,
          opacity: ip(f, [38, 50], [0, 1]),
          transform: `scale(${lerp(0.88, 1, pill)}) translateY(${(1 - pill) * 22}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "26px 42px",
            borderRadius: 999,
            background: `linear-gradient(180deg,${C.lime} 0%,${C.mint} 55%,${C.mintD} 100%)`,
            color: "#04120A",
            fontFamily: DISPLAY,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            boxShadow: SH.mint,
          }}
        >
          Mulai lewat WhatsApp
          <ArrowRight size={36} strokeWidth={2.6} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 900,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          zIndex: 6,
          opacity: ip(f, [50, 64], [0, 1]),
        }}
      >
        <ShieldCheck size={28} color={C.muted} strokeWidth={2} />
        <span style={{ ...body, fontSize: 28, color: C.muted }}>
          Hanya nomor terdaftar yang bisa membuka catatanmu
        </span>
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 7 — Outro ── */
const OutroScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 30, fps, config: { damping: 13, stiffness: 95, mass: 0.9 } });
  const ring = spring({ frame: f - 34, fps, config: { damping: 22, stiffness: 45, mass: 1 } });
  const word = "KAND AI".split("");

  return (
    <AbsoluteFill style={{ zIndex: 4 }}>
      <div
        style={{
          position: "absolute",
          top: 500,
          left: (1080 - 300) / 2,
          width: 300,
          height: 300,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300 + 280 * ring,
            height: 300 + 280 * ring,
            marginLeft: -140 * ring,
            marginTop: -140 * ring,
            borderRadius: "50%",
            border: `1px solid rgba(131,248,145,${0.22 * (1 - ring * 0.5)})`,
            opacity: ip(f, [34, 44], [0, 1]) * (1 - ip(f, [84, 124], [0, 0.6])),
          }}
        />
        <div
          style={{
            width: 250,
            height: 250,
            borderRadius: 64,
            boxShadow: "0 0 90px rgba(131,248,145,0.34), 0 30px 80px rgba(0,0,0,0.5)",
            opacity: ip(f, [30, 40], [0, 1]),
            transform: `scale(${lerp(0.55, 1, logo)}) rotate(${lerp(-12, 0, logo)}deg)`,
          }}
        >
          <Logo size={250} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 850,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {word.map((ch, i) => {
          if (ch === " ") return <div key={i} style={{ width: 28 }} />;
          const p = spring({ frame: f - 44 - i * 2.5, fps, config: POP });
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", height: 130, padding: "0 3px" }}>
              <span
                style={{
                  display: "inline-block",
                  ...disp,
                  fontSize: 118,
                  fontWeight: 800,
                  color: i > 4 ? C.mint : C.ink,
                  transform: `translateY(${(1 - p) * 120}%)`,
                  opacity: ip(f, [44 + i * 2.5, 50 + i * 2.5], [0, 1]),
                }}
              >
                {ch}
              </span>
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1010,
          left: 0,
          width: 1080,
          textAlign: "center",
          opacity: ip(f, [60, 76], [0, 1]),
          transform: `translateY(${(1 - spring({ frame: f - 60, fps, config: SOFT })) * 20}px)`,
        }}
      >
        <div style={{ ...body, fontSize: 38, fontWeight: 500, color: C.muted }}>
          Jurnal dan catatan keuangan harian,
        </div>
        <div style={{ ...body, fontSize: 38, fontWeight: 500, color: C.muted, marginTop: 4 }}>
          langsung dari WhatsApp
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1140,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: ip(f, [74, 90], [0, 1]),
          transform: `scale(${lerp(0.9, 1, spring({ frame: f - 74, fps, config: POP }))})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 30px",
            borderRadius: 999,
            border: `1px solid ${C.mintBd}`,
            background: C.mintBg,
            ...body,
            fontSize: 31,
            fontWeight: 600,
            color: C.mint,
          }}
        >
          kandai.my.id
          <ArrowRight size={26} strokeWidth={2.4} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1260,
          left: 0,
          width: 1080,
          textAlign: "center",
          ...body,
          fontSize: 28,
          fontWeight: 500,
          color: C.faint,
          opacity: ip(f, [88, 104], [0, 1]),
        }}
      >
        Gratis buat mulai · dibuat di Indonesia
      </div>
    </AbsoluteFill>
  );
};

/* ── Transisi yang dibawa objek ── */
const Portal: React.FC<{
  dur: number;
  cx: number;
  cy: number;
  color?: string;
}> = ({ dur, cx, cy, color }) => {
  const f = useCurrentFrame();
  const p = ip(f, [0, Math.min(28, dur - 14)], [0, 1], easeIn);
  const fade = ip(f, [dur - 20, dur], [1, 0], easeIO);
  const r = p * 2400;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background:
          color ??
          `radial-gradient(circle at 42% 38%, ${C.lime} 0%, ${C.mint} 46%, ${C.mintD} 100%)`,
        opacity: p > 0 ? fade : 0,
        zIndex: 20,
      }}
    />
  );
};

const BlockSweep: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = ip(f, [0, 20], [0, 1], easeIO);
  const fade = ip(f, [dur - 16, dur], [1, 0], easeIO);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        background: `linear-gradient(140deg,${C.mint} 0%,${C.lime} 58%,${C.mintD} 100%)`,
        opacity: fade,
        transform: `scaleY(${lerp(0.04, 1, p)})`,
        transformOrigin: "50% 54%",
        zIndex: 20,
      }}
    />
  );
};

/* ── Composition ── */
export const VideoAI: React.FC = () => {
  const bgmVolume = (frame: number) => {
    let v = 0.17 * ip(frame, [0, 36], [0, 1]) * ip(frame, [VIDEO_AI_DURATION - 60, VIDEO_AI_DURATION - 1], [1, 0]);
    for (const w of VOICE) {
      const duck = ip(frame, [w.from - 8, w.from], [0, 1]) * ip(frame, [w.from + w.frames, w.from + w.frames + 12], [1, 0]);
      v *= 1 - 0.66 * duck;
    }
    return v;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />

      {/* Satu dunia chat: 0–18 detik */}
      <Sequence durationInFrames={552}>
        <PhoneWorld />
      </Sequence>

      <Sequence from={T.s1} durationInFrames={152}>
        <S1Head />
      </Sequence>
      <Sequence from={T.s2} durationInFrames={210}>
        <S2Head />
      </Sequence>
      <Sequence from={T.s3} durationInFrames={214}>
        <S3Head />
      </Sequence>
      <Sequence from={T.s4} durationInFrames={182}>
        <DashboardScene />
      </Sequence>
      <Sequence from={T.s5} durationInFrames={178}>
        <LearningScene />
      </Sequence>
      <Sequence from={T.s6} durationInFrames={200}>
        <CTAScene />
      </Sequence>
      <Sequence from={T.s7} durationInFrames={VIDEO_AI_DURATION - T.s7}>
        <OutroScene />
      </Sequence>

      <BrandBug />

      {/* transisi objek */}
      <Sequence from={512} durationInFrames={44}>
        <Portal dur={44} cx={742} cy={1260} />
      </Sequence>
      <Sequence from={838} durationInFrames={40}>
        <BlockSweep dur={40} />
      </Sequence>
      <Sequence from={1018} durationInFrames={44}>
        <Portal dur={44} cx={540} cy={930} />
      </Sequence>

      {/* audio */}
      <Audio src={staticFile("audio-ai/bgm.mp3")} volume={bgmVolume} />
      {VOICE.map((v) => (
        <Sequence key={v.file} from={v.from} durationInFrames={v.frames + 8}>
          <Audio src={staticFile(v.file)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Audio src={staticFile(s.file)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
