/**
 * ============================================================================
 *  rumahbaru.tsx — "ANATOMI KEPUASAN DAN MOTIVASI"
 *  Rumah Penasaran · 9:16 · 1080×1920 · 30fps · 60 detik (1800 frame)
 *  Tanpa voice over: subtitle + penanda scene ada di dalam file ini.
 * ----------------------------------------------------------------------------
 *  CARA PASANG (src/Root.tsx):
 *
 *    import { RumahBaru, RUMAH_BARU_CONFIG } from "./rumahbaru";
 *
 *    <Composition
 *      id={RUMAH_BARU_CONFIG.id}
 *      component={RumahBaru}
 *      durationInFrames={RUMAH_BARU_CONFIG.durationInFrames}
 *      fps={RUMAH_BARU_CONFIG.fps}
 *      width={RUMAH_BARU_CONFIG.width}
 *      height={RUMAH_BARU_CONFIG.height}
 *    />
 *
 *  RENDER:  npx remotion render RumahBaru out/rumahbaru.mp4
 *
 *  PETA WAKTU (penanda scene):
 *    S1  HOOK                     00:00 – 00:07
 *    S2  WANTING VS LIKING        00:07 – 00:17
 *    S3  REWARD PREDICTION ERROR  00:17 – 00:29
 *    S4  GOLDILOCKS RULE          00:29 – 00:43
 *    S5  PENERAPAN                00:43 – 00:54
 *    S6  CLOSING                  00:54 – 01:00
 *
 *  Area aman Reels: konten utama di y 250–1250, subtitle di y 1305–1495.
 *  Paket: remotion, @remotion/three, @react-three/fiber, three,
 *         @remotion/google-fonts (Poppins). Tidak butuh paket tambahan.
 * ============================================================================
 */

import React, { useEffect, useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { CUES } from "./rumahbaru-cues";
import timing from "./rumahbaru-timing.json";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "800"],
  subsets: ["latin"],
});

/* -------------------------------------------------------------------------- */
/*  KONFIGURASI                                                                */
/* -------------------------------------------------------------------------- */

export const RUMAH_BARU_CONFIG = {
  id: "RumahBaru",
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 1800,
} as const;

const FPS = RUMAH_BARU_CONFIG.fps;
const W = RUMAH_BARU_CONFIG.width;
const H = RUMAH_BARU_CONFIG.height;

// Palet Rumah Penasaran (+ satu merah khusus untuk makna "buruk/cemas")
const C = {
  bg: "#1E1B4B",
  bg2: "#4C1D95",
  gold: "#FBBF24",
  white: "#FFFFFF",
  red: "#FB7185",
  slate: "#94A3B8",
  mute: "rgba(255,255,255,0.62)",
};

const sec = (s: number) => Math.round(s * FPS);

type Ease = (t: number) => number;
const ip = (f: number, input: number[], output: number[], easing?: Ease) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
const EO: Ease = Easing.out(Easing.cubic);
const EIO: Ease = Easing.inOut(Easing.cubic);

/** 0 → 1 mulai detik `startSec` (waktu lokal scene), durasi `durSec`. */
const pop = (frame: number, startSec: number, durSec = 0.6) =>
  ip(frame, [sec(startSec), sec(startSec + durSec)], [0, 1], EO);

/* -------------------------------------------------------------------------- */
/*  PENANDA SCENE                                                              */
/* -------------------------------------------------------------------------- */

const SCENES = [
  { n: "01", label: "HOOK", start: 0, end: 7 }, //                     00:00–00:07
  { n: "02", label: "WANTING VS LIKING", start: 7, end: 17 }, //       00:07–00:17
  { n: "03", label: "REWARD PREDICTION ERROR", start: 17, end: 29 }, // 00:17–00:29
  { n: "04", label: "GOLDILOCKS RULE", start: 29, end: 43 }, //         00:29–00:43
  { n: "05", label: "PENERAPAN", start: 43, end: 54 }, //               00:43–00:54
  { n: "06", label: "CLOSING", start: 54, end: 60 }, //                 00:54–01:00
];

/* -------------------------------------------------------------------------- */
/*  SUBTITLE (waktu global, dalam detik)                                       */
/*  hl = kata yang diwarnai kuning                                             */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*  AUDIO: voice over per cue + musik latar                                    */
/* -------------------------------------------------------------------------- */

const T = timing as Record<string, number>;
const DURATION = RUMAH_BARU_CONFIG.durationInFrames;

const VoAudio: React.FC<{ id: string; frames: number }> = ({ id, frames }) => {
  const frame = useCurrentFrame();
  const dur = T[id];
  if (dur == null) return null;
  const win = frames / FPS;
  const rate = dur > win ? Math.min(1.15, dur / win) : 1;
  const volume = interpolate(frame, [Math.max(0, frames - 4), frames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Html5Audio
      src={staticFile(`audio/rumahbaru/${id}.wav`)}
      volume={volume}
      playbackRate={rate}
    />
  );
};

const VoiceOver: React.FC = () => (
  <>
    {CUES.map((cue, i) => {
      const from = sec(cue.start);
      const frames = sec(cue.end) - from;
      const id = `vo-${String(i + 1).padStart(2, "0")}`;
      return (
        <Sequence key={id} from={from} durationInFrames={frames} name={id}>
          <VoAudio id={id} frames={frames} />
        </Sequence>
      );
    })}
  </>
);

const BackgroundMusic: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, FPS], [0, 0.16], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [DURATION - sec(2.5), DURATION], [0.16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <Html5Audio src={staticFile("audio/rumahbaru/bgm.wav")} volume={Math.min(fadeIn, fadeOut)} />;
};

/* -------------------------------------------------------------------------- */
/*  LAPISAN UMUM: latar, chip scene, subtitle, vignette                        */
/* -------------------------------------------------------------------------- */

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: random(`sx-${i}`) * W,
        y: random(`sy-${i}`) * H,
        r: 1 + random(`sr-${i}`) * 2.2,
        p: random(`sp-${i}`) * Math.PI * 2,
        s: 0.03 + random(`ss-${i}`) * 0.05,
      })),
    [],
  );
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${C.bg} 0%, #2B2070 52%, ${C.bg2} 135%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 200) * 14}% ${
            34 + Math.cos(frame / 260) * 8
          }%, rgba(251,191,36,0.16) 0%, rgba(251,191,36,0) 42%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${20 + Math.cos(frame / 180) * 12}% 80%, rgba(124,58,237,0.38) 0%, rgba(124,58,237,0) 48%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={(s.y - frame * s.s * 3 + H) % H}
            r={s.r}
            fill="#FFFFFF"
            opacity={0.12 + 0.35 * Math.abs(Math.sin(frame * s.s + s.p))}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(6,4,24,0.7) 100%)",
    }}
  />
);

const SceneShell: React.FC<{
  dur: number;
  fadeOut: boolean;
  children: React.ReactNode;
}> = ({ dur, fadeOut, children }) => {
  const f = useCurrentFrame();
  const inO = ip(f, [0, 9], [0, 1]);
  const outO = fadeOut ? ip(f, [dur - 9, dur], [1, 0]) : 1;
  const scale = ip(f, [0, dur], [1, 1.04]);
  return (
    <AbsoluteFill style={{ opacity: inO * outO, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Chip penanda scene (kiri atas) + watermark brand (kanan atas). */
const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const found = SCENES.findIndex(
    (s) => frame >= sec(s.start) && frame < sec(s.end),
  );
  const i = found < 0 ? SCENES.length - 1 : found;
  const sc = SCENES[i];
  const local = frame - sec(sc.start);
  const dur = sec(sc.end - sc.start);
  const o =
    ip(local, [0, 10], [0, 1]) *
    (i < SCENES.length - 1 ? ip(local, [dur - 8, dur], [1, 0]) : 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 250,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: o,
          transform: `translateY(${(1 - o) * -14}px)`,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            background: C.gold,
            color: C.bg,
            fontWeight: 800,
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {sc.n}
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 4,
            color: C.white,
          }}
        >
          {sc.label}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 50,
          top: 259,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: 4,
          color: C.mute,
        }}
      >
        RUMAH PENASARAN
      </div>
    </>
  );
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= sec(c.start) && frame < sec(c.end));
  if (!cue) return null;
  const a = sec(cue.start);
  const b = sec(cue.end);
  const o = ip(frame, [a, a + 5, b - 5, b], [0, 1, 1, 0]);
  const y = ip(frame, [a, a + 6], [16, 0], EO);
  const hl = new Set(cue.hl.map((h) => h.toLowerCase()));
  const words = cue.text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 1305,
        height: 190,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ textAlign: "center", lineHeight: 1.62 }}>
        <span
          style={{
            background: "rgba(12,9,40,0.76)",
            padding: "6px 20px",
            borderRadius: 18,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
            fontWeight: 600,
            fontSize: 46,
            color: C.white,
          }}
        >
          {words.map((w, i) => {
            const key = w.replace(/[^a-zA-Z0-9+-]/g, "").toLowerCase();
            const on = hl.has(key);
            return (
              <span
                key={i}
                style={{
                  color: on ? C.gold : C.white,
                  fontWeight: on ? 800 : 600,
                }}
              >
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  ▶ SCENE 1 — HOOK (00:00–00:07)                                            */
/*  Otak 3D + partikel dopamin. Muncul: WANTING dan LIKING.                    */
/* -------------------------------------------------------------------------- */

const buildBrainGeometry = (): THREE.BufferGeometry => {
  const geo = new THREE.IcosahedronGeometry(1, 8);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const folds =
      Math.sin(v.x * 9 + v.y * 5) *
      Math.sin(v.y * 11 - v.z * 7) *
      Math.sin(v.z * 8 + v.x * 4);
    const r = 1 + folds * 0.07;
    let x = v.x * 1.0 * r;
    let y = v.y * 0.78 * r;
    const z = v.z * 1.25 * r;
    // celah longitudinal di antara dua belahan otak
    const fissure = Math.exp(-Math.pow(x / 0.07, 2)) * (y > 0 ? 1 : 0.4);
    y -= fissure * 0.12;
    x *= 1;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
};

const PARTICLE_COUNT = 520;

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const brainGeo = useMemo(buildBrainGeometry, []);
  useEffect(() => () => brainGeo.dispose(), [brainGeo]);

  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const u = random(`bu${i}`) * 2 - 1;
        const th = random(`bt${i}`) * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        return {
          dx: s * Math.cos(th),
          dy: u,
          dz: s * Math.sin(th),
          phase: random(`bp${i}`),
          speed: 0.12 + random(`bs${i}`) * 0.22,
          swirl: (random(`bw${i}`) - 0.5) * 2,
        };
      }),
    [],
  );

  // Partikel dopamin: keluar dari permukaan otak, berputar, lalu memudar.
  const particleGeo = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const burst =
      1 +
      0.9 * Math.exp(-Math.pow((t - 1.7) * 2.4, 2)) +
      0.9 * Math.exp(-Math.pow((t - 4.2) * 2.4, 2));
    const gain = ip(frame, [10, 60], [0, 1]) * burst;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = seeds[i];
      const life = (t * s.speed + s.phase) % 1;
      const out = 1 + life * 0.85;
      const x = s.dx * 1.0 * out;
      const y = s.dy * 0.78 * out;
      const z = s.dz * 1.25 * out;
      const ang = life * s.swirl * 1.4;
      const cs = Math.cos(ang);
      const sn = Math.sin(ang);
      pos[i * 3] = x * cs - z * sn;
      pos[i * 3 + 1] = y + Math.sin(t * 2 + i) * 0.01;
      pos[i * 3 + 2] = x * sn + z * cs;
      const fade = Math.min(1, Math.sin(life * Math.PI) * gain);
      col[i * 3] = 1.0 * fade;
      col[i * 3 + 1] = 0.75 * fade;
      col[i * 3 + 2] = 0.14 * fade;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [frame, seeds, t]);
  useEffect(() => () => particleGeo.dispose(), [particleGeo]);

  const grow = spring({
    frame,
    fps: FPS,
    config: { damping: 16, stiffness: 60, mass: 1 },
  });
  const pulse = 1 + 0.018 * Math.sin(t * 5);
  const brainScale = 0.7 * (0.55 + 0.45 * grow) * pulse;
  const rotY = Math.sin(t / 2.2) * 0.9 + t * 0.12 - 0.3;
  const wire = 0.14 + 0.1 * Math.max(0, Math.sin(t * 5));

  const wantingO = pop(frame, 1.7);
  const neqO = pop(frame, 4.0);
  const likingO = pop(frame, 4.2);

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={W}
        height={H}
        camera={{ position: [0, 0, 5.4], fov: 40 }}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} />
        <pointLight position={[-3, -1, 3]} intensity={60} color="#FBBF24" />
        <group
          position={[0, 0.75, 0]}
          scale={brainScale}
          rotation={[0.12, rotY, 0]}
        >
          <mesh geometry={brainGeo}>
            <meshStandardMaterial
              color="#6D28D9"
              emissive="#3B1A8A"
              emissiveIntensity={0.75}
              roughness={0.55}
              metalness={0.1}
              flatShading
            />
          </mesh>
          <mesh geometry={brainGeo} scale={1.012}>
            <meshBasicMaterial
              color="#FBBF24"
              wireframe
              transparent
              opacity={wire}
            />
          </mesh>
          <points geometry={particleGeo}>
            <pointsMaterial
              size={0.055}
              vertexColors
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              sizeAttenuation
            />
          </points>
        </group>
      </ThreeCanvas>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 872,
          textAlign: "center",
          fontSize: 28,
          fontWeight: 500,
          color: C.mute,
          opacity: pop(frame, 1.0),
        }}
      >
        <span style={{ color: C.gold }}>●</span> partikel kuning = dopamin
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 915,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          lineHeight: 1,
        }}
      >
        <div
          style={{
            fontSize: 112,
            fontWeight: 800,
            color: C.gold,
            opacity: wantingO,
            letterSpacing: (1 - wantingO) * 24 + 2,
            transform: `translateY(${(1 - wantingO) * 30}px)`,
            textShadow: "0 0 36px rgba(251,191,36,0.55)",
          }}
        >
          WANTING
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: C.gold,
            opacity: neqO,
            margin: "8px 0",
          }}
        >
          ≠
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 800,
            color: C.white,
            opacity: likingO,
            letterSpacing: (1 - likingO) * 24 + 2,
            transform: `translateY(${(1 - likingO) * 30}px)`,
            textShadow: "0 0 36px rgba(255,255,255,0.4)",
          }}
        >
          LIKING
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  ▶ SCENE 2 — WANTING VS LIKING (00:07–00:17)                               */
/*  Dua panel: ekspektasi tinggi vs realita biasa + grafik ekspektasi turun.   */
/* -------------------------------------------------------------------------- */

const Sparkle: React.FC<{ x: number; y: number; s: number; o: number }> = ({
  x,
  y,
  s,
  o,
}) => (
  <path
    d="M0,-1 L0.26,-0.26 L1,0 L0.26,0.26 L0,1 L-0.26,0.26 L-1,0 L-0.26,-0.26 Z"
    transform={`translate(${x} ${y}) scale(${s})`}
    fill={C.gold}
    opacity={o}
  />
);

const GiftIcon: React.FC<{ wow: boolean; size: number }> = ({ wow, size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    {wow ? (
      <>
        <rect x="20" y="56" width="80" height="54" rx="6" fill={C.gold} />
        <rect x="14" y="40" width="92" height="20" rx="6" fill="#F59E0B" />
        <rect x="54" y="40" width="12" height="70" fill={C.white} />
        <path d="M60 40 C 40 6, 12 24, 60 40 Z" fill={C.white} />
        <path d="M60 40 C 80 6, 108 24, 60 40 Z" fill={C.white} />
      </>
    ) : (
      <>
        <rect x="20" y="58" width="80" height="52" rx="6" fill="#64748B" />
        <rect x="20" y="58" width="80" height="12" fill="#475569" />
        <g transform="rotate(-16 100 44)">
          <rect x="30" y="34" width="84" height="18" rx="5" fill="#7C8AA0" />
        </g>
      </>
    )}
  </svg>
);

const Meter: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div style={{ width: "100%" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontSize: 24,
          letterSpacing: 3,
          fontWeight: 600,
          color: C.mute,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 40, fontWeight: 800, color }}>
        {Math.round(value)}%
      </span>
    </div>
    <div
      style={{
        height: 20,
        borderRadius: 10,
        background: "rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          borderRadius: 10,
          background: color,
          boxShadow: `0 0 18px ${color}`,
        }}
      />
    </div>
  </div>
);

const SceneWantingLiking: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const headO = pop(f, 0.2);
  const frameO = pop(f, 0.5, 0.7);
  const leftIn = pop(f, 2.4); // 00:09.4 — "Wanting, yaitu..."
  const rightIn = pop(f, 5.7); // 00:12.7 — "dan Liking, yaitu..."
  const meterL = ip(t, [2.8, 4.2], [0, 95], EIO);
  const meterR = ip(t, [6.1, 7.3], [0, 42], EIO);

  const draw = ip(t, [6.2, 9.6], [0, 1], EIO);
  const markO = pop(f, 7.9);
  const gapO = pop(f, 8.9);

  const panel = (
    side: "L" | "R",
    reveal: number,
    left: number,
  ): React.ReactNode => {
    const isL = side === "L";
    const accent = isL ? C.gold : C.white;
    return (
      <div
        style={{
          position: "absolute",
          left,
          top: 410,
          width: 480,
          height: 500,
          borderRadius: 32,
          border: `3px solid ${isL ? "rgba(251,191,36,0.75)" : "rgba(255,255,255,0.3)"}`,
          background: isL ? "rgba(251,191,36,0.09)" : "rgba(255,255,255,0.05)",
          opacity: frameO,
          transform: `translateY(${(1 - frameO) * 40}px)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: 0.35 + 0.65 * reveal,
          }}
        >
          <div
            style={{
              fontSize: 50,
              fontWeight: 800,
              color: accent,
              letterSpacing: 2,
            }}
          >
            {isL ? "WANTING" : "LIKING"}
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, color: C.mute }}>
            {isL ? "Sebelum mendapatkan" : "Saat mendapatkan"}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 130,
            left: 0,
            right: 0,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: reveal,
            transform: `scale(${0.7 + 0.3 * reveal})`,
          }}
        >
          {isL ? (
            <>
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  background:
                    "radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(251,191,36,0) 65%)",
                  opacity: 0.7 + 0.3 * Math.sin(t * 4),
                }}
              />
              <GiftIcon wow size={190} />
              <svg
                width={300}
                height={200}
                viewBox="0 0 300 200"
                style={{ position: "absolute" }}
              >
                <Sparkle x={50} y={50} s={14 + 4 * Math.sin(t * 5)} o={0.9} />
                <Sparkle x={250} y={40} s={11 + 4 * Math.sin(t * 5 + 1)} o={0.9} />
                <Sparkle x={262} y={150} s={9 + 3 * Math.sin(t * 5 + 2)} o={0.8} />
                <Sparkle x={36} y={150} s={8 + 3 * Math.sin(t * 5 + 3)} o={0.8} />
              </svg>
            </>
          ) : (
            <GiftIcon wow={false} size={170} />
          )}
        </div>

        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            bottom: 28,
            opacity: reveal,
          }}
        >
          {isL ? (
            <Meter label="EKSPEKTASI" value={meterL} color={C.gold} />
          ) : (
            <Meter label="REALITA" value={meterR} color={C.slate} />
          )}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 345,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: 8,
          color: C.mute,
          opacity: headO,
        }}
      >
        OTAK PUNYA 2 SISTEM
      </div>

      {panel("L", leftIn, 50)}
      {panel("R", rightIn, 550)}

      {/* Grafik ekspektasi turun setelah hasil diterima */}
      <svg
        width={980}
        height={310}
        viewBox="0 0 980 310"
        style={{ position: "absolute", left: 50, top: 940, opacity: pop(f, 5.9) }}
      >
        <text x={0} y={22} fontSize={24} fontWeight={600} fill={C.mute} letterSpacing={3}>
          EKSPEKTASI vs REALITA
        </text>
        <line x1={0} y1={270} x2={980} y2={270} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />

        <g opacity={markO}>
          <line x1={560} y1={52} x2={560} y2={270} stroke={C.white} strokeWidth={2} strokeDasharray="8 8" opacity={0.5} />
          <text x={560} y={42} fontSize={22} fontWeight={600} fill={C.white} textAnchor="middle" letterSpacing={2}>
            HASIL DITERIMA
          </text>
        </g>

        <line x1={470} y1={70} x2={860} y2={70} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.5 * gapO} />
        <g opacity={gapO}>
          <line x1={860} y1={74} x2={860} y2={202} stroke={C.red} strokeWidth={4} />
          <path d="M850 86 L860 70 L870 86 Z" fill={C.red} />
          <path d="M850 190 L860 206 L870 190 Z" fill={C.red} />
          <text x={884} y={150} fontSize={36} fontWeight={800} fill={C.red}>
            GAP
          </text>
        </g>

        <path
          d="M 0 260 C 140 260, 200 75, 330 70 L 470 70 C 520 70, 545 80, 570 135 C 592 190, 630 205, 700 206 L 980 208"
          fill="none"
          stroke={C.gold}
          strokeWidth={8}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,0.8))" }}
        />
        <text x={330} y={52} fontSize={22} fontWeight={800} fill={C.gold} letterSpacing={2} opacity={ip(t, [7.0, 7.4], [0, 1])}>
          EKSPEKTASI
        </text>
        <text x={640} y={240} fontSize={22} fontWeight={800} fill={C.white} letterSpacing={2} opacity={ip(t, [8.6, 9.0], [0, 1])}>
          REALITA
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  ▶ SCENE 3 — REWARD PREDICTION ERROR (00:17–00:29)                         */
/*  Tiga kartu berurutan: +25, 0, -67.                                         */
/* -------------------------------------------------------------------------- */

type RpeKind = "up" | "flat" | "down";

const RpeArrow: React.FC<{ kind: RpeKind; color: string }> = ({
  kind,
  color,
}) => (
  <svg width={72} height={72} viewBox="0 0 64 64">
    {kind === "up" && <path d="M32 8 L56 36 H40 V56 H24 V36 H8 Z" fill={color} />}
    {kind === "down" && <path d="M32 56 L56 28 H40 V8 H24 V28 H8 Z" fill={color} />}
    {kind === "flat" && <rect x="8" y="25" width="48" height="14" rx="7" fill={color} />}
  </svg>
);

const RpeCard: React.FC<{
  top: number;
  startSec: number;
  num: number;
  kind: RpeKind;
  color: string;
  label: string;
  desc: string;
}> = ({ top, startSec, num, kind, color, label, desc }) => {
  const f = useCurrentFrame();
  const s = Math.max(0, f - sec(startSec));
  const visible = f >= sec(startSec);
  const sp = spring({
    frame: s,
    fps: FPS,
    config: { damping: 13, stiffness: 140, mass: 0.7 },
  });
  const shown = Math.round(num * ip(s, [0, sec(0.9)], [0, 1], EO));
  const text = num > 0 ? `+${shown}` : num < 0 ? `-${Math.abs(shown)}` : "0";
  const shake =
    kind === "down" ? Math.sin(s * 2.2) * ip(s, [0, sec(0.8)], [14, 0]) : 0;
  const flash = ip(s, [0, sec(0.5)], [0.55, 0]);
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        top,
        width: 980,
        height: 200,
        borderRadius: 30,
        border: `3px solid ${color}`,
        background: `linear-gradient(90deg, ${color}30, rgba(30,27,75,0.92) 70%)`,
        boxShadow: `0 0 ${24 + flash * 80}px ${color}${kind === "flat" ? "33" : "66"}`,
        opacity: Math.min(1, sp * 1.4),
        transform: `translateX(${(1 - sp) * 220 + shake}px) scale(${0.94 + 0.06 * sp})`,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 340,
          textAlign: "center",
          fontSize: 124,
          fontWeight: 800,
          color,
          lineHeight: 1,
          textShadow: `0 0 30px ${color}88`,
        }}
      >
        {text}
      </div>
      <div style={{ width: 3, height: 130, background: "rgba(255,255,255,0.15)" }} />
      <div style={{ flex: 1, paddingLeft: 34 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1.15 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 500, color: C.mute, marginTop: 6 }}>
          {desc}
        </div>
      </div>
      <div style={{ paddingRight: 36 }}>
        <RpeArrow kind={kind} color={color} />
      </div>
    </div>
  );
};

const SceneRpe: React.FC = () => {
  const f = useCurrentFrame();
  const slots = [520, 745, 970];
  // waktu muncul kartu (detik lokal): +25 → 00:21, 0 → 00:24.6, -67 → 00:26.4
  const starts = [4.0, 7.6, 9.4];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: pop(f, 0.3),
          transform: `translateY(${(1 - pop(f, 0.3)) * 24}px)`,
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 800, color: C.white, letterSpacing: 1 }}>
          REWARD PREDICTION ERROR
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 425,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 600,
          color: C.gold,
          letterSpacing: 2,
          opacity: pop(f, 1.0),
        }}
      >
        RPE = REALITA − EKSPEKTASI
      </div>

      {slots.map((top, i) => {
        const ghost = pop(f, 1.8 + i * 0.25) * (f < sec(starts[i]) ? 1 : 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 50,
              top,
              width: 980,
              height: 200,
              borderRadius: 30,
              border: "3px dashed rgba(255,255,255,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 90,
              fontWeight: 800,
              color: "rgba(255,255,255,0.22)",
              opacity: ghost,
            }}
          >
            ?
          </div>
        );
      })}

      <RpeCard
        top={slots[0]}
        startSec={starts[0]}
        num={25}
        kind="up"
        color={C.gold}
        label="Kejutan positif"
        desc="Hasil melebihi harapan"
      />
      <RpeCard
        top={slots[1]}
        startSec={starts[1]}
        num={0}
        kind="flat"
        color={C.white}
        label="Netral"
        desc="Hasil sesuai harapan"
      />
      <RpeCard
        top={slots[2]}
        startSec={starts[2]}
        num={-67}
        kind="down"
        color={C.red}
        label="Kekecewaan"
        desc="Hasil jauh di bawah harapan"
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  ▶ SCENE 4 — GOLDILOCKS RULE (00:29–00:43)                                 */
/*  Kurva U terbalik. Kamera: BOSAN → FLOW → CEMAS → kembali ke FLOW.          */
/* -------------------------------------------------------------------------- */

const WORLD_W = 2520;
const WORLD_H = 740;
const CURVE_D =
  "M 0 520 L 60 520 C 600 520 800 90 1260 90 C 1720 90 1920 520 2460 520 L 2520 520";

type Pt = [number, number];
const CURVE_TABLE: Pt[] = (() => {
  const out: Pt[] = [
    [0, 520],
    [60, 520],
  ];
  const seg = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) => {
    for (let i = 1; i <= 120; i++) {
      const t = i / 120;
      const m = 1 - t;
      out.push([
        m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  };
  seg([60, 520], [600, 520], [800, 90], [1260, 90]);
  seg([1260, 90], [1720, 90], [1920, 520], [2460, 520]);
  out.push([2520, 520]);
  return out;
})();

const curveY = (x: number): number => {
  for (let i = 1; i < CURVE_TABLE.length; i++) {
    const [x1, y1] = CURVE_TABLE[i];
    if (x <= x1) {
      const [x0, y0] = CURVE_TABLE[i - 1];
      const k = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * k;
    }
  }
  return 520;
};

const SceneGoldilocks: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  // Posisi titik "KAMU" sepanjang kurva (detik lokal; 29s global = 0 lokal)
  //  0–4.4  : zona BOSAN         ("terlalu mudah"  00:33.4)
  //  7.0→8.6: kamera melewati FLOW menuju CEMAS ("terlalu sulit" 00:36.2)
  //  9.8→11 : kembali ke FLOW    ("titik optimal"  00:38.8)
  const dotX = interpolate(
    t,
    [0, 3.5, 4.4, 7.0, 8.6, 9.8, 11.0, 13.8],
    [200, 300, 380, 380, 2100, 2150, 1260, 1260],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EIO },
  );
  const dotY = curveY(dotX);
  const camX = Math.min(0, Math.max(-(WORLD_W - W), W / 2 - dotX));

  const revealX =
    t < 7
      ? ip(t, [0.3, 2.4], [0, 1300], EO)
      : ip(t, [7.0, 8.4], [1300, WORLD_W], EIO);

  const wB = ip(dotX, [600, 900], [1, 0]);
  const wC = ip(dotX, [1600, 1900], [0, 1]);
  const wF = Math.max(0, 1 - Math.max(wB, wC));
  const flowGlow = ip(t, [10.6, 11.6], [0, 1]);

  const dotO = pop(f, 0.8);
  const halo = 30 + 8 * Math.sin(t * 6);

  const zoneLabel = (
    x: number,
    title: string,
    sub: string,
    color: string,
    w: number,
  ) => (
    <div
      style={{
        position: "absolute",
        left: x - 420,
        top: 580,
        width: 840,
        textAlign: "center",
        opacity: 0.3 + 0.7 * w,
        transform: `scale(${0.92 + 0.08 * w})`,
      }}
    >
      <div style={{ fontSize: 84, fontWeight: 800, color, lineHeight: 1.05, letterSpacing: 2 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 500, color: C.mute }}>{sub}</div>
    </div>
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 335,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: pop(f, 0.3),
          transform: `translateY(${(1 - pop(f, 0.3)) * 24}px)`,
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 800, color: C.white, letterSpacing: 2 }}>
          GOLDILOCKS <span style={{ color: C.gold }}>RULE</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 500, color: C.mute }}>
          Motivasi saat berproses
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 470,
          width: W,
          height: WORLD_H,
          overflow: "hidden",
          opacity: pop(f, 0.4),
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: WORLD_W,
            height: WORLD_H,
            transform: `translateX(${camX}px)`,
          }}
        >
          <svg width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
            <defs>
              <clipPath id="g4-rev">
                <rect x={0} y={0} width={revealX} height={WORLD_H} />
              </clipPath>
              <linearGradient id="g4-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.gold} stopOpacity={0.4} />
                <stop offset="1" stopColor={C.gold} stopOpacity={0} />
              </linearGradient>
            </defs>

            <rect x={0} y={0} width={840} height={WORLD_H} fill={C.slate} opacity={0.07 + 0.1 * wB} />
            <rect x={840} y={0} width={840} height={WORLD_H} fill={C.gold} opacity={0.06 + 0.12 * wF + 0.1 * flowGlow} />
            <rect x={1680} y={0} width={840} height={WORLD_H} fill={C.red} opacity={0.06 + 0.1 * wC} />
            <line x1={840} y1={20} x2={840} y2={WORLD_H - 20} stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="10 10" />
            <line x1={1680} y1={20} x2={1680} y2={WORLD_H - 20} stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="10 10" />
            <line x1={0} y1={540} x2={WORLD_W} y2={540} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />

            <g clipPath="url(#g4-rev)">
              <path d={`${CURVE_D} Z`} fill="url(#g4-area)" />
              <path
                d={CURVE_D}
                fill="none"
                stroke={C.gold}
                strokeWidth={10}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 12px rgba(251,191,36,0.85))" }}
              />
            </g>

            <g opacity={dotO}>
              <circle cx={dotX} cy={dotY} r={halo + 14 * flowGlow} fill={C.gold} opacity={0.22} />
              <circle cx={dotX} cy={dotY} r={17} fill={C.white} stroke={C.gold} strokeWidth={7} />
              <text x={dotX} y={dotY - 54} fontSize={30} fontWeight={800} fill={C.white} textAnchor="middle" letterSpacing={3}>
                KAMU
              </text>
              {flowGlow > 0.01 && (
                <circle cx={dotX} cy={dotY} r={46 + 14 * Math.sin(t * 5)} fill="none" stroke={C.gold} strokeWidth={4} opacity={flowGlow * 0.9} />
              )}
            </g>
          </svg>

          {zoneLabel(420, "BOSAN", "Terlalu mudah", C.slate, wB)}
          {zoneLabel(1260, "FLOW", "Sedikit di atas kemampuan", C.gold, wF)}
          {zoneLabel(2100, "CEMAS", "Terlalu sulit", C.red, wC)}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1218,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 5,
          color: C.mute,
          opacity: pop(f, 0.8),
        }}
      >
        TANTANGAN RENDAH → TINGGI
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  ▶ SCENE 5 — PENERAPAN (00:43–00:54)                                       */
/*  Tumpukan buku → dipecah jadi 3 soal kecil → progress bar naik.             */
/* -------------------------------------------------------------------------- */

type Book = { w: number; h: number; c: string; dx: number; r: number; y: number };
const BOOKS: Book[] = (() => {
  const raw = [
    { w: 260, h: 46, c: "#FBBF24", dx: 0, r: 0 },
    { w: 230, h: 40, c: "#7C3AED", dx: 14, r: -2 },
    { w: 270, h: 50, c: "#FFFFFF", dx: -10, r: 1.5 },
    { w: 220, h: 38, c: "#A78BFA", dx: 18, r: -3 },
    { w: 250, h: 44, c: "#F59E0B", dx: -14, r: 2.5 },
    { w: 210, h: 40, c: "#6D28D9", dx: 10, r: -1.5 },
    { w: 230, h: 42, c: "#FDE68A", dx: -6, r: 3 },
  ];
  let y = 380;
  return raw.map((b) => {
    y -= b.h;
    return { ...b, y };
  });
})();

const Student: React.FC<{ stress: number; t: number }> = ({ stress, t }) => {
  const calm = 1 - stress;
  const bob = Math.sin(t * 2.2) * 3;
  const drop = (t * 60) % 50;
  return (
    <svg width={520} height={440} viewBox="0 0 520 440">
      <g transform={`translate(0 ${bob})`}>
        <rect x={0} y={340} width={520} height={26} rx={8} fill="#7C3AED" />
        <rect x={30} y={366} width={26} height={74} fill="#4C1D95" />
        <rect x={464} y={366} width={26} height={74} fill="#4C1D95" />

        <path d="M 200 336 L 255 322 L 255 340 L 200 352 Z" fill="#FFFFFF" />
        <path d="M 255 322 L 310 336 L 310 352 L 255 340 Z" fill="#E5E7EB" />

        <path d="M 175 340 L 185 215 Q 190 185 225 182 L 295 182 Q 330 185 335 215 L 345 340 Z" fill={C.gold} />
        <path d="M 190 215 Q 150 280 215 335" stroke={C.gold} strokeWidth={34} strokeLinecap="round" fill="none" />
        <path d="M 320 215 Q 360 280 295 335" stroke={C.gold} strokeWidth={34} strokeLinecap="round" fill="none" />
        <circle cx={215} cy={335} r={17} fill="#F2C6A0" />
        <circle cx={295} cy={335} r={17} fill="#F2C6A0" />

        <rect x={238} y={160} width={34} height={30} fill="#F2C6A0" />
        <circle cx={255} cy={125} r={52} fill="#F2C6A0" />
        <path d="M 203 120 Q 205 62 255 62 Q 307 62 307 120 Q 285 90 255 90 Q 225 90 203 120 Z" fill="#A78BFA" />

        <circle cx={237} cy={128} r={6} fill={C.bg} />
        <circle cx={273} cy={128} r={6} fill={C.bg} />
        <line x1={224} y1={116 - 8 * calm} x2={246} y2={108 + 2 * calm} stroke={C.bg} strokeWidth={5} strokeLinecap="round" />
        <line x1={264} y1={108 + 2 * calm} x2={286} y2={116 - 8 * calm} stroke={C.bg} strokeWidth={5} strokeLinecap="round" />
        <path d="M 238 152 Q 246 146 255 152 Q 264 158 272 152" stroke={C.bg} strokeWidth={5} strokeLinecap="round" fill="none" opacity={stress} />
        <path d="M 236 146 Q 255 168 274 146" stroke={C.bg} strokeWidth={5} strokeLinecap="round" fill="none" opacity={calm} />

        <g opacity={stress}>
          <path d={`M 318 ${90 + drop} Q 326 ${104 + drop} 318 ${112 + drop} Q 310 ${104 + drop} 318 ${90 + drop} Z`} fill="#BAE6FD" />
          <path d={`M 196 ${100 + ((drop + 25) % 50)} Q 204 ${114 + ((drop + 25) % 50)} 196 ${122 + ((drop + 25) % 50)} Q 188 ${114 + ((drop + 25) % 50)} 196 ${100 + ((drop + 25) % 50)} Z`} fill="#BAE6FD" />
        </g>
      </g>
    </svg>
  );
};

const STEPS = [
  { label: "SOAL 1", level: "MUDAH", dots: 1, h: 150, start: 3.5, check: 7.0 },
  { label: "SOAL 2", level: "SEDANG", dots: 2, h: 190, start: 3.9, check: 8.4 },
  { label: "SOAL 3", level: "SULIT", dots: 3, h: 230, start: 4.3, check: 9.8 },
];

const ScenePenerapan: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const stress = ip(t, [3.2, 3.8], [1, 0]);

  const bubbleO = pop(f, 1.8) * ip(t, [3.3, 3.6], [1, 0]);
  const strike = ip(t, [2.8, 3.2], [0, 1]);

  const progress = interpolate(
    t,
    [6.6, 7.2, 8.0, 8.6, 9.4, 10.0],
    [0, 33, 33, 67, 67, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EIO },
  );
  const arrowO = pop(f, 6.2);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 20, top: 350, opacity: pop(f, 0.1) }}>
        <Student stress={stress} t={t} />
      </div>

      {/* gelembung pikiran: "SEMPURNA?" */}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 345,
          opacity: bubbleO,
          transform: `translateY(${(1 - bubbleO) * 20}px) translateX(${
            strike > 0 && strike < 1 ? Math.sin(f * 1.8) * 5 : 0
          }px)`,
        }}
      >
        <div
          style={{
            padding: "14px 30px",
            borderRadius: 40,
            background: "rgba(255,255,255,0.95)",
            color: C.bg,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: 2,
            position: "relative",
          }}
        >
          SEMPURNA?
          <div
            style={{
              position: "absolute",
              left: 24,
              top: "50%",
              height: 6,
              width: `${strike * 82}%`,
              background: C.red,
              borderRadius: 3,
            }}
          />
        </div>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.95)", marginLeft: 20, marginTop: 8 }} />
        <div style={{ width: 11, height: 11, borderRadius: 6, background: "rgba(255,255,255,0.95)", marginLeft: 8, marginTop: 4 }} />
      </div>

      {/* tumpukan buku */}
      <svg
        width={400}
        height={400}
        viewBox="0 0 400 400"
        style={{ position: "absolute", left: 640, top: 400 }}
      >
        {BOOKS.map((b, i) => {
          const startF = sec(0.2 + i * 0.22);
          const sp = spring({
            frame: Math.max(0, f - startF),
            fps: FPS,
            config: { damping: 11, stiffness: 110, mass: 0.8 },
          });
          const exit = ip(t, [3.4 + i * 0.04, 3.4 + i * 0.04 + 0.35], [1, 0]);
          const o = ip(f - startF, [0, 4], [0, 1]) * exit;
          const cx = 200 + b.dx;
          const cy = b.y + b.h / 2;
          return (
            <g
              key={i}
              opacity={o}
              transform={`translate(${cx} ${cy + (1 - sp) * -340}) rotate(${b.r}) scale(${0.4 + 0.6 * exit})`}
            >
              <rect x={-b.w / 2} y={-b.h / 2} width={b.w} height={b.h} rx={7} fill={b.c} />
              <rect x={-b.w / 2 + 16} y={-b.h / 2 + 8} width={10} height={b.h - 16} rx={3} fill="rgba(30,27,75,0.35)" />
              <rect x={-b.w / 2 + 40} y={-b.h / 2 + b.h / 2 - 3} width={b.w * 0.45} height={6} rx={3} fill="rgba(30,27,75,0.3)" />
            </g>
          );
        })}
      </svg>

      {/* panah naik bertahap */}
      <svg
        width={980}
        height={120}
        viewBox="0 0 980 120"
        style={{ position: "absolute", left: 50, top: 790, opacity: arrowO }}
      >
        <line x1={110} y1={100} x2={850} y2={30} stroke={C.gold} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
        <path d="M 862 24 L 832 22 L 840 46 Z" fill={C.gold} />
      </svg>

      {/* tiga soal kecil (anak tangga) */}
      {STEPS.map((s, i) => {
        const sp = spring({
          frame: Math.max(0, f - sec(s.start)),
          fps: FPS,
          config: { damping: 12, stiffness: 130, mass: 0.7 },
        });
        const done = ip(t, [s.check, s.check + 0.4], [0, 1], EO);
        const left = 50 + i * 340;
        return (
          <div
            key={s.label}
            style={{
              position: "absolute",
              left,
              top: 1085 - s.h,
              width: 300,
              height: s.h,
              borderRadius: 26,
              border: `3px solid ${C.gold}`,
              background: `linear-gradient(180deg, rgba(251,191,36,${0.1 + 0.2 * done}), rgba(30,27,75,0.9))`,
              boxShadow: `0 0 ${10 + 40 * done}px rgba(251,191,36,${0.15 + 0.4 * done})`,
              opacity: f >= sec(s.start) ? Math.min(1, sp * 1.5) : 0,
              transform: `translateY(${(1 - sp) * 60}px) scale(${0.85 + 0.15 * sp})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 800, color: C.white }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: C.gold, letterSpacing: 3 }}>{s.level}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: d < s.dots ? C.gold : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
            <svg width={44} height={44} viewBox="0 0 44 44" style={{ position: "absolute", right: 14, top: 14 }}>
              <circle cx={22} cy={22} r={19} fill={`rgba(251,191,36,${done})`} stroke={C.gold} strokeWidth={3} />
              <path
                d="M 11 23 L 19 31 L 33 14"
                fill="none"
                stroke={C.bg}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={40}
                strokeDashoffset={40 * (1 - done)}
              />
            </svg>
          </div>
        );
      })}

      {/* progress bar */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 1135,
          width: 980,
          opacity: pop(f, 3.9),
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: 4, color: C.mute }}>PROGRESS</span>
          <span style={{ fontSize: 44, fontWeight: 800, color: C.gold }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 28, borderRadius: 14, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 14,
              background: `linear-gradient(90deg, #F59E0B, ${C.gold})`,
              boxShadow: "0 0 22px rgba(251,191,36,0.8)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  ▶ SCENE 6 — CLOSING (00:54–01:00)                                         */
/*  Tiga konsep satu komposisi → kamera zoom out → judul + tagline.            */
/* -------------------------------------------------------------------------- */

const BadgeIcon: React.FC<{ kind: 0 | 1 | 2 }> = ({ kind }) => (
  <svg width={170} height={170} viewBox="0 0 200 200">
    {kind === 0 && (
      <>
        <rect x={38} y={40} width={50} height={120} rx={8} fill={C.gold} opacity={0.3} stroke={C.gold} strokeWidth={3} strokeDasharray="8 6" />
        <rect x={112} y={100} width={50} height={60} rx={8} fill={C.white} />
        <path d="M 70 28 L 128 80" stroke={C.red} strokeWidth={6} strokeLinecap="round" fill="none" />
        <path d="M 130 62 L 132 86 L 110 80 Z" fill={C.red} />
      </>
    )}
    {kind === 1 && (
      <>
        <path d="M 22 150 C 66 150 68 48 100 48 C 132 48 134 150 178 150" fill="none" stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
        <circle cx={100} cy={48} r={13} fill={C.white} stroke={C.gold} strokeWidth={6} />
      </>
    )}
    {kind === 2 && (
      <>
        <rect x={28} y={120} width={32} height={40} rx={6} fill={C.white} opacity={0.45} />
        <rect x={68} y={90} width={32} height={70} rx={6} fill={C.white} opacity={0.65} />
        <rect x={108} y={60} width={32} height={100} rx={6} fill={C.white} opacity={0.85} />
        <rect x={148} y={28} width={32} height={132} rx={6} fill={C.gold} />
      </>
    )}
  </svg>
);

const SceneClosing: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  // Kamera zoom out (00:57.2 → 00:58.8)
  const zoom = ip(t, [3.2, 4.8], [1.22, 1.0], EIO);

  const badgeSpring = (startSec: number) =>
    spring({
      frame: Math.max(0, f - sec(startSec)),
      fps: FPS,
      config: { damping: 12, stiffness: 120, mass: 0.8 },
    });

  const badges: Array<{ x: number; start: number; kind: 0 | 1 | 2 }> = [
    { x: 200, start: 0.2, kind: 0 }, // 00:54.2 "kelola ekspektasimu"
    { x: 540, start: 2.0, kind: 1 }, // 00:56.0 "sesuaikan tantanganmu"
    { x: 880, start: 3.8, kind: 2 }, // 00:57.8 "bangun kemajuan"
  ];
  const titleLines = [
    { pre: "", word: "EXPECTATION", start: 4.2 },
    { pre: "× ", word: "CHALLENGE", start: 4.5 },
    { pre: "× ", word: "PROGRESS", start: 4.8 },
  ];

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: "540px 560px",
          transform: `scale(${zoom})`,
        }}
      >
        {badges.map((b, i) => {
          const sp = badgeSpring(b.start);
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: "absolute",
                  left: b.x - 120,
                  top: 440,
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  border: "4px solid rgba(251,191,36,0.7)",
                  background: "radial-gradient(circle, rgba(124,58,237,0.5), rgba(30,27,75,0.85))",
                  boxShadow: "0 0 50px rgba(251,191,36,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: Math.min(1, sp * 1.5),
                  transform: `scale(${0.4 + 0.6 * sp})`,
                }}
              >
                <BadgeIcon kind={b.kind} />
              </div>
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: b.x - 170 - 30,
                    top: 515,
                    width: 60,
                    textAlign: "center",
                    fontSize: 72,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: C.gold,
                    opacity: Math.min(1, sp * 1.5),
                  }}
                >
                  ×
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 770,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        {titleLines.map((l) => {
          const o = pop(f, l.start, 0.5);
          return (
            <div
              key={l.word}
              style={{
                fontSize: 92,
                fontWeight: 800,
                color: C.white,
                letterSpacing: 2,
                opacity: o,
                transform: `translateY(${(1 - o) * 28}px)`,
                textShadow: "0 0 34px rgba(251,191,36,0.35)",
              }}
            >
              <span style={{ color: C.gold }}>{l.pre}</span>
              {l.word}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1112,
          textAlign: "center",
          fontSize: 32,
          fontWeight: 500,
          color: C.mute,
          opacity: pop(f, 5.2),
        }}
      >
        Small steps. Better systems. Greater results.
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1170,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: 3,
          color: C.gold,
          opacity: pop(f, 5.4),
        }}
      >
        @rumahpenasaran
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/*  KOMPOSISI UTAMA                                                            */
/* -------------------------------------------------------------------------- */

const SCENE_COMPONENTS: React.FC[] = [
  SceneHook,
  SceneWantingLiking,
  SceneRpe,
  SceneGoldilocks,
  ScenePenerapan,
  SceneClosing,
];

export const RumahBaru: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: C.bg }}>
      <Backdrop />

      {SCENES.map((s, i) => {
        const Comp = SCENE_COMPONENTS[i];
        const dur = sec(s.end - s.start);
        return (
          <Sequence
            key={s.n}
            from={sec(s.start)}
            durationInFrames={dur}
            name={`S${s.n} ${s.label}`}
          >
            <SceneShell dur={dur} fadeOut={i < SCENES.length - 1}>
              <Comp />
            </SceneShell>
          </Sequence>
        );
      })}

      <Chrome />
      <Subtitles />
      <VoiceOver />
      <BackgroundMusic />
      <Vignette />
    </AbsoluteFill>
  );
};
