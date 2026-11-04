# TUGAS: Tambah sound effect ke composition IklanStadion

Tambah SFX ke src/iklanstadion.tsx. JANGAN ubah visual, VO, subtitle, vo-timing.json, atau volume VO.

## ATURAN

- Semua SFX dirender di SATU komponen `SfxLayer`, dipasang SEKALI di root IklanStadion (sesudah `<VoiceOver />`). Jangan taruh audio di scene.
- `VoiceOver` tetap 1 pemakaian komponen audio. Setelah selesai, `grep -n "<Audio" src/iklanstadion.tsx` harus tepat 2 baris: 1 di VoiceOver, 1 di SfxLayer.
- Jangan ubah isi scripts/gen-sfx-iklanstadion.mjs (sudah tersedia, sudah diuji).
- Jangan sentuh file lain, kecuali yang disebut di sini.

## LANGKAH

### 1) Generate file suara

```
node scripts/gen-sfx-iklanstadion.mjs
```

Hasil: 11 file di public/sfx/ (pop, whoosh, tick, ding, swap, charge, zap, sparkle, blip, lock, power) dan src/sfx-meta.json. Kalau gagal, STOP dan lapor.

### 2) Edit src/iklanstadion.tsx

Tambahkan import:

```tsx
import sfxMeta from "./sfx-meta.json";
```

Tambahkan di bawah definisi SCENES (SCENES harus sudah terdefinisi), lalu render `<SfxLayer />` SEKALI di IklanStadion sesudah `<VoiceOver />`:

```tsx
type SfxName =
  | "pop" | "whoosh" | "tick" | "ding" | "swap" | "charge"
  | "zap" | "sparkle" | "blip" | "lock" | "power";
type SfxCue = { scene: string; f: number; name: SfxName; vol: number };

/** Atur keras-pelannya semua SFX di sini (1 = default). */
const SFX_MASTER = 1;

/** scene = nomor scene, f = frame LOKAL di scene tersebut. */
const SFX_CUES: SfxCue[] = [
  // 01 hook
  { scene: "01", f: 22, name: "pop", vol: 0.35 },
  // 02 mystery
  { scene: "02", f: 5, name: "whoosh", vol: 0.25 },
  { scene: "02", f: 50, name: "pop", vol: 0.3 },
  { scene: "02", f: 80, name: "blip", vol: 0.2 },
  { scene: "02", f: 95, name: "whoosh", vol: 0.25 },
  { scene: "02", f: 110, name: "whoosh", vol: 0.25 },
  { scene: "02", f: 150, name: "swap", vol: 0.3 },
  { scene: "02", f: 200, name: "swap", vol: 0.3 },
  // 03 reveal
  { scene: "03", f: 0, name: "whoosh", vol: 0.3 },
  { scene: "03", f: 30, name: "pop", vol: 0.3 },
  { scene: "03", f: 50, name: "whoosh", vol: 0.22 },
  { scene: "03", f: 90, name: "whoosh", vol: 0.22 },
  // 04 led chroma key
  { scene: "04", f: 20, name: "pop", vol: 0.25 },
  { scene: "04", f: 150, name: "whoosh", vol: 0.22 },
  { scene: "04", f: 165, name: "charge", vol: 0.22 },
  { scene: "04", f: 270, name: "ding", vol: 0.3 },
  { scene: "04", f: 390, name: "whoosh", vol: 0.22 },
  { scene: "04", f: 400, name: "zap", vol: 0.28 },
  { scene: "04", f: 420, name: "pop", vol: 0.3 },
  { scene: "04", f: 430, name: "blip", vol: 0.2 },
  // 05 digital replacement
  { scene: "05", f: 10, name: "tick", vol: 0.12 },
  { scene: "05", f: 20, name: "whoosh", vol: 0.2 },
  { scene: "05", f: 28, name: "tick", vol: 0.12 },
  { scene: "05", f: 30, name: "pop", vol: 0.25 },
  { scene: "05", f: 46, name: "tick", vol: 0.12 },
  { scene: "05", f: 64, name: "tick", vol: 0.12 },
  { scene: "05", f: 82, name: "tick", vol: 0.12 },
  { scene: "05", f: 110, name: "blip", vol: 0.2 },
  { scene: "05", f: 180, name: "blip", vol: 0.2 },
  { scene: "05", f: 250, name: "swap", vol: 0.3 },
  { scene: "05", f: 320, name: "blip", vol: 0.2 },
  // 06 camera tracking
  { scene: "06", f: 20, name: "pop", vol: 0.25 },
  { scene: "06", f: 170, name: "lock", vol: 0.25 },
  { scene: "06", f: 170, name: "whoosh", vol: 0.22 },
  { scene: "06", f: 225, name: "tick", vol: 0.15 },
  // 07 not just one method
  { scene: "07", f: 10, name: "tick", vol: 0.12 },
  { scene: "07", f: 25, name: "pop", vol: 0.25 },
  { scene: "07", f: 30, name: "tick", vol: 0.12 },
  { scene: "07", f: 50, name: "tick", vol: 0.12 },
  { scene: "07", f: 70, name: "power", vol: 0.3 },
  { scene: "07", f: 200, name: "whoosh", vol: 0.22 },
  { scene: "07", f: 230, name: "pop", vol: 0.25 },
  { scene: "07", f: 250, name: "pop", vol: 0.25 },
  { scene: "07", f: 300, name: "ding", vol: 0.25 },
  // 08 conclusion
  { scene: "08", f: 0, name: "whoosh", vol: 0.22 },
  { scene: "08", f: 15, name: "pop", vol: 0.25 },
  { scene: "08", f: 25, name: "pop", vol: 0.22 },
  { scene: "08", f: 180, name: "tick", vol: 0.15 },
  { scene: "08", f: 335, name: "sparkle", vol: 0.3 },
];

const SfxLayer: React.FC = () => (
  <>
    {SFX_CUES.map((c, i) => {
      const from = (SCENES.find((s) => s.no === c.scene)?.from ?? 0) + c.f;
      const frames = (sfxMeta as Record<string, { frames: number }>)[c.name].frames + 2;
      return (
        <Sequence
          key={`${c.scene}-${c.f}-${c.name}-${i}`}
          from={from}
          durationInFrames={frames}
          name={`SFX ${c.name}`}
        >
          <Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.vol * SFX_MASTER} />
        </Sequence>
      );
    })}
  </>
);
```

Pakai komponen audio yang SAMA dengan yang dipakai VoiceOver (nama import yang sudah ada). `staticFile` sudah diimpor.

### 3) Cek

- `npx tsc` dan `npx eslint src/iklanstadion.tsx` bersih. (Error lama di src/Root.tsx soal RumahBaru diabaikan.)
- `grep -n "<Audio" src/iklanstadion.tsx` = tepat 2 baris.
- Tidak ada cue ganda (scene + f + name sama) dan semua `from + frames` <= total frame composition.
- `npx remotion compositions` tetap menampilkan IklanStadion dengan durasi yang sama seperti sebelumnya.

### 4) Laporan akhir singkat (Indonesia)

- jumlah cue per scene dan total (harus 50)
- daftar 11 file di public/sfx
- hasil grep, tsc, eslint, compositions

