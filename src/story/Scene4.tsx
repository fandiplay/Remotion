import React from "react";
import { AbsoluteFill, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bell, BookOpen, PenLine, Wallet, type LucideIcon } from "lucide-react";
import { K, Kicker, LineReveal, Reveal, Stage, hideBefore, ip, lerp, mono, serif, sharp, snap } from "./shared";

/* Beat narasi (frame lokal, 30fps), awal dari timing VO:
   1 @0 Dompet · 2 @173 Jurnal · 3 @299 Belajar · 4 @544 Pengingat · 5 @678 ringkasan */
const T = {
  wallet: 0,
  journal: 173,
  study: 299,
  remind: 544,
  ring: 678,
  exit: 800,
};

const DARK = "#16150F";
const CREAM = "#F2EDE3";
const GREEN = "#0A7D3C";

/* Baris di bawah judul: isi beat berganti kartu, tapi kartu sebelumnya tetap tinggal
   (Dompet kiri, Jurnal kanan, Belajar tengah, Pengingat tersebar) supaya layar terisi. */
const rp = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

const Dompet: React.FC<{ f: number }> = ({ f }) => {
  const total = ip(f, [26, 64], [0, 112500], sharp);
  const pct = ip(f, [40, 90], [0, 46], sharp);
  const rows: [string, string][] = [
    ["Kantin", "−12.000"],
    ["Print tugas", "−3.500"],
    ["Transport", "−8.000"],
  ];
  return (
    <div style={{ background: "#FFFFFF", border: `3px solid ${K.ink}`, padding: "26px 30px", boxShadow: "10px 10px 0 rgba(22,21,15,0.12)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ ...mono(26, K.ink, 700), letterSpacing: 4 }}>DOMPET</div>
        <div style={{ ...mono(20, K.mute, 500) }}>HARI INI</div>
      </div>
      <div style={{ borderTop: `2px dashed ${K.line}`, margin: "16px 0" }} />
      {rows.map(([n, v], i) => {
        const p = ip(f, [10 + i * 8, 20 + i * 8], [0, 1], snap);
        return (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", ...mono(28, K.ink, 500), marginBottom: 8, opacity: p, transform: `translateX(${(1 - p) * -24}px)` }}>
            <span>{n}</span>
            <span style={{ color: K.red, fontWeight: 700 }}>{v}</span>
          </div>
        );
      })}
      <div style={{ borderTop: `2px dashed ${K.line}`, margin: "12px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...mono(24, K.mute, 700) }}>TOTAL</span>
        <span style={{ ...mono(36, K.ink, 700) }}>{rp(total)}</span>
      </div>
      <div style={{ height: 18, background: "rgba(22,21,15,0.09)", marginTop: 14 }}>
        <div style={{ height: 18, width: `${pct}%`, background: GREEN }} />
      </div>
      <div style={{ ...mono(20, K.mute, 500), marginTop: 6 }}>{Math.round(pct)}% dari uang saku</div>
    </div>
  );
};

const Jurnal: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ background: DARK, padding: "26px 28px", boxSizing: "border-box" }}>
    <div style={{ ...mono(20, "#8A8574", 700), letterSpacing: 4 }}>JURNAL · HARI INI</div>
    <div style={{ ...serif(40, CREAM), marginTop: 10, fontStyle: "italic" }}>Akhirnya nulis.</div>
    {[92, 88, 70, 96, 44].map((w, i) => (
      <div key={i} style={{ height: 3, background: `rgba(242,237,227,${0.14 + 0.3 * ip(f, [10 + i * 8, 26 + i * 8], [0, 1])})`, width: `${w}%`, marginTop: i === 0 ? 22 : 16 }} />
    ))}
    <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
      {["capek", "lega"].map((t, i) => (
        <div key={t} style={{ ...mono(20, i ? GREEN : K.red, 700), border: `2px solid ${i ? GREEN : K.red}`, padding: "3px 10px", opacity: ip(f, [46 + i * 8, 56 + i * 8], [0, 1]) }}>{t}</div>
      ))}
    </div>
  </div>
);

const STUDY = [
  ["Himpunan", 100, "selesai"],
  ["Relasi & fungsi", 64, "dikerjakan"],
  ["Latihan soal", 18, "besok"],
] as const;

const Belajar: React.FC<{ f: number }> = ({ f }) => (
  <div>
    {STUDY.map(([n, w, s], i) => {
      const p = ip(f, [8 + i * 12, 26 + i * 12], [0, 1], snap);
      return (
        <div key={n} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", ...mono(26, K.ink, 700) }}>
            <span>{n}</span>
            <span style={{ fontWeight: 500, color: K.mute }}>{s}</span>
          </div>
          <div style={{ height: 24, border: `3px solid ${K.ink}`, marginTop: 6 }}>
            <div style={{ height: "100%", width: `${w * p}%`, background: GREEN }} />
          </div>
        </div>
      );
    })}
  </div>
);

const REMIND = [
  ["07.00", "Bawa buku Matematika"],
  ["16.00", "Telepon ibu"],
  ["21.00", "Satu baris jurnal"],
] as const;

const Pengingat: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div>
      {REMIND.map(([t, n], i) => {
        const p = spring({ frame: f - (8 + i * 16), fps, config: { damping: 12, stiffness: 150 } });
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 0", borderBottom: `2px solid ${K.ink}`, opacity: p, transform: `translateY(${(1 - p) * -50}px)` }}>
            <Bell size={34} color={K.red} />
            <div style={{ ...mono(36, K.ink, 700), width: 130 }}>{t}</div>
            <div style={{ ...serif(50) }}>{n}</div>
          </div>
        );
      })}
    </div>
  );
};

type CardDef = { key: string; no: string; title: string; Icon: LucideIcon; dark?: boolean };

const CARDS: CardDef[] = [
  { key: "dompet", no: "01", title: "Dompet", Icon: Wallet },
  { key: "jurnal", no: "02", title: "Jurnal", Icon: PenLine, dark: true },
  { key: "belajar", no: "03", title: "Belajar", Icon: BookOpen },
  { key: "ingat", no: "04", title: "Pengingat", Icon: Bell },
];

const RING_SLOT = (i: number) => ({ left: 90 + (i % 2) * 460, top: 1080 + Math.floor(i / 2) * 250 });

export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = ip(f, [T.exit, T.exit + 20], [0, 1], sharp);
  const ringT = ip(f, [T.ring, T.ring + 30], [0, 1], sharp);
  const beat = (at: number, end: number) => ip(f, [at, at + 10], [0, 1]) * (1 - ip(f, [end - 10, end], [0, 1]));

  return (
    <Stage>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.1 * exit})`, opacity: 1 - exit }}>
        <div style={{ position: "absolute", left: 90, right: 90, top: 100, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Kicker>Setelah itu · hal yang sama, cara lain</Kicker>
          <div style={{ ...mono(24, K.mute, 700), letterSpacing: 3 }}>04 / 04</div>
        </div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 150, height: 4, background: K.ink }} />

        <div style={{ position: "absolute", left: 90, top: 190 }}>
          <LineReveal at={4} size={120}>
            <div style={{ ...serif(112) }}>Sekarang,</div>
          </LineReveal>
          <LineReveal at={14} size={120}>
            <div style={{ ...serif(112), fontStyle: "italic", color: K.red }}>nggak sendirian.</div>
          </LineReveal>
        </div>

        {/* ── 1 Dompet: paling lama, kartu utama ── */}
        <div style={{ ...hideBefore, position: "absolute", left: 90, top: 490, width: 470, opacity: beat(T.wallet, T.study) }}>
          <Dompet f={f - T.wallet} />
        </div>

        {/* ── 2 Jurnal: kanan, lalu tinggal ── */}
        <div
          style={{
            position: "absolute",
            left: 570,
            top: 470,
            width: 420,
            height: 420,
            opacity: ip(f, [T.journal + 4, T.journal + 14], [0, 1]),
            transform: `rotate(${lerp(7, -2, ip(f, [T.journal + 4, T.journal + 24], [0, 1], snap))}deg) translateY(${(1 - ip(f, [T.journal + 4, T.journal + 24], [0, 1], snap)) * 60}px)`,
          }}
        >
          <Jurnal f={f - T.journal} />
        </div>

        {/* beat 1–4 menyusut ke satu strip saat ringkasan */}
        <AbsoluteFill style={{ transform: `translateY(${320 * ringT}px) scale(${lerp(1, 0.3, ringT)})`, transformOrigin: "50% 0%", opacity: 1 - ip(f, [T.ring + 34, T.ring + 48], [0, 1]) }}>
        {/* label fitur di atas kartu tematik */}
        <div style={{ position: "absolute", left: 90, top: 440, ...mono(26, K.ink, 700), letterSpacing: 3, opacity: beat(T.wallet, T.study) }}>01 · DOMPET — CATAT & PANTAU</div>
        <div style={{ position: "absolute", left: 570, top: 420, ...mono(26, K.ink, 700), letterSpacing: 3, opacity: ip(f, [T.journal + 4, T.journal + 14], [0, 1]) }}>02 · JURNAL — TUANG PIKIRAN</div>

        {/* ── 3 Belajar ── */}
        <div style={{ position: "absolute", left: 90, top: 940, width: 900, opacity: beat(T.study, T.remind), transform: `translateY(${(1 - ip(f, [T.study, T.study + 16], [0, 1], snap)) * 50}px)` }}>
          <div style={{ ...mono(26, K.ink, 700), letterSpacing: 3, marginBottom: 14 }}>03 · BELAJAR — MATERI SESUAI KEBUTUHAN</div>
          <Belajar f={f - T.study} />
        </div>

        {/* ── 4 Pengingat ── */}
        <div style={{ position: "absolute", left: 90, top: 830, width: 900, opacity: ip(f, [T.remind + 4, T.remind + 14], [0, 1]) * (1 - ringT) }}>
          <div style={{ ...mono(26, K.ink, 700), letterSpacing: 3, marginBottom: 10 }}>04 · PENGINGAT — YANG HAMPIR LUPA</div>
          <Pengingat />
        </div>
        </AbsoluteFill>

        {/* ── 5 ringkasan: empat kartu + kalimat ── */}
        {CARDS.map((c, i) => {
          const s = RING_SLOT(i);
          const p = spring({ frame: f - (T.ring + 8 + i * 8), fps, config: { damping: 14, stiffness: 160 } });
          const dark = !!c.dark;
          return (
            <div
              key={c.key}
              style={{
                position: "absolute",
                ...s,
                width: 430,
                height: 230,
                boxSizing: "border-box",
                border: `3px solid ${K.ink}`,
                background: interpolateColors(c.dark ? 1 : 0, [0, 1], [CREAM, DARK]),
                padding: "20px 24px",
                opacity: ip(f, [T.ring + 8 + i * 8, T.ring + 14 + i * 8], [0, 1]),
                transform: `translateY(${(1 - p) * 90}px)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ ...mono(22, dark ? CREAM : K.ink, 700), letterSpacing: 3 }}>{c.no}</div>
                <c.Icon size={38} color={dark ? CREAM : K.ink} strokeWidth={2} />
              </div>
              <div style={{ ...serif(66, dark ? CREAM : K.ink), marginTop: 16 }}>{c.title}</div>
              <div style={{ ...mono(24, dark ? "#8A8574" : K.mute, 500) }}>{["catat & pantau", "tuang pikiran", "materi sesuai kebutuhan", "hal yang hampir lupa"][i]}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 90, top: 1640, width: 900, opacity: ip(f, [T.ring + 40, T.ring + 56], [0, 1]) }}>
          <LineReveal at={T.ring + 40} size={100}>
            <div style={{ ...serif(94) }}>berantakan → <span style={{ color: K.red, fontStyle: "italic" }}>punya arah.</span></div>
          </LineReveal>
        </div>
        <Reveal at={T.ring + 54} style={{ position: "absolute", left: 90, top: 1780 }}>
          <div style={{ ...mono(28, K.mute, 500) }}>empat fitur · satu asisten</div>
        </Reveal>
      </AbsoluteFill>
    </Stage>
  );
};
