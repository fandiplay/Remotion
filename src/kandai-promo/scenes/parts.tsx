import type React from "react";
import { Color } from "three";

/* Warna material dunia miniature: kusam & dingin di awal, hangat saat cerita membaik. */
export const P = {
  wall: ["#2a3550", "#ffd9ae"],
  floor: ["#222c44", "#dba06a"],
  wood: ["#3a3f55", "#b9793f"],
  paper: ["#c8d2e4", "#fff6e6"],
  accent: ["#4d6c96", "#f0853a"],
  teal: ["#2f5c68", "#1d9a8a"],
  skin: ["#e0a184", "#f7c39a"],
  hair: ["#1d2233", "#2b2130"],
  shirt: ["#7f97c2", "#fbf3e6"],
  pants: ["#48597e", "#4a6a9c"],
  shoe: ["#151a28", "#2b2f42"],
  glow: ["#7fb4ff", "#ffc36b"],
  coral: ["#7c5560", "#e8734f"],
  warm: ["#6a5560", "#ffb15c"],
  ink: ["#1a1f2e", "#241a14"],
} as const;

export type MatKey = keyof typeof P;

export const col = (key: MatKey, w: number) => {
  const [a, b] = P[key];
  return new Color(a).lerp(new Color(b), w);
};

export const M: React.FC<{ k: MatKey; w: number; rough?: number; metal?: number; emissive?: MatKey; emissiveIntensity?: number }> = ({
  k,
  w,
  rough = 0.75,
  metal = 0,
  emissive,
  emissiveIntensity = 1,
}) => (
  <meshStandardMaterial
    color={col(k, w)}
    roughness={rough}
    metalness={metal}
    emissive={emissive ? col(emissive, w) : undefined}
    emissiveIntensity={emissive ? emissiveIntensity : undefined}
  />
);

/* Ruang isometrik: lantai, dua dinding, dan alas yang menyembunyikan tepi dungeon. */
const FLOOR = 40; // menutup seluruh frame saat kamera miring ke bawah; dinding tetap selebar `size`
export const Room: React.FC<{ w: number; size?: number; wallH?: number; hideBack?: boolean }> = ({ w, size = 9, wallH = 6, hideBack }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[FLOOR, FLOOR]} />
      <M k="floor" w={w} rough={0.9} />
    </mesh>
    <mesh position={[-size / 2, wallH / 2, 0]} receiveShadow>
      <boxGeometry args={[0.3, wallH, size]} />
      <M k="wall" w={w} rough={0.95} />
    </mesh>
    {!hideBack && (
      <mesh position={[0, wallH / 2, -size / 2]} receiveShadow>
        <boxGeometry args={[size, wallH, 0.3]} />
        <M k="wall" w={w} rough={0.95} />
      </mesh>
    )}
  </group>
);

/* Jendela pagi dengan cahaya lembut - dipakai di beberapa scene. */
export const Window: React.FC<{ w: number; pos: [number, number, number]; scale?: number }> = ({ w, pos, scale = 1 }) => (
  <group position={pos} scale={scale}>
    <mesh>
      <boxGeometry args={[2, 2.4, 0.08]} />
      <M k="glow" w={w} emissive="glow" emissiveIntensity={1.6} rough={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.06]}>
      <boxGeometry args={[0.08, 2.4, 0.06]} />
      <M k="wood" w={w} />
    </mesh>
    <mesh position={[0, 0, 0.06]}>
      <boxGeometry args={[2, 0.08, 0.06]} />
      <M k="wood" w={w} />
    </mesh>
  </group>
);

export const Plant: React.FC<{ w: number; pos: [number, number, number]; s?: number }> = ({ w, pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <mesh castShadow>
      <cylinderGeometry args={[0.32, 0.26, 0.5, 12]} />
      <M k="accent" w={w} />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.6) * 0.16, 0.55 + (i % 2) * 0.22, Math.sin(i * 1.6) * 0.16]} rotation={[i * 0.3, i, i * 0.5]} castShadow>
        <icosahedronGeometry args={[0.26, 0]} />
        <M k="teal" w={w} />
      </mesh>
    ))}
  </group>
);

/* Lembaran kertas/tugas atau koin asimetris - satu geometri, dipakai banyak scene. */
export const Shard: React.FC<{ w: number; k?: MatKey; pos: [number, number, number]; rot: [number, number, number]; s: number }> = ({ w, k = "paper", pos, rot, s }) => (
  <mesh position={pos} rotation={rot} scale={s} castShadow>
    <boxGeometry args={[1, 1, 0.03]} />
    <M k={k} w={w} rough={0.6} />
  </mesh>
);
