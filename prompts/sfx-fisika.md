# TUGAS: Tambah sound effect ke composition FISIKA (Fisika Jatuh Bebas, @rumahpenasaran)

Tambah SFX ke `src/fisika.tsx`. JANGAN ubah visual, subtitle (`SUBTITLES`), timing scene (`SECTIONS`), konstanta (`FISIKA_FPS`, `FISIKA_WIDTH`, `FISIKA_HEIGHT`, `FISIKA_DURATION`, `FPS`, `END`), palet `C`, atau nama export (`Fisika`, `FISIKA_*`, default export). Jangan render video.

Konteks composition: 1080x1920, 30 fps, 3114 frame (103,8 detik). Waktu di file ini memakai DETIK global (sama seperti `SUBTITLES` dan `SECTIONS`). Helper modul `sf(detik)` sudah ada (`Math.round(sec * FPS)`), dan `FPS` juga sudah ada. Tidak ada voice over dan tidak ada `VOICE_SRC` di file ini, jadi jangan membuatnya. Komponen subtitle bernama `Subtitles` (jamak, tanpa prop). Indentasi file ini memakai TAB dan tanda kutip TUNGGAL (`'`), tanpa spasi di dalam kurung kurawal (`{a, b}`).

## ATURAN

- Semua SFX dirender di SATU komponen `SfxLayer`, dipasang SEKALI di root `Fisika`, tepat sebelum `<Subtitles />`. Jangan taruh audio di dalam `Scene` / `S1`..`S7`.
- Jangan ubah isi `scripts/gen-sfx-dna.mjs` yang sudah ada (pakai apa adanya; output-nya deterministik).
- Jangan sentuh file lain, kecuali yang disebut di sini (`src/fisika.tsx`, `scripts/`, `public/sfx/`, `src/sfx-meta.json`, dan `tsconfig.json` hanya bila perlu `resolveJsonModule`).
- Gaya kode mengikuti `src/fisika.tsx`: TAB, tanda kutip tunggal.
- Komentar header file (baris 1-29) berisi teks `<Audio src=...>` sebagai contoh. JANGAN diubah. Karena itu `grep -n "<Audio" src/fisika.tsx` akan menampilkan tepat 2 baris: 1 di komentar header (sudah ada) + 1 di `SfxLayer`. Tidak boleh ada `<Audio` lain.

## LANGKAH

### 1) Cek aset SFX (generator TIDAK perlu dijalankan ulang)

11 file sudah ada di `public/sfx/` (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power; semua `.wav`) dan generator sudah ada di `scripts/gen-sfx-dna.mjs`. Jangan ubah, salin, atau ganti nama generator itu.

Yang perlu dicek hanya `src/sfx-meta.json`:

- Kalau file itu ada dan berisi 11 key (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power), masing-masing dengan `frames`, LANGSUNG ke langkah 2.
- Kalau file itu tidak ada atau key-nya kurang, jalankan dari root project: `node scripts/gen-sfx-dna.mjs` (output deterministik, aman menimpa). Kalau gagal, STOP dan lapor.

### 2) Edit src/fisika.tsx

a) Ganti HANYA import `remotion` yang sudah ada (satu baris). `Sequence` sudah ada, tambahkan `Audio` dan `staticFile`:

```tsx
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
```

b) Tambahkan di bawah import `loadFont` yang sudah ada:

```tsx
import sfxMeta from './sfx-meta.json';
```

c) Di bawah `const END = FISIKA_DURATION / FPS;` tambahkan:

```tsx
const ENABLE_SFX = true;
```

d) Tambahkan blok berikut tepat di atas komentar `KOMPOSISI UTAMA` (setelah komponen `Subtitles`). Pakai TAB untuk indentasi (blok di bawah ditulis dengan tab).

```tsx
// ---------------------------------------------------------------------------
// SOUND EFFECT  (satu layer, dipasang sekali di root)
// s   = detik global (acuan: SECTIONS, SUBTITLES, dan komentar di tiap adegan)
// off = geser dalam frame (boleh negatif)
// vol = 0..1 per efek; SFX_MASTER mengatur keras-pelan semuanya
// ---------------------------------------------------------------------------
type SfxName =
	| 'pop' | 'whoosh' | 'tick' | 'ding' | 'swap' | 'charge'
	| 'zap' | 'sparkle' | 'blip' | 'lock' | 'power';

type SfxCue = {s: number; off: number; name: SfxName; vol: number};

const SFX_MASTER = 1;

const SFX_CUES: SfxCue[] = [
	// 01 HOOK (00:00-00:10)
	{s: 0.15, off: 0, name: 'pop', vol: 0.25}, // pendaki muncul
	{s: 0.4, off: 0, name: 'pop', vol: 0.3}, // Kepo muncul
	{s: 4.4, off: 0, name: 'whoosh', vol: 0.2}, // kamera zoom ke tebing
	{s: 8.0, off: 0, name: 'pop', vol: 0.22}, // judul Cuma modal stopwatch
	// 02 EKSPERIMEN (00:10-00:23)
	{s: 9.9, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 10.4, off: 0, name: 'pop', vol: 0.25}, // pendaki masuk
	{s: 10.7, off: 0, name: 'pop', vol: 0.25}, // Kepo masuk
	{s: 13.2, off: 0, name: 'pop', vol: 0.2}, // batu muncul di tangan
	{s: 14.0, off: 0, name: 'pop', vol: 0.25}, // kartu stopwatch
	{s: 14.63, off: 0, name: 'tick', vol: 0.15}, // batu dilepas, stopwatch jalan
	{s: 16.06, off: 0, name: 'tick', vol: 0.15}, // stopwatch berdetak
	{s: 17.49, off: 0, name: 'tick', vol: 0.15}, // stopwatch berdetak
	{s: 18.4, off: 0, name: 'whoosh', vol: 0.2}, // batu makin cepat
	{s: 18.92, off: 0, name: 'pop', vol: 0.35}, // DUK! batu menghantam dasar
	{s: 19.7, off: 0, name: 'pop', vol: 0.22}, // judul 3 detik berapa meter
	{s: 19.95, off: 0, name: 'blip', vol: 0.18}, // tanda tanya ? meter
	// 03 MISTERI ANGKA LIMA (00:23-00:40)
	{s: 23.0, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 23.6, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 24.3, off: 0, name: 'pop', vol: 0.2}, // chip waktu = 3 detik
	{s: 26.3, off: 0, name: 'tick', vol: 0.15}, // angka 3
	{s: 27.4, off: 0, name: 'tick', vol: 0.15}, // angka 3 kedua
	{s: 28.9, off: 0, name: 'tick', vol: 0.15}, // angka 5
	{s: 30.2, off: 0, name: 'blip', vol: 0.18}, // 3 x 3 = 9
	{s: 33.0, off: 0, name: 'blip', vol: 0.18}, // 9 x 5 = ?
	{s: 35.2, off: 0, name: 'ding', vol: 0.3}, // 45 METER
	{s: 35.3, off: 0, name: 'pop', vol: 0.22}, // Kepo kaget
	// 04 KENAPA WAKTU DIKUADRATKAN (00:40-00:59)
	{s: 40.0, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 40.8, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 41.0, off: 0, name: 'pop', vol: 0.2}, // batu muncul
	{s: 41.2, off: 0, name: 'tick', vol: 0.15}, // posisi 0 s
	{s: 45.9, off: 0, name: 'whoosh', vol: 0.2}, // panah gravitasi, batu mulai jatuh
	{s: 48.2, off: 0, name: 'tick', vol: 0.15}, // 1 s, 10 m/s
	{s: 50.4, off: 0, name: 'tick', vol: 0.15}, // 2 s, 20 m/s
	{s: 52.4, off: 0, name: 'blip', vol: 0.18}, // +5 m
	{s: 52.6, off: 0, name: 'tick', vol: 0.15}, // 3 s, 30 m/s
	{s: 53.4, off: 0, name: 'blip', vol: 0.18}, // +15 m
	{s: 54.3, off: 0, name: 'blip', vol: 0.18}, // +25 m
	{s: 55.4, off: 0, name: 'whoosh', vol: 0.2}, // layar menggelap, kartu rumus
	{s: 55.6, off: 0, name: 'pop', vol: 0.28}, // kartu h = 5 x t kuadrat
	{s: 56.6, off: 0, name: 'ding', vol: 0.28}, // Kepo paham
	{s: 57.5, off: 0, name: 'zap', vol: 0.28}, // coretan bukan 5 x t
	// 05 MELURUSKAN MISKONSEPSI (00:59-01:16)
	{s: 59.4, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 60.2, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 60.4, off: 0, name: 'pop', vol: 0.22}, // batu berat dan ringan
	{s: 60.6, off: 0, name: 'blip', vol: 0.18}, // tanda tanya keraguan
	{s: 63.9, off: 0, name: 'pop', vol: 0.25}, // kedua batu dijatuhkan, Kepo kaget
	{s: 64.9, off: 0, name: 'pop', vol: 0.2}, // chip tanpa hambatan udara
	{s: 65.4, off: 0, name: 'blip', vol: 0.18}, // garis sejajar, tanda sama dengan
	{s: 67.0, off: 0, name: 'whoosh', vol: 0.2}, // batu makin cepat
	{s: 67.4, off: 0, name: 'pop', vol: 0.3}, // dua batu mendarat
	{s: 69.0, off: 0, name: 'ding', vol: 0.28}, // a = g, Kepo paham
	{s: 69.1, off: 0, name: 'pop', vol: 0.2}, // chip massa beda percepatan sama
	{s: 70.6, off: 0, name: 'whoosh', vol: 0.2}, // jatuhan kedua dimulai
	{s: 72.3, off: 0, name: 'tick', vol: 0.15}, // garis tinggi sama
	{s: 74.4, off: 0, name: 'whoosh', vol: 0.2}, // batu makin cepat
	{s: 74.8, off: 0, name: 'pop', vol: 0.3}, // dua batu mendarat bersamaan
	{s: 74.9, off: 0, name: 'ding', vol: 0.3}, // TIBA BERSAMAAN
	{s: 75.0, off: 0, name: 'sparkle', vol: 0.22},
	// 06 DARI MANA ANGKA LIMA (01:16-01:31)
	{s: 76.2, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 76.7, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 78.4, off: 0, name: 'tick', vol: 0.15}, // label gravitasi bumi
	{s: 79.8, off: 0, name: 'pop', vol: 0.22}, // g = 9,8 m/s2
	{s: 82.8, off: 0, name: 'tick', vol: 0.15}, // label setengahnya
	{s: 83.2, off: 0, name: 'pop', vol: 0.22}, // 9,8 / 2 = ?
	{s: 84.2, off: 0, name: 'blip', vol: 0.18}, // hasil 4,9
	{s: 84.9, off: 0, name: 'tick', vol: 0.15}, // label dibulatkan
	{s: 85.2, off: 0, name: 'pop', vol: 0.22}, // 4,9 jadi 5
	{s: 86.0, off: 0, name: 'lock', vol: 0.22}, // cincin menandai angka 5
	{s: 88.1, off: 0, name: 'whoosh', vol: 0.2}, // layar menggelap
	{s: 88.3, off: 0, name: 'pop', vol: 0.28}, // kartu h = 5 x t kuadrat
	{s: 88.5, off: 0, name: 'ding', vol: 0.3}, // rumus praktis
	{s: 88.6, off: 0, name: 'sparkle', vol: 0.22},
	// 07 PENUTUP (01:31-01:43) - lebih lembut
	{s: 91.1, off: 0, name: 'whoosh', vol: 0.22}, // pergantian scene
	{s: 91.6, off: 0, name: 'pop', vol: 0.18}, // judul hasilnya hanya perkiraan
	{s: 93.5, off: 0, name: 'whoosh', vol: 0.15}, // garis angin hambatan udara
	{s: 93.6, off: 0, name: 'tick', vol: 0.15}, // chip hambatan udara
	{s: 95.2, off: 0, name: 'tick', vol: 0.15}, // chip ketepatan stopwatch
	{s: 97.9, off: 0, name: 'ding', vol: 0.25}, // Kepo paham
	{s: 100.3, off: 0, name: 'pop', vol: 0.22}, // logo Rumah Penasaran
	{s: 100.4, off: 0, name: 'sparkle', vol: 0.22},
	{s: 102.1, off: 0, name: 'sparkle', vol: 0.2}, // Besok penasaran apa lagi
];

const sfxFrame = (c: SfxCue): number => sf(c.s) + c.off;

const SfxLayer: React.FC = () => (
	<>
		{SFX_CUES.map((c, i) => {
			const from = sfxFrame(c);
			const frames = (sfxMeta as Record<string, {frames: number}>)[c.name].frames + 2;
			return (
				<Sequence
					key={`${c.s}-${c.off}-${c.name}-${i}`}
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

e) Di komponen `Fisika` pasang layer tepat sebelum `<Subtitles />` (setelah `<Scene>` bagian 7). Komentar `{/* SUBTITLE ... */}` yang sudah ada tetap di tempatnya, sisipkan layer di antara `</Scene>` terakhir dan komentar itu:

```tsx
{ENABLE_SFX && <SfxLayer />}
{/* SUBTITLE (selalu di atas semua adegan) */}
<Subtitles />
```

### 3) Cek (tanpa render)

- `npx tsc --noEmit` dan `npx eslint src/fisika.tsx` bersih. Kalau tsc protes soal import JSON, pastikan `"resolveJsonModule": true` di `tsconfig.json`. Kalau ada eslint/prettier yang hanya memprotes format blok baru (mis. panjang baris atau susunan union `SfxName`), rapikan hanya blok SFX baru, jangan menyentuh kode lama.
- `grep -n "<Audio" src/fisika.tsx` = tepat 2 baris (komentar header baris ~27 + `SfxLayer`).
- Tidak ada cue ganda (`s` + `off` + `name` sama), dan semua `from + frames` <= 3114 (cue terakhir `sparkle` di 102.1 s: 3063 + 42 + 2 = 3107).
- `git diff src/fisika.tsx` hanya menunjukkan penambahan (import `sfxMeta`, `ENABLE_SFX`, blok SFX, satu baris `<SfxLayer />`) dan satu perubahan pada import `remotion` (tambah `Audio`, `staticFile`). Tidak ada baris lama lain yang berubah.
- `npx remotion compositions` tetap menampilkan `Fisika` dengan durasi 3114 frame, 30 fps, 1080x1920.

### 4) Laporan akhir singkat (Indonesia)

- jumlah cue per bagian dan total (harus 4 / 12 / 10 / 15 / 17 / 14 / 9 = 81)
- daftar 11 file di `public/sfx`
- hasil grep, tsc, eslint, compositions
