import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip } from "../theme";
import { M, Plant, Room } from "./parts";
import { Raka, POSE } from "./Raka";

/* Orb KAND AI: inti bercahaya + tiga cincin berputar. Dipakai ulang di discover & outro. */
export const Orb: React.FC<{ t: number; scale?: number; intensity?: number }> = ({ t, scale = 1, intensity = 1 }) => {
  const pulse = 1 + Math.sin(t * 0.12) * 0.04;
  return (
    <group scale={scale}>
      <mesh scale={pulse}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshStandardMaterial color="#ffd9a0" emissive="#ffb15c" emissiveIntensity={2.2 * intensity} roughness={0.25} metalness={0.3} />
      </mesh>
      <mesh scale={1.5}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#ffc98c" transparent opacity={0.12 * intensity} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.5, t * (0.03 + i * 0.012), i * 1.1]}>
          <torusGeometry args={[0.95 + i * 0.18, 0.022, 8, 64]} />
          <meshStandardMaterial color="#ffe6c2" emissive="#ffb15c" emissiveIntensity={1.6 * intensity} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

/* 23-34s: kacau mereda, orb KAND AI turun dari langit dan menyala. Raka mengangkat kepala. */
export const SceneDiscover: React.FC = () => {
  const { w, local, dur } = useWorld();
  const frame = useCurrentFrame();
  const drop = ip(local, [10, 70], [8.5, 3.2]);
  const settled = local > 70;
  const lift = ip(local, [40, 100], [0, 1]);
  const pose = {
    ...POSE.slump,
    headTilt: POSE.slump.headTilt * (1 - lift) - 0.05 * lift,
    bodyBend: POSE.slump.bodyBend * (1 - lift),
    armR: settled ? -0.6 - Math.sin(frame * 0.05) * 0.05 : POSE.slump.armR,
    phone: local < 60,
  };

  return (
    <group>
      <Room w={w} size={11} hideBack />
      <Plant w={w} pos={[-4.6, 0, 2.2]} s={2.2} />
      <Plant w={w} pos={[4.6, 0, 2.4]} s={2.4} />

      <group position={[0, 0, 1]}>
        <Raka w={w} pose={pose} scale={1.5} />
      </group>

      <group position={[0, drop, 1.6]}>
        <Orb t={local} scale={2.6} intensity={ip(local, [20, 80], [0.2, 1])} />
      </group>

      {/* lantai bercahaya di bawah orb */}
      <mesh position={[0, 0.02, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 48]} />
        <meshBasicMaterial color="#ffb15c" transparent opacity={0.14 * ip(local, [60, 120], [0, 1])} />
      </mesh>

      {/* debu kertas yang kacau mereda: skala makin kecil */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = i * 2.39 + local * 0.008;
        const r = 3.4 - local * 0.008;
        const s = Math.max(0, 0.35 * (1 - local / (dur * 0.8)));
        return (
          <mesh key={i} position={[Math.cos(a) * r, 1 + Math.sin(i * 1.7) * 1.4, Math.sin(a) * r]} rotation={[a, a, 0]} scale={s}>
            <boxGeometry args={[1, 1, 0.04]} />
            <M k="paper" w={w} />
          </mesh>
        );
      })}
    </group>
  );
};

const LINES = [
  { t: "Satu aplikasi", at: 30 },
  { t: "untuk semua", at: 45 },
  { t: "hal harianku.", at: 60 },
];

export const SceneDiscoverOverlay = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 250, display: "flex", flexDirection: "column", gap: 6 }}>
        {LINES.map((l) => (
          <div
            key={l.t}
            style={{
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: -1,
              color: "#fdf3e4",
              opacity: ip(frame, [l.at, l.at + 14], [0, 1]),
              translate: `${ip(frame, [l.at, l.at + 18], [40, 0])}px 0`,
              textShadow: "0 6px 30px rgba(0,0,0,0.5)",
            }}
          >
            {l.t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
