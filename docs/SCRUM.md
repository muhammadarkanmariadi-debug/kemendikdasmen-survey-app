# SCRUM SPRINT PLAN (3 HARI - 2 DEVELOPER)
## Transformasi & Optimasi Sistem Survei Berstandar Google Forms & Kemendikbud

---

## 1. Ringkasan Sprint & Sasaran Utama (Sprint Goal)

- **Durasi Sprint**: 3 Hari Kerja (Intensif)
- **Kapasitas Tim**: 2 Developer (Fullstack)
- **Sprint Goal**:
  1. Memodernisasi dependensi (TanStack Query v5, Zod, React Hook Form, `@dnd-kit`, NestJS Cache & Throttler).
  2. Mengimplementasikan fitur **Form Builder Drag-and-Drop** dan **Form Runner Multi-Page** ala Google Forms dengan identitas visual Kemendikbud.
  3. Membangun **Hierarki Responden Pendidikan** (Instansi/NPSN, Siswa/NIS, Guru/NUPTK, Kepsek/NUPTK) dan **Penugasan Multi-Instansi Petugas**.
  4. Menerapkan **Relasi Logika Percabangan (*Conditional Skip Logic*)** dan sistem caching frontend/backend.

---

## 2. Matriks Pembagian Tanggung Jawab Per Modul (RACI Matrix)

| Modul Eksisting & Target | Developer 1 (Dev A) | Developer 2 (Dev B) | Fokus Utama Modul |
| :--- | :---: | :---: | :--- |
| **Pembersihan & Restrukturisasi Folder** | **Lead** | Support | Perataan folder ganda, tsconfig alias, dan hapus rute typo. |
| **Prisma Schema & Migrasi DB** | Joint | Joint | Eksekusi perubahan skema di `prisma/schema.prisma` dan migrasi. |
| **Modul `surveys` & `kategori`** | **Owner** | - | Section/Page pagination, order_index, CRUD bagian. |
| **Modul `instruments` & Drag-Drop** | **Owner** | - | Batch reorder API, `@dnd-kit` Canvas Builder, rich input types. |
| **Modul `logic` (Percabangan)** | **Owner** | - | Skip logic engine, evaluasi dependensi jawaban real-time. |
| **Modul `users` & `admins`** | - | **Owner** | Filter user berjenjang, otentikasi role, audit trail. |
| **Modul `instansi` & `responden_sekolah`** | - | **Owner** | Profil NPSN, sub-responden Siswa (NIS), Guru/Kepsek (NUPTK). |
| **Modul `assignments` (Multi-Instansi)** | - | **Owner** | Bulk assignment petugas ke banyak sekolah binaan per survei. |
| **Modul `submission` & Runner** | Review | **Owner** | Runner form validation Zod, upload file, offline draft, TTD & GPS. |
| **Desain Sistem & Komponen UI** | **Owner** | Review | Implementasi token desain Kemendikbud di Tailwind CSS v4. |

---

## 3. Jadwal Eksekusi Harian (Daily Breakdown)

```mermaid
gantt
    title Timeline Eksekusi 3 Hari (Dev 1 & Dev 2) - SELESAI
    dateFormat  HH:mm
    axisFormat  %H:%M
    
    section HARI 1: Fondasi & Backend Core
    Setup Dependensi & Folder Flattening     :done, d1_setup, 08:30, 2h
    Prisma Migration (order_index, sub_role) :done, d1_prisma, 10:30, 2h
    Dev 1: API Surveys, Categories, Reorder  :done, d1_dev1, 13:30, 4h
    Dev 2: API Users, Instansi, Sub-Role, Ass:done, d1_dev2, 13:30, 4h
    Daily Sync & Testing API Postman         :done, d1_sync, 17:30, 1h
    
    section HARI 2: Form Builder & Hierarchy UI
    Dev 1: Canvas Builder Google Forms + DnD :done, d2_dev1_builder, 08:30, 5h
    Dev 2: Management Users, NPSN, Assign UI :done, d2_dev2_user, 08:30, 5h
    Dev 1: Conditional Logic Modal & Engine  :done, d2_dev1_logic, 14:30, 3h
    Dev 2: Sub-Responden Data Entry Portal   :done, d2_dev2_sub, 14:30, 3h
    Daily Sync & Integrasi State             :done, d2_sync, 17:30, 1h
    
    section HARI 3: Runner, Caching & Finishing
    Dev 1: Form Runner Multi-Page + Progress :done, d3_dev1_runner, 08:30, 4h
    Dev 2: Submission Engine, Zod, File Upld :done, d3_dev2_subm, 08:30, 4h
    Dev 1: TanStack Caching & Optimistic UI  :done, d3_dev1_cache, 13:30, 3h
    Dev 2: Petugas Field Mode (TTD, GPS)     :done, d3_dev2_field, 13:30, 3h
    End-to-End Testing & UAT Polish          :done, d3_uat, 16:30, 2h
```

---

### HARI 1: Restrukturisasi, Dependensi, dan Core API Backend

#### Pagi (08.30 - 12.30): Bersama (Joint Tasks)
- [x] **Task 1.1**: Meratakan folder ganda (`pro-backend-survei-main` & `pro-frontend-survei-main`).
- [x] **Task 1.2**: Instalasi paket dependensi baru:
  - *Frontend*: `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`, `clsx`, `tailwind-merge`.
  - *Backend*: `@nestjs/cache-manager`, `cache-manager`, `@nestjs/throttler`, `helmet`, `compression`.
- [x] **Task 1.3**: Menerapkan skema baru pada `prisma/schema.prisma` dan menjalankan `npx prisma db push` + `npx prisma generate`.

#### Siang - Sore (13.30 - 17.30): Pembagian Modul
- [x] **Developer 1 (Modul `surveys`, `kategori`, `instruments`, `logic`)**:
  - Memperbarui `KategoriService`: Menambahkan kolom `order_index` dan endpoint `PATCH /kategori/reorder`.
  - Memperbarui `InstrumentsService`: Menambahkan enum tipe pertanyaan lengkap (`UPLOAD_FILE`, `SKALA_LINEAR`, `TANGGAL`), kolom `order_index`, `file_config`, `scale_config`, dan `for_sub_role`.
  - Membuat endpoint `PATCH /instruments/reorder` menggunakan transaksi database atomic (`prisma.$transaction`).
  - Menyiapkan modul `logic`: CRUD relasi bersyarat pertanyaan (`logic_pertanyaan`).
- [x] **Developer 2 (Modul `users`, `instansi`, `responden_sekolah`, `assignments`)**:
  - Memperbarui model `instansi`: Menambahkan pencarian berbasis `npsn` terindeks.
  - Membuat modul `responden_sekolah`: CRUD data warga sekolah (Siswa/NIS, Guru/NUPTK, Kepsek/NUPTK).
  - Memperbarui modul `assignments`: Membuat endpoint `POST /assignments/bulk` untuk penugasan multi-instansi ke petugas.
  - Membuat endpoint filter terpadu: `GET /users/hierarchy` (filter Admin, Petugas, Sekolah/NPSN, dan sub-role).

#### Evaluasi Hari 1 (17.30 - 18.00)
- [x] Pengujian seluruh endpoint API baru menggunakan Postman / Swagger UI.

---

### HARI 2: Form Builder Kanvas, Drag-and-Drop, dan Portal Pengguna

#### Pagi - Siang (08.30 - 14.30)
- [x] **Developer 1 (Frontend: Survey Canvas Builder)**:
  - Setup `QueryClientProvider` di `app/layout.tsx` atau `providers.tsx`.
  - Mengonfigurasi token warna Kemendikbud & komponen kartu di Tailwind CSS v4 (`docs/DESIGN.md`).
  - Membangun antarmuka kanvas builder ala Google Forms:
    - Kartu header kuesioner dengan aksen garis gradien 6px.
    - Integrasi `@dnd-kit/core` & `@dnd-kit/sortable` untuk seret-lepas kartu soal.
    - Komponen `QuestionCard`: Tipe input selector, inline edit teks pertanyaan, tombol duplikat, hapus, toggle wajib diisi (*required*).
- [x] **Developer 2 (Frontend: Manajemen Pengguna & Penugasan)**:
  - Mengonsolidasikan folder typo (menghapus duplikasi `app/admin/kuisioner` dan merapikan navigasi).
  - Membangun halaman `app/(dashboard)/admin/users`: Tabel filter pengguna berdasarkan Role, NPSN Sekolah, dan Sub-Role (Siswa, Guru, Kepsek).
  - Membangun halaman `app/(dashboard)/admin/assignments`: Antarmuka pemilihan Petugas dan multi-select Sekolah binaan yang ditugaskan.

#### Sore (14.30 - 17.30)
- [x] **Developer 1**:
  - Membangun modal **Atur Logika Percabangan**: Pemilihan kondisi pemicu (*"Jika jawaban Pertanyaan A = 'Ya', maka tampilkan pertanyaan ini"*).
  - Menambahkan *Floating Toolbar* di sisi kanan (+ Pertanyaan, + Bagian/Page, + Judul).
- [x] **Developer 2**:
  - Membangun halaman entri data Siswa (NIS) & Guru/Kepsek (NUPTK) pada dashboard instansi sekolah.
  - Memastikan otentikasi login instansi menggunakan NPSN berjalan mulus.

#### Evaluasi Hari 2 (17.30 - 18.00)
- [x] Demo uji coba seret-lepas kartu pertanyaan di kanvas builder dan verifikasi data user hierarki.

---

### HARI 3: Form Runner Google Forms, Validasi Zod, Caching & Peluncuran

#### Pagi - Siang (08.30 - 13.30)
- [x] **Developer 1 (Frontend: Form Runner & Skip Logic Runtime)**:
  - Membangun antarmuka **Form Runner Kuesioner Multi-Page**:
    - Tampilan kartu bersih ala Google Forms.
    - *Encouraging Progress Bar* dengan pesan motivasi dinamis ("Halaman 2 dari 3").
    - Navigasi tombol *Sebelumnya* dan *Berikutnya*.
  - Membangun custom hook `useConditionalLogic`: Evaluasi otomatis visibilitas pertanyaan anak berdasarkan jawaban yang dipilih tanpa refresh halaman.
- [x] **Developer 2 (Frontend & Backend: Validasi Zod, Upload & Submission Engine)**:
  - Menyusun skema Zod lengkap di `schemas/submission.schema.ts` untuk memvalidasi isian kuesioner dan batas file upload.
  - Memperbarui `SubmissionService` di backend: Menyimpan butir jawaban, mengaitkan dengan ID sub-responden atau petugas, dan menangani upload berkas.
  - Mengintegrasikan fitur Tanda Tangan Digital (Canvas Signature Pad) dan rekam koordinat GPS petugas.

#### Siang - Sore (13.30 - 16.30)
- [x] **Developer 1**:
  - Mengoptimalkan performa frontend dengan **TanStack Query Caching**:
    - Implementasi *Optimistic Updates* pada mutasi reorder drag-and-drop agar posisi kartu berpindah secara instan (<10ms).
    - Cache invalidation saat ada perubahan struktur instrumen survei.
- [x] **Developer 2**:
  - Mengimplementasikan fitur **Local Draft Auto-Save**: Isian kuesioner otomatis tersimpan di LocalStorage/IndexedDB agar petugas lapangan tidak kehilangan data saat sinyal terputus.
  - Mengaktifkan `@nestjs/throttler` (rate limiting) dan `compression` di backend `main.ts`.

#### Sore - Selesai (16.30 - 18.30): End-to-End Testing & UAT Polish
- [x] Simulasi alur penuh dari 3 sudut pandang:
  1. **Admin**: Bikin kuesioner $\rightarrow$ Drag-and-drop urutan $\rightarrow$ Pasang logika bersyarat $\rightarrow$ Assign petugas.
  2. **Petugas**: Buka sekolah binaan $\rightarrow$ Pilih wawancara Siswa (NIS) $\rightarrow$ Isi kuesioner $\rightarrow$ TTD & GPS $\rightarrow$ Submit.
  3. **Sekolah**: Login NPSN $\rightarrow$ Pengisian mandiri sesuai peran Guru/Kepsek $\rightarrow$ Lihat rekap status.
- [x] Final review kode dan pengemasan repositori bersih.

---

## 4. Definition of Done (DoD) Tiap User Story

Setiap tugas dianggap **SELESAI (DONE)** jika memenuhi kriteria:
1. **Fungsional**: Fitur berjalan sesuai spesifikasi di [`docs/PRD.md`](PRD.md) tanpa kesalahan runtime di konsol browser.
2. **Type-Safe**: Bebas dari error TypeScript (`npm run build` lulus di backend dan frontend).
3. **Validasi Terpenuhi**: Form menggunakan Zod dan menampilkan pesan error bahasa Indonesia yang jelas.
4. **Desain Konsisten**: Mengikuti token warna dan komponen kartu pada [`docs/DESIGN.md`](DESIGN.md).
5. **Performa Terjaga**: Menggunakan TanStack Query untuk fetching/caching; operasi drag-and-drop tidak mengalami jeda (lag).

