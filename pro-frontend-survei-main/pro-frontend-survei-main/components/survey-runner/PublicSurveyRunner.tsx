'use client';

import React, { useState, useEffect } from 'react';
import { ISurvei, IKategori, IPertanyaan } from '@/app/types';
import { BASE_API_URL } from '@/global';
import { post } from '@/helper/api-bridge';
import { PublicIdentitySchema } from '@/schemas/submission.schema';
import { 
  Building2, 
  UserCheck, 
  GraduationCap, 
  Briefcase, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  UploadCloud, 
  Calendar,
  RotateCcw,
  Save
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

interface Institution {
  uuid: string;
  nama_instansi: string;
  npsn: string;
  kota: string;
  provinsi: string;
  alamat: string;
}

interface RunnerProps {
  survey: ISurvei;
  institutions: Institution[];
}

export function PublicSurveyRunner({ survey, institutions }: RunnerProps) {
  // Step: 0 = Identitas & Pilih Sekolah, 1..N = Section Pages, 99 = Sukses
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Form Identitas
  const [selectedInstansiId, setSelectedInstansiId] = useState<string>('');
  const [subRole, setSubRole] = useState<'SISWA' | 'GURU' | 'KEPALA_SEKOLAH'>('SISWA');
  const [namaLengkap, setNamaLengkap] = useState<string>('');
  const [nomorIdentitas, setNomorIdentitas] = useState<string>('');
  const [kontak, setKontak] = useState<string>('');

  // Search filter for institutions
  const [instansiSearch, setInstansiSearch] = useState<string>('');

  // Jawaban: { [questionUuid]: { jawaban: string | string[], catatan?: string } }
  const [answers, setAnswers] = useState<{ [qUuid: string]: { jawaban: any; catatan?: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Local Draft Auto-Save
  const DRAFT_KEY = `survei_draft_${survey.uuid}`;
  const [draftAvailable, setDraftAvailable] = useState<boolean>(false);

  // Custom theme & cover
  const [themeColor, setThemeColor] = useState<string>('#0B5C9E');
  const [coverImage, setCoverImage] = useState<string>((survey as any).banner_image || (survey as any).cover_image || '');

  useEffect(() => {
    try {
      const savedThemeStr = localStorage.getItem(`survey_theme_${survey.uuid}`);
      if (savedThemeStr) {
        const parsed = JSON.parse(savedThemeStr);
        if (parsed.theme_color) setThemeColor(parsed.theme_color);
        if (parsed.cover_image) setCoverImage(parsed.cover_image);
      }
    } catch (e) {}
  }, [survey.uuid]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setDraftAvailable(true);
        }
      }
    } catch (e) {}
  }, [DRAFT_KEY]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedInstansiId) setSelectedInstansiId(parsed.selectedInstansiId);
        if (parsed.subRole) setSubRole(parsed.subRole);
        if (parsed.namaLengkap) setNamaLengkap(parsed.namaLengkap);
        if (parsed.nomorIdentitas) setNomorIdentitas(parsed.nomorIdentitas);
        if (parsed.kontak) setKontak(parsed.kontak);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentStep !== undefined && parsed.currentStep !== 99) {
          setCurrentStep(parsed.currentStep);
        }
        toast.success('Draf pengisian berhasil dipulihkan!');
      }
    } catch (e) {
      toast.error('Gagal memulihkan draf.');
    } finally {
      setDraftAvailable(false);
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    setDraftAvailable(false);
    toast.info('Draf dihapus.');
  };

  // Auto-save draft on identity/answer updates
  useEffect(() => {
    if (currentStep === 99) return;
    if (selectedInstansiId || namaLengkap || Object.keys(answers).length > 0) {
      const draftData = {
        selectedInstansiId,
        subRole,
        namaLengkap,
        nomorIdentitas,
        kontak,
        answers,
        currentStep,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      } catch (e) {}
    }
  }, [selectedInstansiId, subRole, namaLengkap, nomorIdentitas, kontak, answers, currentStep, DRAFT_KEY]);

  // Kategori / Sections
  const categories: IKategori[] = survey.kategori || [];
  const currentCategory = currentStep > 0 && currentStep <= categories.length ? categories[currentStep - 1] : null;

  // Filter institutions based on search query
  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.nama_instansi.toLowerCase().includes(instansiSearch.toLowerCase()) ||
      inst.npsn.includes(instansiSearch) ||
      inst.kota.toLowerCase().includes(instansiSearch.toLowerCase())
  );

  const selectedInstansi = institutions.find((i) => i.uuid === selectedInstansiId);

  // Filter questions in the current section based on respondent role and conditional logic
  const visibleQuestions = (currentCategory?.pertanyaan || []).filter((q) => {
    // 1. Role Filter
    if (q.for_sub_role) {
      try {
        const roles = typeof q.for_sub_role === 'string' ? JSON.parse(q.for_sub_role) : q.for_sub_role;
        if (Array.isArray(roles) && roles.length > 0 && !roles.includes(subRole)) {
          return false;
        }
      } catch (e) {}
    }

    // 2. Conditional Skip Logic Filter (Rule Target) - only applies to Pilihan Ganda, Checkbox, Dropdown
    if (q.target_rules && q.target_rules.length > 0) {
      const allSurveyQuestions = categories.flatMap((c) => c.pertanyaan || []);
      for (const rule of q.target_rules) {
        const sourceQuestion = allSurveyQuestions.find((sq) => sq.uuid === rule.id_source_pertanyaan);
        if (
          sourceQuestion &&
          !['PILIHAN', 'PILIHAN_GANDA', 'CHECKBOX', 'KOTAK_CENTANG', 'DROPDOWN'].includes(sourceQuestion.jenis)
        ) {
          continue;
        }
        const sourceAnswerObj = answers[rule.id_source_pertanyaan];
        const rawAns = sourceAnswerObj?.jawaban;
        const selectedValues: string[] = Array.isArray(rawAns)
          ? rawAns.map(String)
          : rawAns
          ? [String(rawAns)]
          : [];

        const triggerOption = sourceQuestion?.opsi_pertanyaan?.find(
          (o) => o.uuid === rule.id_opsi_pemicu
        );
        const targetLabel = triggerOption?.opsi_jawaban || rule.nilai_pemicu || '';

        const matchesTrigger =
          (rule.id_opsi_pemicu && selectedValues.includes(rule.id_opsi_pemicu)) ||
          (targetLabel !== '' && selectedValues.includes(targetLabel));

        if (rule.operator === 'EQUALS') {
          if (!matchesTrigger) return false;
        } else if (rule.operator === 'NOT_EQUALS') {
          if (selectedValues.length === 0 || matchesTrigger) return false;
        } else if (rule.operator === 'IS_NOT_EMPTY') {
          if (selectedValues.length === 0 || selectedValues.every((v) => !v.trim())) return false;
        }
      }
    }

    return true;
  });

  const handleAnswerChange = (qUuid: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [qUuid]: {
        ...(prev[qUuid] || {}),
        jawaban: val,
      },
    }));
  };

  const handleCatatanChange = (qUuid: string, catatan: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qUuid]: {
        ...(prev[qUuid] || { jawaban: '' }),
        catatan,
      },
    }));
  };

  const handleCheckboxToggle = (qUuid: string, optText: string) => {
    const prevArr: string[] = Array.isArray(answers[qUuid]?.jawaban) ? answers[qUuid]?.jawaban : [];
    const newArr = prevArr.includes(optText) ? prevArr.filter((t) => t !== optText) : [...prevArr, optText];
    handleAnswerChange(qUuid, newArr);
  };

  const handleNextStep = () => {
    // Step 0 Zod Validation
    if (currentStep === 0) {
      const parseResult = PublicIdentitySchema.safeParse({
        id_survey: survey.uuid,
        id_instansi: selectedInstansiId,
        sub_role: subRole,
        nama_lengkap: namaLengkap,
        nomor_identitas: nomorIdentitas,
        kontak: kontak || undefined,
      });

      if (!parseResult.success) {
        const firstErr = parseResult.error.issues[0]?.message || 'Data identitas belum lengkap.';
        toast.warning(firstErr);
        return;
      }
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate Required Questions in Current Section
    for (const q of visibleQuestions) {
      if (q.required) {
        const ans = answers[q.uuid]?.jawaban;
        const isEmpty =
          ans === undefined ||
          ans === null ||
          (typeof ans === 'string' && ans.trim() === '') ||
          (Array.isArray(ans) && ans.length === 0);

        if (isEmpty) {
          toast.warning('Mohon lengkapi semua pertanyaan yang bertanda bintang wajib (*).');
          return;
        }
      }
    }

    if (currentStep < categories.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Transform answers to backend submission format
      const jawabanPayload = Object.entries(answers).map(([qUuid, val]) => ({
        id_pertanyaan: qUuid,
        jawaban: typeof val.jawaban === 'object' ? JSON.stringify(val.jawaban) : String(val.jawaban),
        catatan: val.catatan || '',
      }));

      const payload = {
        id_survey: survey.uuid,
        id_instansi: selectedInstansiId,
        id_jenis_responden: '',
        nama: namaLengkap,
        sub_role: subRole,
        nomor_identitas: nomorIdentitas,
        jawaban: jawabanPayload,
      };

      const res = await post(`${BASE_API_URL}/submission/public`, JSON.stringify(payload), '');

      if (res?.data?.success) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (e) {}
        setCurrentStep(99); // Sukses
      } else {
        toast.error(res?.data?.message || 'Gagal mengirim survei.');
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan pengiriman: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 99: Success Screen
  if (currentStep === 99) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih Atas Partisipasi Anda!</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
          Jawaban kuesioner Anda untuk <strong>{survey.nama_survey}</strong> di <strong>{selectedInstansi?.nama_instansi}</strong> telah berhasil dicatat oleh sistem Kemendikbudristek.
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto text-xs text-slate-600 mb-6">
          <p className="font-semibold text-slate-800">{namaLengkap}</p>
          <p className="mt-0.5">{subRole === 'SISWA' ? `NIS: ${nomorIdentitas}` : `NUPTK: ${nomorIdentitas}`}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
        >
          Kirim Tanggapan Lain
        </button>
      </div>
    );
  }

  // Progress Calculation
  const progressPercent =
    categories.length > 0 && currentStep > 0
      ? Math.round((currentStep / categories.length) * 100)
      : 0;

  const getEncouragementText = (percent: number) => {
    if (percent === 0) return 'Identitas & Satuan Pendidikan';
    if (percent <= 30) return 'Awal yang baik! Mari teruskan pengisian instrumen.';
    if (percent <= 65) return 'Bagus sekali! Lebih dari separuh perjalanan telah selesai.';
    if (percent < 100) return 'Hampir selesai! Tinggal sedikit lagi.';
    return 'Semua bagian telah lengkap diisi!';
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-24">
      <ToastContainer hideProgressBar autoClose={3000} />

      {/* Draft Recovery Alert */}
      {draftAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Save className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Draf Isian Ditemukan
              </p>
              <p className="text-xs text-amber-700">
                Ada isian kuesioner yang tersimpan otomatis di perangkat ini. Ingin memulihkannya?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-100 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Hapus Draf
            </button>
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-4 py-1.5 text-xs bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Pulihkan Draf
            </button>
          </div>
        </div>
      )}

      {/* Header Banner Card Ala Google Forms */}
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden mb-6"
        style={{
          borderTopWidth: coverImage ? '4px' : '10px',
          borderTopColor: themeColor,
        }}
      >
        {coverImage ? (
          <div
            className="w-full h-36 md:h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          </div>
        ) : (
          <div className="h-2.5 transition-all" style={{ backgroundColor: themeColor }} />
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: themeColor }} />
              Survei Resmi Kemendikbudristek
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            {survey.nama_survey}
          </h1>
          {survey.deskripsi && (
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {survey.deskripsi}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-500 font-medium">
            <span>* Menunjukkan pertanyaan yang wajib diisi</span>
            {selectedInstansi && (
              <span className="text-slate-500 font-normal">
                Sekolah: <strong>{selectedInstansi.nama_instansi}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Encouraging Progress Bar */}
      {currentStep > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>
              Bagian {currentStep} dari {categories.length}: {currentCategory?.nama_kategori}
            </span>
            <span className="text-primary font-bold">{progressPercent}% Selesai</span>
          </div>
          <div className="text-[11px] text-slate-400 mb-2 italic">
            {getEncouragementText(progressPercent)}
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#0B5C9E] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 0: Identitas Responden & Pilih Sekolah Ter-assign */}
      {currentStep === 0 && (
        <div className="space-y-5">
          {/* Card Pilih Sekolah Ter-assign */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-slate-900">
                Pilih Satuan Pendidikan / Sekolah Anda <span className="text-rose-500">*</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Hanya sekolah yang terdaftar dalam program survei ini yang tersedia dalam pilihan.
            </p>

            <input
              type="text"
              placeholder="Cari nama sekolah, NPSN, atau kota..."
              value={instansiSearch}
              onChange={(e) => setInstansiSearch(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredInstitutions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Sekolah tidak ditemukan dalam penugasan survei ini.
                </div>
              ) : (
                filteredInstitutions.map((inst) => (
                  <label
                    key={inst.uuid}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedInstansiId === inst.uuid
                        ? 'border-primary bg-blue-50/60 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="instansi"
                      value={inst.uuid}
                      checked={selectedInstansiId === inst.uuid}
                      onChange={() => setSelectedInstansiId(inst.uuid)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{inst.nama_instansi}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        NPSN: {inst.npsn || '-'} | {inst.kota}, {inst.provinsi}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Card Pilih Jenis Responden */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Jenis Responden <span className="text-rose-500">*</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Pilih peran Anda di satuan pendidikan ini:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'SISWA', label: 'Siswa / Murid', icon: <GraduationCap className="w-5 h-5 text-sky-600" /> },
                { id: 'GURU', label: 'Guru / Pendidik', icon: <Briefcase className="w-5 h-5 text-emerald-600" /> },
                { id: 'KEPALA_SEKOLAH', label: 'Kepala Sekolah', icon: <Award className="w-5 h-5 text-amber-600" /> },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSubRole(role.id as any)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    subRole === role.id
                      ? 'border-primary bg-blue-50 ring-2 ring-blue-100 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {role.icon}
                  <span className="text-xs font-bold text-slate-800">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Data Diri Singkat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 mb-1">Identitas Pengisi</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda..."
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {subRole === 'SISWA' ? 'Nomor Induk Siswa (NIS / NISN)' : 'NUPTK / NIP'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={subRole === 'SISWA' ? 'Contoh: 0051234567' : 'Contoh: 1234567890123456'}
                value={nomorIdentitas}
                onChange={(e) => setNomorIdentitas(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Kontak / WhatsApp (Opsional)
              </label>
              <input
                type="text"
                placeholder="08..."
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 1..N: Pertanyaan Kuesioner per Bagian */}
      {currentStep > 0 && currentCategory && (
        <div className="space-y-4">
          {visibleQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Tidak ada pertanyaan yang relevan dengan peran Anda di bagian ini. Silakan klik Berikutnya.
            </div>
          ) : (
            visibleQuestions.map((q, qIndex) => (
              <div
                key={q.uuid}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all"
              >
                {/* Judul Pertanyaan */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-primary text-xs font-bold flex items-center justify-center">
                    {qIndex + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      <span dangerouslySetInnerHTML={{ __html: q.pertanyaan }} />
                      {q.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                    </h3>
                    {q.deskripsi_bantuan && (
                      <p className="text-xs text-slate-500 mt-1">{q.deskripsi_bantuan}</p>
                    )}
                  </div>
                </div>

                {/* Question Embedded Image (from file_config) */}
                {(() => {
                  try {
                    if (!q.file_config) return null;
                    const parsed = JSON.parse(q.file_config);
                    if (!parsed?.image_url) return null;
                    return (
                      <div
                        className={`pl-10 my-3 flex flex-col ${
                          parsed.image_align === 'left'
                            ? 'items-start'
                            : parsed.image_align === 'right'
                            ? 'items-end'
                            : 'items-center'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={parsed.image_url}
                          alt={parsed.image_caption || 'Ilustrasi butir pertanyaan'}
                          className="max-h-80 max-w-full rounded-xl border border-slate-200 object-contain shadow-xs bg-slate-50"
                        />
                        {parsed.image_caption && (
                          <span className="text-xs text-slate-500 italic mt-1.5">
                            {parsed.image_caption}
                          </span>
                        )}
                      </div>
                    );
                  } catch (e) {
                    return null;
                  }
                })()}

                {/* Tipe Jawaban: Radio / Pilihan Ganda */}
                {['PILIHAN', 'PILIHAN_GANDA'].includes(q.jenis) && (
                  <div className="space-y-2.5 pl-10">
                    {q.opsi_pertanyaan?.map((opt) => {
                      const isSelected = answers[q.uuid]?.jawaban === opt.opsi_jawaban;
                      return (
                        <div key={opt.uuid} className="space-y-2">
                          <label
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-blue-50/60 ring-2 ring-blue-100 font-medium'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.uuid}`}
                              value={opt.opsi_jawaban}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(q.uuid, opt.opsi_jawaban)}
                              className="accent-primary"
                            />
                            <span className="text-xs text-slate-800">{opt.opsi_jawaban}</span>
                          </label>
                          {isSelected && opt.ada_catatan && (
                            <input
                              type="text"
                              value={answers[q.uuid]?.catatan || ''}
                              onChange={(e) => handleCatatanChange(q.uuid, e.target.value)}
                              placeholder={opt.keterangan_catatan || 'Tuliskan keterangan tambahan...'}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tipe Jawaban: Kotak Centang / Checkbox */}
                {['CHECKBOX', 'KOTAK_CENTANG'].includes(q.jenis) && (
                  <div className="space-y-2.5 pl-10">
                    {q.opsi_pertanyaan?.map((opt) => {
                      const isChecked =
                        Array.isArray(answers[q.uuid]?.jawaban) &&
                        answers[q.uuid]?.jawaban.includes(opt.opsi_jawaban);
                      return (
                        <div key={opt.uuid} className="space-y-2">
                          <label
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-100 font-medium'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(q.uuid, opt.opsi_jawaban)}
                              className="accent-emerald-600 rounded"
                            />
                            <span className="text-xs text-slate-800">{opt.opsi_jawaban}</span>
                          </label>
                          {isChecked && opt.ada_catatan && (
                            <input
                              type="text"
                              value={answers[q.uuid]?.catatan || ''}
                              onChange={(e) => handleCatatanChange(q.uuid, e.target.value)}
                              placeholder={opt.keterangan_catatan || 'Tuliskan keterangan tambahan...'}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tipe Jawaban: Dropdown */}
                {q.jenis === 'DROPDOWN' && (
                  <div className="pl-10 space-y-2">
                    <select
                      value={answers[q.uuid]?.jawaban || ''}
                      onChange={(e) => handleAnswerChange(q.uuid, e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">-- Pilih salah satu opsi --</option>
                      {q.opsi_pertanyaan?.map((opt) => (
                        <option key={opt.uuid} value={opt.opsi_jawaban}>
                          {opt.opsi_jawaban}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const selectedOpt = q.opsi_pertanyaan?.find(
                        (o) => o.opsi_jawaban === answers[q.uuid]?.jawaban
                      );
                      if (selectedOpt?.ada_catatan) {
                        return (
                          <input
                            type="text"
                            value={answers[q.uuid]?.catatan || ''}
                            onChange={(e) => handleCatatanChange(q.uuid, e.target.value)}
                            placeholder={selectedOpt.keterangan_catatan || 'Tuliskan keterangan tambahan...'}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Tipe Jawaban: Isian Singkat */}
                {['ISIAN', 'ISIAN_SINGKAT'].includes(q.jenis) && (
                  <div className="pl-10">
                    <input
                      type="text"
                      placeholder="Jawaban Anda..."
                      value={answers[q.uuid]?.jawaban || ''}
                      onChange={(e) => handleAnswerChange(q.uuid, e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}

                {/* Tipe Jawaban: Paragraf */}
                {q.jenis === 'PARAGRAF' && (
                  <div className="pl-10">
                    <textarea
                      rows={4}
                      placeholder="Uraikan jawaban Anda secara detail..."
                      value={answers[q.uuid]?.jawaban || ''}
                      onChange={(e) => handleAnswerChange(q.uuid, e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}

                {/* Tipe Jawaban: Skala Linear */}
                {q.jenis === 'SKALA_LINEAR' && (
                  <div className="pl-10">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500">1 (Kurang)</span>
                      <div className="flex gap-2.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleAnswerChange(q.uuid, String(val))}
                            className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              answers[q.uuid]?.jawaban === String(val)
                                ? 'bg-primary text-white shadow-md scale-105'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">5 (Sangat Baik)</span>
                    </div>
                  </div>
                )}

                {/* Tipe Jawaban: Tanggal */}
                {q.jenis === 'TANGGAL' && (
                  <div className="pl-10">
                    <input
                      type="date"
                      value={answers[q.uuid]?.jawaban || ''}
                      onChange={(e) => handleAnswerChange(q.uuid, e.target.value)}
                      className="w-full max-w-xs text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Bottom Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-[#094d84] shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Mengirim Jawaban...</span>
            ) : currentStep === categories.length ? (
              <>
                <span>Kirim Formulir</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
