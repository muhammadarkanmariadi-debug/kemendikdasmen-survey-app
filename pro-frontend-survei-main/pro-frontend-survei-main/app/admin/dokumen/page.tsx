'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Printer,
  Save,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  ShieldCheck,
  Eye,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { OfficialPrintConfig } from '@/components/submission-view/OfficialPrintDocumentModal';

const DEFAULT_CONFIG: OfficialPrintConfig = {
  kementerian: 'KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI',
  ditjen: 'DIREKTORAT JENDERAL PENDIDIKAN VOKASI',
  direktorat: 'DIREKTORAT SEKOLAH MENENGAH KEJURUAN',
  alamat:
    'Kompleks Kemendikbudristek Gedung E Lantai 12-13, Jalan Jenderal Sudirman, Senayan, Jakarta Pusat 10270 | Laman: smk.kemdikbud.go.id | Pos-el: survei.smk@kemdikbud.go.id',
  nomorSurat: 'BA.SURV/2026/{NOMOR_REGISTRASI}',
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
};

export default function PengaturanDokumenPage() {
  const [config, setConfig] = useState<OfficialPrintConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'KOP' | 'SUSUNAN'>('KOP');

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('official_doc_config');
      if (saved) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load doc config', e);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('official_doc_config', JSON.stringify(config));
      toast.success('Pengaturan Kop Surat & Dokumen resmi berhasil disimpan!', {
        containerId: 'toastDocConfig',
        hideProgressBar: true,
      });
    } catch (e) {
      toast.error('Gagal menyimpan konfigurasi.', {
        containerId: 'toastDocConfig',
        hideProgressBar: true,
      });
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('official_doc_config');
    toast.info('Konfigurasi dikembalikan ke standar resmi Kemendikbudristek.', {
      containerId: 'toastDocConfig',
      hideProgressBar: true,
    });
  };

  const handlePrintTest = () => {
    window.print();
  };

  const logoSrc =
    config.logoType === 'tutwuri'
      ? '/images/tut wuri handayani.jpeg'
      : '/images/logo_jenama_primer.png';

  return (
    <div className="w-full space-y-6">
      <ToastContainer containerId="toastDocConfig" autoClose={3000} />

      {/* Page Header (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            Administrasi & Pelaporan
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Pengaturan Kop Surat & Format Berkas Resmi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur susunan naskah kedinasan, kop surat kementerian, format penomoran berita acara, dan komponen cetak PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reset ke format bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={handlePrintTest}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Uji Cetak PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Format Dokumen</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Editor (Left) + Realtime A4 Paper Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Panel (print:hidden) */}
        <div className="print:hidden lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('KOP')}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${activeTab === 'KOP'
                  ? 'border-[#0B5C9E] text-[#0B5C9E]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              1. Kop Surat Kedinasan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SUSUNAN')}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${activeTab === 'SUSUNAN'
                  ? 'border-[#0B5C9E] text-[#0B5C9E]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              2. Susunan Komponen Berkas
            </button>
          </div>

          {activeTab === 'KOP' ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kementerian / Instansi Tingkat I
                </label>
                <input
                  type="text"
                  value={config.kementerian}
                  onChange={(e) => setConfig({ ...config, kementerian: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none"
                  placeholder="KEMENTERIAN PENDIDIKAN, KEBUDAYAAN..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Direktorat Jenderal / Unit Eselon I
                </label>
                <input
                  type="text"
                  value={config.ditjen}
                  onChange={(e) => setConfig({ ...config, ditjen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none"
                  placeholder="DIREKTORAT JENDERAL PENDIDIKAN VOKASI"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none"
                  placeholder="DIREKTORAT SEKOLAH MENENGAH KEJURUAN"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Alamat Lengkap & Kontak Resmi Kedinasan
                </label>
                <textarea
                  rows={3}
                  value={config.alamat}
                  onChange={(e) => setConfig({ ...config, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none leading-relaxed"
                  placeholder="Kompleks Kemendikbudristek Gedung E Lt. 12-13..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Template Nomor Surat / Berita Acara
                </label>
                <input
                  type="text"
                  value={config.nomorSurat}
                  onChange={(e) => setConfig({ ...config, nomorSurat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none font-mono"
                  placeholder="BA.SURV/2026/{NOMOR_REGISTRASI}"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tag <code>{'{NOMOR_REGISTRASI}'}</code> akan digantikan otomatis dengan kode berkas unik.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Tampilkan Logo Kop Surat</span>
                  <input
                    type="checkbox"
                    checked={config.showLogo}
                    onChange={(e) => setConfig({ ...config, showLogo: e.target.checked })}
                    className="rounded text-[#0B5C9E] focus:ring-[#0B5C9E] w-4 h-4"
                  />
                </div>

                {config.showLogo && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pilihan Lambang Resmi
                    </label>
                    <select
                      value={config.logoType}
                      onChange={(e) => setConfig({ ...config, logoType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none bg-white"
                    >
                      <option value="tutwuri">Logo Tut Wuri Handayani (Resmi Pendidikan)</option>
                      <option value="kemendikbud">Jenama Primer Kemendikbudristek</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-slate-500 mb-2">
                Pilih bagian berkas yang akan ditampilkan secara baku pada berkas PDF hasil verifikasi:
              </p>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">I. Identitas Satdik & Responden</span>
                  <span className="text-[10px] text-slate-500">Nama Sekolah, NPSN, Kabupaten/Kota, Nama Responden, Petugas</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showIdentity}
                  onChange={(e) => setConfig({ ...config, showIdentity: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">II. Ringkasan Rekapitulasi Lapangan</span>
                  <span className="text-[10px] text-slate-500">Kartu ringkasan jumlah butir terjawab & dokumen terlampir</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showMetrics}
                  onChange={(e) => setConfig({ ...config, showMetrics: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">III. Lembar Jawaban Instrumen</span>
                  <span className="text-[10px] text-slate-500">Tabel butir pertanyaan dan jawaban dengan simbol [ ✓ ]</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showQuestions}
                  onChange={(e) => setConfig({ ...config, showQuestions: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">Catatan & Masukan Responden</span>
                  <span className="text-[10px] text-slate-500">Kolom kutipan catatan khusus responden di bawah jawaban</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showNotes}
                  onChange={(e) => setConfig({ ...config, showNotes: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">IV. Foto Dokumentasi Lapangan</span>
                  <span className="text-[10px] text-slate-500">Lampiran bukti foto kegiatan wawancara dan tinjauan fisik sarpras</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showDocumentations}
                  onChange={(e) => setConfig({ ...config, showDocumentations: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">V. Pengesahan & Tanda Tangan Digital</span>
                  <span className="text-[10px] text-slate-500">Tanda tangan digital responden & surveyor lapangan</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showSignatures}
                  onChange={(e) => setConfig({ ...config, showSignatures: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">Geotagging Titik Lokasi GPS</span>
                  <span className="text-[10px] text-slate-500">Audit koordinat latitude/longitude validasi lokasi wawancara</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showGps}
                  onChange={(e) => setConfig({ ...config, showGps: e.target.checked })}
                  className="rounded text-[#0B5C9E] w-4 h-4"
                />
              </label>

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Klausul Verifikator / Disclaimer Resmi Dokumen
                </label>
                <textarea
                  rows={3}
                  value={config.catatanPetugas}
                  onChange={(e) => setConfig({ ...config, catatanPetugas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-[#0B5C9E] outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Default</span>
            </button>
          </div>
        </div>

        {/* Right Live Real-time A4 Sheet Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="official-print-document"
            className="w-full max-w-[210mm] bg-white text-black shadow-xl rounded-2xl p-8 sm:p-10 font-serif text-[11.5pt] border border-slate-300 print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none"
          >
            {/* Kop Surat */}
            <div className="border-b-[3px] border-black pb-2 mb-1 relative">
              <div className="flex items-center justify-between gap-4">
                {config.showLogo && (
                  <div className="w-20 shrink-0 flex items-center justify-center">
                    <Image
                      src={logoSrc}
                      width={80}
                      height={80}
                      alt="Logo Kedinasan"
                      className="object-contain max-h-[75px] w-auto"
                      priority
                    />
                  </div>
                )}

                <div className="flex-1 text-center font-sans tracking-wide">
                  <h3 className="text-[11pt] font-semibold text-black uppercase tracking-wider leading-tight">
                    {config.kementerian}
                  </h3>
                  <h2 className="text-[13pt] font-bold text-black uppercase tracking-wide leading-tight mt-0.5">
                    {config.ditjen}
                  </h2>
                  <h1 className="text-[15pt] font-extrabold text-black uppercase tracking-wide leading-tight mt-0.5">
                    {config.direktorat}
                  </h1>
                  <p className="text-[8pt] font-normal text-slate-800 leading-snug mt-1 font-sans">
                    {config.alamat}
                  </p>
                </div>

                {config.showLogo && (
                  <div className="w-20 shrink-0 flex items-center justify-center">
                    <Image
                      src="/images/logodirsmk.png"
                      width={75}
                      height={75}
                      alt="Logo Direktorat SMK"
                      className="object-contain max-h-[70px] w-auto"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Garis Ganda Pemisah Kop Surat */}
            <div className="border-b-[1px] border-black mb-5"></div>

            {/* Judul Berkas */}
            <div className="text-center mb-5">
              <h2 className="text-[12pt] font-bold uppercase tracking-wider underline text-black">
                {config.judulDokumen}
              </h2>
              <p className="text-[9.5pt] font-sans text-slate-800 mt-0.5">
                Nomor: <span className="font-semibold">{config.nomorSurat.replace('{NOMOR_REGISTRASI}', '0482-REG/2026')}</span>
              </p>
              <p className="text-[10pt] font-semibold text-slate-900 mt-0.5">
                Survei: &ldquo;Evaluasi Mutu & Kesiapan SMK Pusat Keunggulan (SMK PK) 2026&rdquo;
              </p>
            </div>

            {/* I. Identitas Satdik & Responden */}
            {config.showIdentity && (
              <div className="mb-5 text-[9.5pt] font-sans">
                <div className="bg-slate-100/90 px-2.5 py-1 font-bold text-[9.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-2">
                  I. IDENTITAS SATUAN PENDIDIKAN & RESPONDEN
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-44 py-1 font-semibold text-slate-700">Satuan Pendidikan (SMK)</td>
                      <td className="w-3 py-1 font-bold text-center">:</td>
                      <td className="py-1 font-bold text-slate-900 uppercase">SMK NEGERI 1 SURABAYA</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 font-semibold text-slate-700">NPSN</td>
                      <td className="py-1 font-bold text-center">:</td>
                      <td className="py-1 font-semibold text-slate-900 font-mono">20532219</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 font-semibold text-slate-700">Nama Responden</td>
                      <td className="py-1 font-bold text-center">:</td>
                      <td className="py-1 font-bold text-slate-900">Drs. Bambang Sudarsono, M.T. (Kepala Sekolah)</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">Petugas Surveyor</td>
                      <td className="py-1 font-bold text-center">:</td>
                      <td className="py-1 font-semibold text-slate-900">Dra. Siti Aminah, M.Pd. (Tim Monev)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* II. Ringkasan */}
            {config.showMetrics && (
              <div className="mb-5 text-[9pt] font-sans">
                <div className="bg-slate-100/90 px-2.5 py-1 font-bold text-[9.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-2">
                  II. RINGKASAN REKAPITULASI
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                    <div className="text-[8pt] text-slate-600 font-semibold">Total Butir</div>
                    <div className="text-[11pt] font-extrabold text-[#0B5C9E]">16 Butir</div>
                  </div>
                  <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                    <div className="text-[8pt] text-slate-600 font-semibold">Status Pengisian</div>
                    <div className="text-[11pt] font-extrabold text-emerald-700">Lengkap 100%</div>
                  </div>
                  <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                    <div className="text-[8pt] text-slate-600 font-semibold">Foto Dokumentasi</div>
                    <div className="text-[11pt] font-extrabold text-slate-900">3 Foto</div>
                  </div>
                  <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                    <div className="text-[8pt] text-slate-600 font-semibold">Dokumen Bukti</div>
                    <div className="text-[11pt] font-extrabold text-slate-900">2 Berkas</div>
                  </div>
                </div>
              </div>
            )}

            {/* III. Contoh Butir */}
            {config.showQuestions && (
              <div className="mb-5 text-[9pt] font-sans">
                <div className="bg-slate-100/90 px-2.5 py-1 font-bold text-[9.5pt] uppercase border-l-4 border-[#0B5C9E] text-slate-900 mb-2">
                  III. CONTOH LEMBAR BUTIR INSTRUMEN
                </div>
                <table className="w-full border border-slate-400 border-collapse text-[8.5pt]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-400">
                      <th className="w-8 py-1 px-1 text-center border-r border-slate-400 font-bold">No</th>
                      <th className="py-1 px-2 text-left border-r border-slate-400 font-bold">Butir Pertanyaan</th>
                      <th className="w-48 py-1 px-2 text-left font-bold">Jawaban Terverifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300 bg-white">
                      <td className="py-1.5 px-1 text-center align-top border-r border-slate-300 font-semibold">1</td>
                      <td className="py-1.5 px-2 align-top border-r border-slate-300">
                        Berapa banyak industri mitra berskala nasional/internasional yang telah menandatangani MoU aktif?
                      </td>
                      <td className="py-1.5 px-2 align-top">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#0B5C9E]">[ ✓ ] Lebih dari 15 Industri</div>
                          <div className="text-slate-400">[   ] 5 - 15 Industri</div>
                          <div className="text-slate-400">[   ] Kurang dari 5 Industri</div>
                        </div>
                        {config.showNotes && (
                          <div className="mt-1 p-1 rounded bg-amber-50 text-[7.5pt] text-amber-900 border border-amber-200">
                            <strong>Catatan:</strong> Termasuk MoU bersama PT Telekomunikasi Indonesia & Astra Motor.
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* V. Tanda Tangan */}
            {config.showSignatures && (
              <div className="mt-6 text-[9pt] font-sans break-inside-avoid">
                {config.showGps && (
                  <div className="mb-3 p-2 rounded border border-slate-300 bg-slate-50 flex items-center justify-between text-[8pt]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B5C9E]" />
                      <span>Geotagging: Lat -7.250445, Long 112.768845 (Surabaya, Jawa Timur) &bull; Akurasi &plusmn; 4m</span>
                    </div>
                    <span className="font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      GPS Valid
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center mt-4">
                  <div>
                    <p className="text-[8.5pt]">Mengetahui,</p>
                    <p className="font-bold text-[9pt]">Petugas Surveyor Lapangan</p>
                    <div className="my-2 h-16 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-1 bg-slate-50/50">
                      <span className="text-[8pt] font-bold text-emerald-700">TERVERIFIKASI DIGITAL</span>
                      <span className="text-[7pt] text-slate-400">HASH: 005DEF38-5FAD-4218</span>
                    </div>
                    <p className="font-bold underline text-[9pt]">Dra. Siti Aminah, M.Pd.</p>
                  </div>

                  <div>
                    <p className="text-[8.5pt]">Satuan Pendidikan Terkait,</p>
                    <p className="font-bold text-[9pt]">Kepala Sekolah</p>
                    <div className="my-2 h-16 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-1 bg-slate-50/50">
                      <span className="text-[8pt] font-bold text-emerald-700">TERVERIFIKASI DIGITAL</span>
                      <span className="text-[7pt] text-slate-400">NPSN: 20532219</span>
                    </div>
                    <p className="font-bold underline text-[9pt]">Drs. Bambang Sudarsono, M.T.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
