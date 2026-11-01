import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip } from "../theme";
import { M, Room } from "./parts";
import { Raka, POSE } from "./Raka";

/* 44.5-49.7s: Belajar - buku bertumpuk jadi tangga, kubus pengetahuan naik ke orbit. */
export const SceneLearn: React.FC = () => {
  const { w, local } = useWorld();

  return (
    <group>
      <Room w={w} size={10} hideBack />

      <group position={[-2.2, 0, 1]} rotation={[0, 0.35, 0]}>
        <Raka w={w} pose={{ ...POSE.desk, headTilt: 0.1 }} scale={1.5} />
      </group>

      {/* tangga buku */}
      {[0, 1, 2, 3].map((i) => {
        const p = ip(local, [i * 7, i * 7 + 18], [0, 1]);
        return (
          <group key={i} position={[-0.2 + i * 0.9, 1.6 + i * 0.42 * p, 0.8 - i * 0.5]} rotation={[0, -0.5 + i * 0.12, 0]} scale={1.8}>
            <mesh castShadow scale={p}>
              <boxGeometry args={[1.0, 0.18, 0.75]} />
              <M k={i % 2 ? "teal" : "accent"} w={w} rough={0.7} />
            </mesh>
            <mesh position={[0, 0.1, 0]} scale={p}>
              <boxGeometry args={[0.92, 0.02, 0.7]} />
              <M k="paper" w={w} />
            </mesh>
          </group>
        );
      })}

      {/* kubus pengetahuan mengorbit naik */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = ip(local, [20 + i * 9, 44 + i * 9], [0, 1]);
        const a = local * 0.04 + i * 1.26;
        const r = 1.5 - p * 0.25;
        return (
          <mesh key={i} position={[2.6 + Math.cos(a) * r, 3.6 + p * 2.4 + i * 0.2, 0.4 + Math.sin(a) * r]} rotation={[a, a * 0.7, a * 0.4]} scale={p * 0.5} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <M k={i % 2 ? "glow" : "teal"} w={w} rough={0.4} emissive="glow" emissiveIntensity={i % 2 ? 1.1 : 0.3} />
          </mesh>
        );
      })}

      {/* balok XP melayang */}
      <group position={[2.6, 6.8, 0.2]} rotation={[0, local * 0.02, 0]}>
        <mesh>
          <boxGeometry args={[4.2, 0.9, 0.24]} />
          <meshStandardMaterial color="#1a2234" roughness={0.6} transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
};

const STEPS = ["Konsep dasar", "Latihan 20 soal", "Kuis +XP", "Review catatan"];

export const SceneLearnOverlay = () => {
  const frame = useCurrentFrame();
  const xp = Math.round(ip(frame, [12, 140], [0, 1240], (x) => 1 - Math.pow(1 - x, 2)));
  const pct = Math.min(1, xp / 2000);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, top: 220, opacity: ip(frame, [4, 20], [0, 1]) }}>
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#ffd9a0", fontWeight: 600 }}>BELAJAR</div>
        <div style={{ fontSize: 58, fontWeight: 800, color: "#fff6e6", marginTop: 2 }}>Roadmap Biologi</div>
      </div>

      <div style={{ position: "absolute", left: 70, top: 400, display: "flex", flexDirection: "column", gap: 14 }}>
        {STEPS.map((s, i) => {
          const at = 14 + i * 16;
          const done = frame > at + 20;
          return (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: ip(frame, [at, at + 14], [0, 1]),
                translate: `${ip(frame, [at, at + 16], [-30, 0])}px 0`,
                padding: "16px 26px",
                borderRadius: 20,
                background: "rgba(20,24,38,0.78)",
                border: `1px solid ${done ? "rgba(29,154,138,0.8)" : "rgba(255,255,255,0.14)"}`,
                fontSize: 32,
                fontWeight: 700,
                color: done ? "#8fe3d4" : "#cfd7e6",
              }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 13, border: "2px solid currentColor", background: done ? "currentColor" : "transparent" }} />
              {s}
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 70, right: 70, bottom: 1010, opacity: ip(frame, [10, 26], [0, 1]) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 700, color: "#ffd9a0", marginBottom: 10 }}>
          <span>XP</span>
          <span>{xp.toLocaleString("id-ID")} XP</span>
        </div>
        <div style={{ height: 20, borderRadius: 10, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
          <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#1d9a8a,#ffb15c)" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
