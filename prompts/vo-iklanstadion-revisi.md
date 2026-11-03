# REVISI vo-iklanstadion (menggantikan aturan "Jadwal" dan "Validasi" di prompts/vo-iklanstadion.md)

Aturan lain di vo-iklanstadion.md TETAP berlaku: 1 kalimat = 1 mp3, audio hanya di 1 komponen VoiceOver, manifest idempotent, request berurutan, larangan file lain.

## Sebab laporan sebelumnya

Voice laras lebih lambat dari estimasi, dan tiap mp3 punya hening di awal dan akhir. Scene 01 butuh 203 frame, jatahnya 180. Durasi scene dan visual TIDAK boleh diubah. Solusinya: potong hening, rapatkan jeda, dan percepat tipis per scene HANYA jika masih perlu.

## LANGKAH

### 1) Perbarui scripts/gen-vo-iklanstadion.ts

a. Potong hening awal dan akhir tiap mp3:

```
npx remotion ffmpeg -y -i IN.mp3 -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse" TMP.mp3
```

Lalu ganti file asli dengan TMP.mp3. Kalau `remotion ffmpeg` tidak ada, pakai `ffmpeg` biasa. Kalau keduanya tidak ada, STOP dan lapor.

b. Di manifest catat `"trimmed": true` per file. File lama yang sudah ada (s01-1.mp3, s01-2.mp3) cukup di-trim in-place, TIDAK perlu minta ulang ke Speechify.

c. Ukur durasi SETELAH trim (frame audio = ceil(detik * 30)).

d. Jadwal baru (menggantikan lead 8 / jeda 8 / tail 10):
- start kalimat 1 tiap scene = scene.from + 6
- kalimat berikutnya: start = end sebelumnya + 5
- batas akhir scene: end terakhir <= scene.from + scene.dur - 6

e. Percepatan per scene (hanya jika perlu):
- available = scene.dur - 6 - 6 - 5 * (jumlah_kalimat - 1)
- audioTotal = jumlah frame audio semua kalimat di scene itu
- rate = max(1, audioTotal / available), dibulatkan ke atas 2 desimal
- rate <= 1.15: lanjut. Semua kalimat di scene itu memakai rate yang sama.
- rate > 1.15: STOP dan lapor scene, rate yang dibutuhkan, dan durasi audio total. Jangan ubah apa pun lagi.

f. Hitung per kalimat:
- frame efektif = ceil(audioFrames / rate)
- end = start + frame efektif
- durationInFrames (Sequence) = frame efektif + 2
- cueFrom = start
- cueTo = min(end + 6, start kalimat berikutnya di scene yang sama). Untuk kalimat terakhir scene: end + 6.

g. Validasi: tidak ada overlap (start[i] >= end[i-1]) dan end terakhir tiap scene <= scene.from + scene.dur - 6. Kalau gagal: STOP dan lapor.

h. Tambahkan field `"rate"` di tiap entri src/vo-timing.json (rate scene itu, 1 jika tidak perlu).

### 2) Edit src/iklanstadion.tsx (belum pernah diubah)

Sama seperti di vo-iklanstadion.md, dengan satu perbedaan di VoiceOver:

```tsx
<Audio src={staticFile(t.file)} playbackRate={t.rate} />
```

Sequence tetap memakai `durationInFrames={t.durationInFrames}`. Tetap hanya SATU pemakaian komponen audio. Kalau komponen audio di remotion 4.0.536 tidak punya prop `playbackRate`, STOP dan lapor.

### 3) Jalankan dan laporkan

Urutan: update generator -> jalankan -> edit tsx -> `npm run lint` sampai bersih.

Laporan akhir singkat (Indonesia):
- tabel: scene | idx | start | end | detik asli | rate | teks
- rate tertinggi dan di scene mana
- jumlah overlap (harus 0)
- hasil `grep -n "Audio" src/iklanstadion.tsx` (harus 1 pemakaian)
- hasil lint

