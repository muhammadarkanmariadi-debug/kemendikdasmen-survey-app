/**
 * Comprehensive Database Seeder for Sistem Survei Direktorat SMK (Kemendikbudristek)
 * Seeds:
 *  - Users (Super Admins, Petugas Lapangan, Instansi / Sekolah)
 *  - Jenis Responden (Siswa, Guru, Kepala Sekolah, Komite, Mitra Industri, Dinas)
 *  - Instansi (10 Satuan Pendidikan & Dinas di berbagai provinsi Indonesia)
 *  - Responden Sekolah (30+ Sub-Responden Siswa, Guru, Kepala Sekolah)
 *  - Responden (Primary Responden profiles)
 *  - Surveys (4 instrumen survei lengkap dengan kategori, pertanyaan multi-tipe & opsi)
 *  - Logic Pertanyaan (Aturan percabangan kondisi Google Forms style)
 *  - Assignments (Penugasan petugas lapangan ke instansi)
 *  - Hasil Survey & Jawaban Survey (15+ rekaman pengisian kuesioner)
 *  - Tanda Tangan Digital & Lokasi Geotag Petugas
 */

const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log(' Memulai Seeder Sistem Survei Direktorat SMK Kemendikbud...');
  console.log('====================================================');

  // 1. Membersihkan data lama secara bertahap (Clean up)
  console.log('[1/9] Membersihkan data tabel lama...');
  await prisma.jawaban_survey.deleteMany({});
  await prisma.tanda_tangan_responden.deleteMany({});
  await prisma.tanda_tangan_petugas.deleteMany({});
  await prisma.lokasi_petugas.deleteMany({});
  await prisma.dokumen_survey.deleteMany({});
  await prisma.dokumentasi_survey.deleteMany({});
  await prisma.hasil_survey.deleteMany({});
  await prisma.assignments.deleteMany({});
  await prisma.logic_pertanyaan.deleteMany({});
  await prisma.opsi_pertanyaan.deleteMany({});
  await prisma.pertanyaan.deleteMany({});
  await prisma.kategori.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.responden_sekolah.deleteMany({});
  await prisma.responden.deleteMany({});
  await prisma.instansi.deleteMany({});
  await prisma.jenis_responden.deleteMany({});
  await prisma.users.deleteMany({});

  // Hash password standar untuk seluruh akun seed: "password123"
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Seed Users (Admin, Petugas, dan Sekolah)
  console.log('[2/9] Menambahkan data Pengguna (Admins, Petugas, & Sekolah)...');

  // Admins
  const adminPusat = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Super Admin Pusmendik',
      username: 'admin',
      password: defaultPasswordHash,
      role: 'ADMIN',
    },
  });

  const adminSmk = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Admin Tata Kelola SMK',
      username: 'direktorat_smk',
      password: defaultPasswordHash,
      role: 'ADMIN',
    },
  });

  const adminMutu = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Admin Penjaminan Mutu Vokasi',
      username: 'penjaminan_mutu',
      password: defaultPasswordHash,
      role: 'ADMIN',
    },
  });

  // Petugas Lapangan
  const petugas1 = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Budi Santoso, S.Pd.',
      username: 'petugas_budi',
      password: defaultPasswordHash,
      role: 'PETUGAS',
    },
  });

  const petugas2 = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Dra. Siti Aminah, M.Pd.',
      username: 'petugas_siti',
      password: defaultPasswordHash,
      role: 'PETUGAS',
    },
  });

  const petugas3 = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Ahmad Fauzi, S.T.',
      username: 'petugas_ahmad',
      password: defaultPasswordHash,
      role: 'PETUGAS',
    },
  });

  const petugas4 = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Rina Kusuma, S.Kom.',
      username: 'petugas_rina',
      password: defaultPasswordHash,
      role: 'PETUGAS',
    },
  });

  const petugas5 = await prisma.users.create({
    data: {
      uuid: crypto.randomUUID(),
      nama_user: 'Hendra Wijaya, M.T.',
      username: 'petugas_hendra',
      password: defaultPasswordHash,
      role: 'PETUGAS',
    },
  });

  // 3. Seed Jenis Responden
  console.log('[3/9] Menambahkan data Jenis Responden...');
  const jenisSiswa = await prisma.jenis_responden.create({
    data: {
      uuid: crypto.randomUUID(),
      jenis: 'Siswa / Peserta Didik',
      is_public: true,
      tipe: 'SEKOLAH',
    },
  });

  const jenisGuru = await prisma.jenis_responden.create({
    data: {
      uuid: crypto.randomUUID(),
      jenis: 'Guru Kejuruan & Produktif',
      is_public: true,
      tipe: 'SEKOLAH',
    },
  });

  const jenisKepsek = await prisma.jenis_responden.create({
    data: {
      uuid: crypto.randomUUID(),
      jenis: 'Kepala Sekolah',
      is_public: true,
      tipe: 'SEKOLAH',
    },
  });

  const jenisKomite = await prisma.jenis_responden.create({
    data: {
      uuid: crypto.randomUUID(),
      jenis: 'Komite Sekolah / Wali Murid',
      is_public: true,
      tipe: 'SEKOLAH',
    },
  });

  const jenisDudi = await prisma.jenis_responden.create({
    data: {
      uuid: crypto.randomUUID(),
      jenis: 'Mitra Dunia Usaha & Industri (DUDI)',
      is_public: true,
      tipe: 'SEKOLAH',
    },
  });

  const jenisDinas = await prisma.jenis_responden.create({
    data: {
      uuid: crypto.randomUUID(),
      jenis: 'Cabang Dinas Pendidikan Provinsi',
      is_public: false,
      tipe: 'DINAS',
    },
  });

  // 4. Seed Instansi (Satuan Pendidikan & Dinas)
  console.log('[4/9] Menambahkan data Instansi & Akun Sekolah...');
  const instansiListRaw = [
    {
      nama: 'SMK Negeri 1 Jakarta',
      kode: '20101456',
      alamat: 'Jl. Budi Utomo No. 7, Pasar Baru, Sawah Besar',
      kota: 'Jakarta Pusat',
      provinsi: 'DKI Jakarta',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 2 Bandung',
      kode: '20219142',
      alamat: 'Jl. Cihampelas No. 211, Cipaganti, Coblong',
      kota: 'Kota Bandung',
      provinsi: 'Jawa Barat',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 4 Malang',
      kode: '20533811',
      alamat: 'Jl. Tanimbar No. 22, Kasin, Klojen',
      kota: 'Kota Malang',
      provinsi: 'Jawa Timur',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 1 Surabaya',
      kode: '20532211',
      alamat: 'Jl. SMEA No. 4, Wonokromo',
      kota: 'Kota Surabaya',
      provinsi: 'Jawa Timur',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 2 Yogyakarta',
      kode: '20403328',
      alamat: 'Jl. AM Sangaji No. 47, Cokrodiningratan, Jetis',
      kota: 'Kota Yogyakarta',
      provinsi: 'DI Yogyakarta',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 1 Denpasar',
      kode: '50103144',
      alamat: 'Jl. HOS Cokroaminoto No. 84, Ubung',
      kota: 'Kota Denpasar',
      provinsi: 'Bali',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 3 Makassar',
      kode: '40311982',
      alamat: 'Jl. Bonto Manai No. 14, Banta-Bantaeng, Rappocini',
      kota: 'Kota Makassar',
      provinsi: 'Sulawesi Selatan',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 1 Medan',
      kode: '10210850',
      alamat: 'Jl. Sindoro No. 1, Pusat Pasar, Medan Kota',
      kota: 'Kota Medan',
      provinsi: 'Sumatera Utara',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'SMK Negeri 2 Semarang',
      kode: '20328975',
      alamat: 'Jl. Dr. Cipto No. 121, Sarirejo, Semarang Timur',
      kota: 'Kota Semarang',
      provinsi: 'Jawa Tengah',
      tipe: 'SEKOLAH',
    },
    {
      nama: 'Dinas Pendidikan Provinsi Jawa Timur',
      kode: '60000001',
      alamat: 'Jl. Gentengkali No. 33, Genteng',
      kota: 'Kota Surabaya',
      provinsi: 'Jawa Timur',
      tipe: 'DINAS',
    },
  ];

  const createdInstansi = [];
  for (const item of instansiListRaw) {
    const userInstansi = await prisma.users.create({
      data: {
        uuid: crypto.randomUUID(),
        nama_user: item.nama,
        username: item.kode, // Login username menggunakan NPSN
        password: defaultPasswordHash,
        role: item.tipe === 'DINAS' ? 'DINAS' : 'SEKOLAH',
      },
    });

    const ins = await prisma.instansi.create({
      data: {
        uuid: crypto.randomUUID(),
        kode_instansi: item.kode,
        npsn: item.kode,
        nama_instansi: item.nama,
        alamat: item.alamat,
        kota: item.kota,
        provinsi: item.provinsi,
        tipe: item.tipe,
        user_id: userInstansi.uuid,
        id_jenis_responden: item.tipe === 'DINAS' ? jenisDinas.uuid : jenisKepsek.uuid,
      },
    });

    createdInstansi.push(ins);
  }

  // 5. Seed Sub-Responden Sekolah (Siswa, Guru, Kepala Sekolah)
  console.log('[5/9] Menambahkan data Sub-Responden Sekolah (Siswa, Guru, Kepsek)...');
  const createdSubRespondents = [];

  const subRespData = [
    // SMKN 1 Jakarta
    { insIdx: 0, role: 'KEPALA_SEKOLAH', no: '197203151998021001', nama: 'Drs. H. Mulyadi, M.Pd.', kontak: '081288991001' },
    { insIdx: 0, role: 'GURU', no: '198506122010011015', nama: 'Bambang Triatmojo, S.Pd.', kontak: '081288991002' },
    { insIdx: 0, role: 'GURU', no: '199004252014032008', nama: 'Dewi Anggraini, S.Kom.', kontak: '081288991003' },
    { insIdx: 0, role: 'SISWA', no: '0075412891', nama: 'Muhammad Rizky Pratama', kontak: '085711223301' },
    { insIdx: 0, role: 'SISWA', no: '0075412892', nama: 'Annisa Rahmawati Putri', kontak: '085711223302' },

    // SMKN 2 Bandung
    { insIdx: 1, role: 'KEPALA_SEKOLAH', no: '196811201994121002', nama: 'Dr. Tatang Suryana, M.M.', kontak: '081322445001' },
    { insIdx: 1, role: 'GURU', no: '198207192008011009', nama: 'Asep Saepuloh, S.T.', kontak: '081322445002' },
    { insIdx: 1, role: 'SISWA', no: '0068943210', nama: 'Dadan Ramdani', kontak: '087822334401' },
    { insIdx: 1, role: 'SISWA', no: '0068943211', nama: 'Siti Nurhaliza', kontak: '087822334402' },

    // SMKN 4 Malang
    { insIdx: 2, role: 'KEPALA_SEKOLAH', no: '197005141997031004', nama: 'Drs. Agus Triyono, M.Pd.', kontak: '081233445501' },
    { insIdx: 2, role: 'GURU', no: '198709082011012012', nama: 'Fitria Indah Lestari, M.Kom.', kontak: '081233445502' },
    { insIdx: 2, role: 'GURU', no: '198402172009021003', nama: 'Eko Wahyudi, S.Pd.', kontak: '081233445503' },
    { insIdx: 2, role: 'SISWA', no: '0071239870', nama: 'Bayu Arya Daniswara', kontak: '089611223344' },
    { insIdx: 2, role: 'SISWA', no: '0071239871', nama: 'Cantika Putri Wardhani', kontak: '089611223345' },

    // SMKN 1 Surabaya
    { insIdx: 3, role: 'KEPALA_SEKOLAH', no: '197108251996011001', nama: 'Dr. Supriyanto, M.Pd.', kontak: '081234567801' },
    { insIdx: 3, role: 'GURU', no: '198901152015021004', nama: 'Dimas Setiawan, S.T.', kontak: '081234567802' },
    { insIdx: 3, role: 'SISWA', no: '0078912345', nama: 'Fajar Nugroho', kontak: '082133445566' },

    // SMKN 2 Yogyakarta
    { insIdx: 4, role: 'KEPALA_SEKOLAH', no: '196904121995011003', nama: 'Dra. Sri Wahyuni, M.Eng.', kontak: '081568901234' },
    { insIdx: 4, role: 'GURU', no: '198603202010011011', nama: 'Gunawan Prasetyo, S.Pd.T.', kontak: '081568901235' },
    { insIdx: 4, role: 'SISWA', no: '0067890123', nama: 'Gilang Ramadhan', kontak: '085812345678' },

    // SMKN 1 Denpasar
    { insIdx: 5, role: 'KEPALA_SEKOLAH', no: '197302181999031005', nama: 'I Ketut Suardana, S.Pd., M.Pd.', kontak: '081338901201' },
    { insIdx: 5, role: 'GURU', no: '198811052014021003', nama: 'I Made Danuarta, S.Kom.', kontak: '081338901202' },
    { insIdx: 5, role: 'SISWA', no: '0074567890', nama: 'Ni Putu Ayu Pradnyani', kontak: '087766554433' },

    // SMKN 3 Makassar
    { insIdx: 6, role: 'KEPALA_SEKOLAH', no: '197006191998021002', nama: 'Drs. H. Syamsuddin, M.Si.', kontak: '081144556601' },
    { insIdx: 6, role: 'GURU', no: '198408102009031006', nama: 'Andi Mappatunru, S.Pd.', kontak: '081144556602' },
    { insIdx: 6, role: 'SISWA', no: '0069012345', nama: 'Nurul Fadhilah', kontak: '085244556677' },

    // SMKN 1 Medan
    { insIdx: 7, role: 'KEPALA_SEKOLAH', no: '196712101993031001', nama: 'Drs. Hotman Simanjuntak, M.Pd.', kontak: '081260112201' },
    { insIdx: 7, role: 'GURU', no: '198705142010012007', nama: 'Nurlela Siregar, S.Pd.', kontak: '081260112202' },
    { insIdx: 7, role: 'SISWA', no: '0076789012', nama: 'Bagus Panjaitan', kontak: '081370809010' },

    // SMKN 2 Semarang
    { insIdx: 8, role: 'KEPALA_SEKOLAH', no: '197204191998031004', nama: 'Drs. Bambang Suwanto, M.Kom.', kontak: '081228990011' },
    { insIdx: 8, role: 'GURU', no: '198609212010011014', nama: 'Agus Purnomo, S.T.', kontak: '081228990012' },
    { insIdx: 8, role: 'SISWA', no: '0072345678', nama: 'Rendra Bagaskara', kontak: '085640112233' },
  ];

  for (const item of subRespData) {
    const sub = await prisma.responden_sekolah.create({
      data: {
        uuid: crypto.randomUUID(),
        id_instansi: createdInstansi[item.insIdx].uuid,
        sub_role: item.role,
        nomor_identitas: item.no,
        nama_lengkap: item.nama,
        kontak: item.kontak,
      },
    });
    createdSubRespondents.push({ ...sub, insIdx: item.insIdx });
  }

  // Legacy/Primary Responden linked to instansi
  const createdResponden = [];
  for (let i = 0; i < createdInstansi.length; i++) {
    const ins = createdInstansi[i];
    const r = await prisma.responden.create({
      data: {
        uuid: crypto.randomUUID(),
        nama: ins.nama_instansi,
        alamat: ins.alamat,
        kab_kota: ins.kota,
        provinsi: ins.provinsi,
        jenis_responden: ins.tipe === 'DINAS' ? 'DINAS' : 'SEKOLAH',
        id_jenis_responden: ins.tipe === 'DINAS' ? jenisDinas.uuid : jenisKepsek.uuid,
        id_instansi: ins.uuid,
      },
    });
    createdResponden.push(r);
  }

  // 6. Seed Surveys (4 Instrumen Beragam Lengkap dengan Sections & Questions)
  console.log('[6/9] Menambahkan 4 Master Instrumen Survei beserta Pertanyaan & Opsi...');

  // --- SURVEI 1: Evaluasi SMK Pusat Keunggulan (SMK PK) 2026 ---
  const survey1 = await prisma.survey.create({
    data: {
      uuid: crypto.randomUUID(),
      id_user: adminSmk.uuid,
      nama_survey: 'Evaluasi Mutu & Kesiapan SMK Pusat Keunggulan (SMK PK) 2026',
      deskripsi: 'Instrumen evaluasi komprehensif bagi satuan pendidikan SMK Pusat Keunggulan terkait kemitraan industri, kurikulum berbasis kerja, dan kesiapan sarana laboratorium vokasi.',
      jenis_responden: 'ALL',
      status: true,
      public_link: 'evaluasi-smk-pk-2026',
      responden_group: JSON.stringify([jenisKepsek, jenisGuru, jenisSiswa, jenisDudi]),
    },
  });

  // Section 1: Profil Kemitraan Industri (DUDI)
  const kat1_1 = await prisma.kategori.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      nama_kategori: 'Bagian I: Kemitraan & Penyelarasan Kurikulum dengan Industri',
      deskripsi: 'Evaluasi keterlibatan mitra dunia kerja dalam penyusunan kurikulum dan guru tamu.',
      order_index: 0,
    },
  });

  // Q1 (PILIHAN_GANDA)
  const q1_1 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      id_kategori: kat1_1.uuid,
      kategori: kat1_1.nama_kategori,
      pertanyaan: 'Berapa banyak industri mitra berskala nasional/internasional yang telah menandatangani MoU aktif dengan sekolah Anda?',
      jenis: 'PILIHAN_GANDA',
      required: true,
      order_index: 0,
      for_responden_group: JSON.stringify([jenisKepsek, jenisGuru]),
      for_sub_role: JSON.stringify(['KEPALA_SEKOLAH', 'GURU']),
    },
  });

  const opt1_1_1 = await prisma.opsi_pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_pertanyaan: q1_1.uuid,
      opsi_jawaban: 'Lebih dari 15 Industri Mitra',
      order_index: 0,
      ada_catatan: false,
    },
  });
  const opt1_1_2 = await prisma.opsi_pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_pertanyaan: q1_1.uuid,
      opsi_jawaban: '8 - 15 Industri Mitra',
      order_index: 1,
      ada_catatan: false,
    },
  });
  const opt1_1_3 = await prisma.opsi_pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_pertanyaan: q1_1.uuid,
      opsi_jawaban: 'Kurang dari 8 Industri Mitra',
      order_index: 2,
      ada_catatan: true,
      keterangan_catatan: 'Sebutkan kendala utama dalam menjalin kerjasama industri:',
    },
  });

  // Q2 (KOTAK_CENTANG)
  const q1_2 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      id_kategori: kat1_1.uuid,
      kategori: kat1_1.nama_kategori,
      pertanyaan: 'Bentuk kerjasama apa saja yang secara aktif direalisasikan bersama mitra industri? (Pilih semua yang berlaku)',
      jenis: 'KOTAK_CENTANG',
      required: true,
      order_index: 1,
      for_responden_group: JSON.stringify([jenisKepsek, jenisGuru]),
      for_sub_role: JSON.stringify(['KEPALA_SEKOLAH', 'GURU']),
    },
  });

  await prisma.opsi_pertanyaan.createMany({
    data: [
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_2.uuid, opsi_jawaban: 'Penyelarasan kurikulum bersama industri', order_index: 0 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_2.uuid, opsi_jawaban: 'Program Guru Tamu dari praktisi industri (min. 50 jam/semester)', order_index: 1 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_2.uuid, opsi_jawaban: 'Praktik Kerja Lapangan (PKL) bersertifikat minimal 6 bulan', order_index: 2 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_2.uuid, opsi_jawaban: 'Komitmen penyerapan kerja / rekrutmen langsung lulusan', order_index: 3 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_2.uuid, opsi_jawaban: 'Teaching Factory (TeFa) berbasis pesanan industri', order_index: 4 },
    ],
  });

  // Section 2: Sarana & Prasarana Praktik
  const kat1_2 = await prisma.kategori.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      nama_kategori: 'Bagian II: Kesiapan Sarana, Laboratorium & Teaching Factory',
      deskripsi: 'Evaluasi kelayakan alat praktik standar industri dan keselamatan kerja (K3).',
      order_index: 1,
    },
  });

  // Q3 (SKALA_LINEAR)
  const q1_3 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      id_kategori: kat1_2.uuid,
      kategori: kat1_2.nama_kategori,
      pertanyaan: 'Seberapa mutakhir dan representatif peralatan praktik di bengkel/laboratorium utama Anda dibanding standar industri modern?',
      jenis: 'SKALA_LINEAR',
      required: true,
      order_index: 0,
      scale_config: JSON.stringify({ min: 1, max: 5, minLabel: 'Sangat Tertinggal', maxLabel: 'Standar Industri 4.0' }),
      for_responden_group: JSON.stringify([jenisKepsek, jenisGuru, jenisSiswa]),
      for_sub_role: JSON.stringify(['KEPALA_SEKOLAH', 'GURU', 'SISWA']),
    },
  });

  // Q4 (ISIAN_SINGKAT)
  const q1_4 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      id_kategori: kat1_2.uuid,
      kategori: kat1_2.nama_kategori,
      pertanyaan: 'Tuliskan nama konsentrasi keahlian / kejuruan unggulan yang menjadi fokus Teaching Factory di sekolah Anda:',
      jenis: 'ISIAN_SINGKAT',
      required: true,
      order_index: 1,
      for_responden_group: JSON.stringify([jenisKepsek, jenisGuru]),
      for_sub_role: JSON.stringify(['KEPALA_SEKOLAH', 'GURU']),
    },
  });

  // Q5 (PARAGRAF)
  const q1_5 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      id_kategori: kat1_2.uuid,
      kategori: kat1_2.nama_kategori,
      pertanyaan: 'Jelaskan inovasi produk atau jasa bernilai ekonomi yang berhasil diproduksi oleh Teaching Factory sekolah Anda dalam 1 tahun terakhir:',
      jenis: 'PARAGRAF',
      required: false,
      order_index: 2,
      for_responden_group: JSON.stringify([jenisKepsek, jenisGuru, jenisSiswa]),
      for_sub_role: JSON.stringify(['KEPALA_SEKOLAH', 'GURU', 'SISWA']),
    },
  });

  // Section 3: Kepuasan Siswa & Budaya Kerja
  const kat1_3 = await prisma.kategori.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      nama_kategori: 'Bagian III: Pengalaman Belajar & Budaya Kerja Siswa',
      deskripsi: 'Khusus peserta didik mengenai penerapan 5R/5S dan kesiapan kerja.',
      order_index: 2,
    },
  });

  // Q6 (PILIHAN_GANDA)
  const q1_6 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey1.uuid,
      id_kategori: kat1_3.uuid,
      kategori: kat1_3.nama_kategori,
      pertanyaan: 'Apakah Anda merasa materi praktik dan bimbingan guru kejuruan sudah membekali Anda dengan rasa percaya diri untuk langsung bekerja setelah lulus?',
      jenis: 'PILIHAN_GANDA',
      required: true,
      order_index: 0,
      for_responden_group: JSON.stringify([jenisSiswa]),
      for_sub_role: JSON.stringify(['SISWA']),
    },
  });

  await prisma.opsi_pertanyaan.createMany({
    data: [
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_6.uuid, opsi_jawaban: 'Sangat Percaya Diri & Siap Kerja', order_index: 0 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_6.uuid, opsi_jawaban: 'Cukup Percaya Diri', order_index: 1 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_6.uuid, opsi_jawaban: 'Ragu-ragu / Memilih Melanjutkan Kuliah', order_index: 2 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q1_6.uuid, opsi_jawaban: 'Belum Siap Kerja', order_index: 3 },
    ],
  });

  // Conditional Logic Rule Example
  await prisma.logic_pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_target_pertanyaan: q1_5.uuid,
      id_source_pertanyaan: q1_1.uuid,
      id_opsi_pemicu: opt1_1_1.uuid,
      operator: 'EQUALS',
    },
  });

  // --- SURVEI 2: Iklim Lingkungan Belajar & Kebinekaan Peserta Didik SMK 2026 ---
  const survey2 = await prisma.survey.create({
    data: {
      uuid: crypto.randomUUID(),
      id_user: adminPusat.uuid,
      nama_survey: 'Survei Iklim Lingkungan Belajar & Kebinekaan Siswa SMK 2026',
      deskripsi: 'Pemetaan suasana sekolah aman, ramah anak, bebas perundungan, dan inklusif bagi seluruh peserta didik kejuruan.',
      jenis_responden: 'ALL',
      status: true,
      public_link: 'iklim-belajar-smk-2026',
      responden_group: JSON.stringify([jenisSiswa, jenisGuru, jenisKomite]),
    },
  });

  const kat2_1 = await prisma.kategori.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey2.uuid,
      nama_kategori: 'Keamanan, Inklusivitas & Pencegahan Kekerasan',
      deskripsi: 'Evaluasi implementasi TPPK (Tim Pencegahan dan Penanganan Kekerasan).',
      order_index: 0,
    },
  });

  const q2_1 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey2.uuid,
      id_kategori: kat2_1.uuid,
      kategori: kat2_1.nama_kategori,
      pertanyaan: 'Apakah di sekolah Anda terdapat saluran pengaduan aman dan rahasia untuk melaporkan kasus perundungan (bullying)?',
      jenis: 'PILIHAN_GANDA',
      required: true,
      order_index: 0,
      for_responden_group: JSON.stringify([jenisSiswa, jenisGuru, jenisKomite]),
    },
  });

  await prisma.opsi_pertanyaan.createMany({
    data: [
      { uuid: crypto.randomUUID(), id_pertanyaan: q2_1.uuid, opsi_jawaban: 'Ya, tersedia kotak pengaduan fisik & aplikasi daring resmi', order_index: 0 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q2_1.uuid, opsi_jawaban: 'Hanya melalui guru BK (Bimbingan Konseling)', order_index: 1 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q2_1.uuid, opsi_jawaban: 'Belum ada saluran pengaduan khusus', order_index: 2 },
    ],
  });

  const q2_2 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey2.uuid,
      id_kategori: kat2_1.uuid,
      kategori: kat2_1.nama_kategori,
      pertanyaan: 'Seberapa nyaman dan aman Anda berinteraksi dengan teman berbeda latar belakang suku, agama, dan budaya di sekolah?',
      jenis: 'SKALA_LINEAR',
      required: true,
      order_index: 1,
      scale_config: JSON.stringify({ min: 1, max: 5, minLabel: 'Sangat Tidak Nyaman', maxLabel: 'Sangat Nyaman & Rukun' }),
      for_responden_group: JSON.stringify([jenisSiswa, jenisGuru]),
    },
  });

  // --- SURVEI 3: Kesiapan Digitalisasi & Alat Praktik Industri 4.0 ---
  const survey3 = await prisma.survey.create({
    data: {
      uuid: crypto.randomUUID(),
      id_user: adminMutu.uuid,
      nama_survey: 'Kesiapan Digitalisasi Pembelajaran & IoT Vokasi 2026',
      deskripsi: 'Audit infrastruktur jaringan serat optik, perangkat lunak simulasi CAD/CAM, dan perangkat praktik otomatisasi.',
      jenis_responden: 'SEKOLAH',
      status: true,
      public_link: 'digitalisasi-vokasi-2026',
      responden_group: JSON.stringify([jenisGuru, jenisKepsek]),
    },
  });

  const kat3_1 = await prisma.kategori.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey3.uuid,
      nama_kategori: 'Infrastruktur TIK & Bandwidth Sekolah',
      deskripsi: 'Konektivitas dan ketersediaan perangkat penunjang pembelajaran digital.',
      order_index: 0,
    },
  });

  const q3_1 = await prisma.pertanyaan.create({
    data: {
      uuid: crypto.randomUUID(),
      id_survey: survey3.uuid,
      id_kategori: kat3_1.uuid,
      kategori: kat3_1.nama_kategori,
      pertanyaan: 'Berapa rata-rata kapasitas bandwidth internet aktif yang didedikasikan untuk bengkel dan lab kejuruan?',
      jenis: 'DROPDOWN',
      required: true,
      order_index: 0,
      for_responden_group: JSON.stringify([jenisGuru, jenisKepsek]),
    },
  });

  await prisma.opsi_pertanyaan.createMany({
    data: [
      { uuid: crypto.randomUUID(), id_pertanyaan: q3_1.uuid, opsi_jawaban: 'Diatas 200 Mbps (Dedicated Fiber Optic)', order_index: 0 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q3_1.uuid, opsi_jawaban: '100 - 200 Mbps', order_index: 1 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q3_1.uuid, opsi_jawaban: '50 - 100 Mbps', order_index: 2 },
      { uuid: crypto.randomUUID(), id_pertanyaan: q3_1.uuid, opsi_jawaban: 'Kurang dari 50 Mbps', order_index: 3 },
    ],
  });

  // --- SURVEI 4: Evaluasi BOS Kinerja Vokasi (Draft / Nonaktif) ---
  const survey4 = await prisma.survey.create({
    data: {
      uuid: crypto.randomUUID(),
      id_user: adminPusat.uuid,
      nama_survey: 'Evaluasi Pemanfaatan Dana BOS Kinerja SMK 2025 (Arsip)',
      deskripsi: 'Instrumen pelaporan pertanggungjawaban dana bantuan operasional sekolah kinerja tahun anggaran sebelumnya.',
      jenis_responden: 'SEKOLAH',
      status: false, // Nonaktif
      public_link: 'evaluasi-bos-kinerja-2025',
      responden_group: JSON.stringify([jenisKepsek]),
    },
  });

  // 7. Seed Penugasan Petugas Lapangan (Assignments)
  console.log('[7/9] Menambahkan data Penugasan Petugas Lapangan (Assignments)...');
  const assignmentData = [
    // Budi Santoso -> SMKN 1 Jakarta & SMKN 2 Bandung untuk Survei 1 & 2
    { petugas: petugas1, survey: survey1, instansi: createdInstansi[0] },
    { petugas: petugas1, survey: survey1, instansi: createdInstansi[1] },
    { petugas: petugas1, survey: survey2, instansi: createdInstansi[0] },

    // Siti Aminah -> SMKN 4 Malang & SMKN 1 Surabaya
    { petugas: petugas2, survey: survey1, instansi: createdInstansi[2] },
    { petugas: petugas2, survey: survey1, instansi: createdInstansi[3] },
    { petugas: petugas2, survey: survey2, instansi: createdInstansi[2] },

    // Ahmad Fauzi -> SMKN 2 Yogyakarta & SMKN 2 Semarang
    { petugas: petugas3, survey: survey1, instansi: createdInstansi[4] },
    { petugas: petugas3, survey: survey3, instansi: createdInstansi[8] },

    // Rina Kusuma -> SMKN 1 Denpasar & SMKN 3 Makassar
    { petugas: petugas4, survey: survey1, instansi: createdInstansi[5] },
    { petugas: petugas4, survey: survey2, instansi: createdInstansi[6] },

    // Hendra Wijaya -> SMKN 1 Medan
    { petugas: petugas5, survey: survey1, instansi: createdInstansi[7] },
    { petugas: petugas5, survey: survey3, instansi: createdInstansi[7] },
  ];

  for (const a of assignmentData) {
    await prisma.assignments.create({
      data: {
        uuid: crypto.randomUUID(),
        id_petugas: a.petugas.uuid,
        nama_petugas: a.petugas.nama_user,
        id_survey: a.survey.uuid,
        nama_survey: a.survey.nama_survey,
        id_instansi: a.instansi.uuid,
        nama_instansi: a.instansi.nama_instansi,
      },
    });
  }

  // 8. Seed Hasil Pengisian Kuesioner (Submissions, Answers, TTD & GPS Geotag)
  console.log('[8/9] Menambahkan data Submissions, Butir Jawaban, TTD Digital & Geotag...');

  // Mock sample signature SVG path string
  const sampleSignature = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><path d="M 20 80 Q 90 20 150 90 T 280 60" fill="none" stroke="%230B5C9E" stroke-width="3"/></svg>';

  // Geotag coordinates matching cities
  const cityGeo = {
    'Jakarta Pusat': { lat: '-6.175392', lng: '106.827153' },
    'Kota Bandung': { lat: '-6.917464', lng: '107.619123' },
    'Kota Malang': { lat: '-7.966620', lng: '112.632632' },
    'Kota Surabaya': { lat: '-7.257472', lng: '112.752088' },
    'Kota Yogyakarta': { lat: '-7.795580', lng: '110.369490' },
    'Kota Denpasar': { lat: '-8.670458', lng: '115.212629' },
    'Kota Makassar': { lat: '-5.147665', lng: '119.432732' },
    'Kota Medan': { lat: '3.595196', lng: '98.672223' },
    'Kota Semarang': { lat: '-6.966667', lng: '110.416664' },
  };

  // Submissions generator
  const submissionsToCreate = [
    // SMKN 1 Jakarta - Kepsek
    { subRespIdx: 0, survey: survey1, petugas: petugas1, notes: 'Pengisian didampingi Pengawas Wilayah I' },
    // SMKN 1 Jakarta - Guru
    { subRespIdx: 1, survey: survey1, petugas: petugas1, notes: 'Verifikasi instrumen laboratorium' },
    // SMKN 1 Jakarta - Siswa
    { subRespIdx: 3, survey: survey1, petugas: null, notes: 'Pengisian mandiri melalui Portal Publik' },
    // SMKN 1 Jakarta - Siswa 2 (Survei 2)
    { subRespIdx: 4, survey: survey2, petugas: null, notes: 'Survei Iklim Belajar mandiri' },

    // SMKN 2 Bandung - Kepsek
    { subRespIdx: 5, survey: survey1, petugas: petugas1, notes: 'Supervisi lapangan tahap 1' },
    // SMKN 2 Bandung - Siswa
    { subRespIdx: 7, survey: survey1, petugas: null, notes: 'Responden siswa jurusan Rekayasa Perangkat Lunak' },

    // SMKN 4 Malang - Kepsek
    { subRespIdx: 9, survey: survey1, petugas: petugas2, notes: 'Evaluasi program keunggulan DKV & Animasi' },
    // SMKN 4 Malang - Guru
    { subRespIdx: 10, survey: survey1, petugas: petugas2, notes: 'Validasi kurikulum Teaching Factory' },
    // SMKN 4 Malang - Siswa
    { subRespIdx: 12, survey: survey1, petugas: null, notes: 'Pengisian kelas XII PKL' },

    // SMKN 1 Surabaya - Kepsek
    { subRespIdx: 14, survey: survey1, petugas: petugas2, notes: 'Verifikasi kemitraan industri manufaktur' },
    // SMKN 1 Surabaya - Siswa (Survei 2)
    { subRespIdx: 16, survey: survey2, petugas: null, notes: 'Survei Lingkungan Belajar' },

    // SMKN 2 Yogyakarta - Kepsek
    { subRespIdx: 17, survey: survey1, petugas: petugas3, notes: 'Supervisi laboratorium elektronika daya' },
    // SMKN 2 Yogyakarta - Siswa
    { subRespIdx: 19, survey: survey1, petugas: null, notes: 'Responden siswa berprestasi LKS' },

    // SMKN 1 Denpasar - Kepsek
    { subRespIdx: 20, survey: survey1, petugas: petugas4, notes: 'Evaluasi kemitraan perhotelan & pariwisata' },
    // SMKN 3 Makassar - Kepsek
    { subRespIdx: 23, survey: survey1, petugas: petugas4, notes: 'Supervisi vokasi maritim & kelautan' },
    // SMKN 1 Medan - Kepsek
    { subRespIdx: 26, survey: survey1, petugas: petugas5, notes: 'Evaluasi penjaminan mutu wilayah Sumatera Utara' },
  ];

  let submissionCounter = 1;
  for (const s of submissionsToCreate) {
    const subResp = createdSubRespondents[s.subRespIdx];
    const instansi = createdInstansi[subResp.insIdx];
    const geo = cityGeo[instansi.kota] || { lat: '-6.200000', lng: '106.816666' };

    // Format legacy responden profile matching this school
    const matchingResponden = createdResponden[subResp.insIdx];

    const submission = await prisma.hasil_survey.create({
      data: {
        uuid: crypto.randomUUID(),
        id_user: s.petugas ? s.petugas.uuid : null,
        id_survey: s.survey.uuid,
        id_instansi: instansi.uuid,
        id_responden: matchingResponden.uuid,
        id_responden_sekolah: subResp.uuid,
        createdAt: new Date(Date.now() - (16 - submissionCounter) * 3600 * 1000 * 4), // Timestamps spaced over last few days
      },
    });

    // Jawaban Survey 1 (jika kuesioner 1)
    if (s.survey.uuid === survey1.uuid) {
      await prisma.jawaban_survey.createMany({
        data: [
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q1_1.uuid,
            pertanyaan: q1_1.pertanyaan,
            jenis: q1_1.jenis,
            jawaban: JSON.stringify({ id_opsi_jawaban: opt1_1_1.uuid, text: opt1_1_1.opsi_jawaban }),
            catatan: 'MoU dengan PT Telkom, PT Astra Honda Motor, dan Schneider Electric.',
          },
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q1_2.uuid,
            pertanyaan: q1_2.pertanyaan,
            jenis: q1_2.jenis,
            jawaban: JSON.stringify([
              { text: 'Penyelarasan kurikulum bersama industri' },
              { text: 'Program Guru Tamu dari praktisi industri (min. 50 jam/semester)' },
              { text: 'Teaching Factory (TeFa) berbasis pesanan industri' },
            ]),
            catatan: '',
          },
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q1_3.uuid,
            pertanyaan: q1_3.pertanyaan,
            jenis: q1_3.jenis,
            jawaban: '4',
            catatan: '',
          },
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q1_4.uuid,
            pertanyaan: q1_4.pertanyaan,
            jenis: q1_4.jenis,
            jawaban: 'Rekayasa Perangkat Lunak & Otomasi Industri',
            catatan: '',
          },
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q1_5.uuid,
            pertanyaan: q1_5.pertanyaan,
            jenis: q1_5.jenis,
            jawaban: 'Pengembangan IoT Smart Farming Kit dan aplikasi manajemen inventaris berbasis web untuk UMKM lokal.',
            catatan: '',
          },
        ],
      });
    } else if (s.survey.uuid === survey2.uuid) {
      // Jawaban Survey 2
      await prisma.jawaban_survey.createMany({
        data: [
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q2_1.uuid,
            pertanyaan: q2_1.pertanyaan,
            jenis: q2_1.jenis,
            jawaban: JSON.stringify({ text: 'Ya, tersedia kotak pengaduan fisik & aplikasi daring resmi' }),
            catatan: 'Dikelola oleh Satgas TPPK sekolah.',
          },
          {
            uuid: crypto.randomUUID(),
            id_hasil_survey: submission.uuid,
            id_pertanyaan: q2_2.uuid,
            pertanyaan: q2_2.pertanyaan,
            jenis: q2_2.jenis,
            jawaban: '5',
            catatan: '',
          },
        ],
      });
    }

    // TTD Responden
    await prisma.tanda_tangan_responden.create({
      data: {
        uuid: crypto.randomUUID(),
        id_hasil_survey: submission.uuid,
        nama_responden: subResp.nama_lengkap,
        ttd: sampleSignature,
        top: 20,
        left: 20,
        width: 260,
      },
    });

    // Jika wawancara lapangan oleh petugas: tambahkan TTD Petugas & Lokasi GPS Geotag
    if (s.petugas) {
      await prisma.tanda_tangan_petugas.create({
        data: {
          uuid: crypto.randomUUID(),
          id_user: s.petugas.uuid,
          nama_petugas: s.petugas.nama_user,
          ttd: sampleSignature,
          top: 20,
          left: 20,
          width: 260,
        },
      });

      await prisma.lokasi_petugas.create({
        data: {
          uuid: crypto.randomUUID(),
          id_survey: s.survey.uuid,
          nama_survey: s.survey.nama_survey,
          id_petugas: s.petugas.uuid,
          nama_petugas: s.petugas.nama_user,
          id_responden: matchingResponden.uuid,
          nama_responden: `${subResp.nama_lengkap} (${instansi.nama_instansi})`,
          latitude: geo.lat,
          longitude: geo.lng,
        },
      });
    }

    // Dokumen & Dokumentasi Foto
    await prisma.dokumen_survey.create({
      data: {
        uuid: crypto.randomUUID(),
        id_hasil_survey: submission.uuid,
        nama_file: `MoU_Industri_${instansi.kode_instansi}.pdf`,
      },
    });

    await prisma.dokumentasi_survey.create({
      data: {
        uuid: crypto.randomUUID(),
        id_hasil_survey: submission.uuid,
        nama_file: `Foto_Wawancara_Lab_${instansi.kode_instansi}.jpg`,
      },
    });

    submissionCounter++;
  }

  console.log('[9/9] Selesai!');
  console.log('====================================================');
  console.log(' SEEDING BERHASIL DILAKUKAN!');
  console.log('====================================================');
  console.log('Ringkasan Data Terbuat:');
  console.log(` - Users Admin        : 3 Akun (admin, direktorat_smk, penjaminan_mutu)`);
  console.log(` - Petugas Lapangan   : 5 Akun (petugas_budi, petugas_siti, dll)`);
  console.log(` - Instansi/Sekolah   : 10 Lembaga (NPSN: 20101456, 20219142, dll)`);
  console.log(` - Sub-Responden      : ${createdSubRespondents.length} Siswa, Guru, & Kepsek`);
  console.log(` - Instrumen Survei   : 4 Survei Lengkap (Sections, Questions, & Logic)`);
  console.log(` - Penugasan Petugas  : ${assignmentData.length} Alokasi Wilayah`);
  console.log(` - Hasil Pengisian    : ${submissionsToCreate.length} Isian Form, TTD Digital & GPS`);
  console.log('----------------------------------------------------');
  console.log('Password default untuk semua akun: "password123"');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Error saat menjalankan seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

