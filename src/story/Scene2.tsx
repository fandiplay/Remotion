import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, Kicker, LineReveal, Stage, hideBefore, ip, lerp, mono, serif, sharp, snap } from "./shared";

/* Beat narasi (frame lokal, 30fps), awal dari timing VO:
   1 @0 (pagi) · 2 @164 (siang/malam/penuh) · 3 @424 (capek) · 4 @574 (sendirian) */
const T = {
  beat1: 0,
  slot: [16, 40, 64, 88] as number[],
  stamp: 140,
  beat2: 164,
  quotes: [172, 252, 330] as number[],
  strike: [348, 364, 380] as [number, number, number],
  beat3: 424,
  shrink: 444,
  beat4: 574,
  hand: [586, 604, 622] as number[],
};

const M = 90;
const ITEMS: readonly (readonly [string, string])[] = [
  ["Kepala", "pikiran penuh"],
  ["Uang", "uang saku"],
  ["Tugas", "sekolah"],
  ["Jurnal", "belum ditulis"],
];

const Row: React.FC<{
  at: number;
  time: string;
  title: string;
  note: string;
  tag: string;
  rule?: boolean;
  tagColor?: string;
}> = ({ at, time, title, note, tag, rule = true, tagColor = K.ink }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 14], [0, 1], snap);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "26px 0", position: "relative" }}>
      {rule && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: K.line, transform: `scaleX(${p})`, transformOrigin: "left" }} />}
      <div style={{ width: 250, ...mono(40, K.ink, 700), opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>{time}</div>
      <div style={{ flex: 1 }}>
        <LineReveal at={at + 4} size={84}>
          <div style={{ ...serif(78), letterSpacing: -1 }}>{title}</div>
        </LineReveal>
        <div style={{ ...mono(26, K.mute, 500), marginTop: 10, opacity: ip(f, [at + 10, at + 20], [0, 1]) }}>{note}</div>
      </div>
      <div
        style={{
          ...mono(22, K.ink, 700),
          letterSpacing: 3,
          border: `2px solid ${K.ink}`,
          padding: "6px 12px",
          background: tagColor,
          color: tagColor === K.ink ? K.cream : K.red,
          opacity: ip(f, [at + 12, at + 18], [0, 1]),
          transform: `rotate(-4deg) scale(${lerp(1.4, 1, p)})`,
          alignSelf: "center",
        }}
      >
        {tag}
      </div>
    </div>
  );
};

export const Scene2: React.FC = () => {
  const f = useCurrentFrame();

  const shrink = 1;
  const stress = ip(f, [T.beat3 + 6, T.beat3 + 24], [0, 1], snap);
  const exit = ip(f, [800, 821], [0, 1], sharp);

  return (
    <Stage>
      <AbsoluteFill style={{ transform: `scale(${shrink + 0.1 * exit})`, transformOrigin: "50% 55%", opacity: 1 - exit }}>
        {/* masthead */}
        <div style={{ position: "absolute", left: M, right: M, top: 110, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Kicker>Fig. 01 · Jadwal Raka</Kicker>
          <div style={{ ...mono(24, K.mute, 700), letterSpacing: 4 }}>SENIN–JUMAT</div>
        </div>
        <div style={{ position: "absolute", left: M, right: M, top: 160, height: 4, background: K.ink }} />

        <div style={{ ...hideBefore, position: "absolute", left: M, top: 190 }}>
          <LineReveal at={T.beat1} size={200}>
            <div style={{ ...serif(190), fontStyle: "italic", lineHeight: 0.95 }}>Raka</div>
          </LineReveal>
          <div style={{ ...mono(30, K.mute, 500), marginTop: 16, opacity: ip(f, [22, 34], [0, 1]) }}>punya banyak hal yang harus diurus.</div>
        </div>

        {/* tabel agenda */}
        <div style={{ position: "absolute", left: M, right: M, top: 470, opacity: 1 - ip(f, [T.beat2 - 10, T.beat2 + 4], [0, 1], sharp) }}>
          <Row at={T.slot[0]} time="07.00" title="Uang saku" note="dicoba diatur, belum tentu cukup" tag="PAGI" />
          <Row at={T.slot[1]} time="13.30" title="Tugas numpuk" note="lima mata pelajaran, satu tenggat" tag="SIANG" />
          <Row at={T.slot[2]} time="20.00" title="Belajar ujian" note="bab 4 belum dibuka" tag="MALAM" />
        </div>

        {/* stempel besar */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 980,
            opacity: ip(f, [T.stamp, T.stamp + 5], [0, 1]) * (1 - ip(f, [T.beat2 - 10, T.beat2 + 4], [0, 1], sharp)),
            transform: `rotate(-6deg) scale(${lerp(1.8, 1, ip(f, [T.stamp, T.stamp + 9], [0, 1], sharp))})`,
          }}
        >
          <div style={{ ...serif(64), fontStyle: "italic", color: K.red, borderBottom: `8px solid ${K.red}` }}>dikerjakan sendirian</div>
        </div>

        {/* beat 2: tiga kutipan dari dalam kepala */}
        <div style={{ position: "absolute", left: M, right: M, top: 470, opacity: ip(f, [T.stamp + 6, T.stamp + 22], [0, 1]) * (1 - ip(f, [T.beat3 - 12, T.beat3], [0, 1], sharp)) }}>
          {["“Belum selesai.”", "“Nanti aja.”", "“Aku lupa lagi.”"].map((q, i) => {
            const at = T.quotes[i];
            const p = ip(f, [at, at + 12], [0, 1], snap);
            const struck = ip(f, [T.strike[i], T.strike[i] + 12], [0, 1], sharp);
            return (
              <div key={q} style={{ position: "relative", opacity: p, transform: `translateX(${(1 - p) * (i % 2 ? 60 : -60)}px)`, marginBottom: 10 }}>
                <div style={{ ...serif(84), fontStyle: "italic", color: i === 2 ? K.red : K.ink }}>{q}</div>
                <div style={{ position: "absolute", left: 0, top: 40, width: `${struck * 100}%`, height: 5, background: K.red }} />
              </div>
            );
          })}
        </div>

        {/* beat 3: label capek */}
        <div style={{ position: "absolute", left: M, top: 560, opacity: stress * (1 - ip(f, [T.beat4 - 14, T.beat4], [0, 1], sharp)) }}>
          <Kicker>setiap malam</Kicker>
          <div style={{ ...serif(150), lineHeight: 0.95, marginTop: 10 }}>Tapi cuma</div>
          <div style={{ ...serif(150), lineHeight: 0.95, fontStyle: "italic", color: K.red }}>capek.</div>
          <div style={{ ...mono(32, K.mute, 500), marginTop: 24, maxWidth: 620 }}>ingat · atur · kerjakan — sendirian.</div>
        </div>

        {/* beat 4: empat hal, satu tangan */}
        <div style={{ position: "absolute", left: M, top: 400, opacity: ip(f, [T.beat4, T.beat4 + 14], [0, 1]) }}>
          {ITEMS.map(([t, sub], i) => {
            const at = T.hand[i] ?? 999;
            const p = ip(f, [at, at + 12], [0, 1], snap);
            return (
              <div
                key={t}
                style={{
                  position: "absolute",
                  left: 0,
                  top: i * 150,
                  transform: `translateX(${(1 - p) * -80}px) rotate(${(1 - p) * -6}deg)`,
                  opacity: p,
                  ...mono(44, K.ink, 700),
                  letterSpacing: -1,
                }}
              >
                <span style={{ color: K.red }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ marginLeft: 22 }}>{t}</span>
                <span style={{ marginLeft: 22, ...mono(28, K.mute, 500) }}>{sub}</span>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, top: 580, width: 880, ...mono(26, K.mute, 700), letterSpacing: 4, opacity: ip(f, [T.hand[2] + 6, T.hand[2] + 18], [0, 1]) }}>
            DAN DIURUS OLEH SATU ORANG.
          </div>
          <div style={{ position: "absolute", left: 0, top: 700, width: 880, opacity: ip(f, [T.hand[2] + 24, T.hand[2] + 40], [0, 1]) }}>
            <div style={{ ...serif(96), fontStyle: "italic", color: K.red }}>bukan nggak mau.</div>
          </div>
        </div>
      </AbsoluteFill>

      {/* penanda halaman */}
      <div style={{ position: "absolute", left: M, bottom: 110, ...mono(24, K.mute, 700), letterSpacing: 3 }}>
        FIG. 01 / PRODUKTIFITAS
      </div>
      <div style={{ position: "absolute", right: M, bottom: 110, ...mono(24, K.mute, 700) }}>02</div>
    </Stage>
  );
};
