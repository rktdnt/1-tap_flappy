# 1-tap fly (Flappy Shape)

Permainan arkade berbasis web yang ringan dan adiktif, diinspirasi oleh mekanisme klasik *Flappy Bird*. Pemain harus mengendalikan bentuk geometris yang terbang melewati celah pipa sambil mengumpulkan koin dan beradaptasi dengan tingkat kesulitan yang terus meningkat secara dinamis.

## 🚀 Fitur Utama

* **Mekanik Fisika Responsif**: Kontrol satu ketukan (tap/click) yang halus untuk melompat (flap).
* **Sistem Bentuk Dinamis**: Terdapat 8 bentuk berbeda (Lingkaran, Kotak, Segitiga, Pentagon, Hexagon, Bintang, Berlian, dan Hati) yang berganti secara otomatis setiap kali melewati pipa.
* **Kesulitan Adaptif**: Kecepatan pipa, lebar celah (gap), dan jarak antar pipa berubah secara otomatis berdasarkan skor dan durasi permainan.
* **Sistem Koin & Skor**: Kumpulkan koin di sepanjang jalan untuk meningkatkan saldo koin total yang tersimpan secara lokal di browser (`localStorage`).
* **Audio Cerdas**: Mendukung musik latar dan efek suara. Jika file audio lokal tidak ditemukan, sistem akan menggunakan *Web Audio API* untuk menghasilkan suara sintetis.
* **Optimasi Mobile**: UI yang adaptif dengan kontrol tombol khusus untuk perangkat layar sentuh.

## 🛠️ Teknologi yang Digunakan

* **HTML5 Canvas**: Untuk pergerakan grafis dan rendering game.
* **CSS3**: Untuk tata letak antarmuka (UI) dan efek transisi.
* **Vanilla JavaScript**: Untuk logika permainan, deteksi tabrakan, dan manajemen data.

## 🎮 Cara Bermain

1. **Mulai**: Tekan layar atau tombol **Spasi** untuk memulai permainan.
2. **Terbang**: Ketuk layar atau tekan **Spasi** berulang kali untuk menjaga karakter tetap terbang.
3. **Ganti Bentuk**: Tekan angka **1-8** pada keyboard atau gunakan tombol kontrol di layar (mobile) untuk mengganti bentuk karakter secara manual.
4. **Mute**: Tekan tombol **M** untuk mematikan atau menyalakan suara.
5. **Tujuan**: Lewati celah pipa sebanyak mungkin dan kumpulkan koin sebanyak-banyaknya tanpa menabrak pipa atau jatuh ke tanah.

## 📂 Struktur Aset Lokal

Untuk menggunakan aset gambar dan suara kostum, pastikan struktur folder Anda sebagai berikut:

* `/local/bg.jpg` - Gambar latar belakang.
* `/local/1.jpg` sampai `8.jpg` - Gambar untuk masing-masing bentuk.
* `/local/sounds/` - Berisi file `bg-music.mp3`, `flap.mp3`, `score.mp3`, `gameover.mp3`, dan `coin.mp3`.

*Catatan: Jika aset di atas tidak ada, game akan otomatis menggunakan gambar cadangan (SVG) dan suara beep elektrik.*

## 🔧 Konfigurasi Kustom

Anda dapat mengubah tingkat kesulitan melalui objek `difficultyConfig` di dalam file `index.html`:

```javascript
const difficultyConfig = {
  initialGap: 300,           // Lebar celah awal
  minGap: 200,               // Lebar celah minimal
  basePipeSpeed: 1.6,        // Kecepatan awal pipa
  maxPipeSpeed: 4.0,         // Kecepatan maksimal pipa
  // ... dan pengaturan lainnya
};

```

---

**Kontribusi:**
Silakan lakukan *fork* pada repositori ini dan kirimkan *pull request* jika ingin menambahkan fitur baru atau melakukan perbaikan *bug*.
