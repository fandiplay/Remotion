import type React from "react";
import { M } from "./parts";

/* Pose Raka per adegan. Semua angka deterministik dari frame, tidak ada useFrame. */
export type Pose = {
  headTilt: number; // rad, + = menunduk
  headTurn: number;
  bodyBend: number; // membungkuk ke depan
  armL: number; // rad, rotasi lengan depan (- = angkat)
  armR: number;
  crouch: number; // tekuk lutut
  phone: boolean; // memegang HP di tangan kanan
  book: boolean;
};

export const POSE: Record<"idle" | "slump" | "phone" | "happy" | "walk" | "desk", Pose> = {
  idle: { headTilt: 0.05, headTurn: 0, bodyBend: 0, armL: 0, armR: 0, crouch: 0, phone: false, book: false },
  slump: { headTilt: 0.45, headTurn: 0.1, bodyBend: 0.22, armL: 0.15, armR: 0.15, crouch: 0.25, phone: false, book: false },
  phone: { headTilt: 0.35, headTurn: -0.1, bodyBend: 0.1, armL: 0.2, armR: -1.25, crouch: 0.1, phone: true, book: false },
  happy: { headTilt: -0.12, headTurn: 0, bodyBend: -0.08, armL: -2.4, armR: -2.4, crouch: 0, phone: false, book: false },
  walk: { headTilt: 0, headTurn: 0, bodyBend: 0.04, armL: 0, armR: 0, crouch: 0.05, phone: false, book: false },
  desk: { headTilt: 0.25, headTurn: 0.05, bodyBend: 0.12, armL: -1.1, armR: -1.15, crouch: 0.55, phone: false, book: true },
};

export type RakaProps = {
  w: number;
  pose?: Pose;
  scale?: number;
  /* rotasi langkah untuk pose walk, 0..1 */
  step?: number;
};

const Head: React.FC<{ w: number }> = ({ w }) => (
  <group>
    <mesh position={[0, 0.02, 0]} castShadow>
      <sphereGeometry args={[0.33, 24, 20]} />
      <M k="skin" w={w} rough={0.55} />
    </mesh>
    {/* rambut */}
    <mesh position={[0, 0.13, -0.03]} scale={[1.02, 0.78, 1.02]} castShadow>
      <sphereGeometry args={[0.34, 24, 20]} />
      <M k="hair" w={w} rough={0.5} />
    </mesh>
    {/* ponytail kecil */}
    <mesh position={[0, 0.02, -0.3]} rotation={[0.7, 0, 0]} castShadow>
      <capsuleGeometry args={[0.09, 0.22, 6, 10]} />
      <M k="hair" w={w} rough={0.5} />
    </mesh>
    {/* mata */}
    {[-0.12, 0.12].map((x) => (
      <mesh key={x} position={[x, 0, 0.3]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color="#15182a" roughness={0.2} />
      </mesh>
    ))}
  </group>
);

export const Raka: React.FC<RakaProps> = ({ w, pose = POSE.idle, scale = 1, step = 0 }) => {
  const legs = Math.sin(step * Math.PI * 2) * 0.5;
  return (
    <group scale={scale} rotation={[0, pose.headTurn * 0.4, 0]}>
      {/* sepatu */}
      {[
        [-0.14, 0.06, 0.12],
        [0.14, 0.06, -0.12],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.06, z]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.34]} />
          <M k="shoe" w={w} />
        </mesh>
      ))}
      {/* kaki */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={x} position={[x, 0.38, (i === 0 ? 1 : -1) * legs * 0.12]} rotation={[pose.crouch * 0.15 + ((i === 0 ? 1 : -1) * legs * 0.25), 0, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 6, 10]} />
          <M k="pants" w={w} />
        </mesh>
      ))}
      <group position={[0, 0.6, 0]} rotation={[pose.bodyBend, 0, 0]}>
        {/* badan + kaos */}
        <mesh position={[0, 0.36, 0]} scale={[1, 1.6, 0.75]} castShadow>
          <capsuleGeometry args={[0.26, 0.3, 8, 16]} />
          <M k="shirt" w={w} rough={0.8} />
        </mesh>
        {/* tas selempang */}
        <mesh position={[0, 0.38, 0.02]} rotation={[0, 0, 0.5]}>
          <torusGeometry args={[0.28, 0.03, 6, 24, Math.PI]} />
          <M k="accent" w={w} />
        </mesh>
        {/* lengan */}
        <group position={[-0.29, 0.5, 0]} rotation={[pose.armL + (pose.armL === 0 ? legs * 0.4 : 0), 0, 0.15]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.34, 6, 10]} />
            <M k="shirt" w={w} rough={0.8} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <M k="skin" w={w} rough={0.55} />
          </mesh>
        </group>
        <group position={[0.29, 0.5, 0]} rotation={[pose.armR - (pose.armR === 0 ? legs * 0.4 : 0), 0, -0.15]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.075, 0.34, 6, 10]} />
            <M k="shirt" w={w} rough={0.8} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <M k="skin" w={w} rough={0.55} />
          </mesh>
          {pose.phone && (
            <group position={[0, -0.58, 0.06]} rotation={[-1.0, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.2, 0.36, 0.03]} />
                <M k="hair" w={w} rough={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[0.17, 0.32]} />
                <meshStandardMaterial color="#9fd0ff" emissive="#7fb4ff" emissiveIntensity={1.4} />
              </mesh>
            </group>
          )}
          {pose.book && (
            <group position={[0, -0.56, 0.08]} rotation={[-0.9, 0.2, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.34, 0.02, 0.26]} />
                <M k="accent" w={w} />
              </mesh>
              <mesh position={[0, 0.015, 0]}>
                <boxGeometry args={[0.31, 0.012, 0.24]} />
                <M k="paper" w={w} />
              </mesh>
            </group>
          )}
        </group>
        {/* leher + kepala */}
        <group position={[0, 0.66, 0]} rotation={[pose.headTilt, pose.headTurn, 0]}>
          <Head w={w} />
        </group>
      </group>
    </group>
  );
};
