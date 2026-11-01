import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: SERIF } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const K = {
  bg: "#F2EDE3",
  ink: "#16150F",
  ink2: "#23221B",
  red: "#D92B1F",
  cream: "#F2EDE3",
  mute: "#7A7565",
  line: "rgba(22,21,15,0.16)",
  serif: SERIF,
  mono: MONO,
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ip = (f: number, i: number[], o: number[], easing?: (t: number) => number) =>
  interpolate(f, i, o, { ...clamp, easing });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const snap = Easing.bezier(0.16, 1, 0.3, 1);
export const sharp = Easing.bezier(0.7, 0, 0.2, 1);

export const serif = (size: number, color = K.ink): React.CSSProperties => ({
  fontFamily: K.serif,
  fontSize: size,
  lineHeight: 1.05,
  letterSpacing: -0.5,
  color,
});
export const mono = (size: number, color = K.ink, weight = 500): React.CSSProperties => ({
  fontFamily: K.mono,
  fontSize: size,
  fontWeight: weight,
  color,
});

/* Hapus `<section>` yang ditampilkan sebelum `at` (progress < 0) supaya preview masih terlihat
   saat scrubbing tanpa mengubah output render. */
export const hideBefore: React.CSSProperties = { visibility: "hidden" };

/* Teks yang terungkap per baris: klip naik dari garis bawah, easing tajam. `size` untuk tinggi klip. */
export const LineReveal: React.FC<{
  at: number;
  size: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  top?: boolean;
}> = ({ at, size, children, style, top }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 200, stiffness: 200, mass: 0.7 } });
  return (
    <div style={{ overflow: "hidden", height: size * 1.18, display: "flex", alignItems: top ? "flex-start" : "flex-end" }}>
      <div style={{ ...style, transform: `translateY(${(1 - p) * 105}%)` }}>{children}</div>
    </div>
  );
};

/* Kutipan: klip naik + posisi miring, lerp dua tahap (kalau `at2` dipakai). */
export const Reveal: React.FC<{
  at: number;
  at2?: number;
  from?: number;
  to?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, at2, from = 110, to = 0, children, style }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 20], [0, 1], snap);
  const p2 = at2 === undefined ? 1 : ip(f, [at2, at2 + 16], [0, 1], snap);
  return (
    <div style={{ ...style, opacity: ip(f, [at, at + 6], [0, 1]), transform: `translateY(${lerp(lerp(from, to, p2), 0, p)}%)` }}>
      {children}
    </div>
  );
};

/* Label kecil monospace (kicker / slug). */
export const Kicker: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...mono(24, K.mute, 700), letterSpacing: 4, textTransform: "uppercase", ...style }}>{children}</div>
);

export const Rule: React.FC<{ w: number; h?: number; style?: React.CSSProperties }> = ({ w, h = 3, style }) => (
  <div style={{ width: w, height: h, background: K.red, ...style }} />
);

export const Stage: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <AbsoluteFill style={{ background: dark ? K.ink : K.bg, overflow: "hidden" }}>{children}</AbsoluteFill>
);
