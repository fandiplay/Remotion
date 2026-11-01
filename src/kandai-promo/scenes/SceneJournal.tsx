import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CatmullRomCurve3, Vector3 } from "three";
import { ip } from "../theme";
import { useWorld } from "./state";
import { M, Room } from "./parts";
import { Raka, POSE } from "./Raka";

const BOOK_POS = [-2.6, 2.6, 0.6] as const;
const BOOK_ROT = [0, 0.35, 0] as const;

/* Kertas yang menulis dirinya: halaman terbang dari buku ke dalam spiral cahaya. */
const WORD_PATH = new CatmullRomCurve3([
  new Vector3(-2.2, 0.9, -0.2),
  new Vector3(-0.9, 2.3, 0.5),
  new Vector3(0.8, 2.1, -0.7),
  new Vector3(2.2, 2.8, 0.2),
  new Vector3(2.6, 3.5, 0),
]);

const Buku: React.FC<{ w: number }> = ({ w }) => (
  <group position={[BOOK_POS[0], BOOK_POS[1], BOOK_POS[2]]} rotation={[BOOK_ROT[0], BOOK_ROT[1], BOOK_ROT[2]]} scale={2.4}>
    {/* sampul buku jurnal */}
    <mesh position={[-0.62, 0, 0]} rotation={[0, 0, 0.22]} castShadow>
      <boxGeometry args={[0.66, 0.06, 0.9]} />
      <M k="coral" w={w} rough={0.6} />
    </mesh>
    <mesh position={[0.62, 0, 0]} rotation={[0, 0, -0.22]} castShadow>
      <boxGeometry args={[0.66, 0.06, 0.9]} />
      <M k="coral" w={w} rough={0.6} />
    </mesh>
    <mesh position={[-0.6, 0.05, 0]} rotation={[0, 0, 0.22]}>
      <boxGeometry args={[0.6, 0.02, 0.82]} />
      <M k="paper" w={w} />
    </mesh>
    <mesh position={[0.6, 0.05, 0]} rotation={[0, 0, -0.22]}>
      <boxGeometry args={[0.6, 0.02, 0.82]} />
      <M k="paper" w={w} />
    </mesh>
  </group>
);

/* 39-44.5s: Jurnal - halaman dan pena menulis, lalu kata-kata naik jadi spiral. */
export const SceneJournal: React.FC = () => {
  const { w, local, dur } = useWorld();

  return (
    <group>
      <Room w={w} size={10} hideBack />

      <group position={[-2.4, 0, 1]}>
        <Raka w={w} pose={{ ...POSE.idle, headTilt: 0.2, headTurn: 0.35, armR: -1.3 }} scale={1.5} />
      </group>

      <Buku w={w} />

      {/* pena menulis, bergerak bolak-balik di atas halaman */}
      <group position={[-2.6 + Math.sin(local * 0.35) * 0.4, 3.4, 0.5 + Math.cos(local * 0.28) * 0.3]} rotation={[0.5, 0, -0.6]} scale={2}>
        <mesh castShadow>
          <coneGeometry args={[0.06, 0.5, 8]} />
          <M k="hair" w={w} rough={0.35} metal={0.5} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.18, 10]} />
          <M k="glow" w={w} rough={0.3} metal={0.7} />
        </mesh>
      </group>

      {/* halaman cahaya terbang sepanjang kurva */}
      {Array.from({ length: 18 }, (_, i) => {
        const t = ((local * 0.014 + i / 18) % 1 + 1) % 1;
        const p = WORD_PATH.getPoint(t);
        const s = Math.sin(t * Math.PI) * 0.22;
        return (
          <mesh key={i} position={[p.x, p.y, p.z]} rotation={[t * 4, t * 3, t * 2]} scale={[s * 1.4, s, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#fff1dc" emissive="#ffb15c" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        );
      })}

      {/* spiral kata di kanan */}
      <group position={[2.6, 5.2, 0]} rotation={[0, -0.3, 0]} scale={2}>
        <mesh>
          <torusGeometry args={[0.62, 0.03, 8, 80]} />
          <M k="glow" w={w} rough={0.3} metal={0.7} emissive="glow" emissiveIntensity={1.2} />
        </mesh>
        <mesh rotation={[0, 0, local * 0.02]}>
          <torusGeometry args={[0.4, 0.02, 8, 64]} />
          <M k="coral" w={w} rough={0.3} emissive="coral" emissiveIntensity={1} />
        </mesh>
      </group>

      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7, 48]} />
        <meshBasicMaterial color="#ffb15c" transparent opacity={0.06 + ip(local, [0, dur], [0, 0.06])} />
      </mesh>
    </group>
  );
};

const WORDS = ["Hari ini berat...", "tapi aku bisa.", "Aku ceritakan semua.", "Kepalaku lebih ringan."];

export const SceneJournalOverlay = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 700,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
        }}
      >
        {WORDS.map((t, i) => {
          const at = 10 + i * 22;
          return (
            <div
              key={t}
              style={{
                opacity: ip(frame, [at, at + 12], [0, 1]),
                translate: `${ip(frame, [at, at + 14], [30, 0])}px 0`,
                padding: "16px 26px",
                borderRadius: 22,
                background: i === WORDS.length - 1 ? "rgba(232,115,79,0.92)" : "rgba(22,24,36,0.8)",
                color: i === WORDS.length - 1 ? "#1b1208" : "#fdf3e4",
                fontSize: 32,
                fontWeight: 700,
                border: "1px solid rgba(255,177,92,0.35)",
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
