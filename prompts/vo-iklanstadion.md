# TUGAS: Tambah VO Speechify ke composition IklanStadion

Tambah voice over Speechify ke composition `IklanStadion` (src/iklanstadion.tsx).
JANGAN ubah visual/animasi/scene. Hanya tambah VO + sinkronkan subtitle ke durasi audio asli.

## ATURAN ANTI TABRAKAN/DUPLIKAT

- 1 kalimat = 1 mp3 (29 file): public/vo/iklanstadion/s{no}-{idx}.mp3 (idx mulai 1).
- Audio dirender HANYA di 1 komponen VoiceOver, dipasang SEKALI di root IklanStadion. Dilarang ada komponen audio lain. Cek akhir: `grep -n "Audio" src/iklanstadion.tsx` = 1 pemakaian komponen audio.
- Tiap kalimat: `<Sequence key="{no}-{idx}" from durationInFrames>` berisi 1 audio.
- Jadwal dari durasi mp3 asli (30fps):
  - start kalimat 1 tiap scene = scene.from + 8
  - kalimat berikutnya: start = end sebelumnya + 8
  - end = start + ceil(detik * 30)
  - durationInFrames = ceil(detik * 30) + 3
- Validasi di script. Kalau gagal: STOP, tampilkan scene dan jumlah frame kelebihan, jangan tulis timing, jangan percepat/potong audio, jangan ubah durasi scene.
  - (a) tidak ada overlap (start[i] >= end[i-1])
  - (b) end terakhir tiap scene <= scene.from + scene.dur - 10
- Idempotent: scripts/vo-manifest.json menyimpan hash (voice+model+language+teks TTS) per file. Skip jika hash sama kecuali flag --force. Request berurutan (tanpa paralel), retry max 3x dengan backoff untuk 429/5xx. Jangan cetak API key.

## LANGKAH

### 1) Buat scripts/vo-script.json

```json
{"fps":30,"scenes":[
{"no":"01","from":0,"dur":180,"lines":["Kok bisa ya, iklan di papan stadion *berbeda*,","padahal pertandingan yang ditonton sama?"]},
{"no":"02","from":180,"dur":330,"lines":["Rahasianya ada di teknologi *virtual advertising*.","Iklan bisa diganti khusus pada gambar siaran televisi,","tanpa harus mengganti tampilan yang dilihat penonton di *stadion*."]},
{"no":"03","from":510,"dur":300,"lines":["Jadi, orang di tribun bisa melihat iklan *fisik* yang sama.","Sementara penonton di negara berbeda","menerima versi siaran dengan iklan *berbeda*."]},
{"no":"04","from":810,"dur":600,"lines":["Salah satu pendekatan yang dikembangkan *Fraunhofer*","memakai trik waktu.","Dalam satu siklus *20 milidetik*,","papan menampilkan iklan selama 18 milidetik,","lalu warna magenta selama dua milidetik.","Kamera diatur untuk menangkap *kilatan* singkat itu."]},
{"no":"05","from":1410,"dur":420,"lines":["Di studio, area *magenta* pada rekaman","diganti dengan iklan yang ditargetkan.","Ini teknik *chroma key*, mirip prinsip green screen,","tetapi warna kuncinya muncul sesaat dari panel LED."]},
{"no":"06","from":1830,"dur":390,"lines":["Supaya iklan baru tetap menempel saat kamera bergerak,","sistem *melacak* sudut dan arah kamera.","Pemain yang melintas di depannya","juga harus tetap *natural*."]},
{"no":"07","from":2220,"dur":480,"lines":["Ada *pendekatan* lain.","Platform seperti Supponor memproses sinyal siaran","dengan perangkat lunak berbasis *AI* dan machine learning,","lalu menampilkan pesan yang disesuaikan untuk pasar tertentu.","Jadi, tidak semua sistem memakai trik yang *sama*."]},
{"no":"08","from":2700,"dur":450,"lines":["Intinya, yang berubah bukan stadionnya,","melainkan gambar *siaran* yang kamu tonton.","Satu pertandingan bisa punya beberapa versi iklan.","Besok penasaran apa lagi?","*Follow* Rumah Penasaran."]}
]}
```

(*kata* = highlight subtitle; tetap di JSON, hapus hanya saat kirim ke TTS.)

### 2) Buat scripts/gen-vo-iklanstadion.ts

Run: `npx tsx --env-file=.env scripts/gen-vo-iklanstadion.ts` (pakai async main(), bukan top-level await).

Konstanta di atas file:

```ts
const VOICE_ID = "laras";
const MODEL = "simba-3.0";
const LANGUAGE = "id-ID"; // kosong = tanpa param language
const SPEECH_OVERRIDES: Record<string, string> = {}; // kata -> ejaan TTS; subtitle tetap teks asli
```

Request:
- POST https://api.speechify.ai/v1/audio/stream
- Header: `Authorization: Bearer $SPEECHIFY_API_KEY`, `Accept: audio/mpeg`, `Content-Type: application/json`
- Body: `{input, voice_id, model, language}`

Ukur durasi: `npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 <file>` (fallback ffprobe biasa).

Hitung jadwal + validasi, lalu tulis src/vo-timing.json = array objek:

```json
{"key":"01-1","scene":"01","idx":1,"text":"<teks asli dengan *>","file":"vo/iklanstadion/s01-1.mp3","from":0,"durationInFrames":0,"cueFrom":0,"cueTo":0}
```

- cueFrom = start
- cueTo = start + ceil(detik * 30) + 6

### 3) Edit src/iklanstadion.tsx seminimal mungkin

- `import timing from "./vo-timing.json";`
- tambah `staticFile` ke import dari "remotion"; pakai SATU komponen audio yang diekspor remotion 4.0.536 (cek node_modules/remotion).
- ganti `const SUBTITLE_OVERRIDE: Cue[] | null = null;` jadi:

```tsx
const SUBTITLE_OVERRIDE: Cue[] | null = timing.length
  ? timing.map((t) => ({ from: t.cueFrom, to: t.cueTo, text: t.text }))
  : null;
```

- tambah komponen:

```tsx
const VoiceOver: React.FC = () => (
  <>
    {timing.map((t) => (
      <Sequence key={t.key} from={t.from} durationInFrames={t.durationInFrames} name={`VO ${t.key}`}>
        <Audio src={staticFile(t.file)} />
      </Sequence>
    ))}
  </>
);
```

- render `<VoiceOver />` SEKALI di IklanStadion, sebelum `<TopLogo />`.
- jika tsc protes JSON, cek resolveJsonModule (src/timing-story.json sudah diimpor, harusnya aman).

### 4) Urutan kerja

vo-script.json -> generator -> jalankan generator -> edit tsx -> `npm run lint` sampai bersih.

### 5) Laporan akhir singkat (Indonesia)

- tabel: scene | idx | start | end | detik | teks
- jumlah overlap (harus 0)
- hasil grep audio (harus 1)
- hasil lint

## LARANGAN

Jangan sentuh gen-voice*.mjs, gen-bgm*.mjs, composition KandAI, atau file lain di luar yang disebut. Jangan commit .env. Jangan ubah SHOW_MARKERS.

