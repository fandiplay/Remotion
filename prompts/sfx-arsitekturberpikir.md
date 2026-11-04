# TUGAS: Tambah sound effect ke composition ArsitekturBerpikir

Tambah SFX ke src/arsitekturberpikir.tsx. JANGAN ubah visual, subtitle, timing (SECTIONS/SCRIPT), atau nama export. Jangan render video.

## ATURAN

- Semua SFX dirender di SATU komponen `SfxLayer`, dipasang SEKALI di root `ArsitekturBerpikir`, tepat sebelum `<Subtitles />`. Jangan taruh audio di scene.
- Jangan ubah isi scripts/gen-sfx-arsitektur.mjs (isinya sama dengan gen-sfx-iklanstadion.mjs yang sudah diuji; output-nya deterministik, jadi aman kalau menimpa file sfx yang sama).
- Setelah selesai, `grep -n "<Audio" src/arsitekturberpikir.tsx` harus tepat 1 baris (di SfxLayer).
- Jangan sentuh file lain, kecuali yang disebut di sini.

## LANGKAH

### 1) Siapkan & jalankan generator

Taruh file `gen-sfx-arsitektur.mjs` ke `scripts/`, lalu:

```
node scripts/gen-sfx-arsitektur.mjs
```

Hasil: 11 file di public/sfx/ (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power) dan src/sfx-meta.json. Kalau gagal, STOP dan lapor.

### 2) Edit src/arsitekturberpikir.tsx

Ubah import remotion: tambahkan `Audio` dan `staticFile`. Tambahkan:

```tsx
import sfxMeta from "./sfx-meta.json";
```

Tambahkan di bawah `VIEWS` (SECTIONS, SCRIPT, dan helper `cue` sudah terdefinisi di atasnya), lalu render `<SfxLayer />` SEKALI di `ArsitekturBerpikir` sebelum `<Subtitles />`:

```tsx
type SfxName =
  | "pop" | "whoosh" | "tick" | "ding" | "swap" | "charge"
  | "zap" | "sparkle" | "blip" | "lock" | "power";

/**
 * at:
 *  - "id"          -> awal cue dengan id itu (cue(id).s)
 *  - "mid:id"      -> titik tengah cue itu
 *  - "start:bagian"-> awal bagian (SECTIONS[].from), contoh "start:ipo"
 *  - "abs"         -> frame global langsung (off = frame)
 * off = geser dalam frame (boleh negatif).
 */
type SfxCue = { at: string; off: number; name: SfxName; vol: number };

/** Atur keras-pelannya semua SFX di sini (1 = default). */
const SFX_MASTER = 1;

const SFX_CUES: SfxCue[] = [
  // 01 hook
  { at: "abs", off: 2, name: "pop", vol: 0.35 },
  { at: "abs", off: 8, name: "pop", vol: 0.3 },
  { at: "rumit", off: 0, name: "blip", vol: 0.2 },
  { at: "rumit", off: 6, name: "blip", vol: 0.2 },
  { at: "rumit", off: 12, name: "blip", vol: 0.2 },
  { at: "rumit", off: 18, name: "blip", vol: 0.2 },
  { at: "bingung", off: 0, name: "zap", vol: 0.22 },
  // 02 masalah
  { at: "start:masalah", off: 0, name: "whoosh", vol: 0.25 },
  { at: "tools", off: 0, name: "pop", vol: 0.3 },
  { at: "struktur", off: 0, name: "ding", vol: 0.3 },
  { at: "tanpa", off: 0, name: "zap", vol: 0.22 },
  // 03 matriks
  { at: "start:matriks", off: 0, name: "whoosh", vol: 0.25 },
  { at: "pertama", off: 0, name: "pop", vol: 0.3 },
  { at: "kuadran", off: 0, name: "tick", vol: 0.15 },
  { at: "q1", off: 0, name: "tick", vol: 0.15 },
  { at: "q2", off: 0, name: "tick", vol: 0.15 },
  { at: "q3", off: 0, name: "lock", vol: 0.22 },
  { at: "q4", off: 0, name: "tick", vol: 0.15 },
  { at: "q4", off: 20, name: "sparkle", vol: 0.28 },
  // 04 chaining
  { at: "start:chaining", off: 0, name: "whoosh", vol: 0.25 },
  { at: "inversion", off: 6, name: "pop", vol: 0.25 },
  { at: "hasil", off: 0, name: "tick", vol: 0.15 },
  { at: "mundur", off: 0, name: "tick", vol: 0.15 },
  { at: "syarat", off: 0, name: "tick", vol: 0.15 },
  { at: "awal", off: 0, name: "tick", vol: 0.15 },
  { at: "mundur", off: 6, name: "blip", vol: 0.18 },
  { at: "syarat", off: 6, name: "blip", vol: 0.18 },
  { at: "awal", off: 6, name: "blip", vol: 0.18 },
  { at: "awal", off: 18, name: "ding", vol: 0.28 },
  // 05 ipo
  { at: "start:ipo", off: 0, name: "whoosh", vol: 0.25 },
  { at: "in", off: 0, name: "tick", vol: 0.15 },
  { at: "mid:in", off: 0, name: "tick", vol: 0.15 },
  { at: "out", off: 0, name: "tick", vol: 0.15 },
  { at: "list", off: 0, name: "lock", vol: 0.22 },
  { at: "chain", off: 0, name: "power", vol: 0.32 }, // satu-satunya momen "wow"
  { at: "chain", off: 14, name: "sparkle", vol: 0.3 },
  // 06 penutup
  { at: "start:penutup", off: 0, name: "whoosh", vol: 0.25 },
  { at: "pelaksana", off: 4, name: "pop", vol: 0.25 },
  { at: "arsi", off: 0, name: "ding", vol: 0.28 },
  { at: "arah", off: 0, name: "whoosh", vol: 0.22 },
  { at: "tanya", off: 0, name: "sparkle", vol: 0.3 },
  // 07 outro
  { at: "start:outro", off: 0, name: "whoosh", vol: 0.22 },
  { at: "start:outro", off: 4, name: "pop", vol: 0.25 },
  { at: "start:outro", off: 12, name: "ding", vol: 0.3 },
];

const sfxFrame = (c: SfxCue): number => {
  if (c.at === "abs") return c.off;
  if (c.at.startsWith("start:")) {
    const s = SECTIONS.find((x) => x.id === c.at.slice(6));
    return sec(s ? s.from : 0) + c.off;
  }
  if (c.at.startsWith("mid:")) {
    const k = cue(c.at.slice(4));
    return Math.round((k.s + k.e) / 2) + c.off;
  }
  return cue(c.at).s + c.off;
};

const SfxLayer: React.FC = () => (
  <>
    {SFX_CUES.map((c, i) => {
      const from = sfxFrame(c);
      const frames = (sfxMeta as Record<string, { frames: number }>)[c.name].frames + 2;
      return (
        <Sequence
          key={`${c.at}-${c.off}-${c.name}-${i}`}
          from={from}
          durationInFrames={frames}
          name={`SFX ${c.name}`}
          layout="none"
        >
          <Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.vol * SFX_MASTER} />
        </Sequence>
      );
    })}
  </>
);
```

Di `ArsitekturBerpikir`, pasang `{ENABLE_SFX && <SfxLayer />}` sebelum `<Subtitles />`, dan tambah `const ENABLE_SFX = true;` di dekat `SHOW_DEBUG`.

### 3) Cek (tanpa render)

- `npx tsc` dan `npx eslint src/arsitekturberpikir.tsx` bersih. Kalau tsc protes soal import JSON, pastikan `"resolveJsonModule": true` di tsconfig.json (project IklanStadion sudah pakai pola yang sama).
- `grep -n "<Audio" src/arsitekturberpikir.tsx` = tepat 1 baris.
- Tidak ada cue ganda (at + off + name sama), dan semua `from + frames` <= 1680.
- `npx remotion compositions` tetap menampilkan ArsitekturBerpikir dengan durasi 1680 frame.

### 4) Laporan akhir singkat (Indonesia)

- jumlah cue per bagian dan total (harus 44)
- daftar 11 file di public/sfx
- hasil grep, tsc, eslint, compositions
