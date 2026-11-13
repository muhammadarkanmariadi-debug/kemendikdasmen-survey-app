# Panduan Multi-Provider Database

Sistem Survei & Instrumen Digital Direktorat SMK mendukung multi-provider database secara dinamis. Anda dapat menggunakan:
- **MySQL / MariaDB** (Default)
- **PostgreSQL**
- **SQLite** (Cocok untuk testing lokal ringan tanpa server database terpisah)
- **Microsoft SQL Server**

---

## 1. Cara Kerja Multi-Provider

Prisma ORM secara default membutuhkan penulisan statis `provider` di file `schema.prisma`. Untuk memberikan fleksibilitas penuh:
1. **Master Schema (`prisma/schema.template.prisma`)**: Menyimpan skema acuan seluruh tabel dan relasi.
2. **Synchronizer Engine (`scripts/db-provider.js`)**:
   - Mendeteksi provider dari environment variable `DB_PROVIDER` atau secara otomatis membaca skema URL `DATABASE_URL` (misal `postgresql://...` atau `mysql://...` atau `file:...`).
   - Melakukan transformasi tipe data spesifik (misal: mengganti `@db.LongText` MySQL menjadi `@db.Text` untuk PostgreSQL, atau menghapus native attributes untuk SQLite).
   - Menghasilkan file aktif `prisma/schema.prisma` yang valid dan siap digunakan.

---

## 2. Cara Mengganti Provider Database

### Cara A: Melalui Perintah CLI (Paling Mudah)
Dari folder root proyek:
```bash
# Mengganti ke PostgreSQL
.\survei db switch postgresql
# atau
npm run db:switch postgresql

# Mengganti ke MySQL
.\survei db switch mysql
# atau
npm run db:switch mysql

# Mengganti ke SQLite
.\survei db switch sqlite
# atau
npm run db:switch sqlite
```

### Cara B: Mengubah File `.env` Backend
Buka file `pro-backend-survei-main/pro-backend-survei-main/.env`:
```env
# Tentukan provider
DB_PROVIDER=postgresql

# Sesuaikan string koneksi
DATABASE_URL="postgresql://postgres:password@localhost:5432/apel_cabdin?schema=public"
```
Setelah mengubah `.env`, jalankan:
```bash
npm run db:push
# atau
.\survei db push
```
Skrip otomatis menyinkronkan skema dan menerapkan perubahan ke database yang dituju.

---

## 3. Format URL Koneksi

| Database | Format URL Contoh |
| :--- | :--- |
| **MySQL** | `mysql://root:password@localhost:3306/apel_cabdin` |
| **PostgreSQL** | `postgresql://postgres:password@localhost:5432/apel_cabdin?schema=public` |
| **SQLite** | `file:./dev.db` |
| **SQL Server** | `sqlserver://localhost:1433;database=apel_cabdin;user=sa;password=pass;encrypt=true` |

---

## 4. Perintah Terkait Database

| Perintah | Deskripsi |
| :--- | :--- |
| `.\survei db switch <provider>` | Mengganti provider dan sinkronisasi skema Prisma |
| `.\survei db push` | Menerapkan struktur tabel ke database aktif |
| `.\survei db generate` | Menghasilkan Prisma Client TypeScript |
| `.\survei db migrate` | Menjalankan Prisma Migration (Dev) |
| `.\survei db studio` | Membuka antarmuka grafis data browser (Prisma Studio) |

