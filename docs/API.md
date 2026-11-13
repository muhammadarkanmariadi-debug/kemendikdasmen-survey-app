# API Specification & Contract Document (API.md)
## Dokumentasi Kontrak REST API Platform Survei Kemendikbud

---

## 1. Standar Format Respons API

Seluruh endpoint backend NestJS mengembalikan format respons standar:

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": {},
  "meta": {
    "page": 1,
    "quantity": 10,
    "total": 50
  }
}
```

---

## 2. Modul Autentikasi (`/api/auth`)

### 2.1. Login Pengguna
- **Method / Path**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "admin_pusat",
    "password": "Password123!"
  }
  ```
- **Response**: JWT Token & profil pengguna (Role: `ADMIN | PETUGAS | INSTANSI`).

---

## 3. Modul Kuesioner & Form Builder (`/api/surveys` & `/api/instruments`)

### 3.1. Reorder Batch Pertanyaan (Drag & Drop Sync)
- **Method / Path**: `PATCH /api/instruments/reorder`
- **Headers**: `Authorization: Bearer <TOKEN_ADMIN>`
- **Request Body**:
  ```json
  {
    "id_survey": "uuid-survey",
    "items": [
      { "uuid": "pertanyaan-uuid-1", "order_index": 1, "id_kategori": "kategori-uuid-1" },
      { "uuid": "pertanyaan-uuid-2", "order_index": 2, "id_kategori": "kategori-uuid-1" }
    ]
  }
  ```

### 3.2. Reorder Batch Halaman / Bagian
- **Method / Path**: `PATCH /api/kategori/reorder`
- **Headers**: `Authorization: Bearer <TOKEN_ADMIN>`
- **Request Body**:
  ```json
  {
    "id_survey": "uuid-survey",
    "items": [
      { "uuid": "kategori-uuid-1", "order_index": 1 },
      { "uuid": "kategori-uuid-2", "order_index": 2 }
    ]
  }
  ```

### 3.3. Get Full Survey Tree (Cached untuk Form Runner)
- **Method / Path**: `GET /api/surveys/:id/full-schema`
- **Keterangan**: Mengembalikan struktur survei utuh (Survei $\rightarrow$ Bagian $\rightarrow$ Pertanyaan $\rightarrow$ Opsi + Aturan Logika Percabangan) untuk evaluasi instan di browser.

---

## 4. Modul Relasi Logika Percabangan (`/api/logic`)

### 4.1. Tambah Aturan Logika Bersyarat
- **Method / Path**: `POST /api/logic`
- **Request Body**:
  ```json
  {
    "id_target_pertanyaan": "uuid-pertanyaan-anak",
    "id_source_pertanyaan": "uuid-pertanyaan-induk",
    "id_opsi_pemicu": "uuid-opsi-ya",
    "operator": "EQUALS",
    "nilai_pemicu": ""
  }
  ```

---

## 5. Modul Penugasan Multi-Instansi Petugas (`/api/assignments`)

### 5.1. Bulk Assignment Petugas
- **Method / Path**: `POST /api/assignments/bulk`
- **Request Body**:
  ```json
  {
    "id_survey": "uuid-survey",
    "id_petugas": "uuid-petugas",
    "id_instansi_list": [
      "uuid-sekolah-smkn1",
      "uuid-sekolah-smkn2",
      "uuid-sekolah-smkn3"
    ]
  }
  ```

---

## 6. Modul Pengisian Kuesioner (`/api/submission`)

### 6.1. Simpan Jawaban Kuesioner (Mode Wawancara Petugas / Terotentikasi)
- **Method / Path**: `POST /api/submission`
- **Request Body**:
  ```json
  {
    "id_survey": "uuid-survey",
    "id_instansi": "uuid-instansi",
    "id_responden_sekolah": "uuid-sub-responden",
    "id_petugas": "uuid-petugas-opsional",
    "jawaban": [
      {
        "id_pertanyaan": "uuid-q1",
        "jenis": "PILIHAN_GANDA",
        "jawaban": "{\"id_opsi_jawaban\": \"uuid-opsi\", \"text\": \"Ya\"}",
        "catatan": ""
      },
      {
        "id_pertanyaan": "uuid-q2",
        "jenis": "UPLOAD_FILE",
        "jawaban": "https://storage.kemdikbud.go.id/survei/doc-123.pdf",
        "catatan": "Bukti sertifikat akreditasi"
      }
    ]
  }
  ```

---

## 7. Modul Kuesioner Publik Tanpa Kredensial (`/api/public`)

Endpoint berikut **TIDAK memerlukan token autentikasi (Zero-Credential)** untuk memfasilitasi pengisian publik oleh Siswa, Guru, dan Kepala Sekolah:

### 7.1. Ambil Informasi Survei Publik
- **Method / Path**: `GET /api/public/surveys/:public_link`
- **Response**: Detail nama survei, deskripsi, status aktif, dan daftar bagian/halaman kuesioner.

### 7.2. Ambil Daftar Sekolah yang Di-assign ke Survei Ini
- **Method / Path**: `GET /api/public/surveys/:public_link/assigned-institutions`
- **Response**: Array instansi sekolah binaan yang terdaftar pada survei ini (NPSN, nama instansi, kota, provinsi) untuk mengisi dropdown/search selector responden.

### 7.3. Kirim Pengisian Kuesioner Publik (Public Submit)
- **Method / Path**: `POST /api/public/submission`
- **Request Body**:
  ```json
  {
    "public_link": "evaluasi-vokasi-2026",
    "id_instansi": "uuid-instansi-terpilih",
    "sub_role": "SISWA", // "SISWA" | "GURU" | "KEPALA_SEKOLAH"
    "nama_lengkap": "Budi Santoso",
    "nomor_identitas": "0051234567", // NIS / NUPTK
    "kontak": "08123456789",
    "jawaban": [
      {
        "id_pertanyaan": "uuid-q1",
        "jenis": "PILIHAN_GANDA",
        "jawaban": "{\"id_opsi_jawaban\": \"uuid-opsi-1\", \"text\": \"Sangat Baik\"}",
        "catatan": ""
      }
    ]
  }
  ```


