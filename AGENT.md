# AGENT.MD
## Gerbang Arsitektur & Panduan Operasional AI Agent & Pengembang

Selamat datang di repositori **Platform Survei & Kuesioner Pendidikan Kemendikbudristek**.  
File ini adalah **pintu gerbang utama (entry point)** bagi setiap AI Agent (Antigravity, Cursor, Claude Code, GitHub Copilot) maupun pengembang perangkat lunak untuk memahami struktur, standar arsitektur, dan aturan pengembangan proyek ini.

---

## 1. Peta Navigasi Dokumentasi (`docs/`)

Sebelum melakukan modifikasi kode, membuat fitur baru, atau mengubah skema basis data, Anda **WAJIB** membaca dan mengacu pada dokumen-dokumen yang berada di folder `docs/`:

| Dokumen | Lokasi File | Deskripsi & Isi Panduan |
| :--- | :--- | :--- |
| **PRD** | [`docs/PRD.md`](docs/PRD.md) | **Product Requirements Document**: Analisis kesenjangan, hierarki role (Admin, Petugas, Instansi/NPSN, Siswa/NIS, Guru/NUPTK, Kepsek/NUPTK), dan alur kuesioner ala Google Forms. |
| **TRD** | [`docs/TRD.md`](docs/TRD.md) | **Technical Requirements Document**: Pembaruan dependensi, sistem caching TanStack Query v5, validasi Zod + React Hook Form, blueprint drag-and-drop `@dnd-kit`, dan restrukturisasi folder. |
| **DESIGN** | [`docs/DESIGN.md`](docs/DESIGN.md) | **Design System Kemendikbud**: Filosofi visual Tut Wuri Handayani, palet warna *Clean, Minimalist, yet Cheerful*, token Tailwind CSS v4, pola kartu Google Forms, dan standar aksesibilitas WCAG AA. |
| **SCHEMA** | [`docs/SCHEMA.md`](docs/SCHEMA.md) | **Database Schema & ERD**: Diagram ERD Mermaid, kamus data detail, tipe enum, indeks performa, dan file skema Prisma lengkap (`prisma/schema.prisma`). |
| **API** | [`docs/API.md`](docs/API.md) | **REST API Contracts**: Kontrak endpoint backend NestJS, format payload JSON, dan standar respons. |
| **SCRUM** | [`docs/SCRUM.md`](docs/SCRUM.md) | **3-Day Sprint Plan (2 Developers)**: Pembagian modul, timeline harian, acceptance criteria, dan Definition of Done. |

---

## 2. Ringkasan Eksekutif Sistem

Aplikasi ini merupakan platform kuesioner evaluasi pendidikan yang dirancang untuk menggantikan formulir konvensional menjadi pengalaman interaktif berstandar Google Forms:
- **Admin**: Merancang kuesioner dengan kanvas drag-and-drop, mengatur relasi percabangan logika (*skip logic*), dan mengaudit data responden berjenjang.
- **Petugas Lapangan**: Pewawancara independen yang ditugaskan ke banyak sekolah (*multi-instansi*) untuk mewawancarai warga sekolah secara langsung.
- **Instansi / Satuan Pendidikan**: Mengakses kuesioner berbasis **NPSN** resmi dan mendistribusikan isian ke sub-responden:
  - **Siswa**: Identitas nomor unik **NIS / NISN**.
  - **Guru**: Identitas nomor unik **NUPTK**.
  - **Kepala Sekolah**: Identitas nomor unik **NUPTK**.

---

## 3. Tech Stack & Dependensi Inti

### Frontend
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) dengan token desain Kemendikbud.
- **State & Caching**: `@tanstack/react-query` v5 (Client-side caching, stale-while-revalidate, optimistic updates).
- **Form Management**: `react-hook-form` + `zod` (`@hookform/resolvers`).
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable` (Reordering kartu soal dan halaman).
- **Icons**: `lucide-react` (Ikon minimalis seragam ala Google Workspace).

### Backend
- **Framework**: NestJS 11 (Modular Clean Architecture).
- **Database ORM**: Prisma 6 dengan basis data MySQL.
- **Caching & Resilience**: `@nestjs/cache-manager`, `cache-manager`, `@nestjs/throttler`.
- **Keamanan**: `@nestjs/passport`, `@nestjs/jwt`, `bcrypt`, `helmet`, `compression`.

---

## 4. Aturan Pengkodean Mutlak (Golden Rules for Agents)

1. **Konsistensi Skema Basis Data**:
   - Dilarang keras memodifikasi `prisma/schema.prisma` tanpa mencocokkannya terlebih dahulu dengan [`docs/SCHEMA.md`](docs/SCHEMA.md).
   - Selalu gunakan transaksi atomic (`prisma.$transaction`) saat melakukan reorder posisi pertanyaan atau halaman.
2. **Type Safety & Validasi Input**:
   - Seluruh input formulir wajib divalidasi menggunakan skema Zod sebelum dikirim ke API atau diproses backend.
   - Jangan menggunakan tipe `any` tanpa alasan esensial; manfaatkan inferensi tipe Zod (`z.infer<typeof ...>`).
3. **Pemberian Token Warna & UI**:
   - Jangan pernah menyuntikkan kode hex sembarangan secara inline (misal: `#123456`). Selalu rujuk token resmi pada [`docs/DESIGN.md`](docs/DESIGN.md) (`primary-600`, `accent-gold`, `surface-bg`, dll.).
4. **Optimistic Updates**:
   - Operasi drag-and-drop pertanyaan harus langsung ter-update di UI menggunakan TanStack Query `onMutate` dan memiliki penanganan `onError` rollback jika request gagal.
5. **Kebersihan Rute & Folder**:
   - Hindari duplikasi folder (contoh kasus lama: `app/admin/kuisioner` dan `app/admin/kuesioner`). Gunakan rute terpadu `app/(dashboard)/admin/surveys`.

---

## 5. Perintah Rutin Operasional (Root CLI & NPM Scripts)

Untuk kemudahan pengelolaan proyek secara terpadu langsung dari **root folder**, gunakan skrip CLI bawaan (`survei.bat` / `survei.ps1` / `npm`):

### Cara Singkat (Root CLI):
```bash
# Menjalankan Backend (port 4800) & Frontend (port 3900) bersamaan
survei dev
# atau: .\survei.ps1 dev

# Melakukan compile production Backend & Frontend
survei build

# Sinkronisasi skema database Prisma (db push)
survei db push

# Generate Prisma Client terbaru
survei db generate

# Membuka Prisma Studio web GUI
survei db studio

# Menjalankan migrasi Prisma
survei db migrate

# Install semua dependensi (Root, Backend, Frontend)
survei install
```

### Alternatif melalui NPM Scripts di Root:
```bash
npm run dev              # Menjalankan backend + frontend paralel (concurrently)
npm run dev:backend      # Menjalankan backend saja (port 4800)
npm run dev:frontend     # Menjalankan frontend saja (port 3900)
npm run build            # Build backend & frontend
npm run db:push          # Sinkronisasi skema database
npm run db:generate      # Generate Prisma client
npm run db:studio        # Buka Prisma Studio
npm run install:all      # Install seluruh dependensi
```

---

*Dengan membaca file ini, setiap agent dan developer diharapkan memiliki pemahaman arsitektur yang selaras dan dapat melanjutkan implementasi secara presisi dan terstandardisasi.*
