# Design System & UI/UX Guidelines
## Identitas Visual Kemendikbud: Clean, Minimalist, yet Cheerful

---

## 1. Filosofi Desain & Karakter Brand

Sistem desain ini dirancang khusus untuk platform survei dan evaluasi pendidikan. Desain ini memadukan marwah institusional **Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek)** dengan pendekatan modern: **Clean & Minimalist, yet Cheerful**.

```
       [ Kredibilitas Institusi ]               [ Pengalaman Pengguna Modern ]
          Biru Bahari Kemendikbud       +            Aksen Kuning Emas & Sky Blue
      (Profesional, Terpercaya, Aman)              (Energik, Ramah, Bersahabat)
                                      |
                                      v
          +-------------------------------------------------------+
          |  Pendidikan yang Memerdekakan, Menyenangkan & Eksklusif  |
          +-------------------------------------------------------+
```

### 3 Pilar Desain Inti:
1. **Clean & Minimalist (Fokus Tanpa Distraksi)**:
   - Menghilangkan elemen visual yang tidak esensial. Kuesioner panjang tidak boleh membuat responden jenuh atau terintimidasi.
   - Penggunaan ruang negatif (*whitespace*) yang lapang dan tata letak kartu (*card-based UI*) ala Google Forms.
2. **Cheerful & Encouraging (Penuh Semangat Edukasi)**:
   - Terinspirasi oleh semboyan *Tut Wuri Handayani* ("di belakang memberikan dorongan moral").
   - Warna aksen cerah (kuning matahari, toska, biru langit) dipadukan dengan mikro-interaksi yang ramah, pesan penyemangat (*gamified progress*), dan visual yang hangat bagi siswa, guru, maupun kepala sekolah.
3. **Inclusive & Effortless (Aksesibilitas Tinggi)**:
   - Memenuhi standar **WCAG 2.1 Level AA** untuk kontras warna.
   - Ramah perangkat bergerak (*mobile-first*) untuk petugas survei dan responden yang menggunakan ponsel pintar di berbagai wilayah Indonesia.

---

## 2. Palet Warna & Desain Token (Color Palette)

| Kategori Token | Nama Token | Nilai Hex | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Primary (Kemendikbud)** | `primary-50` | `#F0F7FD` | Latar belakang kartu aktif & hover lembut |
| | `primary-100` | `#DCEEFA` | Border fokus & badge info |
| | `primary-500` | `#1E77BD` | Tombol sekunder & link aktif |
| | `primary-600` | `#0B5C9E` | **Warna Utama**: Header, tombol primer, brand text |
| | `primary-800` | `#073B66` | Teks tombol saat ditekan & header tebal |
| **Cheerful Accent** | `accent-gold` | `#FFB703` | Highlight kuis, lencana prestasi, bintang rating |
| | `accent-amber` | `#F59E0B` | Progress bar, alert peringatan ramah |
| | `accent-sky` | `#0EA5E9` | Animasi loading, drag handle aktif, aksen ceria |
| **Netral (Canvas)** | `surface-bg` | `#F8FAFC` | Latar belakang seluruh halaman (Slate-50) |
| | `surface-card` | `#FFFFFF` | Latar kartu pertanyaan & modal |
| | `border-subtle` | `#E2E8F0` | Garis tepi kartu (Slate-200) |
| | `text-main` | `#0F172A` | Judul & pertanyaan kuesioner (Slate-900) |
| | `text-muted` | `#64748B` | Teks bantuan, keterangan opsi (Slate-500) |

### Role Badges
- **Siswa (NIS)**: `bg-sky-50 text-sky-700 border border-sky-200 font-semibold px-3 py-1 rounded-full text-xs`
- **Guru (NUPTK)**: `bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1 rounded-full text-xs`
- **Kepala Sekolah (NUPTK)**: `bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-3 py-1 rounded-full text-xs`
- **Petugas Lapangan**: `bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-3 py-1 rounded-full text-xs`

---

## 3. Pola Komponen Google Forms Modern

### 3.1. Header Banner Card
Garis aksen 6px di atas kartu header kuesioner:
`bg-gradient-to-r from-[#0B5C9E] via-[#1E77BD] to-[#FFB703]`.

### 3.2. Kartu Pertanyaan (Question Card)
- **Status Normal**: `bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300`
- **Status Aktif**: `bg-white rounded-2xl p-6 border border-blue-300 shadow-md ring-2 ring-blue-50 border-l-4 border-l-[#0B5C9E]`
- **Drag Handle**: 6 titik (`⋮⋮`) abu-abu halus di tengah-atas kartu dengan kursor `cursor-grab`.

### 3.3. Encouraging Progress Bar
Progress bar dengan pesan mikro motivasi:
`"Halaman 2 dari 4 (50%) - Hebat! Separuh perjalanan selesai. Lanjutkan bagian berikutnya!"`

