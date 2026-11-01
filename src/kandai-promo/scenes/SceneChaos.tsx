import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip } from "../theme";
import { M, Room, Shard, Window } from "./parts";
import { Raka, POSE } from "./Raka";

const rand = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* 8-23s: kekacauan - koin, kertas, buku berputar mengelilingi Raka. */
const CHAOS = Array.from({ length: 26 }, (_, i) => ({
  k: i % 3,
  a0: rand(i) * Math.PI * 2,
  r: 3.2 + rand(i, 2) * 2.2,
  y: 1.6 + rand(i, 3) * 4.4,
  sp: (0.012 + rand(i, 4) * 0.02) * (i % 2 ? 1 : -1),
  s: 0.6 + rand(i, 5) * 0.6,
  at: i * 3,
}));

const WHIRL = [
  "paper",
  "accent",
  "teal",
] as const;

export const SceneChaos: React.FC = () => {
  const { w, local } = useWorld();
  const frame = useCurrentFrame();
  const wave = local / 440;

  return (
    <group>
      <Room w={w} size={13} wallH={9} />
      <Window w={w} pos={[-5.4, 5.4, -5.6]} scale={1.9} />

      {/* meja belajar penuh */}
      <group position={[-2.6, 0, -1.4]} rotation={[0, 0.3, 0]} scale={2}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[2.4, 0.14, 1.2]} />
          <M k="wood" w={w} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.5 + i * 0.35, 0.98 + i * 0.06, 0]} rotation={[0.02 * i, 0.2 * i, 0.05]} castShadow>
            <boxGeometry args={[0.5, 0.14, 0.7]} />
            <M k={i === 1 ? "accent" : "paper"} w={w} />
          </mesh>
        ))}
      </group>

      <group position={[0, 0, 1]}>
        <Raka w={w} pose={POSE.desk} step={wave * 2} scale={1.5} />
      </group>

      {CHAOS.map((c, i) => {
        const p = ip(local, [c.at, c.at + 24], [0, 1]);
        const a = c.a0 + local * c.sp;
        const y = c.y + Math.sin(local * 0.03 + i) * 0.12;
        const key = WHIRL[c.k];
        return (
          <group key={i} position={[Math.cos(a) * c.r, y * p - (1 - p) * 0.5, Math.sin(a) * c.r]} rotation={[a * 1.7, a * 2.1, a]} scale={c.s * p}>
            {c.k === 0 ? (
              <mesh castShadow>
                <boxGeometry args={[1, 1, 0.04]} />
                <M k="paper" w={w} rough={0.7} />
              </mesh>
            ) : (
              <mesh castShadow>
                <cylinderGeometry args={[0.55, 0.55, 0.16, 18]} />
                <M k={key} w={w} rough={0.4} metal={0.6} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* lembar tugas jatuh dari langit-langit */}
      {Array.from({ length: 8 }, (_, i) => {
        const t = (frame + i * 55) % 440;
        const y = 9 - t * 0.019;
        return <Shard key={`f${i}`} w={w} k={i % 2 ? "paper" : "accent"} pos={[-4.5 + i * 1.3, Math.max(0.3, y), -2.4 + (i % 3)]} rot={[t * 0.05, t * 0.03, i]} s={0.9} />;
      })}
    </group>
  );
};

const CHIPS = [
  { t: "Rp - habis", at: 10, x: 90, y: 330, color: "#ff8f6b", rot: -4 },
  { t: "Tugas belum disubmit", at: 60, x: 420, y: 250, color: "#ffb3a0", rot: 3 },
  { t: "Pikiran penuh", at: 120, x: 130, y: 560, color: "#9fb8ff", rot: -2 },
  { t: "Janji jam 7 - terlewat", at: 190, x: 380, y: 640, color: "#ffb3a0", rot: 4 },
  { t: "Nilai turun", at: 260, x: 110, y: 780, color: "#ff8f6b", rot: -3 },
];

const Chip: React.FC<{ c: (typeof CHIPS)[number] }> = ({ c }) => {
  const frame = useCurrentFrame();
  const p = ip(frame, [c.at, c.at + 16], [0, 1]);
  const shake = Math.sin(frame * 0.9) * 2.5;
  return (
    <div
      style={{
        position: "absolute",
        left: c.x,
        top: c.y,
        rotate: `${c.rot}deg`,
        opacity: p,
        scale: String(ip(frame, [c.at, c.at + 16], [0.7, 1])),
        translate: `${shake}px 0`,
        padding: "20px 30px",
        borderRadius: 999,
        background: "rgba(26,20,30,0.8)",
        border: `2px solid ${c.color}`,
        color: c.color,
        fontSize: 34,
        fontWeight: 800,
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      }}
    >
      {c.t}
    </div>
  );
};

export const SceneChaosOverlay = () => (
  <AbsoluteFill>
    {CHIPS.map((c) => (
      <Chip key={c.t} c={c} />
    ))}
  </AbsoluteFill>
);
