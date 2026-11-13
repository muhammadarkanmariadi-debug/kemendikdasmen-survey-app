'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Printer, Save, RotateCcw, MapPin } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { OfficialPrintConfig } from '@/components/submission-view/OfficialPrintDocumentModal';
import { KopSuratCanvas } from '@/components/document/KopSuratCanvas';
import { KopSuratControls } from '@/components/document/KopSuratControls';

const DEFAULT_CONFIG: OfficialPrintConfig = {
  kopImageUrl: '',
  kopScale: 100,
  kopX: 0,
  kopY: 0,
  kopAlign: 'center',
  kopShowDivider: true,
  nomorSurat: 'BA.SURV/2026/{NOMOR_REGISTRASI}',
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
};

export default function PengaturanDokumenPage() {
  const [config, setConfig] = useState<OfficialPrintConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'KOP' | 'SUSUNAN'>('KOP');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error('Gagal menyimpan konfigurasi (ukuran gambar mungkin terlalu besar untuk browser).', {
        containerId: 'toastDocConfig',
        hideProgressBar: true,
      });
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('official_doc_config');
    toast.info('Konfigurasi dikembalikan ke format standar.', {
      containerId: 'toastDocConfig',
      hideProgressBar: true,
    });
  };

  const handlePrintTest = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      <ToastContainer containerId="toastDocConfig" autoClose={3000} />

      {/* Page Header (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Administrasi &amp; Pelaporan
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Pengaturan Kop Surat &amp; Format Berkas Resmi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah gambar kop surat, atur skala &amp; posisinya langsung di pratinjau A4 seperti Microsoft Word, dan atur susunan berkas hitam-putih resmi.
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
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
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
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'KOP'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              1. Kop Surat (Gambar)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SUSUNAN')}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'SUSUNAN'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              2. Susunan Komponen Berkas
            </button>
          </div>

          {activeTab === 'KOP' ? (
            <div className="space-y-4 text-xs">
              <KopSuratControls
                layout={config}
                fileInputRef={fileInputRef}
                onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
                onError={(msg) =>
                  toast.error(msg, { containerId: 'toastDocConfig', hideProgressBar: true })
                }
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-200 focus:border-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Template Nomor Berita Acara
                  </label>
                  <input
                    type="text"
                    value={config.nomorSurat}
                    onChange={(e) => setConfig({ ...config, nomorSurat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-200 focus:border-slate-900 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gunakan {'{NOMOR_REGISTRASI}'} untuk kode ID pengisian otomatis.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-slate-500 mb-2">
                Pilih bagian berkas yang akan ditampilkan secara baku pada berkas PDF hasil verifikasi:
              </p>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">I. Identitas Satdik &amp; Responden</span>
                  <span className="text-[10px] text-slate-500">Nama Sekolah, NPSN, Nama Responden, Petugas</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showIdentity}
                  onChange={(e) => setConfig({ ...config, showIdentity: e.target.checked })}
                  className="rounded accent-slate-900 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">II. Ringkasan Rekapitulasi Lapangan</span>
                  <span className="text-[10px] text-slate-500">Tabel ringkasan jumlah butir terjawab &amp; dokumen terlampir</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showMetrics}
                  onChange={(e) => setConfig({ ...config, showMetrics: e.target.checked })}
                  className="rounded accent-slate-900 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">III. Lembar Jawaban Instrumen</span>
                  <span className="text-[10px] text-slate-500">Tabel butir pertanyaan dan jawaban dengan simbol [✓]</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showQuestions}
                  onChange={(e) => setConfig({ ...config, showQuestions: e.target.checked })}
                  className="rounded accent-slate-900 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">Catatan &amp; Keterangan Responden</span>
                  <span className="text-[10px] text-slate-500">Keterangan tambahan responden di bawah jawaban</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showNotes}
                  onChange={(e) => setConfig({ ...config, showNotes: e.target.checked })}
                  className="rounded accent-slate-900 w-4 h-4"
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
                  className="rounded accent-slate-900 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <span className="font-bold text-slate-800 block">V. Pengesahan &amp; Tanda Tangan Digital</span>
                  <span className="text-[10px] text-slate-500">Tanda tangan digital responden &amp; surveyor lapangan</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showSignatures}
                  onChange={(e) => setConfig({ ...config, showSignatures: e.target.checked })}
                  className="rounded accent-slate-900 w-4 h-4"
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
                  className="rounded accent-slate-900 w-4 h-4"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-200 focus:border-slate-900 outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Default</span>
            </button>
          </div>
        </div>

        {/* Right Live Real-time A4 Sheet Preview (Clean Minimalist Black & White) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="official-print-document"
            className="w-full max-w-[210mm] bg-white text-black shadow-xl p-8 sm:p-10 font-serif text-[11pt] border border-neutral-300 print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none"
          >
            {/* Interactive MS Word-style Kop Surat Image */}
            <KopSuratCanvas
              layout={config}
              editable={true}
              onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
              onUploadClick={() => fileInputRef.current?.click()}
            />

            {/* Judul Berkas */}
            <div className="text-center mb-5">
              <h2 className="text-[12pt] font-bold uppercase tracking-wider underline text-black">
                {config.judulDokumen}
              </h2>
              <p className="text-[9.5pt] font-sans text-black mt-1">
                Nomor: <span className="font-semibold">{config.nomorSurat.replace('{NOMOR_REGISTRASI}', '0482-REG/2026')}</span>
              </p>
              <p className="text-[10pt] font-semibold text-black mt-0.5">
                Survei: &ldquo;Evaluasi Mutu &amp; Kesiapan SMK Pusat Keunggulan (SMK PK) 2026&rdquo;
              </p>
            </div>

            {/* I. Identitas Satdik & Responden */}
            {config.showIdentity && (
              <div className="mb-5 text-[9.5pt] font-sans">
                <div className="pb-1 font-bold text-[9.5pt] uppercase border-b border-black text-black mb-2 tracking-wide">
                  I. IDENTITAS SATUAN PENDIDIKAN &amp; RESPONDEN
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-neutral-300">
                      <td className="w-44 py-1 font-medium text-black">Satuan Pendidikan (SMK)</td>
                      <td className="w-3 py-1 text-center text-black">:</td>
                      <td className="py-1 font-bold text-black uppercase">SMK NEGERI 1 SURABAYA</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="py-1 font-medium text-black">NPSN</td>
                      <td className="py-1 text-center text-black">:</td>
                      <td className="py-1 font-semibold text-black font-mono">20532219</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="py-1 font-medium text-black">Nama Responden</td>
                      <td className="py-1 text-center text-black">:</td>
                      <td className="py-1 font-bold text-black">Drs. Bambang Sudarsono, M.T. (Kepala Sekolah)</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="py-1 font-medium text-black">Petugas Surveyor</td>
                      <td className="py-1 text-center text-black">:</td>
                      <td className="py-1 font-medium text-black">Dra. Siti Aminah, M.Pd. (Tim Monev)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* II. Ringkasan */}
            {config.showMetrics && (
              <div className="mb-5 text-[9pt] font-sans">
                <div className="pb-1 font-bold text-[9.5pt] uppercase border-b border-black text-black mb-2 tracking-wide">
                  II. RINGKASAN REKAPITULASI
                </div>
                <table className="w-full border border-black border-collapse text-center text-[9pt]">
                  <thead>
                    <tr className="border-b border-black bg-neutral-100">
                      <th className="py-1 px-2 border-r border-black font-semibold text-black">Total Butir</th>
                      <th className="py-1 px-2 border-r border-black font-semibold text-black">Status Pengisian</th>
                      <th className="py-1 px-2 border-r border-black font-semibold text-black">Foto Dokumentasi</th>
                      <th className="py-1 px-2 font-semibold text-black">Dokumen Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1.5 px-2 border-r border-black font-bold text-black">16 Butir</td>
                      <td className="py-1.5 px-2 border-r border-black font-bold text-black">Lengkap 100%</td>
                      <td className="py-1.5 px-2 border-r border-black font-bold text-black">3 Foto</td>
                      <td className="py-1.5 px-2 font-bold text-black">2 Berkas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* III. Contoh Butir */}
            {config.showQuestions && (
              <div className="mb-5 text-[9pt] font-sans">
                <div className="pb-1 font-bold text-[9.5pt] uppercase border-b border-black text-black mb-2 tracking-wide">
                  III. CONTOH LEMBAR BUTIR INSTRUMEN
                </div>
                <table className="w-full border border-black border-collapse text-[8.5pt]">
                  <thead>
                    <tr className="bg-neutral-100 text-black border-b border-black">
                      <th className="w-8 py-1 px-1 text-center border-r border-black font-bold">No</th>
                      <th className="py-1 px-2 text-left border-r border-black font-bold">Butir Pertanyaan</th>
                      <th className="w-48 py-1 px-2 text-left font-bold">Jawaban Terverifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-400 bg-white">
                      <td className="py-1.5 px-1 text-center align-top border-r border-neutral-400 font-semibold text-black">1</td>
                      <td className="py-1.5 px-2 align-top border-r border-neutral-400 text-black">
                        Berapa banyak industri mitra berskala nasional/internasional yang telah menandatangani MoU aktif?
                      </td>
                      <td className="py-1.5 px-2 align-top">
                        <div className="space-y-0.5">
                          <div className="font-bold text-black">[✓] Lebih dari 15 Industri</div>
                          <div className="text-neutral-500">[ ] 5 - 15 Industri</div>
                          <div className="text-neutral-500">[ ] Kurang dari 5 Industri</div>
                        </div>
                        {config.showNotes && (
                          <div className="mt-1 pt-1 border-t border-neutral-300 text-[7.5pt] text-black">
                            <strong>Keterangan:</strong> Termasuk MoU bersama PT Telekomunikasi Indonesia &amp; Astra Motor.
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
                  <div className="mb-3 p-2 border border-black bg-white flex items-center justify-between text-[8pt] text-black">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-black" />
                      <span>Geotagging: Lat -7.250445, Long 112.768845 (Surabaya, Jawa Timur) &bull; Akurasi &plusmn; 4m</span>
                    </div>
                    <span className="font-bold uppercase border border-black px-1.5 py-0.5 text-black">
                      GPS Valid
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center mt-4 text-black">
                  <div>
                    <p className="text-[8.5pt]">Mengetahui,</p>
                    <p className="font-bold text-[9pt]">Petugas Surveyor Lapangan</p>
                    <div className="my-2 h-16 border border-neutral-400 flex flex-col items-center justify-center p-1 bg-white">
                      <span className="text-[8pt] font-bold text-black uppercase">TERVERIFIKASI DIGITAL</span>
                      <span className="text-[7pt] text-neutral-600 font-mono">HASH: 005DEF38-5FAD-4218</span>
                    </div>
                    <p className="font-bold underline text-[9pt]">Dra. Siti Aminah, M.Pd.</p>
                  </div>

                  <div>
                    <p className="text-[8.5pt]">Satuan Pendidikan Terkait,</p>
                    <p className="font-bold text-[9pt]">Kepala Sekolah</p>
                    <div className="my-2 h-16 border border-neutral-400 flex flex-col items-center justify-center p-1 bg-white">
                      <span className="text-[8pt] font-bold text-black uppercase">TERVERIFIKASI DIGITAL</span>
                      <span className="text-[7pt] text-neutral-600 font-mono">NPSN: 20532219</span>
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
