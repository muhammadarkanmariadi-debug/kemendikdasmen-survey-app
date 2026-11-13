# Sistem Survei & Instrumen Digital Direktorat SMK (Kemendikbudristek)
> **Google Forms Experience & Educational Hierarchy Platform**

Aplikasi platform kuesioner digital berstandar **Google Forms** dengan visual identity resmi **Kemendikbudristek** (`#0B5C9E` & `#FFB703`). Mendukung kanvas drag-and-drop urutan butir pertanyaan, *conditional skip logic*, runner kuesioner multi-halaman berprogres dinamis, mode lapangan petugas (tanda tangan digital & GPS), serta hierarki responden pendidikan (Instansi NPSN, Siswa NIS, Guru NUPTK, dan Kepala Sekolah NUPTK).

---

## 🚀 Perintah Bawaan (Built-in Root Commands)

Pengelolaan proyek kini dapat dijalankan langsung dari **root folder** tanpa harus berpindah-pindah sub-direktori, menggunakan skrip CLI `survei` atau `npm`.

### 1. Menjalankan Server Pengembangan (Dev Mode)
Menjalankan Backend NestJS (port 4800) dan Frontend Next.js 15 (port 3900) secara bersamaan:
```bash
survei dev
# atau
npm run dev
```

Jika hanya ingin menjalankan salah satu:
```bash
survei backend      # atau: npm run dev:backend
survei frontend     # atau: npm run dev:frontend
```

---

### 2. Kompilasi Produksi (Build)
Melakukan compile type-check dan production build untuk kedua aplikasi:
```bash
survei build
# atau
npm run build
```

Hanya build salah satu:
```bash
survei build:backend    # atau: npm run build:backend
survei build:frontend   # atau: npm run build:frontend
```

---

### 3. Pengelolaan Database (Prisma ORM)
Sinkronisasi dan manajemen skema MySQL database:
```bash
# Sinkronisasi skema prisma/schema.prisma ke database MySQL (tanpa migrasi berkas)
survei db push
# atau: npm run db:push

# Generate Prisma Client terbaru
survei db generate
# atau: npm run db:generate

# Menjalankan migrasi database
survei db migrate
# atau: npm run db:migrate

# Membuka Prisma Studio (Web GUI Database Manager)
survei db studio
# atau: npm run db:studio
```

---

### 4. Instalasi Dependensi & Linting
```bash
# Menginstall seluruh dependensi (Root, Backend, Frontend)
survei install
# atau: npm run install:all

# Menjalankan linter
survei lint
# atau: npm run lint
```

---

## 📁 Struktur Repositori

```text
app-survei/
├── AGENT.md                 # Panduan arsitektur & operational rules untuk AI agent
├── README.md                # Panduan instalasi dan penggunaan proyek
├── package.json             # Root package manager & concurrently scripts
├── survei.bat               # Windows batch CLI runner
├── survei.ps1               # PowerShell CLI runner
├── survei.sh                # Bash CLI runner (Linux / macOS / WSL)
├── docs/                    # Dokumentasi lengkap proyek
│   ├── PRD.md               # Product Requirements Document
│   ├── TRD.md               # Technical Requirements Document
│   ├── DESIGN.md            # Panduan desain & token Kemendikbud
│   ├── SCHEMA.md            # ERD & Prisma Schema database
│   ├── API.md               # Kontrak REST API
│   └── SCRUM.md             # Sprint plan & status eksekusi
├── pro-backend-survei-main/ # Backend NestJS 11 + Prisma ORM + MySQL
└── pro-frontend-survei-main/# Frontend Next.js 15 + React 19 + TanStack Query + Tailwind
```

---

## 🌐 Alur Kuesioner Publik (Zero-Credential)
1. Buka portal kuesioner publik di `/public`.
2. Pilih instrumen survei aktif $\rightarrow$ diarahkan ke `/form/[public_link]`.
3. Pilih Satuan Pendidikan / Sekolah binaan yang ter-assign (pencarian instan nama & NPSN).
4. Pilih peran responden (**Siswa** / **Guru** / **Kepala Sekolah**).
5. Masukkan identitas (**NIS/NISN** untuk siswa, **NUPTK** untuk pendidik).
6. Pengisian formulir multi-halaman interaktif dengan *auto-save draft* dan percabangan pertanyaan dinamis.

