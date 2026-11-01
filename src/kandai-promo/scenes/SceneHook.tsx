import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip } from "../theme";
import { M, Plant, Room, Window } from "./parts";
import { Raka, POSE } from "./Raka";

/* 0-8s: Raka bangun, kamar dingin, ponsel bergetar dengan notifikasi.
   Skala dunia: kamera di z=14, ruangan lebar 10, panggung berada di z -6..4 (lihat SHOTS). */

export const SceneHook: React.FC = () => {
  const { w, local, dur } = useWorld();
  const t = local / dur;
  const sitUp = ip(local, [0, 50], [0, 1]);

  return (
    <group>
      <Room w={w} size={13} wallH={9} />
      <Window w={w} pos={[-5.4, 5.4, -5.6]} scale={1.9} />

      {/* rak tinggi di belakang: mengisi bagian atas frame */}
      <group position={[-2.8, 0, -4.6]}>
        <mesh position={[0, 3.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 6.6, 1]} />
          <M k="wood" w={w} rough={0.9} />
        </mesh>
        {[1.2, 2.6, 4, 5.4].map((y, r) => (
          <group key={y}>
            <mesh position={[0, y, 0.55]}>
              <boxGeometry args={[3.2, 0.1, 0.14]} />
              <M k="accent" w={w} />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[-1.3 + i * 0.6, y + 0.42, 0.55]} rotation={[0, 0, ((i + r) % 2 ? 0.07 : -0.05)]} castShadow>
                <boxGeometry args={[0.46, 0.72, 0.34]} />
                <M k={i % 3 === 0 ? "teal" : i % 3 === 1 ? "coral" : "paper"} w={w} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* poster bundar di kanan-atas */}
      <group position={[2.9, 5.2, -4.9]}>
        <mesh>
          <boxGeometry args={[2.8, 3.4, 0.1]} />
          <M k="paper" w={w} rough={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0.08]}>
          <torusGeometry args={[0.8, 0.18, 10, 32]} />
          <M k="warm" w={w} rough={0.5} />
        </mesh>
      </group>

      {/* kasur */}
      <group position={[0, 0, 1.4]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 1.2, 4.6]} />
          <M k="wood" w={w} rough={0.9} />
        </mesh>
        <mesh position={[0, 1.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.9, 0.4, 4.4]} />
          <M k="shirt" w={w} rough={0.95} />
        </mesh>
        <mesh position={[0, 1.75, -1.8]} castShadow>
          <boxGeometry args={[3, 0.5, 0.8]} />
          <M k="paper" w={w} rough={0.9} />
        </mesh>
        <mesh position={[0.6 + t * 0.8, 1.5, 0.5]} rotation={[0, 0.1 * t, 0.12 * t]} castShadow>
          <boxGeometry args={[3.4, 0.2, 2.2]} />
          <M k="accent" w={w} rough={0.95} />
        </mesh>
      </group>

      <group position={[0, 1.5, 1.9]}>
        <Raka w={w} pose={{ ...POSE.phone, headTilt: 0.3 - sitUp * 0.15 }} scale={1.45} />
      </group>

      {/* meja & lampu kiri */}
      <group position={[-4.4, 0, -0.6]}>
        <mesh position={[0, 1.7, 0]} castShadow>
          <boxGeometry args={[2.4, 0.18, 1.6]} />
          <M k="wood" w={w} />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x, 0.85, 0]} castShadow>
            <boxGeometry args={[0.16, 1.7, 1.4]} />
            <M k="wood" w={w} />
          </mesh>
        ))}
        <mesh position={[0.3, 2.3, 0]} castShadow>
          <coneGeometry args={[0.5, 0.6, 18, 1, true]} />
          <M k="glow" w={w} rough={0.4} emissive="glow" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0.3, 2.2, 0]} intensity={22} distance={11} color="#9fc0ff" />
      </group>

      <Plant w={w} pos={[4.6, 0, 2.6]} s={2.4} />
    </group>
  );
};

/* Overlay 2D: notifikasi melayang yang menumpuk - penanda kekacauan. */
const NOTIFS = [
  { t: "Tugas Matematika - besok!", x: 70, y: 380, at: 12 },
  { t: "Uang jajan tersisa Rp12.000", x: 210, y: 500, at: 26 },
  { t: "Kuis Biologi - lupa belajar", x: 60, y: 620, at: 40 },
  { t: "Bayar kas kelas", x: 230, y: 740, at: 54 },
  { t: "Rapat kelompok jam 7", x: 90, y: 860, at: 68 },
  { t: "Jurnal: 6 hari kosong", x: 200, y: 980, at: 82 },
];

const NotifBubble: React.FC<{ n: (typeof NOTIFS)[number] }> = ({ n }) => {
  const frame = useCurrentFrame();
  const p = ip(frame, [n.at, n.at + 14], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: n.x,
        top: n.y,
        opacity: p,
        scale: String(ip(frame, [n.at, n.at + 14], [0.82, 1])),
        translate: `0 ${ip(frame, [n.at, n.at + 14], [24, 0])}px`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 26px",
        borderRadius: 20,
        background: "rgba(18,24,40,0.86)",
        border: "1px solid rgba(140,175,225,0.32)",
        color: "#dbe7f7",
        fontSize: 30,
        fontWeight: 600,
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        maxWidth: 640,
      }}
    >
      <span style={{ width: 14, height: 14, borderRadius: 7, background: "#7fb4ff", flexShrink: 0 }} />
      {n.t}
    </div>
  );
};

export const SceneHookOverlay = () => (
  <AbsoluteFill>
    {NOTIFS.map((n) => (
      <NotifBubble key={n.t} n={n} />
    ))}
  </AbsoluteFill>
);
