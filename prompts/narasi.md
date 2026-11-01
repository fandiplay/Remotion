# NARASI & SUARA — KandAIStory

## DATA NARASI
Buat src/story.ts yang mengekspor STORY dengan bentuk sama seperti FACTS: array { id, judul, bagian: [{ narasi }] }. Isi persis seperti ini:

- id "story-hook" (target ~8s)
  1. "Pernah nggak, baru bangun tidur, tapi rasanya sudah tertinggal jauh?"
  2. "Notifikasi tugas masuk. Deadline semakin dekat. Uang entah habis ke mana."
  3. "Dan jurnal yang harusnya ditulis setiap malam? Sudah tiga hari cuma jadi wacana."

- id "story-konflik" (target ~15s)
  1. "Namanya Raka. Setiap hari dia punya banyak hal yang harus diurus."
  2. "Pagi, dia mencoba mengatur uang sakunya. Siang, tugas sekolah menumpuk. Malam, dia ingin belajar untuk ujian."
  3. "Belum lagi pikirannya sendiri yang sering penuh, tapi nggak tahu harus cerita ke siapa."
  4. "Dia bukan nggak mau produktif. Dia cuma capek harus mengingat, mengatur, dan mengerjakan semuanya sendirian."

- id "story-balik" (target ~11s)
  1. "Sampai suatu malam, ketika sedang menatap daftar tugas yang belum selesai, dia menemukan sesuatu."
  2. "Namanya: KAND AI."
  3. "Awalnya dia mengira itu cuma chatbot biasa. Tapi ternyata, ada sesuatu yang berbeda."

- id "story-solusi" (target ~21s)
  1. "Sekarang, setiap pengeluaran bisa dia catat dan pantau lewat fitur Dompet."
  2. "Ketika pikirannya penuh, dia bisa menuangkannya ke Jurnal."
  3. "Saat ada materi yang belum dipahami, dia tinggal membuka fitur Belajar dan meminta KAND AI menyiapkan materi sesuai kebutuhannya."
  4. "Bahkan, hal-hal yang hampir terlupakan bisa dibantu dengan pengingat."
  5. "Pelan-pelan, yang tadinya terasa berantakan mulai punya arah."

- id "story-penutup" (target ~15s)
  1. "Raka akhirnya sadar... Dia nggak harus menjadi orang yang bisa melakukan semuanya sekaligus."
  2. "Kadang, yang dibutuhkan bukan waktu tambahan. Tapi bantuan yang tepat."
  3. "KAND AI — satu asisten untuk membantu mengelola keseharianmu. Mulai rapikan harimu di kandai.my.id"

## SCRIPT SUARA (kamu yang jalankan)
1. Salin scripts/gen-voice.mjs menjadi scripts/gen-voice-story.mjs. Ubah: import STORY dari ../src/story.ts, output timing ke src/timing-story.json, file audio tetap di public/audio/ dengan nama <id>-<n>.wav (prefix "story-" menjamin tidak bentrok dengan audio KandAI lama). Voice, model, dan style TTS sama seperti aslinya.
2. Setelah script jadi, JALANKAN dari ~/tes-remotion: `npx tsx scripts/gen-voice-story.mjs`. GEMINI_API_KEY sudah ter-export di environment, jangan minta key lagi.
3. Total 18 panggilan TTS. Kalau ada yang gagal, jalankan ulang perintah yang sama (script otomatis skip .wav yang sudah ada). Maksimal 3 kali ulang. Jangan hapus file .wav yang sudah jadi, jangan ubah voice/model/style untuk "memperbaiki" error. Kalau tetap gagal setelah 3 kali, berhenti dan laporkan pesan error aslinya.
4. Setelah src/timing-story.json lengkap (18 entri), baru lanjut ke scene. Durasi scene wajib dibaca dari file itu.
