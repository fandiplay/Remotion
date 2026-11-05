# TUGAS: Tambah sound effect ke composition DNA (Golden State Killer)

Tambah SFX ke `src/dna.tsx`. JANGAN ubah visual, subtitle (`LINES`, `SIL`, `CUES`), timing scene (`SCENES`), konstanta (`DNA_FPS`, `DNA_WIDTH`, `DNA_HEIGHT`, `AUDIO_SECONDS`, `DNA_DURATION_IN_FRAMES`, `VOICE_SRC`), atau nama export (`DnaVideo`, `DNA_*`, default export). Jangan render video.

Konteks composition: 1080x1920, 30 fps, 4079 frame (135.96 detik). Waktu di file ini memakai DETIK global (sama seperti `LINES` dan `SCENES`). TIDAK ada helper `t(detik)` di level modul (di dalam `DnaVideo`, `t` adalah variabel lokal detik), jadi frame dihitung dengan `Math.round(c.s * FPS)`. Konstanta `FPS` sudah ada. Tidak ada `SECTIONS`, `SCRIPT`, `cue(id)`, `SceneIn`, atau vignette di file ini, jadi jangan membuatnya. Komponen subtitle bernama `Subtitle` (tunggal, menerima prop `t`).

## ATURAN

- Semua SFX dirender di SATU komponen `SfxLayer`, dipasang SEKALI di root `DnaVideo`, tepat sebelum `<Subtitle t={t} />`. Jangan taruh audio di dalam scene.
- Baris `{VOICE_SRC ? <Audio src={staticFile(VOICE_SRC)} /> : null}` yang sudah ada di `DnaVideo` JANGAN diubah atau dihapus (itu slot voice over, nilainya `null`).
- Jangan ubah isi generator `gen-sfx-dna.mjs` yang saya lampirkan (pakai apa adanya; output-nya deterministik, jadi aman menimpa file sfx dan `src/sfx-meta.json` yang sudah ada dari proyek lain).
- Jangan sentuh file lain, kecuali yang disebut di sini (`src/dna.tsx`, `scripts/`, `public/sfx/`, `src/sfx-meta.json`, dan `tsconfig.json` hanya bila perlu `resolveJsonModule`).
- Gaya kode mengikuti `src/dna.tsx`: indentasi 2 spasi, tanda kutip ganda.
- Setelah selesai, `grep -n "<Audio" src/dna.tsx` harus tepat 2 baris: slot `VOICE_SRC` yang sudah ada + 1 di `SfxLayer`.

## LANGKAH

### 1) Siapkan & jalankan generator

Taruh lampiran `gen-sfx-dna.mjs` di `scripts/` sebagai `scripts/gen-sfx-dna.mjs` (isi tidak diubah sama sekali), lalu dari root project:

```
node scripts/gen-sfx-dna.mjs
```

Hasil: 11 file di `public/sfx/` (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power) dan `src/sfx-meta.json`. Kalau gagal, STOP dan lapor.

### 2) Edit src/dna.tsx

a) Pada import `remotion` yang sudah ada (multi-baris), tambahkan `Sequence` (urutan alfabet, setelah `random`):

```tsx
import {
  AbsoluteFill,
  Audio,
  Easing,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
```

b) Tambahkan di bawah import `loadFont` yang sudah ada:

```tsx
import sfxMeta from "./sfx-meta.json";
```

c) Di dekat `const DEBUG_MARKERS = false;` tambahkan:

```tsx
const ENABLE_SFX = true;
```

d) Tambahkan blok berikut tepat di atas komentar `KOMPOSISI UTAMA` (setelah komponen `Brand`). `FPS` dan array `SCENES`/`LINES` sudah terdefinisi di file.

```tsx
/* ============================================================================
 * SOUND EFFECT  (satu layer, dipasang sekali di root)
 * s   = detik global (acuan: SCENES, LINES, dan komentar `// 08.99s` di scene)
 * off = geser dalam frame (boleh negatif)
 * vol = 0..1 per efek; SFX_MASTER mengatur keras-pelan semuanya
 * ========================================================================== */
type SfxName =
  | "pop" | "whoosh" | "tick" | "ding" | "swap" | "charge"
  | "zap" | "sparkle" | "blip" | "lock" | "power";

type SfxCue = { s: number; off: number; name: SfxName; vol: number };

const SFX_MASTER = 1;

const SFX_CUES: SfxCue[] = [
  // 01 HOOK (00:00-00:12)
  { s: 0.3, off: 0, name: "pop", vol: 0.25 }, // rumah malam
  { s: 0.5, off: 0, name: "pop", vol: 0.35 }, // Kepo muncul
  { s: 4.4, off: 0, name: "whoosh", vol: 0.2 }, // cincin 40 tahun terisi
  { s: 6.4, off: 0, name: "pop", vol: 0.25 }, // siluet pelaku
  { s: 6.5, off: 0, name: "pop", vol: 0.25 }, // sepupu jauh
  { s: 6.6, off: 0, name: "whoosh", vol: 0.18 }, // DNA mengalir ke pelaku
  { s: 7.0, off: 0, name: "tick", vol: 0.15 }, // chip Sepupu jauh
  { s: 9.0, off: 0, name: "pop", vol: 0.28 }, // awan unggah DNA
  { s: 10.2, off: 0, name: "zap", vol: 0.3 }, // coretan silang: pelaku tidak unggah
  // 02 MISTERI 40 TAHUN (00:12-00:32)
  { s: 12.25, off: 0, name: "whoosh", vol: 0.25 }, // pergantian scene
  { s: 13.1, off: 0, name: "pop", vol: 0.25 }, // kartu identitas
  { s: 13.8, off: 0, name: "pop", vol: 0.2 }, // rumah
  { s: 14.2, off: 0, name: "blip", vol: 0.18 }, // siluet pelaku
  { s: 17.6, off: 0, name: "whoosh", vol: 0.2 }, // peta California
  { s: 18.0, off: 0, name: "tick", vol: 0.15 }, // titik kejadian
  { s: 18.45, off: 0, name: "tick", vol: 0.15 },
  { s: 18.9, off: 0, name: "tick", vol: 0.15 },
  { s: 22.0, off: 0, name: "pop", vol: 0.22 }, // sarung tangan
  { s: 22.85, off: 0, name: "pop", vol: 0.22 }, // wajah tertutup
  { s: 23.6, off: 0, name: "pop", vol: 0.22 }, // tanpa jejak
  { s: 25.0, off: 0, name: "whoosh", vol: 0.22 }, // garis polisi
  { s: 25.3, off: 0, name: "pop", vol: 0.25 }, // kantong bukti DNA
  { s: 27.3, off: 0, name: "tick", vol: 0.15 }, // chip Bukti penting
  { s: 27.4, off: 0, name: "blip", vol: 0.2 }, // kaca pembesar menyisir
  { s: 29.8, off: 0, name: "ding", vol: 0.28 }, // chip DNA
  // 03 SENJATA SAINS (00:32-00:54)
  { s: 32.0, off: 0, name: "whoosh", vol: 0.25 }, // pergantian scene
  { s: 32.6, off: 0, name: "pop", vol: 0.25 }, // database polisi
  { s: 33.0, off: 0, name: "pop", vol: 0.2 }, // heliks DNA
  { s: 34.4, off: 0, name: "blip", vol: 0.18 }, // pencocokan mulai
  { s: 34.9, off: 0, name: "zap", vol: 0.3 }, // Tidak cocok
  { s: 36.3, off: 0, name: "ding", vol: 0.25 }, // Genetic Genealogy
  { s: 36.5, off: 0, name: "pop", vol: 0.22 }, // ilmuwan forensik
  { s: 40.9, off: 0, name: "whoosh", vol: 0.22 }, // STR vs SNP
  { s: 41.4, off: 0, name: "tick", vol: 0.15 }, // batang STR
  { s: 41.64, off: 0, name: "tick", vol: 0.15 },
  { s: 45.0, off: 0, name: "swap", vol: 0.2 }, // beralih ke SNP
  { s: 45.7, off: 0, name: "charge", vol: 0.2 }, // SNP terisi (45.9-48.6)
  { s: 45.85, off: 0, name: "pop", vol: 0.22 }, // kartu SNP
  { s: 49.5, off: 0, name: "pop", vol: 0.2 }, // lingkaran kekerabatan 1
  { s: 50.2, off: 0, name: "pop", vol: 0.2 }, // lingkaran 2
  { s: 50.9, off: 0, name: "pop", vol: 0.2 }, // lingkaran 3
  { s: 51.6, off: 0, name: "lock", vol: 0.22 }, // kerabat jauh terdeteksi
  // 04 SILSILAH (00:54-01:19)
  { s: 53.7, off: 0, name: "whoosh", vol: 0.25 }, // pergantian scene
  { s: 54.3, off: 0, name: "pop", vol: 0.22 }, // DNA pelaku
  { s: 54.5, off: 0, name: "pop", vol: 0.2 }, // situs silsilah
  { s: 54.6, off: 0, name: "charge", vol: 0.18 }, // pemindaian (54.6-57.6)
  { s: 58.7, off: 0, name: "ding", vol: 0.28 }, // kecocokan kerabat jauh
  { s: 61.7, off: 0, name: "whoosh", vol: 0.22 }, // detektif masuk
  { s: 61.8, off: 0, name: "pop", vol: 0.25 }, // papan bukti
  { s: 62.3, off: 0, name: "blip", vol: 0.18 }, // benang merah
  { s: 62.6, off: 0, name: "pop", vol: 0.2 }, // kaca pembesar
  { s: 64.5, off: 0, name: "whoosh", vol: 0.22 }, // pohon keluarga tumbuh
  { s: 65.6, off: 0, name: "tick", vol: 0.15 }, // Leluhur bersama
  { s: 69.0, off: 0, name: "tick", vol: 0.15 }, // Generasi sekarang
  { s: 70.1, off: 0, name: "whoosh", vol: 0.22 }, // ratusan nama
  { s: 70.4, off: 0, name: "pop", vol: 0.2 }, // Kepo
  { s: 71.3, off: 0, name: "tick", vol: 0.15 }, // filter usia
  { s: 72.3, off: 0, name: "tick", vol: 0.15 }, // filter jenis kelamin
  { s: 73.7, off: 0, name: "tick", vol: 0.15 }, // filter tempat tinggal
  { s: 75.8, off: 0, name: "blip", vol: 0.18 }, // daftar menyempit
  { s: 78.3, off: 0, name: "ding", vol: 0.3 }, // satu titik tersisa
  { s: 78.4, off: 0, name: "sparkle", vol: 0.25 },
  // 05 IDENTITAS (01:19-01:47)
  { s: 79.1, off: 0, name: "whoosh", vol: 0.25 }, // pergantian scene
  { s: 79.4, off: 0, name: "pop", vol: 0.25 }, // kartu nama DeAngelo
  { s: 82.4, off: 0, name: "blip", vol: 0.2 }, // kaca pembesar
  { s: 85.2, off: 0, name: "whoosh", vol: 0.22 }, // dua kartu DNA
  { s: 85.6, off: 0, name: "pop", vol: 0.2 }, // kartu kedua
  { s: 86.4, off: 0, name: "blip", vol: 0.18 }, // simbol perbandingan
  { s: 87.4, off: 0, name: "zap", vol: 0.28 }, // Belum cukup
  { s: 90.3, off: 0, name: "pop", vol: 0.22 }, // detektif
  { s: 90.6, off: 0, name: "pop", vol: 0.2 }, // kartu sampel
  { s: 91.2, off: 0, name: "tick", vol: 0.15 }, // Sampel langsung
  { s: 93.9, off: 0, name: "whoosh", vol: 0.22 }, // rumah DeAngelo
  { s: 94.0, off: 0, name: "pop", vol: 0.22 }, // tempat sampah
  { s: 94.4, off: 0, name: "tick", vol: 0.15 }, // Barang buangan
  { s: 96.8, off: 0, name: "pop", vol: 0.22 }, // tabung sampel
  { s: 97.2, off: 0, name: "tick", vol: 0.15 }, // Sampel biologis
  { s: 99.4, off: 0, name: "whoosh", vol: 0.22 }, // pencocokan DNA
  { s: 100.0, off: 0, name: "pop", vol: 0.2 }, // heliks kedua
  { s: 103.0, off: 0, name: "lock", vol: 0.22 }, // pola cocok terkunci
  { s: 103.15, off: 0, name: "ding", vol: 0.3 }, // hasil cocok
  { s: 105.5, off: 0, name: "pop", vol: 0.25 }, // April 2018
  { s: 105.7, off: 0, name: "pop", vol: 0.22 }, // Kepo kaget
  { s: 106.2, off: 0, name: "zap", vol: 0.3 }, // stempel ditangkap
  // 06 PENUTUP (01:47-02:16) - lebih lembut
  { s: 107.45, off: 0, name: "whoosh", vol: 0.22 }, // pergantian scene
  { s: 107.8, off: 0, name: "pop", vol: 0.2 }, // pelaku
  { s: 107.9, off: 0, name: "pop", vol: 0.2 }, // kerabat
  { s: 108.8, off: 0, name: "pop", vol: 0.2 }, // awan unggah (dicoret)
  { s: 109.4, off: 0, name: "blip", vol: 0.15 }, // coretan
  { s: 109.8, off: 0, name: "pop", vol: 0.2 }, // awan unggah (centang)
  { s: 110.2, off: 0, name: "tick", vol: 0.15 }, // Tidak unggah
  { s: 110.6, off: 0, name: "tick", vol: 0.15 }, // Ada di basis data
  { s: 113.7, off: 0, name: "charge", vol: 0.15 }, // aliran informasi genetik (113.9-116.6)
  { s: 114.0, off: 0, name: "pop", vol: 0.2 }, // kartu
  { s: 116.6, off: 0, name: "ding", vol: 0.3 }, // identitas terbuka
  { s: 116.75, off: 0, name: "sparkle", vol: 0.25 },
  { s: 120.2, off: 0, name: "pop", vol: 0.22 }, // Genetic Genealogy
  { s: 122.7, off: 0, name: "pop", vol: 0.22 }, // Ilmu genetika
  { s: 124.6, off: 0, name: "pop", vol: 0.22 }, // Sejarah keluarga
  { s: 126.1, off: 0, name: "pop", vol: 0.22 }, // Investigasi
  { s: 127.8, off: 0, name: "whoosh", vol: 0.2 }, // gembok muncul
  { s: 128.6, off: 0, name: "pop", vol: 0.2 }, // pohon dan rumah
  { s: 129.0, off: 0, name: "lock", vol: 0.22 }, // gembok terbuka
  { s: 131.4, off: 0, name: "ding", vol: 0.3 }, // stempel TERPECAHKAN
  { s: 131.5, off: 0, name: "sparkle", vol: 0.25 },
  { s: 133.3, off: 0, name: "pop", vol: 0.25 }, // Kepo penutup
  { s: 133.6, off: 0, name: "pop", vol: 0.25 }, // tombol follow
  { s: 134.3, off: 0, name: "sparkle", vol: 0.25 },
];

const sfxFrame = (c: SfxCue): number => Math.round(c.s * FPS) + c.off;

const SfxLayer: React.FC = () => (
  <>
    {SFX_CUES.map((c, i) => {
      const from = sfxFrame(c);
      const frames = (sfxMeta as Record<string, { frames: number }>)[c.name].frames + 2;
      return (
        <Sequence key={`${c.s}-${c.off}-${c.name}-${i}`} from={from} durationInFrames={frames} name={`SFX ${c.name}`} layout="none">
          <Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.vol * SFX_MASTER} />
        </Sequence>
      );
    })}
  </>
);
```

e) Di komponen `DnaVideo` pasang layer tepat sebelum `<Subtitle t={t} />` (setelah blok `SCENES.map(...)`):

```tsx
{ENABLE_SFX && <SfxLayer />}
<Subtitle t={t} />
```

### 3) Cek (tanpa render)

- `npx tsc --noEmit` dan `npx eslint src/dna.tsx` bersih. Kalau tsc protes soal import JSON, pastikan `"resolveJsonModule": true` di `tsconfig.json`.
- `grep -n "<Audio" src/dna.tsx` = tepat 2 baris (slot `VOICE_SRC` + `SfxLayer`).
- Tidak ada cue ganda (`s` + `off` + `name` sama), dan semua `from + frames` <= 4079.
- `git diff src/dna.tsx` hanya menunjukkan penambahan (import `Sequence`, import `sfxMeta`, `ENABLE_SFX`, blok SFX, satu baris `<SfxLayer />`). Tidak ada baris lama yang berubah selain import `remotion`.
- `npx remotion compositions` tetap menampilkan `Dna` dengan durasi 4079 frame, 30 fps, 1080x1920.

### 4) Laporan akhir singkat (Indonesia)

- jumlah cue per bagian dan total (harus 9 / 16 / 17 / 20 / 22 / 24 = 108)
- daftar 11 file di `public/sfx`
- hasil grep, tsc, eslint, compositions
