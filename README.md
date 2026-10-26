# DAMVERSE - Simulasi Empangan & Tamadun Hidroelektrik 3D

Permainan simulasi 3D dunia terbuka realistik yang menggabungkan kejuruteraan empangan gergasi, hidrodinamik air, penjanaan tenaga elektrik grid, pengurusan bandar hilir, dan perkembangan ekonomi tamadun dalam Bahasa Melayu.

---

## 🌟 Ciri-Ciri Utama Permainan

1. **Simulasi Hidrodinamik & Takungan Air Sebenar**:
   - Paras takungan air dinamik (12.0m hingga 30.0m) berasaskan isi padu takungan 120 juta meter padu.
   - Pintu alur limpah (Radial Spillway Gates 1, 2, 3) yang boleh dilaraskan 0% hingga 100% dengan kesan semburan air buih terjun (*ski-jump flip bucket*).
   - Kiraan turus air hidraulik (*hydraulic head*), kadar aliran masuk sungai (*inflow*), dan pelepasan air hilir (*outflow*).
   - Risiko banjir hilir apabila pelepasan air melebihi 850 m³/s yang menenggelamkan Kampung Hilir dan menjejaskan kualiti air bandar.
   - Risiko limpahan atas empangan (*overtopping risk*) apabila paras takungan mencecah 28.5m.

2. **Stesen Janakuasa Hidro & 4 Unit Turbin Francis**:
   - 4 unit penjana turbin 60 MW (Jumlah kapasiti hidro 240 MW).
   - Penjanaan megawatt berasaskan formula fizikal $P = \eta \cdot \rho \cdot g \cdot Q \cdot H$.
   - Kehausan bilah turbin (*cavitation wear*), kawalan injap pendikit (*throttle*), dan sistem baik pulih berkala.
   - Penunjuk pemutar berputar (*rotating exciter indicator*) dalam dewan mesin 3D.

3. **Tamadun Hilir & Infrastruktur Kuasa**:
   - **Kampung Hilir**: Perkampungan tradisional Melayu dengan rumah panggung kayu, jeti sungai, perahu sampan, pokok kelapa, dan stesen pam sedutan air bersih perbandaran.
   - **Bandar Mahameru**: Pusat bandar moden dengan pencakar langit pejabat sivik, blok pangsapuri kediaman, hospital dengan helipad, jalan raya berturap, lampu jalan, dan pencawang elektrik 11kV.
   - **Zon Perindustrian Lembah Hijau**: Kilang pembuatan berat, cerobong asap industri, silo simpanan keluli, kren gantry, dan kontena kargo.
   - **Grid Voltan Tinggi**: Tiang kekuda keluli (*transmission pylons*) dengan kabel konduktor catenary membawa kuasa elektrik dari empangan ke bandar dan taman perindustrian.

4. **Karakter Jurutera & Trak Penyelenggaraan 4x4**:
   - Kawalan orang ketiga (Third-Person): Jalan, Lari (*Sprint*), Lompat (*Jump*).
   - Trak pikap 4x4 berlampu amaran (*amber hazard beacon*) yang boleh dipandu menyusuri jambatan empangan dan jalan curam gunung menuruni lembah sehingga ke bandar pada kelajuan tinggi.
   - Kayu bedik maya (*virtual joystick*) dan pad kawalan sentuh untuk peranti mudah alih (telefon/tablet).

5. **Projek Mega & Pembangunan**:
   - **Ladang Solar Terapung Tasik** (+30 MW tenaga solar pada waktu siang).
   - **Sistem Simpanan Bateri BESS 50 MWh** (menyerap lebihan kuasa dan menyuntik kuasa semasa beban puncak).
   - **Pengukuhan Alur Limpah & Chute** (+25% kapasiti pelepasan air selamat).
   - **Pusat Pelancongan & Dek Pemerhatian Kaca Empangan** (+RM 65/s aliran tunai pelancongan).
   - **Loji Penapisan Air Bersih Perbandaran** (bekalan air bersih terjamin semasa banjir).
   - **Penyelidikan R&D**: Salutan Seramik Nano, Ramalan AI Monsun, Suntikan Udara Pencegah Kavitasi, Grid Pintar 2.0.

6. **Audio Prosedural & Cuaca Dinamik**:
   - 100% disintesis menggunakan Web Audio API tanpa sebarang fail luaran (deruman air alur limpah, dengungan motor grid 50Hz, enjin trak, petir ribut monsun, siren amaran banjir).
   - Kitaran 24 jam siang/malam dengan pergerakan matahari, bulan, bayang-bayang, dan lampu jalan malam.
   - Kitaran cuaca: Cerah, Mendung, Hujan, Ribut Tengkujuh, Kemarau El Nino.

7. **Penyimpanan Data Tempatan (LocalStorage)**:
   - Simpanan automatik setiap 30 saat.
   - Simpanan manual dan fungsi kembali ke tetapan asal.

---

## 🚀 Panduan Memulakan & Menjalankan Projek

### 1. Pemasangan Dependensi
```bash
npm install
```

### 2. Menjalankan Pelayan Pembangunan
```bash
npm run dev
```
Buka pelayar web anda di `http://localhost:3000`.

### 3. Membina untuk Pengeluaran (Production Build)
```bash
npm run build
```

### 4. Mengesahkan Kod & Jenis TypeScript
```bash
npm run lint
```

---

## 📱 Pemasangan Sebagai Aplikasi Android (APK / PWA)

Permainan ini dilengkapi dengan sokongan penuh **Progressive Web App (PWA)** standard Android:
1. Buka laman permainan di pelayar **Google Chrome** atau **Samsung Internet** di telefon pintar Android.
2. Tekan butang hijau **"Pasang Android"** pada Menu Utama atau bar status HUD.
3. Sahkan pemasangan; ikon **DAMVERSE** akan muncul di Skrin Utama (*Home Screen*) dan Laci Aplikasi (*App Drawer*) telefon anda.
4. Nikmati permainan dalam mod **Skrin Penuh (Standalone)** tanpa bar carian pelayar, dengan sokongan getaran haptik (*haptic feedback*), responsif sentuhan 60 FPS, dan boleh dibuka secara luar talian (*offline*).

---

## 🎮 Kawalan Permainan

| Tindakan | Papan Kekunci Desktop | Peranti Skrin Sentuh Android |
|---|---|---|
| **Pergerakan** | `W`, `A`, `S`, `D` atau Anak Panah | Kayu Bedik Maya (Bawah Kiri) |
| **Pusing Pandangan** | Seret Tetikus | Seret Skrin Kanan |
| **Lari Laju** | Kekunci `Shift` | Butang Pecutan (Kanan) |
| **Lompat** | Kekunci `Angkasa` (Space) | Butang Lompat (Kanan) |
| **Pandu / Keluar Trak** | Kekunci `E` | Butang Ikon Trak |
| **Skrin Penuh** | - | Butang Skrin Penuh (Atas Kanan) |
| **Jeda / Menu** | Kekunci `Esc` | Butang Jeda (Bawah) |

