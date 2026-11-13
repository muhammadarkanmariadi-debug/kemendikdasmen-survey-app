'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HasilSurvey,
  IKategori,
  IResponden,
  IDocument,
  IInstansi,
} from '@/app/types';
import { BASE_FILE_DOCUMENTATION, BASE_FILE_DOCUMENTS } from '@/global';
import { OfficialPrintDocumentModal } from './OfficialPrintDocumentModal';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  ImageIcon,
  Layers,
  MapPin,
  Maximize2,
  PenTool,
  Printer,
  ShieldCheck,
  User,
  UserCheck,
  X,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ModernSubmissionDetailViewProps {
  submission: HasilSurvey;
  categories: IKategori[];
  respondents: IResponden[];
  id_jenis_responden: string;
  respondent_id: string;
  documents: IDocument[];
  documentations: IDocument[];
  answer: {
    [key: string]: {
      jawaban:
        | string
        | { id_opsi_jawaban: string; text: string }
        | { id_opsi_jawaban: string; text: string }[];
      catatan: string;
      keterangan_catatan?: string;
    };
  };
  backUrl?: string;
  headerAction?: React.ReactNode;
}

export function ModernSubmissionDetailView({
  submission,
  categories,
  respondents,
  id_jenis_responden,
  respondent_id,
  documents = [],
  documentations = [],
  answer = {},
  backUrl = '/admin/hasil',
  headerAction,
}: ModernSubmissionDetailViewProps) {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  // Category Filtering
  const filteredCategories = categories
    .map((kategori) => ({
      ...kategori,
      pertanyaan: kategori.pertanyaan.filter((q) =>
        q.for_responden_group.some((res) => res.uuid === id_jenis_responden)
      ),
    }))
    .filter((kategori) => kategori.pertanyaan.length > 0);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'ANSWERS' | 'DOCS' | 'PROOF'>('ANSWERS');

  // Lightbox / Image Preview Modal State
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Parse respondent & instansi
  const currentRespondent = respondents.find((it) => it.uuid === respondent_id);
  const namaResponden = currentRespondent?.nama || submission.responden?.nama || 'Responden Terdaftar';
  const namaInstansi =
    submission.instansi?.nama_instansi ||
    (submission.responden as any)?.instansi?.nama_instansi ||
    'Satuan Pendidikan SMK';
  const npsn =
    submission.instansi?.kode_instansi ||
    submission.instansi?.npsn ||
    (submission.responden as any)?.instansi?.kode_instansi ||
    (submission.responden as any)?.instansi?.npsn ||
    '-';
  const kota =
    submission.instansi?.kota ||
    (submission.responden as any)?.instansi?.kota ||
    '';
  const provinsi =
    submission.instansi?.provinsi ||
    (submission.responden as any)?.instansi?.provinsi ||
    '';

  // Format Date (Indonesian)
  const formattedDate = new Date(submission.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = new Date(submission.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const surveyorName = submission.user?.nama_user || 'Petugas Lapangan Kemendikbud';
  const verifiedDate = `${formattedDate}, ${formattedTime} WIB`;

  // Calculate statistics
  const totalQuestions = filteredCategories.reduce(
    (acc, cat) => acc + cat.pertanyaan.length,
    0
  );
  const answeredCount = Object.keys(answer).filter(
    (k) => answer[k]?.jawaban !== undefined && answer[k]?.jawaban !== ''
  ).length;

  const currentCategory = filteredCategories[activeCategoryIndex] || filteredCategories[0];

  const parseOptionNote = (optionId: string, catatan: string): string => {
    try {
      const parsed = JSON.parse(catatan);
      if (Array.isArray(parsed)) {
        const found = parsed.find((it: any) => it.option_id === optionId);
        return found ? found.value : '';
      }
    } catch (e) {}
    return catatan || '';
  };

  const parseQuestionImage = (fileConfig?: string | null) => {
    try {
      if (!fileConfig) return null;
      const parsed = JSON.parse(fileConfig);
      return parsed?.image_url ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE INSPECTION HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lembar Hasil Terverifikasi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B5C9E]" />
                Penjaminan Mutu SMK
              </span>
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {submission.survey?.nama_survey || 'Kuesioner Mutu Terpadu'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ID Submission:{' '}
                <span className="font-mono text-slate-700 font-medium">
                  {submission.uuid}
                </span>
              </p>
            </div>

            {/* School & Respondent Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Building2 className="w-4 h-4 text-[#0B5C9E] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Satuan Pendidikan
                  </span>
                  <p className="font-bold text-slate-800 truncate">{namaInstansi}</p>
                  <p className="text-slate-500 text-[11px]">
                    NPSN: {npsn} {kota ? `• ${kota}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <UserCheck className="w-4 h-4 text-[#0B5C9E] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Identitas Responden
                  </span>
                  <p className="font-bold text-slate-800 truncate">{namaResponden}</p>
                  <p className="text-slate-500 text-[11px]">
                    {submission.tipe_responden || 'Responden Terdata'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-[#0B5C9E] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Waktu Pengisian
                  </span>
                  <p className="font-bold text-slate-800">{formattedDate}</p>
                  <p className="text-slate-500 text-[11px]">{formattedTime} WIB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                <span className="text-lg font-extrabold text-[#0B5C9E]">
                  {answeredCount}/{totalQuestions}
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">
                  Butir Terisi
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-lg font-extrabold text-slate-700">
                  {documentations.length + documents.length}
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">
                  Lampiran
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Verifikasi PDF</span>
              </button>

              {headerAction && (
                <div className="w-full">
                  {headerAction}
                </div>
              )}

              {backUrl && (
                <Link
                  href={backUrl}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  <span>Kembali ke Daftar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('ANSWERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ANSWERS'
              ? 'bg-[#0B5C9E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Lembar Jawaban Butir ({totalQuestions})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DOCS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DOCS'
              ? 'bg-[#0B5C9E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Galeri Foto & Dokumen ({documentations.length + documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PROOF')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PROOF'
              ? 'bg-[#0B5C9E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Integritas & Tanda Tangan Digital</span>
        </button>
      </div>

      {/* TAB 1: LEMBAR JAWABAN BUTIR */}
      {activeTab === 'ANSWERS' && (
        <div className="space-y-5">
          {/* Sub-Category Navigation Pills */}
          {filteredCategories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredCategories.map((cat, idx) => (
                <button
                  key={cat.uuid}
                  type="button"
                  onClick={() => setActiveCategoryIndex(idx)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCategoryIndex === idx
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>
                    {idx + 1}. {cat.nama_kategori}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/50 text-slate-600">
                    {cat.pertanyaan.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Current Category Question List */}
          {currentCategory ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E]">
                    Bagian {activeCategoryIndex + 1} dari {filteredCategories.length}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {currentCategory.nama_kategori}
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {currentCategory.pertanyaan.length} Butir Pertanyaan
                </span>
              </div>

              <div className="space-y-6">
                {currentCategory.pertanyaan.map((question, qIdx) => {
                  const ansData = answer[question.uuid];
                  const qImage = parseQuestionImage(question.file_config);

                  return (
                    <div
                      key={question.uuid}
                      className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all space-y-3"
                    >
                      {/* Question Header & Title */}
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#0B5C9E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                            <span
                              dangerouslySetInnerHTML={{ __html: question.pertanyaan }}
                            />
                            {question.required && (
                              <span className="text-rose-500 ml-1 font-bold">*</span>
                            )}
                          </h3>
                          {question.deskripsi_bantuan && (
                            <p className="text-xs text-slate-500 mt-1">
                              {question.deskripsi_bantuan}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Attached Question Illustration (If any) */}
                      {qImage && (
                        <div
                          className={`pl-9 my-2 flex flex-col ${
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
                            className="max-h-60 max-w-full rounded-xl border border-slate-200 object-contain shadow-xs bg-white"
                          />
                          {qImage.image_caption && (
                            <span className="text-[11px] text-slate-400 italic mt-1">
                              {qImage.image_caption}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Clean Modern Answer Output */}
                      <div className="pl-9 pt-1">
                        {!ansData || ansData.jawaban === undefined || ansData.jawaban === '' ? (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-800 italic flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Responden tidak mengisi butir ini (opsional).</span>
                          </div>
                        ) : typeof ansData.jawaban === 'string' ? (
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs md:text-sm text-slate-800 leading-relaxed font-medium shadow-2xs">
                            {ansData.jawaban}
                          </div>
                        ) : Array.isArray(ansData.jawaban) ? (
                          <div className="space-y-2">
                            {ansData.jawaban.map((item, itIdx) => (
                              <div
                                key={item.id_opsi_jawaban || itIdx}
                                className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col gap-1 shadow-2xs"
                              >
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>{item.text}</span>
                                </div>
                                {parseOptionNote(item.id_opsi_jawaban, ansData.catatan) && (
                                  <div className="mt-1 p-2 bg-blue-50/80 rounded-lg text-xs text-[#0B5C9E] border border-blue-100">
                                    <span className="font-bold text-[10px] uppercase block text-blue-900">
                                      Catatan Responden:
                                    </span>
                                    <span>
                                      {parseOptionNote(item.id_opsi_jawaban, ansData.catatan)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B5C9E]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{(ansData.jawaban as any).text}</span>
                            </div>
                            {ansData.catatan && (
                              <div className="p-2 bg-blue-50/80 rounded-lg text-xs text-slate-700 border border-blue-100">
                                <span className="font-bold text-[10px] uppercase block text-blue-900">
                                  {ansData.keterangan_catatan || 'Catatan Responden:'}
                                </span>
                                <span>{ansData.catatan}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Tidak ada data butir pertanyaan untuk responden ini.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GALERI FOTO LAPANGAN & DOKUMEN PENDUKUNG (The Modern Preview requested by user) */}
      {activeTab === 'DOCS' && (
        <div className="space-y-6">
          {/* 2A. FOTO DOKUMENTASI WAWANCARA & SARPRAS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#0B5C9E]" />
                  <span>Foto Dokumentasi Pengisian & Lapangan ({documentations.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Foto bukti pelaksanaan wawancara langsung, kondisi sarana prasarana, atau proses verifikasi sekolah.
                </p>
              </div>
            </div>

            {documentations.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Tidak ada foto dokumentasi terlampir
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Petugas atau responden tidak menyertakan foto pada sesi ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {documentations.map((doc, idx) => {
                  const imageUrl = `${BASE_FILE_DOCUMENTATION}/${doc.nama_file}`;
                  return (
                    <div
                      key={doc.uuid || idx}
                      className="group/card relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={doc.nama_file}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback if file not on disk
                            (e.target as any).src = '/images/tut wuri handayani.jpeg';
                          }}
                        />
                        <div
                          onClick={() =>
                            setLightboxImage({ url: imageUrl, title: doc.nama_file })
                          }
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white"
                        >
                          <Maximize2 className="w-5 h-5 drop-shadow-md" />
                          <span className="text-xs font-semibold drop-shadow-md">
                            Perbesar
                          </span>
                        </div>
                      </div>

                      {/* File Details Bar */}
                      <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate" title={doc.nama_file}>
                            {doc.nama_file}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Foto Dokumentasi #{idx + 1}
                          </span>
                        </div>

                        <a
                          href={imageUrl}
                          download={doc.nama_file}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B5C9E] hover:bg-blue-50 transition-colors"
                          title="Unduh berkas foto"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2B. DOKUMEN PENDUKUNG RESMI (PDF / DOC / MoU) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0B5C9E]" />
                  <span>Dokumen Pendukung & Regulasi ({documents.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berkas lampiran resmi seperti SK Tim Pengembang, MoU Industri, Rencana Kerja Sekolah (RKS), atau bukti fisik pendukung.
                </p>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Tidak ada dokumen pendukung terlampir
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tidak ada dokumen fisik tambahan yang diunggah untuk kuesioner ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {documents.map((doc, idx) => {
                  const docUrl = `${BASE_FILE_DOCUMENTS}/${doc.nama_file}`;
                  const isPdf = doc.nama_file.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={doc.uuid || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B5C9E] shadow-xs hover:shadow-sm transition-all flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        {isPdf ? (
                          <FileText className="w-5 h-5 text-red-600" />
                        ) : (
                          <FileCheck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate" title={doc.nama_file}>
                          {doc.nama_file}
                        </p>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {isPdf ? 'Berkas PDF Resmi' : 'Dokumen Terlampir'}
                        </span>

                        <div className="mt-2.5 flex items-center gap-2">
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B5C9E] hover:underline"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Buka Preview</span>
                          </a>
                          <span className="text-slate-300">|</span>
                          <a
                            href={docUrl}
                            download={doc.nama_file}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                          >
                            <Download className="w-3 h-3" />
                            <span>Unduh</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRITAS & TANDA TANGAN DIGITAL */}
      {activeTab === 'PROOF' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3A. Tanda Tangan Digital */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PenTool className="w-4 h-4 text-[#0B5C9E]" />
              <h3 className="text-base font-bold text-slate-900">
                Tanda Tangan Digital Responden
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tanda tangan digital ini dibubuhkan secara langsung oleh responden saat proses wawancara lapangan diselesaikan.
            </p>

            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-52">
              {submission.tanda_tangan_responden &&
              submission.tanda_tangan_responden.length > 0 &&
              submission.tanda_tangan_responden[0].tanda_tangan ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={submission.tanda_tangan_responden[0].tanda_tangan}
                  alt="Tanda tangan digital responden"
                  className="max-h-40 max-w-full object-contain filter contrast-125"
                />
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <PenTool className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-600">
                    Tanda Tangan Tersimpan Otentik
                  </p>
                  <p className="text-[11px]">
                    Ditandatangani secara digital oleh {namaResponden}.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-[#0B5C9E]">
              <span className="font-semibold">Otentikasi: Terverifikasi Digital</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* 3B. Geotagging & GPS Geolocation */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-[#0B5C9E]" />
              <h3 className="text-base font-bold text-slate-900">
                Data Lokasi Audit & GPS Geotag
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Catatan koordinat geografis saat formulir dikirimkan untuk memastikan survei dilakukan secara faktual di lokasi satuan pendidikan.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Satuan Pendidikan Sasaran
                  </span>
                  <p className="font-bold text-slate-800">{namaInstansi}</p>
                </div>
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Wilayah Kedinasan
                  </span>
                  <p className="font-bold text-slate-800">
                    {kota ? `${kota}, ` : ''}{provinsi || 'Indonesia'}
                  </p>
                </div>
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Petugas Pewawancara
                  </span>
                  <p className="font-bold text-slate-800">
                    {submission.user?.nama_user || 'Petugas Lapangan Kemendikbud'}
                  </p>
                </div>
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX / FULLSCREEN PREVIEW MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <ImageIcon className="w-4 h-4 text-[#0B5C9E]" />
                <span className="text-xs font-bold truncate">
                  {lightboxImage.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  download={lightboxImage.title}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Unduh gambar"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] max-w-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as any).src = '/images/tut wuri handayani.jpeg';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Official Document Print & Kop Surat Configuration Modal */}
      <OfficialPrintDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        submission={submission}
        categories={categories}
        respondents={respondents}
        id_jenis_responden={id_jenis_responden}
        respondent_id={respondent_id}
        documents={documents}
        documentations={documentations}
        answer={answer}
        namaResponden={namaResponden}
        namaInstansi={namaInstansi}
        npsn={npsn}
        surveyorName={surveyorName}
        verifiedDate={verifiedDate}
      />
    </div>
  );
}
