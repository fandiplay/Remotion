# TUGAS: Tambah sound effect ke composition Sitara

Tambah SFX ke `src/sitara.tsx`. JANGAN ubah visual, subtitle (`CUES`), timing scene (`SCENES`), konstanta `SITARA`, atau nama export (`Sitara`, `SITARA`, default export). Jangan render video.

Konteks composition: 1080x1920, 30 fps, 1350 frame (45 detik), tanpa voice over. Waktu di file ini memakai DETIK global (sama seperti `CUES` dan `SCENES`), dan helper `t(detik)` sudah ada untuk mengubahnya ke frame. Tidak ada `SECTIONS`, `SCRIPT`, atau `cue(id)` di file ini, jadi jangan membuatnya.

## ATURAN

- Semua SFX dirender di SATU komponen `SfxLayer`, dipasang SEKALI di root `Sitara`, tepat sebelum `<Subtitles />`. Jangan taruh audio di dalam scene.
- Jangan ubah isi `scripts/gen-sfx-sitara.mjs` (file generator yang saya lampirkan, pakai apa adanya; output-nya deterministik, jadi aman menimpa file sfx yang sudah ada).
- Jangan sentuh file lain, kecuali yang disebut di sini.
- Setelah selesai, `grep -n "<Audio" src/sitara.tsx` harus tepat 1 baris (di `SfxLayer`).

## LANGKAH

### 1) Siapkan & jalankan generator

Taruh `gen-sfx-sitara.mjs` di `scripts/`, lalu dari root project:

```
node scripts/gen-sfx-sitara.mjs
```

Hasil: 11 file di `public/sfx/` (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power) dan `src/sfx-meta.json`. Kalau gagal, STOP dan lapor.

### 2) Edit src/sitara.tsx

a) Ubah import remotion menjadi:

```tsx
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
```

b) Tambahkan di bawah import yang sudah ada:

```tsx
import sfxMeta from './sfx-meta.json';
```

c) Di dekat `const SHOW_MARKERS = false;` tambahkan:

```tsx
const ENABLE_SFX = true;
```

d) Tambahkan blok berikut tepat di atas bagian `KOMPOSISI UTAMA` (setelah `SceneIn`). Helper `t` dan array `SCENES`/`CUES` sudah terdefinisi di file.

```tsx
/* ============================================================================
 * SOUND EFFECT  (satu layer, dipasang sekali di root)
 * s   = detik global (acuan: SCENES dan CUES)
 * off = geser dalam frame (boleh negatif)
 * vol = 0..1 per efek; SFX_MASTER mengatur keras-pelan semuanya
 * ========================================================================== */
type SfxName =
	| 'pop' | 'whoosh' | 'tick' | 'ding' | 'swap' | 'charge'
	| 'zap' | 'sparkle' | 'blip' | 'lock' | 'power';

type SfxCue = {s: number; off: number; name: SfxName; vol: number};

const SFX_MASTER = 1;

const SFX_CUES: SfxCue[] = [
	// 01 HOOK (00:00-00:04)
	{s: 0.07, off: 0, name: 'pop', vol: 0.35}, // Kepo muncul
	{s: 2.13, off: 0, name: 'whoosh', vol: 0.15}, // seng mulai jatuh
	{s: 3.27, off: 0, name: 'zap', vol: 0.35}, // seng menghantam lantai
	// 02 PEMBUKA CERITA (00:04-00:10)
	{s: 4.0, off: 0, name: 'whoosh', vol: 0.25},
	{s: 4.2, off: 0, name: 'zap', vol: 0.3}, // teks KLANG!
	{s: 5.27, off: 0, name: 'whoosh', vol: 0.22}, // kamera menjauh
	{s: 6.2, off: 0, name: 'pop', vol: 0.25}, // Kepo kaget
	{s: 6.93, off: 0, name: 'whoosh', vol: 0.25}, // kerumunan berlarian
	{s: 8.6, off: 0, name: 'ding', vol: 0.28}, // sorot ke Sitara
	// 03 FAKTA (00:10-00:17)
	{s: 10.0, off: 0, name: 'whoosh', vol: 0.25},
	{s: 10.1, off: 0, name: 'pop', vol: 0.25}, // Muhammad masuk
	{s: 10.33, off: 0, name: 'pop', vol: 0.2}, // tanda seru warga
	{s: 10.53, off: 0, name: 'pop', vol: 0.2},
	{s: 10.8, off: 0, name: 'tick', vol: 0.15}, // Muhammad menunjuk
	{s: 13.2, off: 0, name: 'blip', vol: 0.2}, // garis pandang Sitara
	{s: 14.33, off: 0, name: 'whoosh', vol: 0.2}, // kamera mendekat ke wajah
	{s: 15.0, off: 0, name: 'lock', vol: 0.22}, // garis pandang mengunci seng
	// 04 PENJELASAN ILMIAH (00:17-00:25)
	{s: 17.0, off: 0, name: 'whoosh', vol: 0.25}, // dua kartu masuk
	{s: 17.4, off: 0, name: 'tick', vol: 0.15},
	{s: 20.33, off: 0, name: 'tick', vol: 0.15}, // hafalan mencocokkan pola
	{s: 21.07, off: 0, name: 'tick', vol: 0.15},
	{s: 21.8, off: 0, name: 'tick', vol: 0.15},
	{s: 22.47, off: 0, name: 'whoosh', vol: 0.22}, // beralih ke penalaran
	{s: 22.67, off: 0, name: 'pop', vol: 0.25}, // SEBAB
	{s: 23.47, off: 0, name: 'pop', vol: 0.25}, // AKIBAT
	{s: 24.27, off: 0, name: 'ding', vol: 0.3}, // JAWABAN
	{s: 24.47, off: 0, name: 'sparkle', vol: 0.28}, // Kepo paham
	// 05 PENERAPAN (00:25-00:32)
	{s: 25.0, off: 0, name: 'whoosh', vol: 0.25},
	{s: 25.33, off: 0, name: 'pop', vol: 0.2}, // Kepo muncul
	{s: 26.53, off: 0, name: 'pop', vol: 0.22}, // lompatan 1
	{s: 26.87, off: 0, name: 'tick', vol: 0.15}, // label fondasi
	{s: 27.2, off: 0, name: 'pop', vol: 0.22}, // lompatan 2
	{s: 27.87, off: 0, name: 'pop', vol: 0.22}, // lompatan 3
	{s: 28.27, off: 0, name: 'blip', vol: 0.18}, // Kepo sadar
	{s: 29.13, off: 0, name: 'zap', vol: 0.2}, // anak tangga palsu
	{s: 30.0, off: 0, name: 'pop', vol: 0.22}, // Kepo melompat lagi
	{s: 30.27, off: 0, name: 'zap', vol: 0.3}, // anak tangga palsu hancur
	// 06 PESAN AL-QUR'AN (00:32-00:40) - sengaja lembut
	{s: 32.0, off: 0, name: 'whoosh', vol: 0.22},
	{s: 32.2, off: 0, name: 'sparkle', vol: 0.3}, // cahaya mushaf
	{s: 32.4, off: 0, name: 'pop', vol: 0.2}, // Kepo muncul
	{s: 34.33, off: 0, name: 'blip', vol: 0.18}, // Kepo berpikir
	{s: 38.17, off: 0, name: 'ding', vol: 0.3}, // Kepo paham
	{s: 38.3, off: 0, name: 'sparkle', vol: 0.28},
	// 07 OUTRO (00:40-00:45)
	{s: 40.0, off: 0, name: 'whoosh', vol: 0.22},
	{s: 40.07, off: 0, name: 'pop', vol: 0.25}, // Kepo masuk
	{s: 41.47, off: 0, name: 'pop', vol: 0.25}, // logo muncul
	{s: 41.73, off: 0, name: 'ding', vol: 0.3}, // antena jadi tanda seru
	{s: 41.8, off: 0, name: 'sparkle', vol: 0.28},
	{s: 42.8, off: 0, name: 'pop', vol: 0.25}, // tombol follow
	{s: 43.33, off: 0, name: 'blip', vol: 0.18},
];

const sfxFrame = (c: SfxCue): number => t(c.s) + c.off;

const SfxLayer: React.FC = () => (
	<>
		{SFX_CUES.map((c, i) => {
			const from = sfxFrame(c);
			const frames = (sfxMeta as Record<string, {frames: number}>)[c.name].frames + 2;
			return (
				<Sequence key={`${c.s}-${c.off}-${c.name}-${i}`} from={from} durationInFrames={frames} name={`SFX ${c.name}`} layout="none">
					<Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.vol * SFX_MASTER} />
				</Sequence>
			);
		})}
	</>
);
```

e) Di komponen `Sitara` pasang layer sebelum `<Subtitles />` (setelah vignette):

```tsx
{ENABLE_SFX && <SfxLayer />}
<Subtitles />
```

### 3) Cek (tanpa render)

- `npx tsc` dan `npx eslint src/sitara.tsx` bersih. Kalau tsc protes soal import JSON, pastikan `"resolveJsonModule": true` di `tsconfig.json`.
- `grep -n "<Audio" src/sitara.tsx` = tepat 1 baris.
- Tidak ada cue ganda (`s` + `off` + `name` sama), dan semua `from + frames` <= 1350.
- `npx remotion compositions` tetap menampilkan `Sitara` dengan durasi 1350 frame.

### 4) Laporan akhir singkat (Indonesia)

- jumlah cue per bagian dan total (harus 3 / 6 / 8 / 10 / 10 / 6 / 7 = 50)
- daftar 11 file di `public/sfx`
- hasil grep, tsc, eslint, compositions
