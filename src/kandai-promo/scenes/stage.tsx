import type React from "react";
import { M, Plant, Room, Window } from "./parts";
import { Raka, type Pose } from "./Raka";

/* Layout panggung minimum (kamera utama di z≈12, fov 44, melihat turun):
   Raka 2.6 unit berdiri di z≈1 -> kepala di layar y≈640, sepatu y≈1190.
   Titik fokus yang harus terlihat ada di y 1.5..7, z -5..3. */
export const STAGE = { rakaZ: 1.0, rakaY: 0, rakaScale: 1.5 };

/* Latar belakang tinggi: rak, poster, jendela. Mengisi bagian atas frame yang kosong. */
export const Backdrop: React.FC<{ w: number }> = ({ w }) => (
  <group position={[0, 0, -5.2]}>
    {/* rak buku tinggi */}
    <group position={[-2.6, 0, 0]}>
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 6.8, 0.9]} />
        <M k="wood" w={w} rough={0.9} />
      </mesh>
      {[1, 2.4, 3.8, 5.2].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0.5]}>
            <boxGeometry args={[3, 0.08, 0.1]} />
            <M k="accent" w={w} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[-1.2 + i * 0.55, y + 0.38, 0.5]} rotation={[0, 0, i % 2 ? 0.06 : -0.04]} castShadow>
              <boxGeometry args={[0.42, 0.68, 0.3]} />
              <M k={i % 3 === 0 ? "teal" : i % 3 === 1 ? "coral" : "paper"} w={w} />
            </mesh>
          ))}
        </group>
      ))}
    </group>

    {/* poster + jam di kanan */}
    <group position={[2.6, 4.6, 0.4]}>
      <mesh>
        <boxGeometry args={[2.6, 3.2, 0.08]} />
        <M k="paper" w={w} rough={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <torusGeometry args={[0.75, 0.16, 10, 32]} />
        <M k="warm" w={w} rough={0.5} />
      </mesh>
    </group>
  </group>
);

/* Ruangan lengkap dengan Kasur/meja/lampu kiri-kanan + Raka di tengah. */
export const Stage: React.FC<{ w: number; pose?: Pose; scale?: number; x?: number; z?: number; showBackdrop?: boolean }> = ({
  w,
  pose,
  scale = STAGE.rakaScale,
  x = 0,
  z = STAGE.rakaZ,
  showBackdrop = true,
}) => (
  <group>
    <Room w={w} size={13} wallH={9} />
    <Window w={w} pos={[-5.4, 5.4, -5.6]} scale={1.9} />
    {showBackdrop && <Backdrop w={w} />}
    <Plant w={w} pos={[4.6, 0, 2.4]} s={2.4} />
    <group position={[x, STAGE.rakaY, z]}>
      <Raka w={w} pose={pose} scale={scale} />
    </group>
  </group>
);
