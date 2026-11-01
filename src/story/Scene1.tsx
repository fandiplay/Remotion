import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { K, Kicker, LineReveal, Reveal, Stage, hideBefore, ip, lerp, mono, serif, sharp, snap } from "./shared";

/* Storyboard (frame lokal, 30fps) — 4 beat narasi → 4 komposisi berbeda.
   Beat 3 sengaja gelap: malam, ruang istirahat.
   Awal beat dari timing VO: bagian 1 @0, 2 @142, 3 @341. */
const T = {
  // beat 1 (0–4.72s): pertanyaan besar + jam berdetak
  clockIn: 0,
  clockOut: 120,
  clockOutDur: 22,
  q1: 10,
  q1Out: 130,
  q2: 120,
  // beat 2 (4.72s): tumpukan notifikasi sebagai bar alarm
  pushSeed: 142,
  rows: 148,
  stamp2: 190,
  // beat 3 (11.36s): malam, grid hilang
  night: 345,
  clock3: 352,
  // beat 4 (17.12s): frasa bertumpuk, dikedipkan
  oldLabel: 512,
  word: 524,
  wordOut: [540, 566, 592] as number[],
  newLabel: 600,
  // keluar
  outStart: 630,
  outEnd: 676,
};

const NUM_ROWS = 4;
const DARK = "#16150F";
const DARK_INK = "#F2EDE3";

const clockText = (f: number) => {
  // jam berjalan lebih cepat dari waktu nyata; mulai 07:04
  const sec = Math.floor(7 * 3600 + 4 * 60 + f * 27);
  const hh = Math.floor(sec / 3600) % 24;
  const mm = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return [p(hh), p(mm), p(ss)];
};

const Clock: React.FC<{ size: number; color: string; f: number }> = ({ size, color, f }) => {
  const [hh, mm, ss] = clockText(f);
  return (
    <div style={{ ...mono(size, color, 700), display: "flex", alignItems: "baseline", letterSpacing: -6, fontVariantNumeric: "tabular-nums" }}>
      <span>{hh}</span>
      <span style={{ color: K.red, margin: "0 6px" }}>:</span>
      <span>{mm}</span>
      <span style={{ color: K.red, margin: "0 6px" }}>:</span>
      <span style={{ opacity: 0.55 }}>{ss}</span>
    </div>
  );
};

const Word: React.FC<{ at: number; out?: number; size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, size, children, style }) => {
  const f = useCurrentFrame();
  const shifted = out !== undefined && f >= out;
  return (
    <LineReveal at={at} size={size}>
      <div
        style={{
          ...serif(size),
          color: shifted ? K.red : K.ink,
          fontStyle: shifted ? "italic" : "normal",
          ...style,
        }}
      >
        {children}
      </div>
    </LineReveal>
  );
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const clockExit = ip(f, [T.clockOut, T.clockOut + T.clockOutDur], [0, 1], sharp);
  const shake = f > 190 && f < 240 ? Math.sin(f * 1.9) * ip(f, [190, 200, 226, 240], [0, 1, 1, 0]) * 9 : 0;
  const night = ip(f, [T.night, T.night + 26], [0, 1], sharp);

  return (
    <Stage>
      {/* backdrop kertas + grid cetak biru */}
      <AbsoluteFill style={{ background: interpolateColors(night, [0, 1], [K.bg, DARK]) }}>
        <AbsoluteFill
          style={{
            opacity: (1 - night) * 0.5,
            backgroundImage: `linear-gradient(${K.line} 1px, transparent 1px), linear-gradient(90deg, ${K.line} 1px, transparent 1px)`,
            backgroundSize: "90px 90px",
          }}
        />
      </AbsoluteFill>

      {/* margin kolom cetak */}
      <div style={{ position: "absolute", left: 150, top: 0, bottom: 0, width: 2, background: night > 0.5 ? "rgba(242,237,227,0.18)" : K.line }} />
      <div style={{ position: "absolute", left: 90, top: 120 }}>
        <Kicker style={{ color: interpolateColors(night, [0, 1], [K.mute, "#8A8574"]) }}>KandAI · 001</Kicker>
      </div>
      <div style={{ position: "absolute", right: 90, top: 120, ...mono(24, interpolateColors(night, [0, 1], [K.mute, "#8A8574"]), 700), letterSpacing: 4 }}>
        {`${String(Math.min(99, Math.floor(f / 7) + 1)).padStart(2, "0")} / 99`}
      </div>

      {/* ─── BEAT 1: jam ─── */}
      <div
        style={{
          ...hideBefore,
          visibility: f < T.clockIn ? "hidden" : undefined,
          position: "absolute",
          left: 0,
          width: 1080,
          top: 250,
          display: "flex",
          justifyContent: "center",
          opacity: ip(f, [T.clockIn, T.clockIn + 8], [0, 1]) * (1 - clockExit),
          transform: `translateY(${-160 * clockExit}px)`,
        }}
      >
        <Clock size={208} color={K.ink} f={f} />
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 530, display: "flex", justifyContent: "center", opacity: ip(f, [10, 20], [0, 1]) * (1 - clockExit), transform: `translateY(${-160 * clockExit}px)` }}>
        <Kicker>bangun tidur</Kicker>
      </div>

      <div style={{ position: "absolute", left: 170, top: 700, width: 920, opacity: 1 - ip(f, [T.pushSeed - 8, T.pushSeed + 2], [0, 1], sharp) }}>
        <Word at={T.q1} out={T.q1Out} size={108}>
          Pernah nggak,
        </Word>
        <Word at={T.q2} out={T.q1Out} size={108}>
          baru bangun tidur,
        </Word>
        <div style={{ display: "flex", gap: 18, alignItems: "baseline", marginTop: 6 }}>
          <Word at={T.q2 + 10} out={T.q1Out} size={108} style={{ color: K.red, fontStyle: "italic" }}>
            tapi sudah
          </Word>
        </div>
        <Word at={T.q2 + 20} out={T.q1Out} size={108} style={{ color: K.red, fontStyle: "italic" }}>
          tertinggal jauh?
        </Word>
      </div>

      {/* ─── BEAT 2: bar alarm notifikasi ─── */}
      <AbsoluteFill style={{ opacity: 1 - night }}>
        {Array.from({ length: NUM_ROWS }).map((_, i) => {
          const src = (r: "t" | "d" | "u") => {
            const seeds = r === "t"
              ? ["Tugas Matematika", "Tugas Fisika", "Kuis Bahasa Inggris", "Poster kelompok"]
              : r === "d"
                ? ["Deadline 2 hari lagi", "Deadline besok 08.00", "Kumpul malam ini", "Deadline 3 hari lagi"]
                : ["Saldo Rp50rb", "Uang habis ke mana?", "Jajan 47rb hari ini", "Jatah 6 hari lagi"];
            return seeds[i % seeds.length];
          };
          const start = T.rows + i * 12;
          const p = ip(f, [start, start + 14], [0, 1], snap);
          const val = 88 - i * 14;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 90,
                top: 500 + i * 128,
                width: 900,
                opacity: ip(f, [start, start + 5], [0, 1]),
                transform: `translateX(${lerp(-260, 0, p)}px)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={mono(26, K.ink, 700)}>{src(i % 3 === 0 ? "t" : i % 3 === 1 ? "d" : "u")}</div>
                <div style={mono(26, K.mute, 500)}>{src("d")}</div>
              </div>
              <div style={{ height: 2, background: K.line, margin: "10px 0 12px" }} />
              <div style={{ height: 26, background: "rgba(22,21,15,0.08)" }}>
                <div style={{ height: 26, width: `${val * ip(f, [start + 2, start + 22], [0, 1], snap)}%`, background: i === 1 ? K.red : K.ink }} />
              </div>
            </div>
          );
        })}

        {/* stempel merah tercetak miring */}
        <div
          style={{
            position: "absolute",
            left: 420,
            top: 1080,
            opacity: ip(f, [T.stamp2, T.stamp2 + 4], [0, 1]),
            transform: `rotate(-8deg) scale(${lerp(1.6, 1, ip(f, [T.stamp2, T.stamp2 + 10], [0, 1], sharp))})`,
          }}
        >
          <div style={{ border: `7px solid ${K.red}`, padding: "10px 26px", ...mono(46, K.red, 700), letterSpacing: 2 }}>DEADLINE</div>
        </div>

        {/* baris berlebih + goyang + coret */}
        <div style={{ position: "absolute", left: 170, top: 1300, width: 810, transform: `translate(${shake}px,${shake * 0.6}px)` }}>
          {Array.from({ length: 3 }).map((_, i) => {
            const p = ip(f, [300 + i * 6, 312 + i * 6], [0, 1], snap);
            return (
              <div key={i} style={{ overflow: "hidden", height: 86 }}>
                <div style={{ ...mono(34, K.ink, 700), letterSpacing: -1, transform: `translateY(${(1 - p) * 100}%)`, width: 300 + i * 90 }}>
                  {["+ 12 notifikasi", "+ 5 tagihan", "+ 3 tugas baru"][i]}
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: -10, top: 120, width: 700 * ip(f, [322, 340], [0, 1], sharp), height: 8, background: K.red, transform: "rotate(-2deg)" }} />
        </div>

        <Reveal at={T.stamp2 + 6} style={{ position: "absolute", left: 170, top: 1560, width: 760 }}>
          <div style={mono(30, K.ink, 500)}>Uang entah habis ke mana.</div>
        </Reveal>
      </AbsoluteFill>

      {/* ─── BEAT 3: malam ─── */}
      <AbsoluteFill style={{ opacity: night * (1 - ip(f, [T.oldLabel - 12, T.oldLabel + 2], [0, 1], sharp)), visibility: f < T.night - 12 ? "hidden" : undefined }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 380,
            display: "flex",
            justifyContent: "center",
            transform: `translateY(${lerp(40, 0, ip(f, [T.night, T.night + 20], [0, 1], snap))}px)`,
          }}
        >
          <Clock size={150} color={DARK_INK} f={f + 60} />
        </div>
        <div style={{ position: "absolute", left: 0, width: 1080, top: 580, display: "flex", justifyContent: "center" }}>
          <Kicker style={{ color: "#A9A292" }}>tiga hari kemudian</Kicker>
        </div>
        <div style={{ position: "absolute", left: 0, width: 1080, top: 720, display: "flex", justifyContent: "center" }}>
          <div style={{ ...serif(178, DARK_INK), fontStyle: "italic" }}>03</div>
        </div>
        <div style={{ position: "absolute", left: 0, width: 1080, top: 940, display: "flex", justifyContent: "center" }}>
          <div style={{ ...mono(30, "#A9A292", 500), letterSpacing: 6 }}>HALAMAN JURNAL · KOSONG</div>
        </div>

        {/* garis kosong jurnal dengan penanda kemarin-kemarin */}
        <div style={{ position: "absolute", left: 170, top: 1080, width: 740 }}>
          {["senin", "selasa", "rabu"].map((d, i) => {
            const p = ip(f, [T.night + 24 + i * 10, T.night + 40 + i * 10], [0, 1], snap);
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 34, opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
                <div style={{ ...mono(24, "#8A8574", 700), width: 110, letterSpacing: 2 }}>{d.toUpperCase()}</div>
                <div style={{ flex: 1, height: 2, background: "rgba(242,237,227,0.22)" }} />
                <div style={{ ...mono(24, K.red, 700), letterSpacing: 2 }}>NGGAK DITULIS</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ─── BEAT 4: frasa bertumpuk ─── */}
      <AbsoluteFill style={{ visibility: f < T.oldLabel ? "hidden" : undefined }}>
        <div style={{ position: "absolute", left: 170, top: 620 }}>
          <Kicker>{f >= T.newLabel ? "yang sebenarnya" : "bukan soal malas"}</Kicker>
        </div>
        <div style={{ position: "absolute", left: 170, top: 670, width: 900 }}>
          {[
            { t: "Nggak", at: T.word, out: T.wordOut[0] },
            { t: "Punya", at: T.word + 6, out: T.wordOut[1] },
            { t: "Waktu.", at: T.word + 12, out: T.wordOut[2] },
          ].map((w) => (
            <Word key={w.t} at={w.at} out={w.out} size={172}>
              {w.t}
            </Word>
          ))}
        </div>
        <div style={{ position: "absolute", left: 170, top: 1130, width: 820 }}>
          <Reveal at={T.newLabel}>
            <div style={{ ...serif(96, DARK_INK) }}>Tiga hari lewat.</div>
          </Reveal>
          <Reveal at={T.newLabel + 18}>
            <div style={{ ...serif(96, DARK_INK), fontStyle: "italic", color: K.red }}>Tiga hari lagi.</div>
          </Reveal>
          {["senin", "selasa", "rabu"].map((d, i) => (
            <div key={d} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: i === 0 ? 40 : 16, opacity: ip(f, [T.newLabel + 34 + i * 10, T.newLabel + 46 + i * 10], [0, 1]) }}>
              <div style={{ ...mono(24, "#8A8574", 700), width: 110, letterSpacing: 2 }}>{d.toUpperCase()}</div>
              <div style={{ flex: 1, height: 3, background: K.red, transform: `scaleX(${ip(f, [T.newLabel + 44 + i * 10, T.newLabel + 60 + i * 10], [0, 1], sharp)})`, transformOrigin: "left" }} />
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* ─── keluar ─── */}
      <AbsoluteFill
        style={{
          background: K.red,
          opacity: ip(f, [T.outStart, T.outEnd], [0, 1], sharp),
        }}
      />
      <AbsoluteFill style={{ opacity: ip(f, [T.outStart + 24, T.outEnd], [0, 1]), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...mono(34, K.cream, 700), letterSpacing: 10 }}>SETIAP PAGI SAMA.</div>
      </AbsoluteFill>
    </Stage>
  );
};
