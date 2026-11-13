/**
 * Dedicated Seeder for Instrumen Supervisi Bantuan Pemerintah Sertifikasi Kompetensi Murid SMK Tahun 2026
 * 1. Instrumen Supervisi Serkom 2026 (Untuk Sekolah / Kepala Sekolah)
 * 2. Instrumen Supervisi Serkom 2026 (Untuk Murid)
 */

const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedSerkom2026() {
  console.log('================================================================');
  console.log(' Seeder Instrumen Supervisi Serkom 2026 (Sekolah & Murid) ');
  console.log('================================================================');

  // Ambil user admin dan jenis responden yang ada
  let adminUser = await prisma.users.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    adminUser = await prisma.users.findFirst();
  }

  const allJenis = await prisma.jenis_responden.findMany();
  const jenisSiswa = allJenis.find(j => j.jenis.toLowerCase().includes('siswa')) || allJenis[0];
  const jenisGuru = allJenis.find(j => j.jenis.toLowerCase().includes('guru')) || allJenis[0];
  const jenisKepsek = allJenis.find(j => j.jenis.toLowerCase().includes('kepala') || j.jenis.toLowerCase().includes('sekolah')) || allJenis[0];
  const jenisDudi = allJenis.find(j => j.jenis.toLowerCase().includes('dudi') || j.jenis.toLowerCase().includes('industri')) || allJenis[0];

  const adminUuid = adminUser ? adminUser.uuid : crypto.randomUUID();

  // ============================================================================
  // INSTRUMEN 1: SUPERVISI SERKOM 2026 (UNTUK SEKOLAH / KEPALA SEKOLAH)
  // ============================================================================
  console.log('\n[1/2] Membuat Instrumen Supervisi Serkom 2026 (Untuk Sekolah)...');

  // Hapus survei lama jika public link sama agar idempotent
  const existingSekolahSurvey = await prisma.survey.findFirst({
    where: { public_link: 'supervisi-serkom-2026-sekolah' },
  });

  if (existingSekolahSurvey) {
    console.log('  -> Menghapus data instrumen supervisi sekolah versi lama...');
    const katList = await prisma.kategori.findMany({ where: { id_survey: existingSekolahSurvey.uuid } });
    const katUuids = katList.map(k => k.uuid);
    const pertList = await prisma.pertanyaan.findMany({ where: { id_kategori: { in: katUuids } } });
    const pertUuids = pertList.map(p => p.uuid);

    await prisma.logic_pertanyaan.deleteMany({
      where: {
        OR: [
          { id_source_pertanyaan: { in: pertUuids } },
          { id_target_pertanyaan: { in: pertUuids } },
        ],
      },
    });
    await prisma.opsi_pertanyaan.deleteMany({ where: { id_pertanyaan: { in: pertUuids } } });
    await prisma.pertanyaan.deleteMany({ where: { id_survey: existingSekolahSurvey.uuid } });
    await prisma.kategori.deleteMany({ where: { id_survey: existingSekolahSurvey.uuid } });
    await prisma.survey.delete({ where: { uuid: existingSekolahSurvey.uuid } });
  }

  const surveySekolah = await prisma.survey.create({
    data: {
      uuid: crypto.randomUUID(),
      id_user: adminUuid,
      nama_survey: 'Instrumen Supervisi Bantuan Pemerintah Sertifikasi Kompetensi Murid SMK Tahun 2026 (Untuk Sekolah)',
      deskripsi: 'Instrumen resmi supervisi dan evaluasi pelaksanaan program Bantuan Pemerintah Sertifikasi Kompetensi Siswa SMK tahun 2026 bagi satuan pendidikan, mencakup perencanaan, kesiapan sarana TUK, pembiayaan, koordinasi LSP/Industri, dan dampak mutu lulusan.',
      jenis_responden: 'SEKOLAH',
      status: true,
      public_link: 'supervisi-serkom-2026-sekolah',
      responden_group: JSON.stringify([jenisKepsek, jenisGuru]),
    },
  });

  // Helper untuk membuat kategori
  const createCategory = async (idSurvey, nama, deskripsi, order) => {
    return await prisma.kategori.create({
      data: {
        uuid: crypto.randomUUID(),
        id_survey: idSurvey,
        nama_kategori: nama,
        deskripsi: deskripsi,
        order_index: order,
      },
    });
  };

  // Helper untuk membuat pertanyaan pilihan ganda dengan opsi
  const createChoiceQuestion = async (surveyUuid, katUuid, katNama, teks, bantuan, options, order, group, subRoles) => {
    const q = await prisma.pertanyaan.create({
      data: {
        uuid: crypto.randomUUID(),
        id_survey: surveyUuid,
        id_kategori: katUuid,
        kategori: katNama,
        pertanyaan: teks,
        deskripsi_bantuan: bantuan || null,
        jenis: 'PILIHAN_GANDA',
        required: true,
        order_index: order,
        for_responden_group: JSON.stringify(group || [jenisKepsek, jenisGuru]),
        for_sub_role: JSON.stringify(subRoles || ['KEPALA_SEKOLAH', 'GURU']),
      },
    });

    const createdOpts = [];
    for (let i = 0; i < options.length; i++) {
      const opt = await prisma.opsi_pertanyaan.create({
        data: {
          uuid: crypto.randomUUID(),
          id_pertanyaan: q.uuid,
          opsi_jawaban: options[i],
          order_index: i,
          ada_catatan: false,
        },
      });
      createdOpts.push(opt);
    }

    return { question: q, options: createdOpts };
  };

  // Helper untuk membuat pertanyaan esai / terbuka / isian
  const createTextQuestion = async (surveyUuid, katUuid, katNama, teks, bantuan, jenis, order, group, subRoles) => {
    return await prisma.pertanyaan.create({
      data: {
        uuid: crypto.randomUUID(),
        id_survey: surveyUuid,
        id_kategori: katUuid,
        kategori: katNama,
        pertanyaan: teks,
        deskripsi_bantuan: bantuan || null,
        jenis: jenis || 'PARAGRAF',
        required: true,
        order_index: order,
        for_responden_group: JSON.stringify(group || [jenisKepsek, jenisGuru]),
        for_sub_role: JSON.stringify(subRoles || ['KEPALA_SEKOLAH', 'GURU']),
      },
    });
  };

  // --- Kategori 1: Identitas Program & Penyelenggara ---
  const katSekolah_0 = await createCategory(
    surveySekolah.uuid,
    'Bagian I: Identitas Program & Penyelenggara',
    'Data identitas operasional pelaksanaan uji sertifikasi kompetensi di satuan pendidikan.',
    0
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_0.uuid,
    katSekolah_0.nama_kategori,
    'Jumlah siswa penerima bantuan sertifikasi kompetensi di sekolah Anda:',
    'Tuliskan jumlah total murid sasaran penerima bantuan dalam angka',
    'ISIAN_SINGKAT',
    0
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_0.uuid,
    katSekolah_0.nama_kategori,
    'Lembaga Sertifikasi Profesi (LSP) pelaksana / Industri mitra penguji:',
    'Tuliskan nama lengkap LSP P1/P2/P3 atau nama Perusahaan/Industri yang melaksanakan sertifikasi',
    'ISIAN_SINGKAT',
    1
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_0.uuid,
    katSekolah_0.nama_kategori,
    'Jenis skema sertifikasi yang diujikan:',
    'Tuliskan nama-nama skema kejuruan yang diujikan kepada para siswa',
    'PARAGRAF',
    2
  );

  // --- Kategori 2: Perencanaan Program ---
  const katSekolah_1 = await createCategory(
    surveySekolah.uuid,
    'Bagian II: Perencanaan Program',
    'Evaluasi pembentukan kepanitiaan, pemetaan skema kejuruan, dan sosialisasi bantuan sertifikasi.',
    1
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_1.uuid,
    katSekolah_1.nama_kategori,
    'Sekolah membentuk tim/ panitia pelaksana bantuan uji sertifikasi kompetensi siswa dengan melibatkan wakil kepala sekolah bidang kurikulum, kepala konsentrasi keahlian dan perwakilan guru kejuruan.',
    'Bukti dukung: SK Tim pelaksana',
    [
      'Tidak ada SK tim pelaksana',
      'SK tim pelaksana ada hanya melibatkan bendahara dan wakil kepala sekolah saja bidang kurikulum',
      'SK tim pelaksana ada hanya melibatkan bendahara dan wakil kepala sekolah saja bidang kurikulum dan kepala konsentrasi keahlian',
      'SK tim pelaksana ada hanya melibatkan bendahara dan wakil kepala sekolah saja bidang kurikulum dan kepala konsentrasi keahlian serta perwakilan guru kejuruan (Lengkap)',
    ],
    0
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_1.uuid,
    katSekolah_1.nama_kategori,
    'Di dalam melakukan perencanaan uji sertifikasi kompetensi mempertimbangkan jenis skema yang diambil berdasarkan kebutuhan siswa dan industri.',
    'Bukti dukung: Pemetaan skema yang dibutuhkan siswa berdasarkan pertimbangan industri dan daftar skema',
    [
      'Tidak melakukan pemetaan skema yang dibutuhkan siswa dan industri dalam melakukan perencanaan uji sertifikasi kompetensi',
      'Kepala konsentrasi keahlian melakukan pemetaan skema yang dibutuhkan siswa dalam melakukan perencanaan uji sertifikasi kompetensi, tanpa mempertimbangkan kebutuhan industri',
      'Kepala konsentrasi keahlian bersama guru kejuruan melakukan pemetaan skema yang dibutuhkan siswa dalam melakukan perencanaan uji sertifikasi kompetensi tanpa mempertimbangkan kebutuhan industri',
      'Kepala konsentrasi keahlian bersama guru kejuruan melakukan pemetaan skema yang dibutuhkan siswa dalam melakukan perencanaan uji sertifikasi kompetensi dengan mempertimbangkan kebutuhan industri kemudian mengkoordinasikan pada LSP P2/LSP P3 atau industri yang relevan',
    ],
    1
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_1.uuid,
    katSekolah_1.nama_kategori,
    'Tujuan bantuan sertifikasi kompetensi siswa dipahami oleh sekolah.',
    'Bukti dukung: Bukti sosialisasi, daftar hadir, dokumentasi dan notulen',
    [
      'Hanya kepala sekolah yang memahami tujuan bantuan sertifikasi kompetensi',
      'Kepala sekolah dan ketua tim sertifikasi yang memahami tujuan sertifikasi sekolah',
      'Kepala sekolah dan manajemen sekolah beserta guru kejuruan yang memahami tujuan sertifikasi siswa',
      'Kepala sekolah dan manajemen sekolah, guru dan siswa memahami tujuan sertifikasi siswa secara menyeluruh',
    ],
    2
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_1.uuid,
    katSekolah_1.nama_kategori,
    'Sekolah mensosialisasikan bantuan sertifikasi kompetensi kepada warga sekolah.',
    'Bukti dukung: Bukti sosialisasi, daftar hadir, dokumentasi dan notulen',
    [
      'Tidak melakukan sosialisasi ke warga sekolah',
      'Mensosialisasikan hanya kepada manajemen sekolah',
      'Mensosialisasikan hanya kepada manajemen dan guru saja',
      'Mensosialisasikan kepada manajemen sekolah, guru dan siswa',
    ],
    3
  );

  // --- Kategori 3: Pelaksanaan Sertifikasi - Input ---
  const katSekolah_2 = await createCategory(
    surveySekolah.uuid,
    'Bagian III: Pelaksanaan Sertifikasi - Kesiapan Input',
    'Kesiapan sarana prasarana tempat uji (TUK), kecukupan dana bantuan, dan kelengkapan administrasi.',
    2
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_2.uuid,
    katSekolah_2.nama_kategori,
    'Sekolah memiliki sarana prasarana yang mendukung sesuai dengan kebutuhan TUK (Jumlah peralatan sesuai spesifikasi, kondisi layak/baik, area K3 terpenuhi, penerangan & sirkulasi memadai, ruang uji kondusif).',
    'Bukti dukung: Daftar alat yang digunakan untuk uji sertifikasi (sesuai skema yg diujikan)',
    [
      'Sekolah memiliki hanya 2 komponen dari sarana prasarana yang harus dipenuhi sebagai tempat uji kompetensi',
      'Sekolah memiliki hanya 3 komponen dari sarana prasarana yang harus dipenuhi sebagai tempat uji kompetensi',
      'Sekolah memiliki hanya 4 komponen dari sarana prasarana yang harus dipenuhi sebagai tempat uji kompetensi',
      'Sekolah memiliki 5 komponen lengkap dari sarana prasarana yang harus dipenuhi sebagai tempat uji kompetensi',
    ],
    0
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_2.uuid,
    katSekolah_2.nama_kategori,
    'Dana bantuan sertifikasi yang diterima mencukupi untuk pelaksanaan uji sertifikasi yang mencakup komponen pembiayaan (Honor Asesor, Transport Lokal Asesor, Biaya Penerbitan Sertifikat, Bahan Praktek, Penyiapan MUK).',
    'Komponen pembiayaan bantuan pemerintah',
    [
      'Dana bantuan sertifikasi hanya mencukupi 2 komponen pembiayaan',
      'Dana bantuan sertifikasi hanya mencukupi 3 komponen pembiayaan',
      'Dana bantuan sertifikasi hanya mencukupi 4 komponen pembiayaan',
      'Dana bantuan sertifikasi mencukupi 5 komponen pembiayaan secara lengkap',
    ],
    1
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_2.uuid,
    katSekolah_2.nama_kategori,
    'Dokumen dan administrasi yang diperlukan mudah dipenuhi oleh sekolah (Undangan & Jadwal, Surat Tugas, Notula, Daftar Hadir, Laporan Kegiatan, Dokumentasi, Materi Kegiatan).',
    'Dokumen administrasi sertifikasi',
    [
      'Sangat sulit untuk dipenuhi dokumen administrasinya, hanya 1 dokumen yang dipenuhi',
      'Terdapat 2-3 jenis dokumen yang dipenuhi',
      'Terdapat 4-5 dokumen yang dipenuhi',
      'Sudah sangat lengkap dokumennya dan sangat mudah dipenuhi (7 dokumen terpenuhi semua)',
    ],
    2
  );

  // --- Kategori 4: Pelaksanaan Sertifikasi - Proses ---
  const katSekolah_3 = await createCategory(
    surveySekolah.uuid,
    'Bagian IV: Pelaksanaan Sertifikasi - Proses',
    'Ketepatan jadwal, efektivitas koordinasi dengan LSP/Industri, dan ketaatan prosedur operasional standar (SOP).',
    3
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_3.uuid,
    katSekolah_3.nama_kategori,
    'Pelaksanaan sertifikasi berjalan sesuai jadwal yang telah ditetapkan.',
    'Bukti dukung: Jadwal pelaksanaan uji',
    [
      'Pelaksanaan sertifikasi tidak mengikuti jadwal yang ditetapkan dan menghambat pencapaian tujuan program',
      'Beberapa kegiatan sertifikasi mengalami keterlambatan atau perubahan jadwal yang cukup mempengaruhi pelaksanaan',
      'Sebagian besar kegiatan sertifikasi dilaksanakan sesuai jadwal, meskipun terdapat sedikit penyesuaian yang tidak mempengaruhi hasil program',
      'Seluruh kegiatan sertifikasi dilaksanakan sesuai jadwal yang telah ditetapkan tanpa hambatan yang berarti',
    ],
    0
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_3.uuid,
    katSekolah_3.nama_kategori,
    'Koordinasi antara sekolah dan LSP atau industri berjalan efektif.',
    'Bukti dukung: Perjanjian Kerjasama dengan Industri/LSP',
    [
      'Koordinasi kurang efektif, komunikasi dan pembagian tugas belum berjalan dengan baik sehingga menghambat pelaksanaan sertifikasi',
      'Koordinasi berjalan cukup baik, tetapi masih terdapat beberapa hambatan atau ketidakjelasan yang mempengaruhi sebagian pelaksanaan kegiatan',
      'Koordinasi antara sekolah dan LSP/Industri berjalan efektif, meskipun terdapat kendala kecil yang tidak mempengaruhi pelaksanaan program secara keseluruhan',
      'Koordinasi antara sekolah dan LSP/Industri berlangsung sangat efektif, komunikasi berjalan lancar, pembagian tugas jelas, dan hampir tidak ada kendala',
    ],
    1
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_3.uuid,
    katSekolah_3.nama_kategori,
    'Pelaksanaan sertifikasi mengikuti prosedur dan standar yang berlaku.',
    'Bukti dukung: SOP dari Industri/LSP untuk uji sertifikasi kompetensi',
    [
      'Pelaksanaan sertifikasi kurang mengikuti prosedur dan standar yang berlaku sehingga mempengaruhi kelancaran atau kualitas pelaksanaan',
      'Pelaksanaan sertifikasi cukup mengikuti prosedur dan standar, namun masih terdapat beberapa tahapan yang perlu diperbaiki atau diperjelas',
      'Sebagian besar pelaksanaan sertifikasi telah mengikuti prosedur dan standar yang berlaku, meskipun terdapat kendala kecil yang tidak memengaruhi kualitas pelaksanaan',
      'Seluruh tahapan sertifikasi dilaksanakan sesuai prosedur operasional dan standar yang berlaku tanpa adanya penyimpangan',
    ],
    2
  );

  // --- Kategori 5: Kebermanfaatan dan Dampak ---
  const katSekolah_4 = await createCategory(
    surveySekolah.uuid,
    'Bagian V: Kebermanfaatan dan Dampak',
    'Dampak program terhadap kesiapan kerja siswa, kepercayaan diri, mutu sekolah, dan kelayakan kelanjutan program.',
    4
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_4.uuid,
    katSekolah_4.nama_kategori,
    'Bantuan sertifikasi kompetensi berdampak positif terhadap siswa dan sekolah antara lain (Meningkatnya kompetensi siswa, kesiapan memasuki industri, kepercayaan diri, dan peningkatan mutu sekolah).',
    'Dampak positif program bantuan',
    [
      'Bantuan sertifikasi siswa tidak berdampak positif terhadap siswa dan mutu sekolah',
      'Bantuan sertifikasi siswa hanya berdampak positif pada 1 komponen saja',
      'Bantuan sertifikasi siswa hanya berdampak positif pada 2 komponen saja',
      'Bantuan sertifikasi siswa berdampak positif pada 3-4 komponen (komprehensif)',
    ],
    0
  );

  await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_4.uuid,
    katSekolah_4.nama_kategori,
    'Program bantuan sertifikasi layak untuk dilanjutkan pada tahun berikutnya.',
    'Kelayakan keberlanjutan program',
    [
      'Program bantuan sertifikasi kurang layak untuk dilanjutkan karena manfaat yang diperoleh belum sesuai dengan harapan atau pelaksanaannya masih mengalami banyak kendala',
      'Program bantuan sertifikasi cukup layak untuk dilanjutkan, tetapi terdapat beberapa aspek yang perlu dievaluasi dan diperbaiki terlebih dahulu',
      'Program bantuan sertifikasi layak untuk dilanjutkan karena memberikan manfaat yang baik bagi sekolah dan siswa, meskipun masih memerlukan beberapa penyempurnaan',
      'Program bantuan sertifikasi sangat layak untuk dilanjutkan karena memberikan manfaat yang besar, mendukung peningkatan kompetensi siswa, dan memenuhi kebutuhan dunia industri',
    ],
    1
  );

  // --- Kategori 6: Kemitraan LSP-P2 / LSP-P3 ---
  const katSekolah_5 = await createCategory(
    surveySekolah.uuid,
    'Bagian VI: Kemitraan LSP-P2 / LSP-P3',
    'Kesesuaian MUK, lisensi lembaga, kesiapan asesor, dan perjanjian kerjasama dengan LSP.',
    5
  );

  const qLspTrigger = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_5.uuid,
    katSekolah_5.nama_kategori,
    'Apakah sekolah melakukan sertifikasi kompetensi dengan LSP (LSP-P2 / LSP-P3)?',
    'Bukti dukung: Perjanjian Kerjasama dengan LSP',
    ['Ya', 'Tidak'],
    0
  );

  const qLsp_2 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_5.uuid,
    katSekolah_5.nama_kategori,
    'Sertifikat lisensi LSP-P2/LSP-P3 masih berlaku.',
    'Bukti dukung: Sertifikat lisensi LSP dari BNSP',
    [
      'LSP-P2/LSP-P3 tidak memiliki lisensi yang berlaku atau tidak memenuhi persyaratan untuk melaksanakan sertifikasi kompetensi',
      'Status keberlakuan lisensi LSP-P2/LSP-P3 belum diketahui secara pasti atau informasi yang tersedia belum lengkap',
      'LSP-P2/LSP-P3 memiliki lisensi yang masih berlaku dan dapat digunakan, meskipun terdapat beberapa administrasi pendukung yang perlu diperbarui',
      'LSP-P2/LSP-P3 memiliki lisensi yang masih berlaku, lengkap, dan memenuhi seluruh persyaratan penyelenggaraan sertifikasi kompetensi',
    ],
    1
  );

  const qLsp_3 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_5.uuid,
    katSekolah_5.nama_kategori,
    'Kesesuaian Materi Uji Kompetensi (MUK), Unit Kompetensi (UK), dan skema sertifikasi dengan capaian pembelajaran di sekolah.',
    'Bukti dukung: Daftar Skema sertifikasi yang diujikan',
    [
      'Skema sertifikasi dan MUK tidak sesuai dengan capaian pembelajaran unit kompetensi keahlian di sekolah dan tidak mendukung pencapaian kompetensi murid',
      'Skema sertifikasi dan MUK kurang sesuai dengan unit kompetensi keahlian di sekolah sehingga pelaksanaannya belum optimal / sudah kedaluwarsa',
      'Skema sertifikasi dan MUK sesuai dengan sebagian besar capaian pembelajaran unit kompetensi keahlian di sekolah dan mendukung pencapaian kompetensi lulusan',
      'Skema sertifikasi dan MUK sangat sesuai dengan Capaian pembelajaran kompetensi keahlian yang diajarkan di sekolah, mencakup seluruh unit kompetensi dan relevan dengan dunia kerja',
    ],
    2
  );

  const qLsp_4 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_5.uuid,
    katSekolah_5.nama_kategori,
    'Kesiapan dan ketersediaan asesor untuk melaksanakan sertifikasi di sekolah.',
    'Bukti dukung: Sertifikat asesor dan surat tugas penguji',
    [
      'Kesiapan asesor kurang memadai sehingga dapat mempengaruhi pelaksanaan sertifikasi',
      'Asesor siap namun jumlah asesor kurang sebanding dengan jumlah asesi yang diuji',
      'Asesor kompeten dan siap menguji sebagian besar skema yang dijadwalkan dengan lancar',
      'Seluruh asesor memiliki sertifikat kompetensi aktif, bertugas sesuai bidang keahlian, dan sangat siap melaksanakan uji sertifikasi secara profesional',
    ],
    3
  );

  const qLsp_5 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_5.uuid,
    katSekolah_5.nama_kategori,
    'Administrasi serta laporan kegiatan dan keuangan pelaksanaan uji sertifikasi disusun secara lengkap dan sesuai ketentuan.',
    'Pelaporan administrasi dan keuangan',
    [
      'Administrasi serta laporan kegiatan dan keuangan tidak lengkap dan tidak sesuai dengan ketentuan yang berlaku',
      'Administrasi dan laporan cukup lengkap, namun masih terdapat beberapa dokumen atau informasi yang perlu dilengkapi atau diperbaiki',
      'Sebagian besar administrasi dan laporan telah lengkap serta sesuai ketentuan, meskipun terdapat kekurangan kecil yang tidak mempengaruhi pertanggungjawaban kegiatan',
      'Seluruh administrasi, laporan kegiatan, dan laporan keuangan uji sertifikasi disusun secara lengkap, tepat waktu, akurat, dan sesuai dengan pedoman yang berlaku',
    ],
    4
  );

  const qLsp_6 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_5.uuid,
    katSekolah_5.nama_kategori,
    'Adanya Perjanjian Kerjasama (PKS) resmi dengan LSP-P2 / LSP-P3.',
    'Bukti dukung: Dokumen Perjanjian Kerjasama',
    [
      'Sekolah tidak memiliki Perjanjian Kerjasama yang berlaku atau kerja sama dengan LSP tidak didukung oleh perjanjian resmi',
      'Perjanjian Kerjasama ada, tetapi kurang mendukung pelaksanaan sertifikasi atau masa berlakunya tidak jelas',
      'Perjanjian Kerjasama tersedia, tetapi pelaksanaan atau pemanfaatannya dalam kegiatan sertifikasi belum optimal',
      'Sekolah memiliki Perjanjian Kerjasama yang masih berlaku, mencakup ruang lingkup kerja sama yang jelas, serta diimplementasikan secara optimal',
    ],
    5
  );

  // Hubungkan conditional logic: Tampilkan pertanyaan teknis LSP jika qLspTrigger = 'Ya'
  const optLspYa = qLspTrigger.options.find(o => o.opsi_jawaban === 'Ya');
  if (optLspYa) {
    for (const targetQ of [qLsp_2.question, qLsp_3.question, qLsp_4.question, qLsp_5.question, qLsp_6.question]) {
      await prisma.logic_pertanyaan.create({
        data: {
          uuid: crypto.randomUUID(),
          id_source_pertanyaan: qLspTrigger.question.uuid,
          id_target_pertanyaan: targetQ.uuid,
          id_opsi_pemicu: optLspYa.uuid,
          operator: 'EQUALS',
          nilai_pemicu: 'Ya',
        },
      });
    }
  }

  // --- Kategori 7: Kemitraan Industri ---
  const katSekolah_6 = await createCategory(
    surveySekolah.uuid,
    'Bagian VII: Kemitraan Industri',
    'Evaluasi TUK industri, peralatan uji, kualifikasi asesor industri, SOP, dan penguatan kemitraan.',
    6
  );

  const qIndTrigger = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Apakah sekolah melakukan sertifikasi kompetensi dengan Industri?',
    'Bukti dukung: Perjanjian Kerjasama dengan Industri',
    ['Ya', 'Tidak'],
    0
  );

  const qInd_2 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Industri menyediakan tempat uji kompetensi (TUK) yang memenuhi standar.',
    'Bukti dukung: Dokumentasi TUK, daftar sarana, SOP',
    [
      'Tempat uji kompetensi tidak memenuhi standar dan tidak layak digunakan untuk pelaksanaan uji kompetensi',
      'Tempat uji kompetensi memenuhi standar minimum, tetapi masih memerlukan beberapa perbaikan pada fasilitas atau kelengkapan pendukung',
      'Tempat uji kompetensi memenuhi sebagian besar standar, terdapat kekurangan kecil namun tidak mengganggu pelaksanaan uji kompetensi',
      'Tempat uji kompetensi memenuhi seluruh standar yang dipersyaratkan, fasilitas lengkap, aman, nyaman, dan sesuai kebutuhan kompetensi yang diuji',
    ],
    1
  );

  const qInd_3 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Peralatan uji kompetensi sesuai dengan kebutuhan kompetensi yang diuji.',
    'Bukti dukung: Inventaris alat, dokumentasi peralatan, SOP',
    [
      'Peralatan uji belum memadai dan terdapat kekurangan yang mempengaruhi kelancaran atau kualitas pelaksanaan uji kompetensi',
      'Peralatan uji tersedia sesuai standar minimum, tetapi beberapa peralatan masih perlu dilengkapi atau ditingkatkan kualitasnya',
      'Sebagian besar peralatan uji tersedia dan sesuai dengan kompetensi yang diuji, terdapat kekurangan kecil namun tidak mengganggu proses uji',
      'Seluruh peralatan uji tersedia lengkap, berfungsi dengan baik, mutakhir, dan sepenuhnya sesuai dengan standar kompetensi serta kebutuhan dunia industri',
    ],
    2
  );

  const qInd_4 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Industri menyediakan asesor atau penguji yang kompeten (Memiliki sertifikat asesor, min. jabatan supervisor/kepala bengkel, pengalaman menguji CV, surat tugas industri).',
    'Bukti Dukung: Sertifikat asesor, surat tugas penguji dari industri, CV',
    [
      'Asesor/penguji hanya memiliki 1 kriteria dari persyaratan kompetensi industri',
      'Asesor/penguji hanya memiliki 2 kriteria dari persyaratan kompetensi industri',
      'Asesor/penguji memiliki 3 kriteria dari persyaratan kompetensi industri',
      'Asesor/penguji memenuhi 4 kriteria lengkap (tersertifikasi, berpengalaman, supervisor, bersurat tugas resmi)',
    ],
    3
  );

  const qInd_5 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Uji kompetensi dilaksanakan sesuai standar operasional yang berlaku di industri tersebut.',
    'Bukti Dukung: SOP industri, berita acara pelaksanaan',
    [
      'Tidak terdapat SOP uji kompetensi di industri',
      'Terdapat SOP di Industri untuk uji kompetensi tetapi pelaksanaan uji kompetensi tidak menggunakan standar uji yg ada pada SOP tersebut',
      'Terdapat SOP di Industri untuk uji kompetensi dan pelaksanaan sudah sesuai SOP yang berlaku tetapi masih ada beberapa indikator dalam SOP yang tidak dilaksanakan',
      'Pelaksanaan uji kompetensi sepenuhnya mengikuti standar operasional prosedur (SOP) industri, seluruh tahapan berjalan tertib, aman, dan sesuai ketentuan',
    ],
    4
  );

  const qInd_6 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Komunikasi dan koordinasi antara sekolah dan industri berjalan dengan baik dibuktikan adanya Perjanjian Kerjasama dan koordinasi sekolah dengan industri.',
    'Bukti Dukung: Perjanjian Kerjasama sekolah dengan industri, notulen rapat, surat koordinasi',
    [
      'Tidak terdapat Perjanjian Kerjasama antara sekolah dengan industri',
      'Terdapat Perjanjian Kerjasama antara sekolah dengan industri tapi tidak ada koordinasi berkelanjutan',
      'Terdapat Perjanjian Kerjasama dan sesekali melakukan koordinasi dengan industri',
      'Terdapat Perjanjian Kerjasama sekolah dan industri dan koordinasi beserta komunikasi antara kedua belah pihak terbangun dengan sangat baik',
    ],
    5
  );

  const qInd_7 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Materi uji kompetensi selaras dengan kebutuhan dunia kerja dan kompetensi/ konsentrasi keahlian siswa.',
    'Bukti Dukung: Skema sertifikasi, unit kompetensi industri',
    [
      'Materi uji kompetensi tidak sesuai dengan kompetensi/konsentrasi keahlian siswa dan kebutuhan industri',
      'Materi uji kompetensi cukup sesuai dengan kompetensi siswa, namun beberapa bagian belum sepenuhnya mencerminkan kebutuhan dunia kerja saat ini',
      'Materi uji kompetensi sebagian besar sesuai dengan kebutuhan dunia kerja dan kompetensi siswa',
      'Materi uji kompetensi sepenuhnya sesuai dengan kebutuhan dunia kerja, standar industri, dan konsentrasi keahlian siswa',
    ],
    6
  );

  const qInd_8 = await createChoiceQuestion(
    surveySekolah.uuid,
    katSekolah_6.uuid,
    katSekolah_6.nama_kategori,
    'Program sertifikasi memperkuat hubungan dan kemitraan strategis sekolah dengan dunia industri.',
    'Bukti Dukung: Dokumen kerja sama, laporan kegiatan bersama',
    [
      'Program sertifikasi tidak memberikan pengaruh terhadap hubungan sekolah dan industri, bahkan kerja sama yang ada tidak berjalan dengan baik',
      'Program sertifikasi kurang memberikan dampak terhadap penguatan hubungan sekolah dan industri, sehingga kerja sama yang terjalin belum optimal',
      'Program sertifikasi cukup mendukung hubungan sekolah dan industri, tetapi interaksi dan keterlibatan industri masih terbatas pada kegiatan tertentu saja',
      'Program sertifikasi sangat memperkuat kemitraan sekolah dan industri, ditandai dengan kerja sama yang aktif, berkelanjutan, dan memberikan manfaat nyata',
    ],
    7
  );

  // Hubungkan conditional logic: Tampilkan pertanyaan industri jika qIndTrigger = 'Ya'
  const optIndYa = qIndTrigger.options.find(o => o.opsi_jawaban === 'Ya');
  if (optIndYa) {
    for (const targetQ of [qInd_2.question, qInd_3.question, qInd_4.question, qInd_5.question, qInd_6.question, qInd_7.question, qInd_8.question]) {
      await prisma.logic_pertanyaan.create({
        data: {
          uuid: crypto.randomUUID(),
          id_source_pertanyaan: qIndTrigger.question.uuid,
          id_target_pertanyaan: targetQ.uuid,
          id_opsi_pemicu: optIndYa.uuid,
          operator: 'EQUALS',
          nilai_pemicu: 'Ya',
        },
      });
    }
  }

  // --- Kategori 8: Instrumen Pertanyaan Terbuka ---
  const katSekolah_7 = await createCategory(
    surveySekolah.uuid,
    'Bagian VIII: Instrumen Pertanyaan Terbuka (Esai Evaluasi)',
    'Pendalaman kualitatif mengenai tantangan perencanaan, peran kepemimpinan, kendala pelaksanaan, dan rekomendasi program.',
    7
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Apa tantangan utama yang dihadapi sekolah dalam merencanakan uji sertifikasi kompetensi, dan bagaimana strategi yang dilakukan untuk mengatasinya?',
    'Uraikan tantangan perencanaan dan solusi strategis yang diambil sekolah',
    'PARAGRAF',
    0
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Bagaimana peran kepala sekolah / wakil kepala sekolah / guru terkait proses perencanaan uji sertifikasi kompetensi?',
    'Jelaskan pembagian peran kepemimpinan dan manajemen program di sekolah',
    'PARAGRAF',
    1
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Bagaimana sekolah memastikan seluruh tahapan pelaksanaan uji sertifikasi kompetensi berjalan sesuai dengan pedoman?',
    'Jelaskan mekanisme monitoring, SOP, dan penjaminan mutu pelaksanaan uji',
    'PARAGRAF',
    2
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Bagaimana koordinasi antara sekolah dengan LSP / Industri selama pelaksanaan uji sertifikasi kompetensi?',
    'Jelaskan efektivitas komunikasi, jadwal pengujian, dan penyiapan berkas asesi',
    'PARAGRAF',
    3
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Apa kendala yang dihadapi selama melaksanakan uji sertifikasi kompetensi dengan LSP atau Industri? Dan bagaimana mengatasinya?',
    'Sebutkan kendala teknis/anggaran/sarana dan langkah penyelesaian yang dilakukan',
    'PARAGRAF',
    4
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Bagaimana menangani siswa yang dinyatakan belum kompeten oleh LSP / Industri?',
    'Uraikan program remedial, pembinaan lanjutan, atau kesempatan uji ulang bagi siswa',
    'PARAGRAF',
    5
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Apa harapan sekolah terhadap pelaksanaan uji sertifikasi kompetensi untuk masa mendatang?',
    'Tuliskan masukan kebijakan dan perbaikan program bantuan pemerintah',
    'PARAGRAF',
    6
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_7.uuid,
    katSekolah_7.nama_kategori,
    'Adakah rekomendasi Sertifikasi yang dibutuhkan Murid SMK? Berapa perkiraan harga satuan per-asesi, dan apa nama Lembaga yang menerbitkan sertifikat tersebut?',
    'Tuliskan nama skema, estimasi biaya per siswa, dan nama LSP/Asosiasi penerbit',
    'PARAGRAF',
    7
  );

  // --- Kategori 9: Dokumentasi & Testimoni Video ---
  const katSekolah_8 = await createCategory(
    surveySekolah.uuid,
    'Bagian IX: Dokumentasi & Video Testimoni',
    'Dokumentasi visual dan tautan video testimoni pelaksanaan program bantuan sertifikasi siswa.',
    8
  );

  await createTextQuestion(
    surveySekolah.uuid,
    katSekolah_8.uuid,
    katSekolah_8.nama_kategori,
    'Tautan (Link) Google Drive Video Testimoni Kepala Sekolah & Siswa:',
    'Mohon cantumkan tautan publik Google Drive video testimoni pelaksanaan Program Bantuan Sertifikasi Kompetensi Siswa (memuat manfaat, dampak, dan keberhasilan program). Pastikan hak akses link telah disetel ke "Anyone with the link can view".',
    'ISIAN_SINGKAT',
    0
  );

  console.log('  -> Berhasil membuat Instrumen Supervisi Sekolah dengan 9 Kategori & seluruh butir pertanyaan!');


  // ============================================================================
  // INSTRUMEN 2: SUPERVISI SERKOM 2026 (UNTUK MURID)
  // ============================================================================
  console.log('\n[2/2] Membuat Instrumen Supervisi Serkom 2026 (Untuk Murid)...');

  const existingMuridSurvey = await prisma.survey.findFirst({
    where: { public_link: 'supervisi-serkom-2026-murid' },
  });

  if (existingMuridSurvey) {
    console.log('  -> Menghapus data instrumen supervisi murid versi lama...');
    const katList = await prisma.kategori.findMany({ where: { id_survey: existingMuridSurvey.uuid } });
    const katUuids = katList.map(k => k.uuid);
    const pertList = await prisma.pertanyaan.findMany({ where: { id_kategori: { in: katUuids } } });
    const pertUuids = pertList.map(p => p.uuid);

    await prisma.logic_pertanyaan.deleteMany({
      where: {
        OR: [
          { id_source_pertanyaan: { in: pertUuids } },
          { id_target_pertanyaan: { in: pertUuids } },
        ],
      },
    });
    await prisma.opsi_pertanyaan.deleteMany({ where: { id_pertanyaan: { in: pertUuids } } });
    await prisma.pertanyaan.deleteMany({ where: { id_survey: existingMuridSurvey.uuid } });
    await prisma.kategori.deleteMany({ where: { id_survey: existingMuridSurvey.uuid } });
    await prisma.survey.delete({ where: { uuid: existingMuridSurvey.uuid } });
  }

  const surveyMurid = await prisma.survey.create({
    data: {
      uuid: crypto.randomUUID(),
      id_user: adminUuid,
      nama_survey: 'Instrumen Supervisi Bantuan Pemerintah Sertifikasi Kompetensi Murid SMK Tahun 2026 (Untuk Murid)',
      deskripsi: 'Instrumen evaluasi mandiri bagi peserta didik / murid SMK penerima program Bantuan Pemerintah Sertifikasi Kompetensi Tahun 2026 mengenai manfaat sertifikasi, peningkatan kepercayaan diri, kepuasan pelaksanaan, dan pengalaman berkesan selama proses asesmen.',
      jenis_responden: 'SEKOLAH',
      status: true,
      public_link: 'supervisi-serkom-2026-murid',
      responden_group: JSON.stringify([jenisSiswa]),
    },
  });

  // --- Kategori Murid 1: Kebermanfaatan dan Dampak ---
  const katMurid_1 = await createCategory(
    surveyMurid.uuid,
    'Bagian I: Kebermanfaatan dan Dampak',
    'Pengaruh sertifikasi terhadap pemahaman standar industri, kepercayaan diri, dan peningkatan keterampilan praktik.',
    0
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_1.uuid,
    katMurid_1.nama_kategori,
    'Murid menjadi lebih memahami standar kompetensi yang dibutuhkan oleh industri.',
    null,
    [
      'Murid tidak mendapatkan pemahaman tentang standar kompetensi yang dibutuhkan industri',
      'Murid masih kurang memahami standar kompetensi yang dibutuhkan industri dan mengalami kesulitan dalam menghubungkannya dengan kompetensi yang dipelajari di sekolah',
      'Murid mendapatkan pemahaman tentang standar kompetensi di industri tetapi belum cukup memahami dengan baik dan masih memerlukan penguatan yang mendalam',
      'Murid memahami seluruh standar kompetensi yang dibutuhkan industri dan dapat menerapkannya dengan baik',
    ],
    0,
    [jenisSiswa],
    ['SISWA']
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_1.uuid,
    katMurid_1.nama_kategori,
    'Program sertifikasi meningkatkan rasa percaya diri saya saat melamar pekerjaan.',
    null,
    ['Tidak setuju', 'Kurang setuju', 'Setuju', 'Sangat setuju'],
    1,
    [jenisSiswa],
    ['SISWA']
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_1.uuid,
    katMurid_1.nama_kategori,
    'Saya merasa kemampuan praktik saya meningkat setelah mengikuti sertifikasi kompetensi.',
    null,
    ['Tidak setuju', 'Kurang setuju', 'Setuju', 'Sangat setuju'],
    2,
    [jenisSiswa],
    ['SISWA']
  );

  // --- Kategori Murid 2: Kepuasan terhadap Keterlaksanaan Bantuan ---
  const katMurid_2 = await createCategory(
    surveyMurid.uuid,
    'Bagian II: Kepuasan terhadap Keterlaksanaan Bantuan Sertifikasi Siswa',
    'Penilaian siswa terhadap sosialisasi sekolah, penguatan materi dari asesor, ketepatan jadwal, keselarasan skema, dan fasilitas peralatan.',
    1
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_2.uuid,
    katMurid_2.nama_kategori,
    'Informasi mengenai bantuan sertifikasi disampaikan dengan jelas oleh sekolah melalui sosialisasi bantuan sertifikasi ke siswa.',
    null,
    [
      'Tidak diadakan sosialisasi oleh sekolah terkait bantuan sertifikasi oleh sekolah',
      'Dilaksanakan sosialisasi bantuan sertifikasi kompetensi oleh sekolah kepada perwakilan siswa tetapi kurang secara jelas informasi yang disampaikan',
      'Disosialisasikan bantuan sertifikasi kompetensi oleh sekolah secara jelas tetapi hanya kepada perwakilan siswa',
      'Disosialisasikan bantuan sertifikasi kompetensi oleh sekolah secara jelas kepada seluruh siswa',
    ],
    0,
    [jenisSiswa],
    ['SISWA']
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_2.uuid,
    katMurid_2.nama_kategori,
    'Siswa mendapatkan penguatan materi dari LSP P3/LSP P2/ Industri yang menjadi asesor uji sertifikasi kompetensi sebelum uji sertifikasi.',
    null,
    [
      'Tidak mendapatkan penguatan materi sebelum uji sertifikasi kompetensi',
      'Mendapatkan penguatan materi oleh guru kejuruan bukan dari LSP maupun industri',
      'Mendapatkan penguatan materi sebelum uji secara daring oleh LSP/ industri',
      'Mendapatkan penguatan materi secara luring dari LSP/ Industri secara intensif',
    ],
    1,
    [jenisSiswa],
    ['SISWA']
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_2.uuid,
    katMurid_2.nama_kategori,
    'Pelaksanaan uji kompetensi berjalan dengan tertib dan sesuai jadwal.',
    null,
    [
      'Pelaksanaan uji sertifikasi kompetensi dilaksanakan tanpa perencanaan dan dadakan diinformasikan ke siswa',
      'Pelaksanaan uji sertifikasi kompetensi dilaksanakan bergeser waktu pelaksanaannya dan mengakibatkan pelaksanaan uji terkendala',
      'Pelaksanaan uji sertifikasi kompetensi dilaksanakan bergeser waktunya tetapi tidak mempengaruhi uji sertifikasi',
      'Pelaksanaan uji sertifikasi dilaksanakan sesuai dengan jadwal dan berjalan dengan tertib dan lancar',
    ],
    2,
    [jenisSiswa],
    ['SISWA']
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_2.uuid,
    katMurid_2.nama_kategori,
    'Skema yang diujikan sesuai dengan kompetensi keahlian saya dan capaian pembelajaran yang saya pelajari di sekolah.',
    null,
    [
      'Skema yang diujikan tidak sesuai dengan kompetensi/ konsentrasi keahlian saya',
      'Skema yang diujikan sesuai dengan kompetensi/ konsentrasi keahlian saya, tetapi tidak sesuai dengan capaian pembelajaran yang diajarkan di sekolah',
      'Skema yang diujikan sesuai dengan kompetensi/ konsentrasi keahlian saya, sebagian besar sesuai dengan capaian pembelajaran yang diajarkan di sekolah',
      'Skema yang diujikan sesuai dengan kompetensi/ konsentrasi keahlian saya, dan sesuai dengan capaian pembelajaran yang diajarkan di sekolah',
    ],
    3,
    [jenisSiswa],
    ['SISWA']
  );

  await createChoiceQuestion(
    surveyMurid.uuid,
    katMurid_2.uuid,
    katMurid_2.nama_kategori,
    'Fasilitas dan peralatan yang digunakan saat sertifikasi sudah memadai sesuai dengan skema yang diujikan.',
    null,
    [
      'Peralatan yang digunakan tidak sesuai dengan skema yang diujikan',
      'Peralatan yang digunakan sesuai dengan skema yang diujikan tetapi kondisi beberapa peralatannya kurang baik sehingga kurang berjalan maksimal',
      'Peralatan yang digunakan sesuai dengan skema yang diujikan hanya beberapa peralatan yang perlu diperbaiki tapi tidak mengganggu pelaksanaan uji sertifikasi',
      'Peralatan yang digunakan sesuai dengan skema yang diujikan dan sangat memadai',
    ],
    4,
    [jenisSiswa],
    ['SISWA']
  );

  // --- Kategori Murid 3: Pertanyaan Terbuka ---
  const katMurid_3 = await createCategory(
    surveyMurid.uuid,
    'Bagian III: Instrumen Pertanyaan Terbuka (Refleksi Murid)',
    'Pengalaman otentik siswa mengenai kendala yang dihadapi, momen berkesan, kesiapan kerja, dan saran perbaikan.',
    2
  );

  await createTextQuestion(
    surveyMurid.uuid,
    katMurid_3.uuid,
    katMurid_3.nama_kategori,
    'Apakah ada kendala dalam melaksanakan uji sertifikasi kompetensi? Kalau ada kendala, sebutkan!',
    'Ceritakan kendala sarana, waktu, materi uji, atau pembiayaan yang Anda rasakan',
    'PARAGRAF',
    0,
    [jenisSiswa],
    ['SISWA']
  );

  await createTextQuestion(
    surveyMurid.uuid,
    katMurid_3.uuid,
    katMurid_3.nama_kategori,
    'Apa pengalaman paling berkesan yang Anda peroleh selama mengikuti proses Uji Sertifikasi Kompetensi?',
    'Ceritakan pengalaman berharga selama berhadapan dengan asesor atau saat praktik uji kerja',
    'PARAGRAF',
    1,
    [jenisSiswa],
    ['SISWA']
  );

  await createTextQuestion(
    surveyMurid.uuid,
    katMurid_3.uuid,
    katMurid_3.nama_kategori,
    'Menurut Anda, apa pengaruh Uji Sertifikasi Kompetensi terhadap kesiapan Anda memasuki industri / dunia kerja?',
    'Jelaskan perubahan kesiapan mental, keterampilan, dan portofolio Anda',
    'PARAGRAF',
    2,
    [jenisSiswa],
    ['SISWA']
  );

  await createTextQuestion(
    surveyMurid.uuid,
    katMurid_3.uuid,
    katMurid_3.nama_kategori,
    'Apa harapan Anda terhadap program bantuan Uji Sertifikasi Kompetensi di masa mendatang?',
    'Tuliskan harapan Anda untuk adik-adik kelas dan pengembangan program bantuan kejuruan',
    'PARAGRAF',
    3,
    [jenisSiswa],
    ['SISWA']
  );

  await createTextQuestion(
    surveyMurid.uuid,
    katMurid_3.uuid,
    katMurid_3.nama_kategori,
    'Saran apa yang ingin Anda berikan agar program bantuan Uji Sertifikasi Kompetensi dapat menjadi lebih efektif dan bermanfaat bagi Anda?',
    'Berikan saran mengenai pelatihan sebelum uji, bimbingan teknis, dan alat praktik',
    'PARAGRAF',
    4,
    [jenisSiswa],
    ['SISWA']
  );

  // --- Kategori Murid 4: Dokumentasi & Testimoni Video ---
  const katMurid_4 = await createCategory(
    surveyMurid.uuid,
    'Bagian IV: Dokumentasi & Video Testimoni Siswa',
    'Tautan video testimoni pengalaman siswa mengikuti uji sertifikasi kejuruan.',
    3
  );

  await createTextQuestion(
    surveyMurid.uuid,
    katMurid_4.uuid,
    katMurid_4.nama_kategori,
    'Tautan (Link) Google Drive Video Testimoni Siswa:',
    'Cantumkan link Google Drive video singkat testimoni Anda mengenai manfaat sertifikasi. Pastikan link dapat diakses publik (Anyone with the link can view).',
    'ISIAN_SINGKAT',
    0,
    [jenisSiswa],
    ['SISWA']
  );

  console.log('  -> Berhasil membuat Instrumen Supervisi Murid dengan 4 Kategori & seluruh butir pertanyaan!');

  // ============================================================================
  // PENUGASAN (ASSIGNMENTS) KE INSTANSI SEKOLAH
  // ============================================================================
  console.log('\n[Penugasan] Mengaitkan kedua instrumen ke sekolah-sekolah yang terdaftar...');
  const allInstansi = await prisma.instansi.findMany({ take: 10 });
  const allPetugas = await prisma.users.findMany({ where: { role: 'PETUGAS' } });

  const defaultPetugasUuid = allPetugas.length > 0 ? allPetugas[0].uuid : adminUuid;

  let assignedCount = 0;
  for (const ins of allInstansi) {
    // Tugaskan survei sekolah
    const existingAssignSekolah = await prisma.assignments.findFirst({
      where: { id_instansi: ins.uuid, id_survey: surveySekolah.uuid },
    });
    if (!existingAssignSekolah) {
      await prisma.assignments.create({
        data: {
          uuid: crypto.randomUUID(),
          id_instansi: ins.uuid,
          id_petugas: defaultPetugasUuid,
          id_survey: surveySekolah.uuid,
        },
      });
      assignedCount++;
    }

    // Tugaskan survei murid
    const existingAssignMurid = await prisma.assignments.findFirst({
      where: { id_instansi: ins.uuid, id_survey: surveyMurid.uuid },
    });
    if (!existingAssignMurid) {
      await prisma.assignments.create({
        data: {
          uuid: crypto.randomUUID(),
          id_instansi: ins.uuid,
          id_petugas: defaultPetugasUuid,
          id_survey: surveyMurid.uuid,
        },
      });
      assignedCount++;
    }
  }

  console.log(`  -> Berhasil menambahkan ${assignedCount} penugasan instrumen ke sekolah!`);
  console.log('\n================================================================');
  console.log(' SEEDER INSTRUMEN SUPERVISI SERKOM 2026 SELESAI DENGAN SUKSES! ');
  console.log('================================================================');
}

module.exports = { seedSerkom2026 };

// Jika dipanggil langsung lewat `node prisma/seed-serkom-2026.js`
if (require.main === module) {
  seedSerkom2026()
    .catch((e) => {
      console.error('Error menjalankan seed-serkom-2026:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

