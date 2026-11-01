import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useWorld } from "./state";
import { ip, C, FONT } from "../theme";
import { Plant, Room, Window } from "./parts";
import { Raka, POSE } from "./Raka";
import { Orb } from "./SceneDiscover";

/* 55-70s: dunia hangat - Raka bahagia, orb KAND AI, lalu logo + tagline + URL. */
export const SceneOutro: React.FC = () => {
  const { w, local } = useWorld();
  const cheer = local > 40 ? Math.sin(local * 0.12) * 0.06 : 0;

  return (
    <group>
      <Room w={w} size={12} hideBack />
      <Window w={w} pos={[-5.4, 5.4, -5.6]} scale={1.9} />
      <Window w={w} pos={[0.4, 6.2, -5.8]} scale={1.7} />
      <Plant w={w} pos={[-4.8, 0, 1.2]} s={2.2} />
      <Plant w={w} pos={[4.6, 0, 2.4]} s={2.4} />

      <group position={[-1.6, 0, 1]} rotation={[0, 0.25, 0]}>
        <Raka w={w} pose={{ ...POSE.happy, headTilt: -0.1 + cheer }} scale={1.5} step={local * 0.01} />
      </group>

      <group position={[2.4, 4.6, 1.2]}>
        <Orb t={local} scale={2.4} />
      </group>

      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 56]} />
        <meshBasicMaterial color="#ffb15c" transparent opacity={0.1} />
      </mesh>

      {/* kelopak/partikel hangat naik pelan */}
      {Array.from({ length: 16 }, (_, i) => {
        const t = ((local * 0.004 + i / 16) % 1 + 1) % 1;
        const a = i * 2.1;
        return (
          <mesh key={i} position={[Math.cos(a) * (4 + i * 0.08), t * 9 - 0.5, Math.sin(a) * (3 + i * 0.06)]} rotation={[t * 5, a, 0]} scale={0.1}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#ffd9a0" />
          </mesh>
        );
      })}
    </group>
  );
};

/* Logo + tagline + kandai.my.id, muncul dari 58 detik. */
export const SceneOutroOverlay = () => {
  const frame = useCurrentFrame();
  const logoIn = ip(frame, [60, 95], [0, 1]);
  const tagIn = ip(frame, [110, 145], [0, 1]);
  const urlIn = ip(frame, [150, 185], [0, 1]);
  const glow = 0.55 + Math.sin(frame * 0.08) * 0.1;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          padding: "64px 56px",
          borderRadius: 40,
          background: "rgba(16,16,26,0.55)",
          border: "1px solid rgba(255,177,92,0.28)",
          backdropFilter: "blur(6px)",
          opacity: logoIn,
          scale: String(ip(frame, [60, 100], [0.86, 1])),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 26,
              background: "radial-gradient(circle at 35% 30%, #ffe6c2, #ffb15c 55%, #f0853a)",
              boxShadow: `0 0 ${60 * glow}px rgba(255,177,92,${glow})`,
            }}
          />
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -2, color: C.cream, lineHeight: 1 }}>KAND AI</div>
        </div>

        <div style={{ fontSize: 46, fontWeight: 600, color: "#ffd9a0", textAlign: "center", opacity: tagIn, translate: `0 ${ip(frame, [110, 145], [18, 0])}px` }}>
          Teman tumbuhmu setiap hari.
        </div>

        <div
          style={{
            marginTop: 8,
            opacity: urlIn,
            translate: `0 ${ip(frame, [150, 185], [18, 0])}px`,
            padding: "18px 40px",
            borderRadius: 999,
            background: "#ffb15c",
            color: "#1b1208",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          kandai.my.id
        </div>
      </div>
    </AbsoluteFill>
  );
};
