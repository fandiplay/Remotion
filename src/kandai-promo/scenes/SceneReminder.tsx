import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip } from "../theme";
import { M, Plant, Room } from "./parts";
import { Raka, POSE } from "./Raka";

/* 49.7-55s: Pengingat - jam dinding besar, bel berbunyi, jadwal mengorbit rapi. */
export const SceneReminder: React.FC = () => {
  const { w, local } = useWorld();
  const swing = Math.sin(local * 0.35);

  return (
    <group>
      <Room w={w} size={10} hideBack />
      <Plant w={w} pos={[4.6, 0, 2.4]} s={2.4} />

      <group position={[-2.2, 0, 1]}>
        <Raka w={w} pose={{ ...POSE.idle, headTurn: -0.4, headTilt: -0.05, armR: -1.9 + swing * 0.08 }} scale={1.5} />
      </group>

      {/* jam dinding */}
      <group position={[2.4, 5.6, -1.6]} rotation={[0, -0.35, 0]} scale={1.9}>
        <mesh castShadow>
          <cylinderGeometry args={[1.15, 1.15, 0.18, 48]} />
          <M k="wood" w={w} rough={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 48]} />
          <M k="paper" w={w} rough={0.9} />
        </mesh>
        {/* jarum berputar sekali per scene */}
        {[0, 1].map((i) => (
          <mesh key={i} position={[0, i * 0.02, 0.16 + i * 0.01]} rotation={[0, 0, -local * (i ? 0.09 : 0.02) + i * 1.2]} castShadow>
            <boxGeometry args={[0.06, i ? 0.75 : 0.55, 0.02]} />
            <M k="ink" w={w} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.18]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <M k="coral" w={w} />
        </mesh>
      </group>

      {/* bel besar */}
      <group position={[2.6, 3.0, 1.4]} rotation={[0, 0, swing * 0.18]} scale={2}>
        <mesh castShadow rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.5, 0.85, 24, 1, true]} />
          <M k="accent" w={w} rough={0.3} metal={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <M k="glow" w={w} rough={0.4} metal={0.6} />
        </mesh>
        <mesh position={[0, -0.48, 0]}>
          <sphereGeometry args={[0.16, 14, 14]} />
          <M k="glow" w={w} rough={0.4} metal={0.6} emissive="glow" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* kartu jadwal mengorbit bel */}
      {[0, 1, 2].map((i) => {
        const a = local * 0.025 + (i * Math.PI * 2) / 3;
        const p = ip(local, [i * 8 + 8, i * 8 + 28], [0, 1]);
        return (
          <group key={i} position={[2.6 + Math.cos(a) * 2.4, 3.1 + Math.sin(local * 0.05 + i) * 0.4, 1.4 + Math.sin(a) * 2.4]} rotation={[0.1, -a, 0]} scale={p * 1.6}>
            <mesh castShadow>
              <boxGeometry args={[1.0, 0.62, 0.05]} />
              <M k={i === 0 ? "glow" : "teal"} w={w} rough={0.5} emissive={i === 0 ? "glow" : undefined} emissiveIntensity={1} />
            </mesh>
          </group>
        );
      })}

      {/* gelombang bunyi dari bel */}
      {[0, 1, 2].map((i) => {
        const t = ((local * 0.02 + i / 3) % 1 + 1) % 1;
        return (
          <mesh key={`r${i}`} position={[2.4, 2.85, 0.6]} rotation={[Math.PI / 2, 0, 0]} scale={0.3 + t * 1.5}>
            <torusGeometry args={[1, 0.02, 6, 48]} />
            <meshBasicMaterial color="#ffcf8a" transparent opacity={0.5 * (1 - t)} />
          </mesh>
        );
      })}
    </group>
  );
};

const AGENDA = [
  { t: "07.00 - Sekolah", at: 8 },
  { t: "15.00 - Belajar Biologi", at: 26 },
  { t: "19.00 - Rapat kelompok", at: 44 },
  { t: "20.30 - Jurnal malam", at: 62 },
];

export const SceneReminderOverlay = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, top: 220 }}>
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#ffd9a0", fontWeight: 600, opacity: ip(frame, [2, 18], [0, 1]) }}>PENGINGAT</div>
        <div style={{ fontSize: 58, fontWeight: 800, color: "#fff6e6", opacity: ip(frame, [4, 20], [0, 1]) }}>Hari ini</div>
      </div>

      <div style={{ position: "absolute", left: 70, right: 70, top: 360, display: "flex", flexDirection: "column", gap: 14 }}>
        {AGENDA.map((a) => (
          <div
            key={a.t}
            style={{
              opacity: ip(frame, [a.at, a.at + 14], [0, 1]),
              translate: `${ip(frame, [a.at, a.at + 16], [-40, 0])}px 0`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 26px",
              borderRadius: 20,
              background: "rgba(22,26,40,0.78)",
              border: "1px solid rgba(255,177,92,0.35)",
              fontSize: 32,
              fontWeight: 700,
              color: "#f3e6d4",
            }}
          >
            <span style={{ width: 12, height: 36, borderRadius: 6, background: "#ffb15c" }} />
            {a.t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
