import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";

const JUMLAH = 14;
const DURASI = 150;

const BENDA = Array.from({ length: JUMLAH }, (_, i) => ({
  tipe: i % 3, // 0 = buku, 1 = koin, 2 = HP
  x: (random(`x${i}`) - 0.5) * 6,
  y: (random(`y${i}`) - 0.5) * 11,
  z: (random(`z${i}`) - 0.5) * 3,
  putar: 0.01 + random(`r${i}`) * 0.03,
  muncul: 10 + i * 6, // frame kemunculan, makin lama makin banyak
}));

const Benda: React.FC<{ b: (typeof BENDA)[number]; i: number }> = ({ b, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // makin lama makin merapat ke tengah = makin sesak
  const rapat = interpolate(frame, [0, DURASI], [1, 0.35], {
    extrapolateRight: "clamp",
  });
  const skala = spring({
    frame: frame - b.muncul,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const melayang = Math.sin(frame * 0.05 + i) * 0.2;

  return (
    <mesh
      position={[b.x * rapat, b.y * rapat + melayang, b.z]}
      rotation={[frame * b.putar, frame * b.putar * 1.3, 0]}
      scale={skala}
    >
      {b.tipe === 0 && <boxGeometry args={[1.2, 1.6, 0.3]} />}
      {b.tipe === 1 && <cylinderGeometry args={[0.6, 0.6, 0.12, 12]} />}
      {b.tipe === 2 && <boxGeometry args={[0.8, 1.4, 0.1]} />}
      {b.tipe === 2 ? (
        <meshBasicMaterial color="#7aa2ff" />
      ) : (
        <meshLambertMaterial
          color={b.tipe === 0 ? "#ff5a4d" : "#f2c14e"}
          flatShading
        />
      )}
    </mesh>
  );
};

export const DemoKonflik: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const teksMasuk = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 14], fov: 50 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 6]} intensity={1.6} />
        {BENDA.map((b, i) => (
          <Benda key={i} b={b} i={i} />
        ))}
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 80px 320px",
          opacity: teksMasuk,
          transform: `translateY(${(1 - teksMasuk) * 30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 150,
            lineHeight: 1,
            color: "#f1ece1",
          }}
        >
          Tapi cuma{" "}
          <span style={{ color: "#e5392b", fontStyle: "italic" }}>capek.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
