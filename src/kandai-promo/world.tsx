import { Color } from "three";
import type { CameraShot } from "./camera";
import { warmColor } from "./theme";

/* Palet "warmth" 0..1 dipakai lighting + fog: satu dunia, dingin saat kacau, hangat saat teratur. */
export type Props3D = { w: number };

const COLD = { ambient: 1.5, key: "#9fc2ee", keyInt: 2.6, fill: "#5a79ab", fillInt: 1.5, fog: 0.006, fogCol: "#0a1122" };
const WARM = { ambient: 2.1, key: "#ffd7a8", keyInt: 3.2, fill: "#ff9e5c", fillInt: 1.8, fog: 0.0035, fogCol: "#f6b26b" };

const lerpHue = (a: string, b: string, t: number) => `#${new Color(a).lerp(new Color(b), t).getHexString()}`;

export const lightsAt = (w: number) => ({
  ambient: COLD.ambient + (WARM.ambient - COLD.ambient) * w,
  keyInt: COLD.keyInt + (WARM.keyInt - COLD.keyInt) * w,
  fillInt: COLD.fillInt + (WARM.fillInt - COLD.fillInt) * w,
  fog: COLD.fog + (WARM.fog - COLD.fog) * w,
});

/* Lampu standar untuk semua scene 3D. Fog dipasang sekali oleh pembungkus canvas. */
export function WorldLight({ w }: Props3D) {
  const l = lightsAt(w);
  return (
    <>
      <ambientLight intensity={l.ambient} color={warmColor("#cfd8e8", "#fff1dc", w)} />
      <directionalLight position={[7, 12, 8]} intensity={l.keyInt} color={lerpHue(COLD.key, WARM.key, w)} castShadow />
      <directionalLight position={[-8, 4, -6]} intensity={l.fillInt} color={lerpHue(COLD.fill, WARM.fill, w)} />
      <hemisphereLight color={warmColor("#c9d8f0", "#ffe6c2", w)} groundColor="#1a2338" intensity={0.55 + w * 0.7} />
    </>
  );
}

export const fogAt = (w: number) => ({ color: lerpHue(COLD.fogCol, WARM.fogCol, w), density: lightsAt(w).fog });

export type { CameraShot };
