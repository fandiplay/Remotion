import type React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { fogAt, WorldLight, type Props3D } from "./world";
import { warmth } from "./theme";
import { DURATION, SCENE_TIMES } from "./timeline";

export type CameraShot = { pos: [number, number, number]; look: [number, number, number]; fov: number };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/* Dolly antar kunci kamera, tanpa sudut potong. */
export const shotAt = (shots: CameraShot[], t: number): CameraShot => {
  const n = shots.length - 1;
  if (n <= 0) return shots[0];
  const c = Math.max(0, Math.min(n, t * n));
  const i = Math.min(n - 1, Math.floor(c));
  const k = c - i;
  const a = shots[i];
  const b = shots[i + 1];
  return {
    pos: a.pos.map((v, j) => mix(v, b.pos[j], k)) as CameraShot["pos"],
    look: a.look.map((v, j) => mix(v, b.look[j], k)) as CameraShot["look"],
    fov: mix(a.fov, b.fov, k),
  };
};

const CameraRig: React.FC<{ pos: [number, number, number]; look: [number, number, number] }> = ({ pos, look }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  return null;
};

const BOUNDS = Object.values(SCENE_TIMES).map((s) => s.from);

const sceneIndex = (frame: number) => {
  let i = 0;
  for (let k = 0; k < BOUNDS.length; k++) if (frame >= BOUNDS[k]) i = k;
  return i;
};

/* Progres 0..1 di dalam scene saat ini. */
const sceneT = (frame: number) => {
  const i = sceneIndex(frame);
  const end = BOUNDS[i + 1] ?? DURATION;
  return (frame - BOUNDS[i]) / Math.max(1, end - BOUNDS[i]);
};

/* Satu-satunya <ThreeCanvas> untuk seluruh video. Canvas diisi ulang per scene (bukan dibuat baru),
   supaya WebGL context tidak menumpuk selama render 2100 frame. */
export const WorldCanvas: React.FC<{ shots: CameraShot[]; children: React.ReactNode }> = ({ shots, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const w = warmth(frame);
  const fog = fogAt(w);
  // Kunci kamera ditaruh satu per batas scene; tiap scene bergerak dari kuncinya ke kunci berikut.
  const seg = sceneIndex(frame);
  const shot = shotAt([shots[seg], shots[seg + 1]], sceneT(frame));

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{ position: shot.pos, fov: shot.fov, near: 0.1, far: 140 }}>
        <CameraRig pos={shot.pos} look={shot.look} />
        <fogExp2 attach="fog" args={[fog.color, fog.density]} />
        <WorldLight w={w} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export type { Props3D };
