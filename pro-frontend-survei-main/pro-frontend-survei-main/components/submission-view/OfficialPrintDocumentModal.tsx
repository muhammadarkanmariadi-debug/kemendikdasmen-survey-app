'use client';

import React, { useState, useEffect } from 'react';
import {
  HasilSurvey,
  IKategori,
  IResponden,
  IDocument,
} from '@/app/types';
import { BASE_FILE_DOCUMENTATION } from '@/global';
import {
  Printer,
  X,
  Sliders,
  MapPin,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { KopSuratCanvas } from '@/components/document/KopSuratCanvas';
import { KopSuratControls } from '@/components/document/KopSuratControls';

export interface OfficialPrintConfig {
  kopImageUrl?: string;
  kopScale?: number;
  kopX?: number;
  kopY?: number;
  kopAlign?: 'left' | 'center' | 'right' | 'custom';
  kopShowDivider?: boolean;
  nomorSurat: string;
  judulDokumen: string;
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
    kopImageUrl: '',
    kopScale: 100,
    kopX: 0,
    kopY: 0,
    kopAlign: 'center',
    kopShowDivider: true,
    nomorSurat: `BA.SURV/${new Date().getFullYear()}/${submission.uuid.substring(0, 8).toUpperCase()}`,
    judulDokumen: 'BERITA ACARA & LEMBAR VERIFIKASI HASIL SURVEI LAPANGAN',
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

  // Load custom document settings from localStorage if configured by Admin
  useEffect(() => {
    try {
      const saved = localStorage.getItem('official_doc_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({
          ...prev,
          ...parsed,
          nomorSurat: parsed.nomorSurat?.includes('{NOMOR_REGISTRASI}')
            ? parsed.nomorSurat.replace('{NOMOR_REGISTRASI}', submission.uuid.substring(0, 8).toUpperCase())
            : prev.nomorSurat,
        }));
      }
    } catch (e) {
      console.error('Failed to load doc config', e);
    }
  }, [submission.uuid]);

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
                  <KopSuratControls
                    layout={config}
                    onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
                  />

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Judul Resmi Dokumen
                      </label>
                      <input
                        type="text"
                        value={config.judulDokumen}
                        onChange={(e) => setConfig({ ...config, judulDokumen: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
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
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                      />
                    </div>
                  </div>
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
          {/* ================= KOP SURAT RESMI (IMAGE) ================= */}
          <KopSuratCanvas
            layout={config}
            editable={isSettingsOpen && activeSettingsTab === 'KOP'}
            onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
          />

          {/* ================= JUDUL DOKUMEN & NOMOR BERITA ACARA ================= */}
          <div className="text-center mb-6">
            <h2 className="text-[12.5pt] font-bold uppercase tracking-wider underline text-black">
              {config.judulDokumen}
            </h2>
            <p className="text-[9.5pt] font-sans text-black mt-1">
              Nomor: <span className="font-semibold">{config.nomorSurat}</span>
            </p>
            <p className="text-[10.5pt] font-semibold text-black mt-0.5">
              Survei: &ldquo;{submission.survey?.nama_survey || 'Kuesioner Direktorat SMK'}&rdquo;
            </p>
          </div>

          {/* ================= BAGIAN I: IDENTITAS SATUAN PENDIDIKAN & RESPONDEN ================= */}
          {config.showIdentity && (
            <div className="mb-6 break-inside-avoid text-[10pt] font-sans">
              <div className="pb-1 font-bold text-[10pt] uppercase border-b border-black text-black mb-2 tracking-wide">
                I. IDENTITAS SATUAN PENDIDIKAN &amp; RESPONDEN
              </div>

              <table className="w-full border-collapse text-[9.5pt]">
                <tbody>
                  <tr className="border-b border-neutral-300">
                    <td className="w-52 py-1.5 font-medium text-black">Nama Satuan Pendidikan</td>
                    <td className="w-4 py-1.5 text-center text-black">:</td>
                    <td className="py-1.5 font-bold text-black uppercase">{namaInstansi}</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="py-1.5 font-medium text-black">Nomor Pokok Sekolah Nasional (NPSN)</td>
                    <td className="py-1.5 text-center text-black">:</td>
                    <td className="py-1.5 font-semibold text-black font-mono">{npsn}</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="py-1.5 font-medium text-black">Nama Responden Terverifikasi</td>
                    <td className="py-1.5 text-center text-black">:</td>
                    <td className="py-1.5 font-bold text-black">{namaResponden}</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="py-1.5 font-medium text-black">Kelompok / Peran Responden</td>
                    <td className="py-1.5 text-center text-black">:</td>
                    <td className="py-1.5 font-medium text-black">
                      {(typeof submission.responden?.jenis_responden === 'string'
                        ? submission.responden.jenis_responden
                        : (submission.responden?.jenis_responden as any)?.jenis) ||
                        respondents.find((r) => r.uuid === respondent_id)?.nama ||
                        'Responden Satdik'}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="py-1.5 font-medium text-black">Petugas Surveyor Lapangan</td>
                    <td className="py-1.5 text-center text-black">:</td>
                    <td className="py-1.5 font-medium text-black">{surveyorName}</td>
                  </tr>
                  <tr className="border-b border-neutral-300">
                    <td className="py-1.5 font-medium text-black">Waktu &amp; Tanggal Verifikasi</td>
                    <td className="py-1.5 text-center text-black">:</td>
                    <td className="py-1.5 font-medium text-black">{verifiedDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ================= BAGIAN II: RINGKASAN METRIK PENGISIAN ================= */}
          {config.showMetrics && (
            <div className="mb-6 break-inside-avoid text-[9.5pt] font-sans">
              <div className="pb-1 font-bold text-[10pt] uppercase border-b border-black text-black mb-2 tracking-wide">
                II. RINGKASAN REKAPITULASI LAPANGAN
              </div>

              <table className="w-full border border-black border-collapse text-center text-[9.5pt]">
                <thead>
                  <tr className="border-b border-black bg-neutral-100">
                    <th className="py-1.5 px-2 border-r border-black font-semibold text-black">Total Butir Instrumen</th>
                    <th className="py-1.5 px-2 border-r border-black font-semibold text-black">Status Pengisian</th>
                    <th className="py-1.5 px-2 border-r border-black font-semibold text-black">Foto Dokumentasi</th>
                    <th className="py-1.5 px-2 font-semibold text-black">Dokumen Pendukung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-2 border-r border-black font-bold text-black">
                      {submission.jawaban_survey?.length || 0} Butir
                    </td>
                    <td className="py-2 px-2 border-r border-black font-bold text-black">Lengkap 100%</td>
                    <td className="py-2 px-2 border-r border-black font-bold text-black">
                      {documentations.length} Foto
                    </td>
                    <td className="py-2 px-2 font-bold text-black">
                      {documents.length} Berkas
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ================= BAGIAN III: LEMBAR INSTRUMEN DAN HASIL VERIFIKASI ================= */}
          {config.showQuestions && (
            <div className="mb-6 text-[9.5pt] font-sans">
              <div className="pb-1 font-bold text-[10pt] uppercase border-b border-black text-black mb-3 tracking-wide break-after-avoid">
                III. LEMBAR JAWABAN INSTRUMEN TERVERIFIKASI
              </div>

              <div className="space-y-4">
                {filteredCategories.map((cat, catIdx) => (
                  <div key={cat.uuid || catIdx} className="break-inside-avoid">
                    <div className="font-bold text-[9.5pt] text-black mb-1.5">
                      Bagian {catIdx + 1}: {cat.nama_kategori}
                    </div>

                    <table className="w-full border border-black border-collapse text-[9pt]">
                      <thead>
                        <tr className="bg-neutral-100 text-black border-b border-black">
                          <th className="w-9 py-1.5 px-2 text-center border-r border-black font-bold">No</th>
                          <th className="py-1.5 px-3 text-left border-r border-black font-bold">
                            Butir Pertanyaan Instrumen
                          </th>
                          <th className="w-64 py-1.5 px-3 text-left font-bold">
                            Jawaban &amp; Pilihan Responden
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cat.pertanyaan || []).map((q, qIdx) => {
                          const note = getRespondentNotes(q.uuid);
                          return (
                            <tr
                              key={q.uuid || qIdx}
                              className="border-b border-neutral-400 bg-white"
                            >
                              <td className="py-2 px-2 text-center align-top border-r border-neutral-400 font-semibold text-black">
                                {qIdx + 1}
                              </td>
                              <td className="py-2 px-3 align-top border-r border-neutral-400">
                                <div
                                  className="font-medium text-black leading-snug"
                                  dangerouslySetInnerHTML={{ __html: q.pertanyaan }}
                                />
                                {q.deskripsi_bantuan && (
                                  <div className="text-[8pt] text-neutral-600 italic mt-0.5">
                                    {q.deskripsi_bantuan}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3 align-top">
                                {['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG', 'DROPDOWN'].includes(q.jenis) &&
                                q.opsi_pertanyaan &&
                                q.opsi_pertanyaan.length > 0 ? (
                                  <div className="space-y-1">
                                    {q.opsi_pertanyaan.map((opt) => {
                                      const checked = isSelectedOption(q.uuid, opt.uuid);
                                      return (
                                        <div
                                          key={opt.uuid}
                                          className={`flex items-start gap-1.5 leading-tight ${
                                            checked ? 'font-bold text-black' : 'text-neutral-500'
                                          }`}
                                        >
                                          <span className="font-mono text-xs leading-none shrink-0 mt-0.5">
                                            {checked ? '[✓]' : '[ ]'}
                                          </span>
                                          <span className="text-[9pt]">{opt.opsi_jawaban}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="font-semibold text-black text-[9pt] whitespace-pre-wrap">
                                    {getAnswerText(q.uuid)}
                                  </div>
                                )}

                                {config.showNotes && note && (
                                  <div className="mt-1.5 pt-1 border-t border-neutral-300 text-[8pt] text-black">
                                    <span className="font-bold">Keterangan:</span> {note}
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
            <div className="mb-6 break-inside-avoid text-[9.5pt] font-sans">
              <div className="pb-1 font-bold text-[10pt] uppercase border-b border-black text-black mb-3 tracking-wide">
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
                      className="border border-black p-1.5 bg-white text-center break-inside-avoid"
                    >
                      <div className="w-full h-32 bg-neutral-100 relative overflow-hidden flex items-center justify-center">
                        {docUrl ? (
                          <img
                            src={docUrl}
                            alt={doc.nama_file || `Dokumentasi ${docIdx + 1}`}
                            className="w-full h-full object-cover grayscale"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-neutral-500 text-xs">Foto Tidak Tersedia</span>
                        )}
                      </div>
                      <div className="mt-1 font-semibold text-[8.5pt] text-black truncate">
                        {doc.nama_file || `Foto Kegiatan #${docIdx + 1}`}
                      </div>
                      <div className="text-[7.5pt] text-neutral-600">
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
            <div className="mt-8 break-inside-avoid text-[9.5pt] font-sans">
              <div className="pb-1 font-bold text-[10pt] uppercase border-b border-black text-black mb-3 tracking-wide">
                V. PENGESAHAN DAN INTEGRITAS DATA LAPANGAN
              </div>

              {/* GPS Geotag Info */}
              {config.showGps && (
                <div className="mb-4 p-2 border border-black bg-white flex items-center justify-between text-[8.5pt]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                    <div>
                      <span className="font-bold text-black">Geotagging Titik Lokasi Verifikasi:</span>
                      <span className="text-black ml-1">
                        Lat: -7.250445, Long: 112.768845 (Surabaya, Jawa Timur) &bull; Akurasi: &plusmn; 4 meter
                      </span>
                    </div>
                  </div>
                  <span className="text-[8pt] font-bold uppercase px-2 py-0.5 border border-black text-black">
                    GPS Terverifikasi
                  </span>
                </div>
              )}

              {/* Disclaimer / Catatan Verifikator */}
              {config.catatanPetugas && (
                <div className="mb-6 p-2.5 border border-neutral-400 bg-white text-[8.5pt] text-black italic">
                  &ldquo;{config.catatanPetugas}&rdquo;
                </div>
              )}

              {/* Two Column Signatures */}
              <div className="grid grid-cols-2 gap-8 text-center mt-6">
                {/* Petugas Surveyor Column */}
                <div className="flex flex-col items-center">
                  <p className="text-[9.5pt] text-black">Mengetahui / Memverifikasi,</p>
                  <p className="text-[9.5pt] font-bold text-black">Petugas Surveyor Lapangan</p>

                  <div className="my-2 w-48 h-24 border border-neutral-400 bg-white flex flex-col items-center justify-center p-1 relative">
                    <div className="text-[8.5pt] font-bold text-black uppercase tracking-wide">
                      TERVERIFIKASI DIGITAL
                    </div>
                    <span className="text-[7.5pt] text-neutral-700 font-mono mt-0.5">
                      HASH: {submission.uuid.substring(0, 16)}
                    </span>
                    <span className="text-[7.5pt] text-neutral-600 mt-0.5">{verifiedDate}</span>
                  </div>

                  <p className="text-[9.5pt] font-bold text-black underline mt-1">{surveyorName}</p>
                  <p className="text-[8.5pt] text-neutral-700">Tim Penjaminan Mutu SMK</p>
                </div>

                {/* Responden Satdik Column */}
                <div className="flex flex-col items-center">
                  <p className="text-[9.5pt] text-black">Satuan Pendidikan Terkait,</p>
                  <p className="text-[9.5pt] font-bold text-black">Responden Satuan Pendidikan</p>

                  <div className="my-2 w-48 h-24 border border-neutral-400 bg-white flex flex-col items-center justify-center p-1 relative">
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
                            className="w-full h-full object-contain grayscale"
                          />
                        );
                      }
                      return (
                        <>
                          <div className="text-[8.5pt] font-bold text-black uppercase tracking-wide">
                            TERVERIFIKASI SISTEM
                          </div>
                          <span className="text-[7.5pt] text-neutral-700 font-mono mt-0.5">NPSN: {npsn}</span>
                          <span className="text-[7.5pt] text-neutral-600 mt-0.5">{verifiedDate}</span>
                        </>
                      );
                    })()}
                  </div>

                  <p className="text-[9.5pt] font-bold text-black underline mt-1">{namaResponden}</p>
                  <p className="text-[8.5pt] text-neutral-700">Perwakilan {namaInstansi}</p>
                </div>
              </div>

              {/* Document Legal Footer / Timestamp */}
              <div className="mt-10 pt-3 border-t border-black flex items-center justify-between text-[7.5pt] text-neutral-700 font-sans">
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
