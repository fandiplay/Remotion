import React from "react";
import { AbsoluteFill, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { K, Kicker, Reveal, Stage, ip, lerp, mono, serif, sharp, snap } from "./shared";

/* Beat, awal dari timing VO: 1 @0 · 2 @193 (nama) · 3 @293 (chatbot → lebih) */
const T = {
  room: 0,
  taskRows: [14, 28, 42, 56, 70] as number[],
  lampOut: 150,
  glow: 180,
  name: 196,
  nameShift: 246,
  beat3a: 298,
  beat3b: 364,
};

const DARK = "#12110C";
const PAPER = "#F2EDE3";

export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dark = ip(f, [T.lampOut, T.lampOut + 26], [0, 1], sharp);
  const glow = ip(f, [T.glow, T.glow + 40], [0, 1], snap);
  const bright = ip(f, [T.name, T.name + 20], [0, 1], sharp);
  const squeeze = spring({ frame: f - T.name, fps, config: { damping: 12, stiffness: 160, mass: 0.8 } });
  const squeeze2 = spring({ frame: f - T.nameShift, fps, config: { damping: 14, stiffness: 120 } });
  const thin = ip(f, [T.beat3a, T.beat3a + 24], [1, 0.28], sharp);
  const co = ip(f, [T.beat3b, T.beat3b + 20], [0, 1], snap);
  const exit = ip(f, [486, 508], [0, 1], sharp);

  const tasks = ["Tugas Biologi — kumpul besok", "Ringkas bab 5", "Latihan soal", "Balas grup kelas", "Tulis jurnal"];

  return (
    <Stage>
      <AbsoluteFill style={{ background: interpolateColors(dark, [0, 1], [PAPER, DARK]) }}>
        {/* gradien lampu meja dari kanan */}
        <AbsoluteFill
          style={{
            opacity: (1 - dark) * 0.55,
            background: "radial-gradient(circle 620px at 92% 18%, rgba(217,43,31,0.22), rgba(217,43,31,0) 70%)",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-40 * exit}px)` }}>
        {/* posisi kiri atas: label + jam dinding */}
        <div style={{ position: "absolute", left: 90, top: 110 }}>
          <Kicker style={{ color: interpolateColors(dark, [0, 1], [K.mute, "#8A8574"]) }}>Malam itu · 23.41</Kicker>
        </div>
        <div style={{ position: "absolute", right: 90, top: 96, width: 96, height: 96, borderRadius: 48, border: `3px solid ${interpolateColors(dark, [0, 1], [K.ink, "#3A3830"])}`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 3, height: 30, background: interpolateColors(dark, [0, 1], [K.ink, PAPER]), transformOrigin: "bottom", transform: `translateY(-15px) rotate(${f * 2}deg)` }} />
        </div>

        {/* daftar tugas */}
        <div style={{ position: "absolute", left: 90, right: 90, top: 300 }}>
          <div style={{ ...mono(26, interpolateColors(dark, [0, 1], [K.ink, "#8A8574"]), 700), letterSpacing: 4, marginBottom: 30 }}>DAFTAR TUGAS — BELUM SELESAI</div>
          {tasks.map((t, i) => {
            const at = T.taskRows[i];
            const p = ip(f, [at, at + 12], [0, 1], snap);
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 0", borderBottom: `2px solid ${interpolateColors(dark, [0, 1], [K.line, "#26251E"])}`, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
                <div style={{ width: 34, height: 34, border: `3px solid ${K.red}`, flexShrink: 0 }} />
                <div style={{ ...mono(34, interpolateColors(dark, [0, 1], [K.ink, "#B9B3A2"]), 500) }}>{t}</div>
              </div>
            );
          })}
        </div>

        {/* cahaya hijau dari bawah */}
        <AbsoluteFill
          style={{
            opacity: glow,
            background: "radial-gradient(circle 760px at 50% 100%, rgba(0,200,83,0.20), rgba(0,200,83,0) 72%)",
          }}
        />

        {/* nama KAND AI */}
        <div style={{ position: "absolute", left: 0, width: 1080, top: lerp(520, 430, squeeze2), display: "flex", justifyContent: "center" }}>
          <div
            style={{
              ...serif(84, interpolateColors(bright, [0, 1], ["#B9B3A2", PAPER])),
              letterSpacing: 14,
              fontWeight: 400,
              transform: `scale(${lerp(0.82, 1, squeeze)} ${lerp(1, 1.15, squeeze2)})`,
              opacity: ip(f, [T.name - 4, T.name + 4], [0, 1]),
            }}
          >
            KAND AI
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: ip(f, [T.name + 14, T.name + 26], [0, 1]) }}>
          <div style={{ width: 220 * ip(f, [T.name + 14, T.name + 40], [0, 1], sharp), height: 6, background: K.red }} />
        </div>
        <Reveal at={T.name + 24} style={{ position: "absolute", left: 0, width: 1080, top: 680, display: "flex", justifyContent: "center" }}>
          <div style={{ ...mono(30, "#B9B3A2", 500), letterSpacing: 2 }}>namanya disebut sekali.</div>
        </Reveal>

        {/* beat 3: "chatbot biasa" menyusut jadi satu baris kecil */}
        <div style={{ position: "absolute", left: 90, right: 90, top: 300, transformOrigin: "50% 0%", opacity: thin }}>
          <div style={{ ...mono(26, "#6E6A5C", 700), letterSpacing: 4 }}>ANGGAPAN AWAL</div>
          <div style={{ ...serif(92), color: "#6E6A5C", marginTop: 12 }}>chatbot biasa.</div>
          <div style={{ height: 3, background: K.red, width: `${88 * ip(f, [T.beat3a + 8, T.beat3a + 22], [0, 1], sharp)}%`, marginTop: 6 }} />
        </div>

        {/* garis pembatas + tiga hal yang berbeda */}
        <div style={{ position: "absolute", left: 90, right: 90, top: 780, height: 3, background: K.red, transform: `scaleX(${co})`, transformOrigin: "left" }} />
        <div style={{ position: "absolute", left: 90, right: 90, top: 820, opacity: co }}>
          {["Mengingat", "Menata", "Menemani"].map((t, i) => {
            const p = ip(f, [T.beat3b + 8 + i * 10, T.beat3b + 22 + i * 10], [0, 1], snap);
            return (
              <div key={t} style={{ display: "flex", alignItems: "baseline", gap: 26, marginBottom: 6, transform: `translateX(${(1 - p) * 60}px)`, opacity: p }}>
                <div style={{ ...mono(26, K.red, 700) }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ ...serif(108), color: PAPER }}>{t}</div>
              </div>
            );
          })}
          <div style={{ ...mono(30, "#8A8574", 500), marginTop: 18, opacity: ip(f, [T.beat3b + 40, T.beat3b + 54], [0, 1]) }}>bukan cuma menjawab.</div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
