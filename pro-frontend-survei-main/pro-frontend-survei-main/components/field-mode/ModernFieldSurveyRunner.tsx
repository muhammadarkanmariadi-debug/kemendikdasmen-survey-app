'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IJenisResponden, IKategori } from '@/app/types';
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from '@/global';
import { post } from '@/helper/api-bridge';
import { getCookie } from '@/helper/client-cookie';
import { SignaturePad } from '@/components/field-mode/SignaturePad';
import { GeolocationCapture } from '@/components/field-mode/GeolocationCapture';
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
  FileCheck,
  PenTool,
  MapPin,
  Send,
  RotateCcw,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

interface ModernFieldSurveyRunnerProps {
  survey_id: string;
  survey_name?: string;
  categories: IKategori[];
  respondents: {
    uuid: string;
    nama_instansi: string;
    id_instansi: string;
    id_jenis_responden: string;
    tipe: string;
    npsn?: string;
    kota?: string;
  }[];
  jenisResponden: IJenisResponden[];
  redirectBase?: string; // defaults to '/petugas/kuesioner'
  tokenKey?: string; // defaults to TOKEN_KEY_PETUGAS
}

export function ModernFieldSurveyRunner({
  survey_id,
  survey_name = 'Instrumen Mutu SMK',
  categories,
  respondents = [],
  jenisResponden = [],
  redirectBase = '/petugas/kuesioner',
  tokenKey = TOKEN_KEY_PETUGAS,
}: ModernFieldSurveyRunnerProps) {
  const router = useRouter();
  const token = getCookie(tokenKey) || '';

  // Step state: 0 = Identitas & Sekolah, 1..N = Sections, N+1 = Tanda Tangan & GPS
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Form State: Identitas Responden
  const [selectedInstansiId, setSelectedInstansiId] = useState<string>('');
  const [id_jenis_responden, setIdJenisResponden] = useState<string>('');
  const [namaResponden, setNamaResponden] = useState<string>('');
  const [instansiSearch, setInstansiSearch] = useState<string>('');

  // Signature & GPS
  const [signature, setSignature] = useState<string>('');
  const [gpsCoords, setGpsCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  // Jawaban: { [qUuid]: { jawaban: any, catatan?: string, keterangan_catatan?: string } }
  const [answers, setAnswers] = useState<{
    [qUuid: string]: { jawaban: any; catatan?: string; keterangan_catatan?: string };
  }>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter categories by respondent role
  const filteredCategories = categories
    .map((kategori) => ({
      ...kategori,
      pertanyaan: kategori.pertanyaan.filter((q) =>
        id_jenis_responden
          ? q.for_responden_group.some((res) => res.uuid === id_jenis_responden)
          : true
      ),
    }))
    .filter((kategori) => kategori.pertanyaan.length > 0);

  const selectedInstansi = respondents.find(
    (it) => it.id_instansi === selectedInstansiId || it.uuid === selectedInstansiId
  );

  // Available jenis responden for selected instansi
  const availableRoles = jenisResponden.filter((it) =>
    selectedInstansi?.tipe ? it.tipe === selectedInstansi.tipe : true
  );

  // Filtered respondents by search query
  const filteredRespondents = respondents.filter((r) =>
    r.nama_instansi.toLowerCase().includes(instansiSearch.toLowerCase())
  );

  // Parse Question Image
  const parseQuestionImage = (fileConfig?: string | null) => {
    try {
      if (!fileConfig) return null;
      const parsed = JSON.parse(fileConfig);
      return parsed?.image_url ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  // Answer handler
  const handleAnswerChange = (qUuid: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [qUuid]: {
        ...prev[qUuid],
        jawaban: val,
      },
    }));
  };

  // Checkbox toggle
  const handleCheckboxToggle = (qUuid: string, optText: string) => {
    const current = answers[qUuid]?.jawaban;
    let updated: string[] = Array.isArray(current) ? [...current] : [];
    if (updated.includes(optText)) {
      updated = updated.filter((item) => item !== optText);
    } else {
      updated.push(optText);
    }
    setAnswers((prev) => ({
      ...prev,
      [qUuid]: {
        ...prev[qUuid],
        jawaban: updated,
      },
    }));
  };

  // Catatan handler
  const handleNoteChange = (qUuid: string, noteVal: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qUuid]: {
        ...prev[qUuid],
        catatan: noteVal,
      },
    }));
  };

  // Step 0 Validator
  const handleNextFromStep0 = () => {
    if (!selectedInstansiId) {
      toast.warning('Pilih satuan pendidikan / sekolah sasaran terlebih dahulu.');
      return;
    }
    if (!id_jenis_responden) {
      toast.warning('Pilih tipe / peran responden yang diwawancarai.');
      return;
    }
    if (!namaResponden.trim()) {
      toast.warning('Masukkan nama lengkap responden yang diwawancarai.');
      return;
    }
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Total Steps: Step 0 (Identitas) + Sections + Step Final (Signature & GPS)
  const totalSections = filteredCategories.length;
  const finalStepIndex = totalSections + 1;

  // Progress percentage
  const currentProgress =
    currentStep === 0
      ? 10
      : Math.min(
          100,
          Math.round((currentStep / (totalSections + 1)) * 100)
        );

  // Submit Handler
  const handleSubmit = async () => {
    try {
      if (!signature) {
        toast.warning('Responden belum membubuhkan tanda tangan digital.');
        return;
      }

      setIsSubmitting(true);

      // Build answer payload
      const answerPayload = Object.keys(answers).map((qId) => {
        const item = answers[qId];
        let serializedJawaban = item.jawaban;
        if (typeof item.jawaban === 'object' && item.jawaban !== null) {
          serializedJawaban = JSON.stringify(item.jawaban);
        }
        return {
          id_pertanyaan: qId,
          jawaban: serializedJawaban !== undefined ? String(serializedJawaban) : '',
          catatan: item.catatan || '',
        };
      });

      const namaInstansi = selectedInstansi?.nama_instansi || '';
      const payload = {
        id_survey: survey_id,
        nama: `${namaResponden.trim()} - ${namaInstansi}`,
        id_instansi: selectedInstansiId,
        id_jenis_responden,
        jawaban: answerPayload,
        signature: signature || undefined,
        gps: gpsCoords || undefined,
      };

      const url = `${BASE_API_URL}/submission`;
      const { data } = await post(url, JSON.stringify(payload), token);
      setIsSubmitting(false);

      if (data?.success === true) {
        toast.success(data?.message || 'Data survei berhasil disimpan!', {
          containerId: 'toastFieldRunner',
        });
        const submissionId = data?.data?.uuid;
        setTimeout(() => {
          router.replace(
            `${redirectBase}/${survey_id}/files?submission_id=${submissionId}`
          );
        }, 800);
      } else {
        toast.warning(data?.message || 'Gagal menyimpan hasil survei.', {
          containerId: 'toastFieldRunner',
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error('Terjadi kesalahan koneksi saat mengirim formulir.', {
        containerId: 'toastFieldRunner',
      });
    }
  };

  const currentCategory =
    currentStep >= 1 && currentStep <= totalSections
      ? filteredCategories[currentStep - 1]
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      <ToastContainer containerId="toastFieldRunner" autoClose={3000} hideProgressBar />

      {/* 1. GOOGLE FORMS-GRADE OFFICIAL HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="h-3 bg-[#0B5C9E]" />
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B5C9E]" />
              Mode Supervisi Lapangan Resmi
            </span>
            {selectedInstansi && (
              <span className="text-xs font-semibold text-[#0B5C9E] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {selectedInstansi.nama_instansi}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            {survey_name}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
            Formulir supervisi dan wawancara langsung penjaminan mutu SMK. Pastikan data diisi secara faktual bersama pihak sekolah.
          </p>

          {/* Progress bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>
                {currentStep === 0
                  ? 'Tahap 1: Verifikasi Sekolah & Responden'
                  : currentStep <= totalSections
                  ? `Bagian ${currentStep} dari ${totalSections}: ${currentCategory?.nama_kategori}`
                  : 'Tahap Akhir: Tanda Tangan & Verifikasi GPS'}
              </span>
              <span className="text-[#0B5C9E] font-bold">{currentProgress}% Selesai</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#0B5C9E] transition-all duration-300 rounded-full"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* STEP 0: SELEKSI SEKOLAH & IDENTITAS RESPONDEN (Interactive modern picker) */}
      {currentStep === 0 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card Pilih Sekolah Ter-assign */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-[#0B5C9E]" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pilih Satuan Pendidikan / Sekolah Binaan <span className="text-rose-500">*</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih sekolah yang ditugaskan kepada Anda untuk supervisi ini.
                </p>
              </div>
            </div>

            {/* Quick Filter Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari nama sekolah atau kota..."
                value={instansiSearch}
                onChange={(e) => setInstansiSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0B5C9E] transition-all"
              />
            </div>

            {/* School Options Grid */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredRespondents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Tidak ditemukan sekolah yang cocok dengan pencarian.
                </div>
              ) : (
                filteredRespondents.map((inst) => {
                  const isSelected =
                    selectedInstansiId === inst.id_instansi ||
                    selectedInstansiId === inst.uuid;
                  return (
                    <div
                      key={inst.id_instansi || inst.uuid}
                      onClick={() => {
                        setSelectedInstansiId(inst.id_instansi || inst.uuid);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#0B5C9E] bg-blue-50/60 ring-2 ring-blue-100 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#0B5C9E] text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {inst.nama_instansi}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {inst.tipe ? `Tipe: ${inst.tipe} • ` : ''}
                            {inst.kota || 'Wilayah Terdaftar'}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#0B5C9E] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card Pilih Peran & Responden */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <UserCheck className="w-5 h-5 text-[#0B5C9E]" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Peran & Data Diri Responden <span className="text-rose-500">*</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan posisi narasumber di sekolah yang diwawancarai langsung.
                </p>
              </div>
            </div>

            {/* Role Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pilih Tipe / Kelompok Responden:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableRoles.map((role) => {
                  const isSelected = id_jenis_responden === role.uuid;
                  return (
                    <button
                      key={role.uuid}
                      type="button"
                      onClick={() => setIdJenisResponden(role.uuid)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-[#0B5C9E] bg-blue-50/70 ring-2 ring-blue-100 text-[#0B5C9E] font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5 text-[#0B5C9E]" />
                      <span className="text-xs">{role.jenis}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nama Responden Input */}
            <div className="pt-2">
              <label
                htmlFor="input-nama-responden"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Nama Lengkap & Gelar Narasumber yang Diwawancarai <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-nama-responden"
                type="text"
                value={namaResponden}
                onChange={(e) => setNamaResponden(e.target.value)}
                placeholder="Contoh: Drs. Bambang Sutrisno, M.Pd. / Siswa SMK PK"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs md:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Action Step 0 */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNextFromStep0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0B5C9E] hover:bg-[#094B82] text-white font-bold text-xs md:text-sm shadow-md transition-all cursor-pointer hover:translate-x-0.5"
            >
              <span>Mulai Pengisian Butir Kuesioner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1..N: SECTIONS & GOOGLE FORMS QUESTIONS */}
      {currentStep >= 1 && currentStep <= totalSections && currentCategory && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E]">
                  Bagian {currentStep} dari {totalSections}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {currentCategory.nama_kategori}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {currentCategory.pertanyaan.length} Butir Pertanyaan
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {currentCategory.pertanyaan.map((q, qIdx) => {
                const qImage = parseQuestionImage(q.file_config);
                const currentAns = answers[q.uuid]?.jawaban;
                const currentNote = answers[q.uuid]?.catatan || '';

                return (
                  <div
                    key={q.uuid}
                    className="p-5 md:p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#0B5C9E]/60 transition-all space-y-4 shadow-2xs"
                  >
                    {/* Question Title */}
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#0B5C9E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                          <span dangerouslySetInnerHTML={{ __html: q.pertanyaan }} />
                          {q.required && (
                            <span className="text-rose-500 ml-1 font-bold">*</span>
                          )}
                        </h3>
                        {q.deskripsi_bantuan && (
                          <p className="text-xs text-slate-500 mt-1">
                            {q.deskripsi_bantuan}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Question Image (If any) */}
                    {qImage && (
                      <div
                        className={`pl-10 my-2 flex flex-col ${
                          qImage.image_align === 'left'
                            ? 'items-start'
                            : qImage.image_align === 'right'
                            ? 'items-end'
                            : 'items-center'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qImage.image_url}
                          alt={qImage.image_caption || 'Ilustrasi butir pertanyaan'}
                          className="max-h-72 max-w-full rounded-xl border border-slate-200 object-contain shadow-xs bg-slate-50"
                        />
                        {qImage.image_caption && (
                          <span className="text-[11px] text-slate-500 italic mt-1.5">
                            {qImage.image_caption}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Input Elements per Question Type */}
                    <div className="pl-10 space-y-3">
                      {/* Pilihan Ganda (Single Choice) */}
                      {['PILIHAN', 'PILIHAN_GANDA'].includes(q.jenis) && (
                        <div className="space-y-2">
                          {q.opsi_pertanyaan?.map((opt) => {
                            const isChecked =
                              currentAns === opt.opsi_jawaban ||
                              (typeof currentAns === 'object' &&
                                currentAns?.id_opsi_jawaban === opt.uuid);

                            return (
                              <label
                                key={opt.uuid}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'border-[#0B5C9E] bg-blue-50/60 ring-2 ring-blue-100 font-semibold text-[#0B5C9E]'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-800 bg-white hover:bg-slate-50/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.uuid}`}
                                  value={opt.opsi_jawaban}
                                  checked={isChecked}
                                  onChange={() =>
                                    handleAnswerChange(q.uuid, {
                                      id_opsi_jawaban: opt.uuid,
                                      text: opt.opsi_jawaban,
                                    })
                                  }
                                  className="accent-[#0B5C9E] w-4 h-4"
                                />
                                <span className="text-xs">{opt.opsi_jawaban}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Kotak Centang (Multiple Checkboxes) */}
                      {['CHECKBOX', 'KOTAK_CENTANG'].includes(q.jenis) && (
                        <div className="space-y-2">
                          {q.opsi_pertanyaan?.map((opt) => {
                            const isChecked =
                              Array.isArray(currentAns) &&
                              currentAns.includes(opt.opsi_jawaban);

                            return (
                              <label
                                key={opt.uuid}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-100 font-semibold text-emerald-900'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-800 bg-white hover:bg-slate-50/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    handleCheckboxToggle(q.uuid, opt.opsi_jawaban)
                                  }
                                  className="accent-emerald-600 rounded w-4 h-4"
                                />
                                <span className="text-xs">{opt.opsi_jawaban}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Dropdown */}
                      {q.jenis === 'DROPDOWN' && (
                        <select
                          value={
                            typeof currentAns === 'object'
                              ? currentAns?.text || ''
                              : currentAns || ''
                          }
                          onChange={(e) => {
                            const opt = q.opsi_pertanyaan?.find(
                              (o) => o.opsi_jawaban === e.target.value
                            );
                            handleAnswerChange(q.uuid, {
                              id_opsi_jawaban: opt?.uuid || '',
                              text: e.target.value,
                            });
                          }}
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                        >
                          <option value="">-- Pilih salah satu opsi --</option>
                          {q.opsi_pertanyaan?.map((opt) => (
                            <option key={opt.uuid} value={opt.opsi_jawaban}>
                              {opt.opsi_jawaban}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Isian Singkat */}
                      {['ISIAN', 'ISIAN_SINGKAT'].includes(q.jenis) && (
                        <input
                          type="text"
                          placeholder="Tuliskan jawaban singkat responden..."
                          value={typeof currentAns === 'string' ? currentAns : ''}
                          onChange={(e) => handleAnswerChange(q.uuid, e.target.value)}
                          className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                        />
                      )}

                      {/* Paragraf / Uraian Panjang */}
                      {q.jenis === 'PARAGRAF' && (
                        <textarea
                          rows={3}
                          placeholder="Tuliskan uraian hasil wawancara mendalam..."
                          value={typeof currentAns === 'string' ? currentAns : ''}
                          onChange={(e) => handleAnswerChange(q.uuid, e.target.value)}
                          className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E]"
                        />
                      )}

                      {/* Optional Notes / Catatan Tambahan Petugas */}
                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Catatan tambahan pewawancara (opsional)..."
                          value={currentNote}
                          onChange={(e) => handleNoteChange(q.uuid, e.target.value)}
                          className="w-full text-[11px] text-slate-600 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0B5C9E]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(currentStep - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(currentStep + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white font-bold text-xs md:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>{currentStep === totalSections ? 'Lanjut ke Verifikasi Lapangan' : 'Bagian Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FINAL STEP: TANDA TANGAN DIGITAL & GPS GEOTAGGING */}
      {currentStep > totalSections && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Tahap Verifikasi Akhir
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Tanda Tangan Digital & Koordinat Audit
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Bukti Integritas Supervisi
              </span>
            </div>

            {/* Field Verification Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Widget A: Digital Signature */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#0B5C9E]" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Tanda Tangan Narasumber / Responden <span className="text-rose-500">*</span>
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  Mohon agar {namaResponden} membubuhkan tanda tangan langsung di bawah ini:
                </p>

                <SignaturePad onSave={(dataUrl) => setSignature(dataUrl)} />
              </div>

              {/* Widget B: Geolocation Capture */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0B5C9E]" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Koordinat Geotag GPS Lapangan
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ambil posisi titik koordinat faktual sekolah untuk autentikasi audit penugasan:
                </p>

                <GeolocationCapture
                  onLocationCaptured={(coords) => setGpsCoords(coords)}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(totalSections);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Soal</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirim Data Supervisi...' : 'Simpan & Lanjut ke Berkas Foto'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
