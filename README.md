# 1-tap flappy (Flappy Shape)

**1-tap flappy** adalah permainan arkade berbasis web yang ringan dan adiktif, terinspirasi oleh mekanik klasik *Flappy Bird*. Pemain mengendalikan bentuk geometris yang harus melewati celah pipa sambil mengumpulkan koin. Game ini dirancang dengan tingkat kesulitan adaptif yang meningkat seiring berjalannya waktu dan perolehan skor.

## 🚀 Fitur Utama

* **Mekanik Fisika Responsif**: Kontrol satu ketukan (tap/klik) yang halus untuk membuat karakter melompat (flap).
* **Sistem Bentuk Dinamis**: Terdapat 8 bentuk berbeda (Lingkaran, Kotak, Segitiga, Pentagon, Hexagon, Bintang, Berlian, dan Hati). Bentuk karakter akan berganti secara otomatis setiap kali berhasil melewati pipa.
* **Kesulitan Adaptif**: Kecepatan pipa, lebar celah (*gap*), dan jarak antar pipa berubah secara dinamis berdasarkan skor dan durasi permainan untuk memberikan tantangan yang terus berkembang.
* **Sistem Koin & Skor**: Kumpulkan koin untuk meningkatkan saldo total yang disimpan secara lokal di browser melalui `localStorage`.
* **Audio Cerdas**: Mendukung musik latar dan efek suara. Jika file audio lokal tidak tersedia, sistem secara otomatis menggunakan *Web Audio API* untuk menghasilkan suara sintetis (*beep*).
* **Optimasi Mobile**: Antarmuka yang responsif dengan kontrol khusus untuk perangkat layar sentuh.

## 🎮 Cara Bermain

1. **Memulai**: Tekan layar, klik mouse, atau tekan tombol **Spasi** untuk memulai.
2. **Terbang**: Ketuk atau tekan **Spasi** berulang kali untuk menjaga karakter tetap di udara.
3. **Ganti Bentuk Manual**: Gunakan tombol angka **1-8** pada keyboard atau tombol di layar (pada perangkat mobile) untuk mengganti bentuk karakter secara instan.
4. **Mute**: Tekan tombol **M** atau ikon suara untuk mematikan/menyalakan audio.
5. **Tujuan**: Lewati celah pipa sebanyak mungkin dan kumpulkan koin tanpa menabrak pipa atau jatuh ke tanah.

## 🛠️ Teknologi yang Digunakan

* **HTML5 Canvas**: Digunakan untuk rendering grafis dan animasi permainan secara *real-time*.
* **CSS3**: Digunakan untuk tata letak UI, efek transisi, dan responsivitas layar.
* **Vanilla JavaScript**: Mengatur seluruh logika permainan, deteksi tabrakan, manajemen audio, dan penyimpanan data.

## 📂 Struktur Aset

Game ini mencari aset di folder `local/`. Jika tidak ditemukan, sistem akan menggunakan *fallback* berupa SVG dan suara sintetis.

* **Gambar**:
* `/local/bg.jpg` (Latar belakang)
* `/local/1.jpg` hingga `8.jpg` (Gambar untuk tiap bentuk)


* **Audio**:
* `/local/sounds/bg-music.mp3`
* `/local/sounds/flap.mp3`
* `/local/sounds/score.mp3`
* `/local/sounds/gameover.mp3`
* `/local/sounds/coin.mp3`



## 🔧 Konfigurasi Kustom

Anda dapat memodifikasi tingkat kesulitan permainan dengan mengubah objek `difficultyConfig` di dalam file `game.js`:

```javascript
const difficultyConfig = {
  initialGap: 300,           // Lebar celah awal antar pipa
  minGap: 200,               // Lebar celah minimum
  shrinkPerSecond: 2.0,      // Penyusutan celah per detik
  basePipeSpeed: 1.2,        // Kecepatan awal pipa
  maxPipeSpeed: 3.0,         // Kecepatan maksimal pipa
  // ... (pengaturan lainnya)
};

```

---

**Kontribusi**: Silakan lakukan *fork* pada repositori ini dan kirimkan *pull request* untuk fitur baru atau perbaikan bug.
