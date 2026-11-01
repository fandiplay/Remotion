import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Color } from "three";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";

const { fontFamily: JAKARTA } = loadJakarta("normal", { weights: ["500", "600", "800"], subsets: ["latin"] });

export const FONT = JAKARTA;

/* Palet: dingin saat kacau, hangat saat teratur. */
export const C = {
  night: "#0b1020",
  nightSoft: "#141c33",
  cold: "#3d5675",
  coldDim: "#22304a",
  cream: "#fdf3e4",
  warm: "#ffb15c",
  warmDeep: "#f0853a",
  teal: "#1d9a8a",
  coral: "#e8734f",
  ink: "#141a2b",
  inkSoft: "#4a5068",
  line: "rgba(253,243,228,0.16)",
  fog: "#0a1122",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ip = (frame: number, input: number[], output: number[], easing = Easing.bezier(0.16, 1, 0.3, 1)) =>
  interpolate(frame, input, output, { ...clamp, easing });

/* Musim cerita: 0 = gelap/kacau, 1 = hangat/teratur. Dipakai lighting, fog, dan kamera. */
export const WARMTH_INPUT = [0, 600, 780, 1020, 2100];
export const WARMTH_OUTPUT = [0, 0, 0.45, 1, 1];

export const warmth = (frame: number) => interpolate(frame, WARMTH_INPUT, WARMTH_OUTPUT, clamp);

/* Muncul dengan spring, untuk elemen UI overlay. */
export const warmColor = (cold: string, warm: string, t: number) =>
  `#${new Color(cold).lerp(new Color(warm), t).getHexString()}`;

export const usePop = (start: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, config: { damping, stiffness: 140, mass: 0.7 } });
};
