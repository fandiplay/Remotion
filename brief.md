# Instruksi Proyek Video: KAND AI (kandai.my.id)

## 1. Wajib Baca Skill
Sebelum menulis kode, WAJIB baca dan patuhi:
- `remotion-best-practices` & `remotion-markup` & `remotion-render`
- `antislop-ui` & `antislop-design` (jika tersedia)

## 2. Spesifikasi Teknis & Anti-Kotak (Wajib!)
- **ID Composition:** `KandAI` (daftarkan di `src/Root.tsx`, komponen di `src/Composition.tsx`)
- **Dimensi:** 1080x1920 (9:16), 30 FPS, Durasi 540 frame (18 detik).
- **DILARANG KERAS PAKAI EMOJI ATAU KARAKTER UNICODE!** Semua ikon WAJIB di-import dari package `lucide-react` (contoh: `Brain`, `Wallet`, `MessageSquare`, `GraduationCap`, `Sparkles`, `CheckCircle2`, `Globe`, `ArrowRight`, `HeartPulse`, `BookOpen`).
- **Font:** Gunakan `@remotion/google-fonts/PlusJakartaSans` (loadFont) agar tipografi modern, tebal, dan tajam.
- **Animasi:** Wajib `useCurrentFrame()`, `spring()`, dan `interpolate()`. Dilarang pakai CSS transition/keyframes.

## 3. Aturan Visual & Layout (Anti-Slop Design System)
- **Jangan pakai gradien hijau norak!** Gunakan background gelap pekat khas Linear/Vercel: `#09090B` (Zinc 950) dengan sedikit radial spotlight halus `#18181B` di tengah.
- **Card Style:** Background `#121215`, border `2px solid #27272A`, `borderRadius: 28px`, `padding: 40px`, box-shadow gelap yang halus.
- **Ukuran Teks (Wajib Besar & Terbaca di HP 1080p):**
  - Label/Badge atas: `26px`, uppercase, tracking lebar, warna `#A1A1AA`.
  - Judul Utama Scene: `64px` - `72px`, `fontWeight: 800`, warna `#FAFAFA`, line-height `1.15`.
  - Isi Teks / List dalam Card: `36px`, `fontWeight: 500`, warna `#E4E4E7`.
  - Jarak antar elemen (gap): minimal `28px` - `36px`. Jangan terlalu rapat!
- **Aksen Warna:** Gunakan Emerald (`#10B981`) dan Indigo (`#6366F1`) HANYA untuk badge ikon, tombol CTA, atau highlight kata penting.
- **Footer Watermark:** Di bagian bawah layar (posisi `bottom: 120px` agar tidak tertutup tombol player HP!), tampilkan pill elegan dengan ikon `<Globe />` dari lucide-react dan teks `kandai.my.id`.

## 4. Alur 6 Scene (<Sequence>)
- **Scene 1 (Frame 0-90 | Masalah):**
  Judul besar di atas: "Terlalu Banyak Hal di Kepala?"
  4 Card horizontal rapi muncul berurutan (staggered spring) dengan ikon Lucide di sebelah kiri:
  1. [Ikon Brain] "Pikiran penuh & stres"
  2. [Ikon Wallet] "Keuangan berantakan"
  3. [Ikon MessageSquare] "Perasaan sulit diceritakan"
  4. [Ikon GraduationCap] "Belajar kehilangan arah"
  Teks bawah: "Harus pakai banyak aplikasi untuk semuanya?"

- **Scene 2 (Frame 90-180 | Perkenalan):**
  Bento Box besar di tengah dengan ikon `<Sparkles />`:
  Judul Raksasa (88px): "KAND AI"
  Subjudul (44px, warna #10B981): "Satu AI, Banyak Solusi."
  Deskripsi (36px): "Asisten AI harianmu, langsung via WhatsApp & Platform Belajar."
  Badge URL dengan ikon `<Globe />`: "kandai.my.id"

- **Scene 3 (Frame 180-270 | Fitur 01 - Teman Cerita & Jurnal):**
  Judul: "Teman Cerita & Jurnal"
  Simulasi UI Chat modern (ukuran font chat minimal 32px, tanpa emoji kotak!):
  - User: "Hari ini kepalaku penuh banget..."
  - KAND AI: "Cerita pelan-pelan aja. Aku bantu rapikan dan catat di jurnalmu."
  Di bawah chat, tampilkan 3 poin dengan ikon `<CheckCircle2 />`: Teman berbincang, Info kesehatan umum, & Jurnal terstruktur.

- **Scene 4 (Frame 270-360 | Fitur 02 - Keuangan):**
  Judul: "Kelola Uang Lewat Chat"
  Card Dashboard Keuangan rapi berisi animasi angka pengeluaran dan progress bar mulus, dilengkapi 3 poin dengan ikon `<CheckCircle2 />`: Catat transaksi via percakapan, Kelola multi-dompet, & Pantau di Dashboard.

- **Scene 5 (Frame 360-450 | Fitur 03 - Belajar & Memori):**
  Judul: "Tutor Belajar Personal"
  Card Roadmap & XP Bar (animasi XP naik), dilengkapi 3 poin dengan ikon `<CheckCircle2 />`: Susun Roadmap & Kuis ber-XP, Tanya Tutor AI kapan saja, & Ingat konteks pribadimu.

- **Scene 6 (Frame 450-540 | Outro & CTA):**
  Judul Tengah: "Bukan sekadar AI untuk bertanya, tapi teman untuk berkembang."
  Tombol CTA besar (`padding: 32px 56px`, `borderRadius: 999px`, background `#10B981`, teks `#09090B` tebal 40px) dengan ikon `<ArrowRight />`: "Mulai Bersama KAND AI"
  Box URL mencolok di bawahnya dengan ikon `<Globe />`: "kandai.my.id"

## 5. Eksekusi Akhir
Setelah kode selesai ditulis di `src/Composition.tsx` dan `src/Root.tsx`, cek apakah ada error kompilasi, lalu langsung jalankan:
`npx remotion render KandAI kand-ai.mp4 --concurrency=2 --gl=swiftshader`
