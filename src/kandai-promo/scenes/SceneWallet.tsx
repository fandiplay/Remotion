import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip } from "../theme";
import { M, Room } from "./parts";
import { Raka, POSE } from "./Raka";

/* 34-39s: Dompet - koin teratur dalam tumpukan rapi, satu koin besar berputar. */
export const SceneWallet: React.FC = () => {
  const { w, local, dur } = useWorld();
  const collect = ip(local, [0, dur * 0.55], [0, 1]);

  return (
    <group>
      <Room w={w} size={10} hideBack />

      <group position={[-1.8, 0, 1]}>
        <Raka w={w} pose={{ ...POSE.phone, headTilt: 0.3 }} scale={1.5} />
      </group>

      {/* tumpukan koin tumbuh dari bawah */}
      <group position={[2.4, 2.4, 0.4]} scale={2}>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 40]} />
          <meshBasicMaterial color="#ffb15c" transparent opacity={0.16 * collect} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const s = ip(local, [i * 6, i * 6 + 20], [0, 1]);
          const h = 0.22 * (i + 1) * s;
          return (
            <group key={i} position={[(i % 3) * 0.5 - 0.5, h, Math.floor(i / 3) * 0.5 - 0.25]}>
              <mesh castShadow scale={s}>
                <cylinderGeometry args={[0.3, 0.3, 0.12, 20]} />
                <M k="accent" w={w} rough={0.35} metal={0.75} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* koin raksasa berputar dengan simbol dompet */}
      <group position={[2.6, 5.4, 0.4]} rotation={[0.3, local * 0.03, 0.1]} scale={1.7}>
        <mesh castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.16, 36]} />
          <M k="accent" w={w} rough={0.28} metal={0.85} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.32, 0.07, 10, 28]} />
          <M k="glow" w={w} rough={0.3} metal={0.6} emissive="glow" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
          <boxGeometry args={[0.5, 0.16, 0.1]} />
          <M k="glow" w={w} rough={0.3} metal={0.6} emissive="glow" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* uang kertas melayang rapi */}
      {[0, 1, 2, 3].map((i) => {
        const t = ip(local, [i * 8 + 10, i * 8 + 34], [0, 1]);
        return (
          <mesh key={i} position={[-1.2 + i * 1.7, 6.2 + Math.sin(local * 0.06 + i) * 0.2, 1.4]} rotation={[0.4, 0.2 * i, 0.1 * i]} scale={t} castShadow>
            <boxGeometry args={[1.44, 0.8, 0.04]} />
            <M k="teal" w={w} rough={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

export const SceneWalletOverlay = () => {
  const frame = useCurrentFrame();
  const saldo = Math.round(ip(frame, [20, 120], [0, 85000], (x) => 1 - Math.pow(1 - x, 3)));
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 230,
          padding: "26px 34px",
          borderRadius: 26,
          background: "rgba(18,20,32,0.78)",
          border: "1px solid rgba(255,177,92,0.4)",
          opacity: ip(frame, [6, 24], [0, 1]),
          translate: `0 ${ip(frame, [6, 24], [-20, 0])}px`,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#ffd9a0", fontWeight: 600 }}>DOMPET</div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#fff6e6", marginTop: 4 }}>Rp {saldo.toLocaleString("id-ID")}</div>
      </div>
    </AbsoluteFill>
  );
};
