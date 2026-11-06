# TUGAS: Tambah sound effect ke composition KURS (Pasar Empat Nilai)

Tambah SFX ke `src/kurs.tsx`. JANGAN ubah visual, subtitle (`CUES`), penanda waktu di adegan (`HookScene`, `Sec2` sampai `Sec6`, props `at`, konstanta detik), Kepo (`KEPO`), header (`CHIPS`), konstanta (`KURS_FPS`, `KURS_WIDTH`, `KURS_HEIGHT`, `KURS_DURATION`, `VOICE_OVER_SRC`), atau nama export (`Kurs`, `KURS_*`, default export). Jangan render video.

Konteks composition: 1080x1920, 30 fps, 3210 frame (107 detik). Waktu di file ini memakai DETIK global (sama seperti `CUES` dan nilai `at` di tiap adegan). TIDAK ada helper `t(detik)` di level modul (di dalam `Kurs`, `t` adalah variabel lokal detik), jadi frame dihitung dengan `Math.round(c.s * KURS_FPS)`. Konstanta frame rate di file ini bernama `KURS_FPS` (bukan `FPS`). Tidak ada `SCENES`, `SECTIONS`, `cue(id)`, atau `SceneIn`, jadi jangan membuatnya. Komponen subtitle bernama `Subtitle` (tunggal, menerima prop `t`).

## ATURAN

- Semua SFX dirender di SATU komponen `SfxLayer`, dipasang SEKALI di root `Kurs`, tepat sebelum `<Subtitle t={t} />`. Jangan taruh audio di dalam adegan.
- Baris `{VOICE_OVER_SRC ? <Audio src={staticFile(VOICE_OVER_SRC)} /> : null}` yang sudah ada di `Kurs` JANGAN diubah atau dihapus (itu slot voice over, nilainya `""` sehingga tidak merender apa pun).
- Jangan ubah isi generator `gen-sfx-dna.mjs` yang saya lampirkan (pakai apa adanya; output-nya deterministik, jadi aman menimpa file sfx yang sudah ada di `public/sfx/` dari proyek lain, dan membuat `src/sfx-meta.json`).
- Jangan sentuh file lain, kecuali yang disebut di sini (`src/kurs.tsx`, `scripts/`, `public/sfx/`, `src/sfx-meta.json`, dan `tsconfig.json` hanya bila perlu `resolveJsonModule`).
- Gaya kode mengikuti `src/kurs.tsx`: indentasi 2 spasi, tanda kutip ganda.
- Setelah selesai, `grep -n "<Audio" src/kurs.tsx` harus tepat 2 baris: slot `VOICE_OVER_SRC` yang sudah ada + 1 di `SfxLayer`.

## LANGKAH

### 1) Siapkan & jalankan generator

Taruh lampiran `gen-sfx-dna.mjs` di `scripts/` sebagai `scripts/gen-sfx-dna.mjs` (isi tidak diubah sama sekali), lalu dari root project:

```
node scripts/gen-sfx-dna.mjs
```

Hasil: 11 file di `public/sfx/` (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power) dan `src/sfx-meta.json`. Jalankan walaupun `public/sfx/` sudah berisi file dengan nama yang sama, karena `src/sfx-meta.json` wajib ada dan ikut dibuat oleh generator. Kalau gagal, STOP dan lapor.

### 2) Edit src/kurs.tsx

a) Pada import `remotion` yang sudah ada (satu baris), tambahkan `Sequence` (urutan alfabet, setelah `Easing`):

```tsx
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
```

b) Tambahkan di bawah import `loadFont` yang sudah ada:

```tsx
import sfxMeta from "./sfx-meta.json";
```

c) Di bawah `const VOICE_OVER_SRC = ...;` (bagian KONFIGURASI) tambahkan:

```tsx
const ENABLE_SFX = true;
```

d) Tambahkan blok berikut tepat di atas komentar `KOMPOSISI UTAMA` (setelah komponen `Sec6`). `KURS_FPS` sudah terdefinisi di file.

```tsx
/* ============================================================================
 * SOUND EFFECT  (satu layer, dipasang sekali di root)
 * s   = detik global (acuan: CUES dan nilai `at` di HookScene, Sec2 ... Sec6)
 * off = geser dalam frame (boleh negatif)
 * vol = 0..1 per efek; SFX_MASTER mengatur keras-pelan semuanya
 * ========================================================================== */
type SfxName =
  | "pop" | "whoosh" | "tick" | "ding" | "swap" | "charge"
  | "zap" | "sparkle" | "blip" | "lock" | "power";

type SfxCue = { s: number; off: number; name: SfxName; vol: number };

const SFX_MASTER = 1;

const SFX_CUES: SfxCue[] = [
  // 01 HOOK (00:00-00:08)
  { s: 0.05, off: 0, name: "pop", vol: 0.2 }, // Gerai Emas muncul
  { s: 0.15, off: 0, name: "pop", vol: 0.2 }, // Gerai Perak muncul
  { s: 0.2, off: 0, name: "pop", vol: 0.3 }, // Kepo muncul (penasaran)
  { s: 0.25, off: 0, name: "pop", vol: 0.2 }, // Alun-alun Perunggu muncul
  { s: 0.35, off: 0, name: "pop", vol: 0.2 }, // Gerai Kerikil muncul
  { s: 0.9, off: 0, name: "whoosh", vol: 0.18 }, // papan IDR/USD turun
  { s: 1.1, off: 0, name: "zap", vol: 0.22 }, // Rupiah melemah (merah muda)
  { s: 2.9, off: 0, name: "whoosh", vol: 0.18 }, // papan EUR/USD turun
  { s: 3.2, off: 0, name: "ding", vol: 0.2 }, // Euro stabil
  { s: 5.8, off: 0, name: "whoosh", vol: 0.2 }, // kamera zoom, papan menghilang
  { s: 6.36, off: 0, name: "pop", vol: 0.3 }, // judul Pasar Empat Nilai
  { s: 7.3, off: 0, name: "sparkle", vol: 0.2 }, // coba kita bikin pasar sendiri
  // 02 DUNIA ANALOGI (00:08-00:28)
  { s: 8.4, off: 0, name: "whoosh", vol: 0.22 }, // pergantian adegan
  { s: 8.9, off: 0, name: "tick", vol: 0.15 }, // slot kosong 1
  { s: 9.15, off: 0, name: "tick", vol: 0.15 }, // slot kosong 2
  { s: 9.4, off: 0, name: "tick", vol: 0.15 }, // slot kosong 3
  { s: 9.65, off: 0, name: "tick", vol: 0.15 }, // slot kosong 4
  { s: 10.82, off: 0, name: "pop", vol: 0.3 }, // karakter Emas
  { s: 13.0, off: 0, name: "pop", vol: 0.3 }, // karakter Perak
  { s: 15.5, off: 0, name: "pop", vol: 0.3 }, // karakter Perunggu
  { s: 17.78, off: 0, name: "pop", vol: 0.3 }, // karakter Kerikil
  { s: 19.9, off: 0, name: "whoosh", vol: 0.2 }, // karakter keluar, meja pertukaran masuk
  { s: 20.22, off: 0, name: "pop", vol: 0.25 }, // baris 1 Emas
  { s: 21.5, off: 0, name: "tick", vol: 0.12 }, // perunggu 1/4
  { s: 21.68, off: 0, name: "tick", vol: 0.12 }, // perunggu 2/4
  { s: 21.86, off: 0, name: "tick", vol: 0.12 }, // perunggu 3/4
  { s: 22.04, off: 0, name: "tick", vol: 0.12 }, // perunggu 4/4
  { s: 23.72, off: 0, name: "pop", vol: 0.25 }, // baris 2 Perak
  { s: 24.2, off: 0, name: "tick", vol: 0.12 }, // perunggu 1/2
  { s: 24.4, off: 0, name: "tick", vol: 0.12 }, // perunggu 2/2
  { s: 25.44, off: 0, name: "pop", vol: 0.25 }, // baris 3 Perunggu
  { s: 26.3, off: 0, name: "tick", vol: 0.1 }, // kerikil (tiap butir ke-2) 1/5
  { s: 26.54, off: 0, name: "tick", vol: 0.1 }, // kerikil (tiap butir ke-2) 2/5
  { s: 26.78, off: 0, name: "tick", vol: 0.1 }, // kerikil (tiap butir ke-2) 3/5
  { s: 27.02, off: 0, name: "tick", vol: 0.1 }, // kerikil (tiap butir ke-2) 4/5
  { s: 27.26, off: 0, name: "tick", vol: 0.1 }, // kerikil (tiap butir ke-2) 5/5
  // 03 KERIKIL MENGUAT (00:28-00:54)
  { s: 28.0, off: 0, name: "whoosh", vol: 0.22 }, // pergantian adegan
  { s: 28.1, off: 0, name: "pop", vol: 0.22 }, // baris Perunggu = 10 kerikil
  { s: 28.3, off: 0, name: "pop", vol: 0.3 }, // karakter Kerikil besar
  { s: 28.5, off: 0, name: "sparkle", vol: 0.2 }, // kerikil mendadak berharga
  { s: 28.5, off: 0, name: "tick", vol: 0.1 }, // 10 kerikil muncul (tiap butir ke-2) 1/5
  { s: 28.66, off: 0, name: "tick", vol: 0.1 }, // 10 kerikil muncul (tiap butir ke-2) 2/5
  { s: 28.82, off: 0, name: "tick", vol: 0.1 }, // 10 kerikil muncul (tiap butir ke-2) 3/5
  { s: 28.98, off: 0, name: "tick", vol: 0.1 }, // 10 kerikil muncul (tiap butir ke-2) 4/5
  { s: 29.14, off: 0, name: "tick", vol: 0.1 }, // 10 kerikil muncul (tiap butir ke-2) 5/5
  { s: 33.74, off: 0, name: "swap", vol: 0.25 }, // 10 kerikil jadi 5
  { s: 33.9, off: 0, name: "power", vol: 0.2 }, // kerikil membesar / menguat
  { s: 35.3, off: 0, name: "ding", vol: 0.28 }, // lencana MENGUAT 2x
  { s: 37.5, off: 0, name: "pop", vol: 0.3 }, // Kepo kaget
  { s: 37.64, off: 0, name: "zap", vol: 0.22 }, // Tapi tunggu!
  { s: 37.64, off: 0, name: "pop", vol: 0.2 }, // baris Emas
  { s: 37.9, off: 0, name: "pop", vol: 0.2 }, // baris Perak
  { s: 38.4, off: 0, name: "blip", vol: 0.2 }, // lencana ? (Emas)
  { s: 38.6, off: 0, name: "blip", vol: 0.15 }, // lencana ? (Perak)
  { s: 41.48, off: 0, name: "lock", vol: 0.25 }, // Tidak! lencana TETAP (Emas)
  { s: 41.7, off: 0, name: "tick", vol: 0.15 }, // lencana TETAP (Perak)
  { s: 44.96, off: 0, name: "pop", vol: 0.22 }, // chip Kalau ditukar ke kerikil
  { s: 48.28, off: 0, name: "pop", vol: 0.25 }, // baris Emas = 20 kerikil
  { s: 49.0, off: 0, name: "tick", vol: 0.1 }, // kerikil muncul 1/4
  { s: 49.2, off: 0, name: "tick", vol: 0.1 }, // kerikil muncul 2/4
  { s: 49.4, off: 0, name: "tick", vol: 0.1 }, // kerikil muncul 3/4
  { s: 49.8, off: 0, name: "tick", vol: 0.1 }, // kerikil muncul 4/4
  { s: 49.6, off: 0, name: "ding", vol: 0.25 }, // angka 20
  { s: 52.72, off: 0, name: "pop", vol: 0.25 }, // baris Perak = 10 kerikil
  { s: 53.2, off: 0, name: "tick", vol: 0.1 }, // kerikil muncul 1/2
  { s: 53.4, off: 0, name: "tick", vol: 0.1 }, // kerikil muncul 2/2
  { s: 53.6, off: 0, name: "ding", vol: 0.25 }, // angka 10
  // 04 PERUNGGU MENGUAT GLOBAL (00:54-01:18)
  { s: 54.6, off: 0, name: "whoosh", vol: 0.22 }, // pergantian adegan, skenario baru
  { s: 54.8, off: 0, name: "pop", vol: 0.25 }, // Perunggu di alun-alun
  { s: 54.9, off: 0, name: "pop", vol: 0.22 }, // baris Emas = 4 perunggu
  { s: 55.1, off: 0, name: "tick", vol: 0.12 }, // perunggu muncul
  { s: 55.2, off: 0, name: "pop", vol: 0.22 }, // baris Perak = 2 perunggu
  { s: 55.4, off: 0, name: "tick", vol: 0.12 }, // perunggu muncul
  { s: 55.5, off: 0, name: "pop", vol: 0.22 }, // baris Perunggu = 10 kerikil
  { s: 55.7, off: 0, name: "tick", vol: 0.12 }, // kerikil muncul
  { s: 56.1, off: 0, name: "whoosh", vol: 0.2 }, // pembeli berdatangan
  { s: 57.5, off: 0, name: "whoosh", vol: 0.2 }, // pembeli makin ramai
  { s: 58.0, off: 0, name: "pop", vol: 0.3 }, // chip DIBURU!
  { s: 58.9, off: 0, name: "power", vol: 0.3 }, // Perunggu bersinar (momen wow)
  { s: 58.95, off: 0, name: "sparkle", vol: 0.25 }, // kilau Perunggu
  { s: 60.4, off: 0, name: "zap", vol: 0.25 }, // Emas 4 jadi 2 perunggu
  { s: 63.66, off: 0, name: "zap", vol: 0.22 }, // Perak 2 jadi 1 perunggu
  { s: 66.0, off: 0, name: "ding", vol: 0.28 }, // Perunggu = 20 kerikil
  { s: 66.0, off: 0, name: "pop", vol: 0.2 }, // lencana MENGUAT
  { s: 67.4, off: 0, name: "whoosh", vol: 0.2 }, // pembeli bubar
  { s: 67.7, off: 0, name: "pop", vol: 0.3 }, // Kepo mikir
  { s: 69.0, off: 0, name: "pop", vol: 0.22 }, // kartu Emas
  { s: 69.2, off: 0, name: "zap", vol: 0.22 }, // setengah nilai Emas
  { s: 69.5, off: 0, name: "pop", vol: 0.22 }, // kartu Perak
  { s: 69.5, off: 0, name: "zap", vol: 0.22 }, // setengah nilai Perak
  { s: 72.6, off: 0, name: "whoosh", vol: 0.2 }, // beralih ke perbandingan
  { s: 72.8, off: 0, name: "pop", vol: 0.25 }, // Emas
  { s: 73.2, off: 0, name: "blip", vol: 0.2 }, // tanda sama dengan
  { s: 73.5, off: 0, name: "pop", vol: 0.25 }, // Perak pertama
  { s: 73.8, off: 0, name: "pop", vol: 0.25 }, // Perak kedua
  { s: 74.3, off: 0, name: "ding", vol: 0.3 }, // rasio 1 : 2 tetap
  { s: 75.9, off: 0, name: "swap", vol: 0.22 }, // 1 emas ditukar 2 perak
  { s: 77.5, off: 0, name: "lock", vol: 0.22 }, // dua perak terkunci
  // 05 MEMBONGKAR RAHASIA (01:18-01:38)
  { s: 78.6, off: 0, name: "whoosh", vol: 0.25 }, // pergantian adegan
  { s: 78.9, off: 0, name: "pop", vol: 0.3 }, // Emas dan Perunggu (EUR/USD)
  { s: 79.3, off: 0, name: "blip", vol: 0.2 }, // garis penghubung EUR/USD
  { s: 79.6, off: 0, name: "tick", vol: 0.15 }, // chip stabil
  { s: 80.1, off: 0, name: "pop", vol: 0.3 }, // Kerikil dan Perunggu (IDR/USD)
  { s: 80.5, off: 0, name: "blip", vol: 0.2 }, // garis penghubung IDR/USD
  { s: 80.8, off: 0, name: "zap", vol: 0.22 }, // chip melemah
  { s: 82.2, off: 0, name: "whoosh", vol: 0.22 }, // pasangan baru
  { s: 82.4, off: 0, name: "pop", vol: 0.25 }, // Perak
  { s: 82.6, off: 0, name: "pop", vol: 0.25 }, // Emas
  { s: 83.0, off: 0, name: "blip", vol: 0.2 }, // dibandingkan
  { s: 85.05, off: 0, name: "zap", vol: 0.28 }, // dicoret: sendirian
  { s: 85.2, off: 0, name: "pop", vol: 0.2 }, // chip sendirian
  { s: 87.7, off: 0, name: "whoosh", vol: 0.22 }, // pergantian ke cross-rate
  { s: 87.85, off: 0, name: "pop", vol: 0.3 }, // judul CROSS-RATE
  { s: 87.85, off: 0, name: "ding", vol: 0.28 }, // istilah cross-rate
  { s: 88.1, off: 0, name: "pop", vol: 0.22 }, // Emas
  { s: 88.3, off: 0, name: "pop", vol: 0.22 }, // Perunggu
  { s: 88.5, off: 0, name: "pop", vol: 0.22 }, // Perak
  { s: 88.6, off: 0, name: "blip", vol: 0.18 }, // garis Emas-Perunggu 1 : 4
  { s: 88.8, off: 0, name: "blip", vol: 0.18 }, // garis Perunggu-Perak 1 : 2
  { s: 89.2, off: 0, name: "whoosh", vol: 0.18 }, // busur Emas ke Perak
  { s: 89.4, off: 0, name: "ding", vol: 0.28 }, // Emas : Perak = 1 : 2
  { s: 90.4, off: 0, name: "whoosh", vol: 0.22 }, // pergantian ke segitiga
  { s: 90.6, off: 0, name: "pop", vol: 0.22 }, // Gerai Emas
  { s: 90.7, off: 0, name: "blip", vol: 0.15 }, // garis segitiga
  { s: 90.9, off: 0, name: "pop", vol: 0.22 }, // Gerai Perak
  { s: 91.2, off: 0, name: "pop", vol: 0.22 }, // Gerai Perunggu
  { s: 91.6, off: 0, name: "pop", vol: 0.2 }, // benda pembawa muncul
  { s: 92.3, off: 0, name: "zap", vol: 0.28 }, // Selisih! harga tidak seimbang
  { s: 93.74, off: 0, name: "whoosh", vol: 0.2 }, // benda mulai bergerak
  { s: 93.74, off: 0, name: "pop", vol: 0.2 }, // label 1 Emas = 3 Perak
  { s: 94.55, off: 0, name: "swap", vol: 0.22 }, // tukar di Gerai Perak
  { s: 94.85, off: 0, name: "pop", vol: 0.2 }, // label 3 Perak = 6 Perunggu
  { s: 95.65, off: 0, name: "swap", vol: 0.22 }, // tukar di Gerai Perunggu
  { s: 95.95, off: 0, name: "pop", vol: 0.2 }, // label 6 Perunggu = 1,5 Emas
  { s: 96.34, off: 0, name: "pop", vol: 0.22 }, // judul Triangular Arbitrage
  { s: 96.75, off: 0, name: "swap", vol: 0.22 }, // tukar di Gerai Emas
  { s: 96.85, off: 0, name: "ding", vol: 0.3 }, // hasil +0,5 Emas
  { s: 96.95, off: 0, name: "sparkle", vol: 0.25 }, // kilau hasil
  // 06 PENUTUP (01:38-01:47) - lebih lembut
  { s: 98.35, off: 0, name: "whoosh", vol: 0.2 }, // pergantian adegan
  { s: 98.4, off: 0, name: "pop", vol: 0.3 }, // Kepo muncul
  { s: 98.7, off: 0, name: "pop", vol: 0.2 }, // karakter Emas
  { s: 98.95, off: 0, name: "pop", vol: 0.2 }, // karakter Perak
  { s: 99.2, off: 0, name: "pop", vol: 0.2 }, // karakter Perunggu
  { s: 99.45, off: 0, name: "pop", vol: 0.2 }, // karakter Kerikil
  { s: 100.55, off: 0, name: "pop", vol: 0.22 }, // teks Siapa yang menguat?
  { s: 103.84, off: 0, name: "ding", vol: 0.28 }, // Menguat terhadap siapa?
  { s: 103.9, off: 0, name: "sparkle", vol: 0.25 }, // Kepo paham
  { s: 105.5, off: 0, name: "pop", vol: 0.25 }, // tombol follow
  { s: 105.5, off: 0, name: "sparkle", vol: 0.25 }, // penutup
];

const sfxFrame = (c: SfxCue): number => Math.round(c.s * KURS_FPS) + c.off;

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

e) Di komponen `Kurs` pasang layer tepat sebelum `<Subtitle t={t} />` (setelah `</div>` yang membungkus `HookScene` ... `KepoLayer`):

```tsx
{ENABLE_SFX && <SfxLayer />}
<Subtitle t={t} />
```

### 3) Cek (tanpa render)

- `npx tsc --noEmit` dan `npx eslint src/kurs.tsx` bersih. Kalau tsc protes soal import JSON, pastikan `"resolveJsonModule": true` di `tsconfig.json`.
- `grep -n "<Audio" src/kurs.tsx` = tepat 2 baris (slot `VOICE_OVER_SRC` + `SfxLayer`).
- Tidak ada cue ganda (`s` + `off` + `name` sama), dan semua `from + frames` <= 3210.
- `git diff src/kurs.tsx` hanya menunjukkan penambahan (`Sequence` di import `remotion`, import `sfxMeta`, `ENABLE_SFX`, blok SFX, satu baris `<SfxLayer />`). Tidak ada baris lama yang berubah selain import `remotion`.
- `npx remotion compositions` tetap menampilkan `Kurs` dengan durasi 3210 frame, 30 fps, 1080x1920.

### 4) Laporan akhir singkat (Indonesia)

- jumlah cue per bagian dan total (harus 12 / 24 / 31 / 31 / 40 / 11 = 149)
- daftar 11 file di `public/sfx`
- hasil grep, tsc, eslint, compositions

## CATATAN DESAIN (untuk referensi, jangan diubah kecuali diminta)

- Volume: pop 0.2-0.3, whoosh 0.18-0.25, tick 0.1-0.15, ding 0.2-0.3, zap 0.22-0.3, power 0.2-0.3. Bagian 06 sengaja lebih lembut.
- `zap` dipakai untuk makna buruk (Rupiah melemah, Emas/Perak kehilangan nilai, "Selisih!", "sendirian"), sejalan dengan warna merah muda di visual.
- Momen "wow" tunggal video ada di 58.9 s (Perunggu diburu: `power` 0.3 + `sparkle`). Jangan tambah efek sekeras itu di tempat lain.
- `tick` untuk deretan benda yang muncul bertahap: satu tick per benda bila jumlahnya kecil, tiap butir ke-2 untuk 10 kerikil supaya tidak ramai.
- Tiga `swap` di 94.55 / 95.65 / 96.75 menandai tiga proses pertukaran triangular arbitrage, dan `ding` 0.3 di 96.85 menandai selisih +0,5 Emas.
- Kalau SFX terasa terlalu cepat/lambat terhadap gambar, geser lewat `off` (frame) per cue, atau ubah `SFX_MASTER`. Jangan ubah `s`.
