'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  HasilSurvey,
  IKategori,
  IResponden,
  IDocument,
} from '@/app/types';
import { BASE_FILE_DOCUMENTATION, BASE_FILE_DOCUMENTS } from '@/global';
import {
  Printer,
  X,
  Sliders,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ShieldCheck,
  Eye,
  Settings,
} from 'lucide-react';

export interface OfficialPrintConfig {
  kementerian: string;
  ditjen: string;
  direktorat: string;
  alamat: string;
  nomorSurat: string;
  judulDokumen: string;
  showLogo: boolean;
  logoType: 'tutwuri' | 'kemendikbud';
  showIdentity: boolean;
  showMetrics: boolean;
  showQuestions: boolean;
  showNotes: boolean;
  showDocumentations: boolean;
  showSupportingDocs: boolean;
  showSignatures: boolean;
  showGps: boolean;
  catatanPetugas: string;
}

interface OfficialPrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: HasilSurvey;
  categories: IKategori[];
  respondents: IResponden[];
  id_jenis_responden: string;
  respondent_id: string;
  documents?: IDocument[];
  documentations?: IDocument[];
  answer?: Record<string, any>;
  namaResponden: string;
  namaInstansi: string;
  npsn: string;
  surveyorName: string;
  verifiedDate: string;
}

export function OfficialPrintDocumentModal({
  isOpen,
  onClose,
  submission,
  categories,
  respondents,
  id_jenis_responden,
  respondent_id,
  documents = [],
  documentations = [],
  answer = {},
  namaResponden,
  namaInstansi,
  npsn,
  surveyorName,
  verifiedDate,
}: OfficialPrintDocumentModalProps) {
  // Config state for Kop Surat & Document Structure (can be customized by Admin)
  const [config, setConfig] = useState<OfficialPrintConfig>({
    kementerian: 'KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI',
    ditjen: 'DIREKTORAT JENDERAL PENDIDIKAN VOKASI',
    direktorat: 'DIREKTORAT SEKOLAH MENENGAH KEJURUAN',
    alamat:
      'Kompleks Kemendikbudristek Gedung E Lantai 12-13, Jalan Jenderal Sudirman, Senayan, Jakarta Pusat 10270 | Laman: smk.kemdikbud.go.id | Pos-el: survei.smk@kemdikbud.go.id',
    nomorSurat: `BA.SURV/${new Date().getFullYear()}/${submission.uuid.substring(0, 8).toUpperCase()}`,
    judulDokumen: 'BERITA ACARA & LEMBAR VERIFIKASI HASIL SURVEI LAPANGAN',
    showLogo: true,
    logoType: 'tutwuri',
    showIdentity: true,
    showMetrics: true,
    showQuestions: true,
    showNotes: true,
    showDocumentations: true,
    showSupportingDocs: true,
    showSignatures: true,
    showGps: true,
    catatanPetugas:
      'Seluruh butir kuesioner telah diverifikasi sesuai instrumen resmi dan data lapangan yang dilaporkan oleh satuan pendidikan.',
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'KOP' | 'SUSUNAN'>('KOP');

  if (!isOpen) return null;

  // Filter categories and questions for this respondent group
  const filteredCategories = categories
    .map((kategori) => ({
      ...kategori,
      pertanyaan: (kategori.pertanyaan || []).filter((q) =>
        (q.for_responden_group || []).some((res: any) => res.uuid === id_jenis_responden)
      ),
    }))
    .filter((kategori) => kategori.pertanyaan.length > 0);

  // Helper to check answer
  const isSelectedOption = (questionUuid: string, optionUuid: string) => {
    const ans = answer[questionUuid]?.jawaban;
    if (!ans) return false;
    if (typeof ans === 'object') {
      if (Array.isArray(ans)) {
        return ans.some((it: any) => it.id_opsi_jawaban === optionUuid || it.uuid === optionUuid);
      }
      return ans.id_opsi_jawaban === optionUuid || ans.uuid === optionUuid;
    }
    if (typeof ans === 'string') {
      try {
        const parsed = JSON.parse(ans);
        if (Array.isArray(parsed)) {
          return parsed.some((it: any) => it.id_opsi_jawaban === optionUuid);
        }
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed.id_opsi_jawaban === optionUuid;
        }
      } catch {
        return ans === optionUuid;
      }
    }
    return false;
  };

  const getAnswerText = (questionUuid: string) => {
    const ans = answer[questionUuid]?.jawaban;
    if (!ans) return '-';
    if (typeof ans === 'string') {
      try {
        const parsed = JSON.parse(ans);
        if (typeof parsed === 'object') {
          return parsed.text || parsed.opsi_jawaban || JSON.stringify(parsed);
        }
      } catch {
        return ans;
      }
      return ans;
    }
    if (typeof ans === 'object') {
      if (Array.isArray(ans)) {
        return ans.map((it: any) => it.text || it.opsi_jawaban || it.id_opsi_jawaban).join(', ');
      }
      return ans.text || ans.opsi_jawaban || '-';
    }
    return String(ans);
  };

  const getRespondentNotes = (questionUuid: string) => {
    return answer[questionUuid]?.catatan || '';
  };

  // Direct trigger window.print
  const handlePrint = () => {
    window.print();
  };

  const logoSrc =
    config.logoType === 'tutwuri'
      ? '/images/tut wuri handayani.jpeg'
      : '/images/logo_jenama_primer.png';

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="print:hidden w-full bg-white border-b border-slate-200 shadow-md py-3 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B5C9E]/10 flex items-center justify-center text-[#0B5C9E]">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Pratinjau & Pengaturan Berkas Resmi (Kop Surat & Cetak PDF)
            </h2>
            <p className="text-[11px] text-slate-500">
              Dokumen siap cetak langsung tanpa tab baru. Sesuaikan kop dan susunan melalui panel pengaturan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isSettingsOpen
                ? 'bg-blue-50 text-[#0B5C9E] border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 text-[#0B5C9E]" />
            <span>Pengaturan Dokumen & Kop</span>
            {isSettingsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang (PDF)</span>
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body: Settings Drawer + A4 Document Canvas */}
      <div className="flex-1 overflow-y-auto flex justify-center p-4 sm:p-8 bg-slate-200/70 print:p-0 print:bg-white print:overflow-visible">
        {/* Settings Drawer (print:hidden) */}
        {isSettingsOpen && (
          <div className="print:hidden fixed top-16 right-6 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pengaturan Cetak Resmi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ubah Kop Surat dan susunan isi dokumen secara langsung
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setActiveSettingsTab('KOP')}
                className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  activeSettingsTab === 'KOP'
                    ? 'border-[#0B5C9E] text-[#0B5C9E]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Kop Surat Kedinasan
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab('SUSUNAN')}
                className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  activeSettingsTab === 'SUSUNAN'
                    ? 'border-[#0B5C9E] text-[#0B5C9E]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Susunan & Komponen
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {activeSettingsTab === 'KOP' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kementerian / Lembaga
                    </label>
                    <input
                      type="text"
                      value={config.kementerian}
                      onChange={(e) => setConfig({ ...config, kementerian: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Direktorat Jenderal / Eselon I
                    </label>
                    <input
                      type="text"
                      value={config.ditjen}
                      onChange={(e) => setConfig({ ...config, ditjen: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Direktorat / Satuan Kerja
                    </label>
                    <input
                      type="text"
                      value={config.direktorat}
                      onChange={(e) => setConfig({ ...config, direktorat: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alamat & Kontak Kedinasan
                    </label>
                    <textarea
                      rows={3}
                      value={config.alamat}
                      onChange={(e) => setConfig({ ...config, alamat: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nomor Berita Acara / Registrasi
                    </label>
                    <input
                      type="text"
                      value={config.nomorSurat}
                      onChange={(e) => setConfig({ ...config, nomorSurat: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none font-mono"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700">Tampilkan Logo Kop</span>
                    <input
                      type="checkbox"
                      checked={config.showLogo}
                      onChange={(e) => setConfig({ ...config, showLogo: e.target.checked })}
                      className="rounded border-slate-300 text-[#0B5C9E] focus:ring-[#0B5C9E]"
                    />
                  </div>

                  {config.showLogo && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Pilihan Lambang
                      </label>
                      <select
                        value={config.logoType}
                        onChange={(e) => setConfig({ ...config, logoType: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none"
                      >
                        <option value="tutwuri">Tut Wuri Handayani (Resmi Pendidikan)</option>
                        <option value="kemendikbud">Jenama Primer Kemendikbudristek</option>
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">I. Identitas Satdik & Responden</span>
                      <input
                        type="checkbox"
                        checked={config.showIdentity}
                        onChange={(e) => setConfig({ ...config, showIdentity: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">II. Ringkasan Metrik Pengisian</span>
                      <input
                        type="checkbox"
                        checked={config.showMetrics}
                        onChange={(e) => setConfig({ ...config, showMetrics: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">III. Lembar Instrumen & Jawaban</span>
                      <input
                        type="checkbox"
                        checked={config.showQuestions}
                        onChange={(e) => setConfig({ ...config, showQuestions: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">Tampilkan Catatan Responden</span>
                      <input
                        type="checkbox"
                        checked={config.showNotes}
                        onChange={(e) => setConfig({ ...config, showNotes: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">IV. Foto Dokumentasi Lapangan</span>
                      <input
                        type="checkbox"
                        checked={config.showDocumentations}
                        onChange={(e) => setConfig({ ...config, showDocumentations: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">Daftar Dokumen Pendukung</span>
                      <input
                        type="checkbox"
                        checked={config.showSupportingDocs}
                        onChange={(e) => setConfig({ ...config, showSupportingDocs: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">V. Pengesahan & Tanda Tangan</span>
                      <input
                        type="checkbox"
                        checked={config.showSignatures}
                        onChange={(e) => setConfig({ ...config, showSignatures: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-medium text-slate-800">Audit Lokasi GPS Geotag</span>
                      <input
                        type="checkbox"
                        checked={config.showGps}
                        onChange={(e) => setConfig({ ...config, showGps: e.target.checked })}
                        className="rounded text-[#0B5C9E]"
                      />
                    </label>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Catatan Verifikator / Disclaimer Dokumen
                    </label>
                    <textarea
                      rows={3}
                      value={config.catatanPetugas}
                      onChange={(e) => setConfig({ ...config, catatanPetugas: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0B5C9E] outline-none leading-relaxed"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#0B5C9E] text-white text-xs font-semibold cursor-pointer"
              >
                Terapkan & Tutup
              </button>
            </div>
          </div>
        )}

        {/* Printable Official Sheet (A4 Portrait Paper Styling) */}
        <div
          id="official-print-document"
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl p-8 sm:p-12 font-serif text-[12pt] leading-normal print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:text-black"
        >
          {/* ================= KOP SURAT RESMI KEDINASAN ================= */}
          <div className="border-b-[3px] border-black pb-2 mb-1 relative">
            <div className="flex items-center justify-between gap-4">
              {config.showLogo && (
                <div className="w-24 shrink-0 flex items-center justify-center">
                  <Image
                    src={logoSrc}
                    width={90}
                    height={90}
                    alt="Logo Kedinasan"
                    className="object-contain max-h-[85px] w-auto"
                    priority
                  />
                </div>
              )}

              <div className="flex-1 text-center font-sans tracking-wide">
                <h3 className="text-[12pt] font-semibold text-black uppercase tracking-wider leading-tight">
                  {config.kementerian}
                </h3>
                <h2 className="text-[14pt] font-bold text-black uppercase tracking-wide leading-tight mt-0.5">
                  {config.ditjen}
                </h2>
                <h1 className="text-[16pt] font-extrabold text-black uppercase tracking-wide leading-tight mt-0.5">
                  {config.direktorat}
                </h1>
                <p className="text-[8.5pt] font-normal text-slate-800 leading-snug mt-1.5 font-sans">
                  {config.alamat}
                </p>
              </div>

              {config.showLogo && (
                <div className="w-24 shrink-0 flex items-center justify-center">
                  <Image
                    src="/images/logodirsmk.png"
                    width={85}
                    height={85}
                    alt="Logo Direktorat SMK"
                    className="object-contain max-h-[80px] w-auto"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Double line separator (Garis ganda tebal tipis khas berkas negara) */}
          <div className="border-b-[1px] border-black mb-6"></div>

          {/* ================= JUDUL DOKUMEN & NOMOR BERITA ACARA ================= */}
          <div className="text-center mb-6">
            <h2 className="text-[13pt] font-bold uppercase tracking-wider underline text-black">
              {config.judulDokumen}
            </h2>
            <p className="text-[10pt] font-sans text-slate-800 mt-1">
              Nomor: <span className="font-semibold">{config.nomorSurat}</span>
            </p>
            <p className="text-[11pt] font-semibold text-slate-900 mt-1">
              Survei: &ldquo;{submission.survey?.nama_survey || 'Kuesioner Direktorat SMK'}&rdquo;
            </p>
          </div>

          {/* ================= BAGIAN I: IDENTITAS SATUAN PENDIDIKAN & RESPONDEN ================= */}
          {config.showIdentity && (
            <div className="mb-6 break-inside-avoid text-[10.5pt] font-sans">
              <div className="bg-slate-100/80 px-3 py-1 font-bold text-[10.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-2">
                I. IDENTITAS SATUAN PENDIDIKAN & RESPONDEN
              </div>

              <table className="w-full border-collapse text-[10pt]">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-48 py-1.5 font-semibold text-slate-700">Nama Satuan Pendidikan</td>
                    <td className="w-4 py-1.5 font-bold text-center">:</td>
                    <td className="py-1.5 font-bold text-slate-900 uppercase">{namaInstansi}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Nomor Pokok Sekolah Nasional (NPSN)</td>
                    <td className="py-1.5 font-bold text-center">:</td>
                    <td className="py-1.5 font-semibold text-slate-900 font-mono">{npsn}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Nama Responden Terverifikasi</td>
                    <td className="py-1.5 font-bold text-center">:</td>
                    <td className="py-1.5 font-bold text-slate-900">{namaResponden}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Kelompok / Peran Responden</td>
                    <td className="py-1.5 font-bold text-center">:</td>
                    <td className="py-1.5 font-semibold text-slate-900">
                      {(typeof submission.responden?.jenis_responden === 'string'
                        ? submission.responden.jenis_responden
                        : (submission.responden?.jenis_responden as any)?.jenis) ||
                        respondents.find((r) => r.uuid === respondent_id)?.nama ||
                        'Responden Satdik'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Petugas Surveyor Lapangan</td>
                    <td className="py-1.5 font-bold text-center">:</td>
                    <td className="py-1.5 font-semibold text-slate-900">{surveyorName}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-semibold text-slate-700">Waktu & Tanggal Verifikasi</td>
                    <td className="py-1.5 font-bold text-center">:</td>
                    <td className="py-1.5 font-semibold text-slate-900">{verifiedDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ================= BAGIAN II: RINGKASAN METRIK PENGISIAN ================= */}
          {config.showMetrics && (
            <div className="mb-6 break-inside-avoid text-[10pt] font-sans">
              <div className="bg-slate-100/80 px-3 py-1 font-bold text-[10.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-2">
                II. RINGKASAN REKAPITULASI LAPANGAN
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                  <div className="text-[9pt] text-slate-600 font-semibold">Total Butir Instrumen</div>
                  <div className="text-[13pt] font-extrabold text-[#0B5C9E]">
                    {submission.jawaban_survey?.length || 0} Butir
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                  <div className="text-[9pt] text-slate-600 font-semibold">Status Pengisian</div>
                  <div className="text-[13pt] font-extrabold text-emerald-700">Lengkap 100%</div>
                </div>

                <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                  <div className="text-[9pt] text-slate-600 font-semibold">Foto Dokumentasi</div>
                  <div className="text-[13pt] font-extrabold text-slate-900">
                    {documentations.length} Foto
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                  <div className="text-[9pt] text-slate-600 font-semibold">Dokumen Pendukung</div>
                  <div className="text-[13pt] font-extrabold text-slate-900">
                    {documents.length} Berkas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= BAGIAN III: LEMBAR INSTRUMEN DAN HASIL VERIFIKASI ================= */}
          {config.showQuestions && (
            <div className="mb-6 text-[10pt] font-sans">
              <div className="bg-slate-100/80 px-3 py-1 font-bold text-[10.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-3 break-after-avoid">
                III. LEMBAR JAWABAN INSTRUMEN TERVERIFIKASI
              </div>

              <div className="space-y-4">
                {filteredCategories.map((cat, catIdx) => (
                  <div key={cat.uuid || catIdx} className="break-inside-avoid">
                    <div className="font-bold text-[10.5pt] text-slate-900 mb-1 pb-1 border-b border-slate-400">
                      Bagian {catIdx + 1}: {cat.nama_kategori}
                    </div>

                    <table className="w-full border border-slate-400 border-collapse text-[9.5pt]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 border-b border-slate-400">
                          <th className="w-8 py-1.5 px-2 text-center border-r border-slate-400 font-bold">No</th>
                          <th className="py-1.5 px-3 text-left border-r border-slate-400 font-bold">
                            Butir Pertanyaan Instrumen
                          </th>
                          <th className="w-64 py-1.5 px-3 text-left font-bold">
                            Jawaban & Pilihan Responden
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cat.pertanyaan || []).map((q, qIdx) => {
                          const note = getRespondentNotes(q.uuid);
                          return (
                            <tr
                              key={q.uuid || qIdx}
                              className={`border-b border-slate-300 ${qIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
                            >
                              <td className="py-2 px-2 text-center align-top border-r border-slate-300 font-semibold">
                                {qIdx + 1}
                              </td>
                              <td className="py-2 px-3 align-top border-r border-slate-300">
                                <div
                                  className="font-medium text-slate-900 leading-snug"
                                  dangerouslySetInnerHTML={{ __html: q.pertanyaan }}
                                />
                                {q.deskripsi_bantuan && (
                                  <div className="text-[8.5pt] text-slate-500 italic mt-0.5">
                                    {q.deskripsi_bantuan}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3 align-top">
                                {['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG'].includes(q.jenis) &&
                                q.opsi_pertanyaan &&
                                q.opsi_pertanyaan.length > 0 ? (
                                  <div className="space-y-1">
                                    {q.opsi_pertanyaan.map((opt) => {
                                      const checked = isSelectedOption(q.uuid, opt.uuid);
                                      return (
                                        <div
                                          key={opt.uuid}
                                          className={`flex items-start gap-1.5 leading-tight ${
                                            checked ? 'font-bold text-[#0B5C9E]' : 'text-slate-500'
                                          }`}
                                        >
                                          <span className="font-mono text-sm leading-none shrink-0">
                                            {checked ? '[ ✓ ]' : '[   ]'}
                                          </span>
                                          <span className="text-[9pt]">{opt.opsi_jawaban}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="font-semibold text-slate-900 text-[9pt] whitespace-pre-wrap">
                                    {getAnswerText(q.uuid)}
                                  </div>
                                )}

                                {config.showNotes && note && (
                                  <div className="mt-1.5 p-1.5 rounded bg-amber-50/80 border border-amber-200 text-[8.5pt] text-amber-900">
                                    <span className="font-bold">Catatan Responden:</span> {note}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= BAGIAN IV: LAMPIRAN FOTO DOKUMENTASI & BUKTI FISIK ================= */}
          {config.showDocumentations && documentations.length > 0 && (
            <div className="mb-6 break-inside-avoid text-[10pt] font-sans">
              <div className="bg-slate-100/80 px-3 py-1 font-bold text-[10.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-3">
                IV. LAMPIRAN BUKTI FOTO DOKUMENTASI LAPANGAN
              </div>

              <div className="grid grid-cols-3 gap-3">
                {documentations.map((doc, docIdx) => {
                  const docUrl = doc.nama_file
                    ? doc.nama_file.startsWith('http')
                      ? doc.nama_file
                      : `${BASE_FILE_DOCUMENTATION}/${doc.nama_file}`
                    : '';
                  return (
                    <div
                      key={doc.id || docIdx}
                      className="border border-slate-300 rounded p-1.5 bg-slate-50 text-center break-inside-avoid"
                    >
                      <div className="w-full h-32 bg-slate-200 rounded relative overflow-hidden flex items-center justify-center">
                        {docUrl ? (
                          <img
                            src={docUrl}
                            alt={doc.nama_file || `Dokumentasi ${docIdx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.src = '/images/tut wuri handayani.jpeg';
                              e.target.className = 'w-16 h-16 object-contain opacity-50 m-auto';
                            }}
                          />
                        ) : (
                          <span className="text-slate-400 text-xs">Foto Tidak Tersedia</span>
                        )}
                      </div>
                      <div className="mt-1 font-semibold text-[8.5pt] text-slate-800 truncate">
                        {doc.nama_file || `Foto Kegiatan #${docIdx + 1}`}
                      </div>
                      <div className="text-[7.5pt] text-slate-500">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('id-ID') : 'Terverifikasi'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= BAGIAN V: PENGESAHAN, GEOTAG GPS & TANDA TANGAN DIGITAL ================= */}
          {config.showSignatures && (
            <div className="mt-8 break-inside-avoid text-[10pt] font-sans">
              <div className="bg-slate-100/80 px-3 py-1 font-bold text-[10.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-3">
                V. PENGESAHAN DAN INTEGRITAS DATA LAPANGAN
              </div>

              {/* GPS Geotag Info */}
              {config.showGps && (
                <div className="mb-4 p-2.5 rounded border border-slate-300 bg-slate-50 flex items-center justify-between text-[9pt]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B5C9E] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">Geotagging Titik Lokasi Verifikasi:</span>
                      <span className="text-slate-700 ml-1">
                        Lat: -7.250445, Long: 112.768845 (Surabaya, Jawa Timur) &bull; Akurasi: &plusmn; 4 meter
                      </span>
                    </div>
                  </div>
                  <span className="text-[8pt] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    GPS Terverifikasi
                  </span>
                </div>
              )}

              {/* Disclaimer / Catatan Verifikator */}
              {config.catatanPetugas && (
                <div className="mb-6 p-2.5 rounded border border-slate-200 bg-white text-[8.5pt] text-slate-700 italic">
                  &ldquo;{config.catatanPetugas}&rdquo;
                </div>
              )}

              {/* Two Column Signatures */}
              <div className="grid grid-cols-2 gap-8 text-center mt-6">
                {/* Petugas Surveyor Column */}
                <div className="flex flex-col items-center">
                  <p className="text-[9.5pt] text-slate-800">Mengetahui / Memverifikasi,</p>
                  <p className="text-[10pt] font-bold text-slate-900">Petugas Surveyor Lapangan</p>

                  <div className="my-2 w-48 h-24 border border-dashed border-slate-300 rounded bg-slate-50/50 flex flex-col items-center justify-center p-1 relative">
                    <div className="flex items-center gap-1 text-[9pt] font-bold text-emerald-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>TERVERIFIKASI DIGITAL</span>
                    </div>
                    <span className="text-[7.5pt] text-slate-500 font-mono mt-0.5">
                      HASH: {submission.uuid.substring(0, 16)}
                    </span>
                    <span className="text-[7.5pt] text-slate-400 mt-0.5">{verifiedDate}</span>
                  </div>

                  <p className="text-[10pt] font-bold text-slate-900 underline mt-1">{surveyorName}</p>
                  <p className="text-[8.5pt] text-slate-600">Tim Penjaminan Mutu SMK</p>
                </div>

                {/* Responden Satdik Column */}
                <div className="flex flex-col items-center">
                  <p className="text-[9.5pt] text-slate-800">Satuan Pendidikan Terkait,</p>
                  <p className="text-[10pt] font-bold text-slate-900">Responden Satuan Pendidikan</p>

                  <div className="my-2 w-48 h-24 border border-dashed border-slate-300 rounded bg-slate-50/50 flex flex-col items-center justify-center p-1 relative">
                    {(() => {
                      const sigUrl = Array.isArray(submission.tanda_tangan_responden)
                        ? submission.tanda_tangan_responden[0]?.tanda_tangan
                        : typeof submission.tanda_tangan_responden === 'string'
                        ? submission.tanda_tangan_responden
                        : null;
                      if (sigUrl) {
                        return (
                          <img
                            src={sigUrl}
                            alt="Tanda Tangan Responden"
                            className="w-full h-full object-contain"
                          />
                        );
                      }
                      return (
                        <>
                          <div className="flex items-center gap-1 text-[9pt] font-bold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>TERVERIFIKASI SISTEM</span>
                          </div>
                          <span className="text-[7.5pt] text-slate-500 font-mono mt-0.5">NPSN: {npsn}</span>
                          <span className="text-[7.5pt] text-slate-400 mt-0.5">{verifiedDate}</span>
                        </>
                      );
                    })()}
                  </div>

                  <p className="text-[10pt] font-bold text-slate-900 underline mt-1">{namaResponden}</p>
                  <p className="text-[8.5pt] text-slate-600">Perwakilan {namaInstansi}</p>
                </div>
              </div>

              {/* Document Legal Footer / Timestamp */}
              <div className="mt-10 pt-3 border-t border-slate-300 flex items-center justify-between text-[7.5pt] text-slate-500 font-sans">
                <div>
                  Dicetak secara otomatis melalui Sistem Kuesioner Digital Direktorat SMK pada{' '}
                  {new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                </div>
                <div className="font-mono">ID: {submission.uuid}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global CSS for seamless direct printing */}
      <style jsx global>{`
        @media print {
          /* Hide everything in page body */
          body * {
            visibility: hidden;
          }
          /* Show only the official print document and all its children */
          #official-print-document,
          #official-print-document * {
            visibility: visible;
          }
          #official-print-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .break-after-avoid {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
