'use client';

import React, { useState, useEffect } from 'react';
import { ISurvei } from '@/app/types';
import { ShieldCheck, Image as ImageIcon, Check, Palette, Eye, ExternalLink } from 'lucide-react';

interface HeaderCardProps {
  survey: ISurvei;
  onUpdateHeader: (data: {
    nama_survey: string;
    deskripsi?: string;
    status?: boolean;
    cover_image?: string;
  }) => void;
  isSaving?: boolean;
}

const PRESET_BANNERS = [
  {
    id: 'bahari',
    name: 'Kemendikbud Bahari (Default)',
    style: 'bg-[#0B5C9E]',
    url: '',
  },
  {
    id: 'vokasi',
    name: 'SMK Pusat Keunggulan',
    style: 'bg-slate-800',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'digital',
    name: 'IoT & Digitalisasi Vokasi',
    style: 'bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-500',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'campus',
    name: 'Satuan Pendidikan SMK',
    style: 'bg-gradient-to-r from-teal-800 via-emerald-700 to-amber-400',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  },
];

export function GoogleFormsHeaderCard({ survey, onUpdateHeader, isSaving }: HeaderCardProps) {
  const [namaSurvey, setNamaSurvey] = useState(survey.nama_survey);
  const [deskripsi, setDeskripsi] = useState(survey.deskripsi || '');
  const [status, setStatus] = useState(survey.status);
  const [selectedBanner, setSelectedBanner] = useState<string>(
    (survey as any).cover_image || ''
  );
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setNamaSurvey(survey.nama_survey);
    setDeskripsi(survey.deskripsi || '');
    setStatus(survey.status);
    setSelectedBanner((survey as any).cover_image || '');
  }, [survey]);

  const handleBlur = () => {
    setIsFocused(false);
    if (
      namaSurvey !== survey.nama_survey ||
      deskripsi !== (survey.deskripsi || '') ||
      status !== survey.status ||
      selectedBanner !== ((survey as any).cover_image || '')
    ) {
      onUpdateHeader({
        nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
        deskripsi: deskripsi.trim(),
        status,
        cover_image: selectedBanner,
      });
    }
  };

  const handleSelectBanner = (url: string) => {
    setSelectedBanner(url);
    setIsThemePickerOpen(false);
    onUpdateHeader({
      nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
      deskripsi: deskripsi.trim(),
      status,
      cover_image: url,
    });
  };

  const handleToggleStatus = (newStatus: boolean) => {
    setStatus(newStatus);
    onUpdateHeader({
      nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
      deskripsi: deskripsi.trim(),
      status: newStatus,
      cover_image: selectedBanner,
    });
  };

  return (
    <div
      onClick={() => setIsFocused(true)}
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden mb-6 transition-all duration-200 ${
        isFocused
          ? 'border-[#0B5C9E] ring-2 ring-blue-100/60 shadow-md border-t-8 border-t-[#0B5C9E]'
          : 'border-slate-200 border-t-8 border-t-[#0B5C9E] hover:border-slate-300'
      }`}
    >
      {/* Cover Banner Area */}
      <div className="relative group">
        {selectedBanner ? (
          <div
            className="w-full h-36 md:h-44 bg-cover bg-center transition-all"
            style={{ backgroundImage: `url(${selectedBanner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>
        ) : (
          <div className="w-full h-3 bg-[#0B5C9E]" />
        )}

        {/* Theme / Cover Change Button */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsThemePickerOpen(!isThemePickerOpen);
            }}
            className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Palette className="w-3.5 h-3.5 text-[#0B5C9E]" />
            <span>Kustomisasi Tema Cover</span>
          </button>
        </div>

        {/* Theme Picker Popup */}
        {isThemePickerOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-3 z-30 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">Pilih Banner Tema Form</span>
              <button
                type="button"
                onClick={() => setIsThemePickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_BANNERS.map((banner) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => handleSelectBanner(banner.url)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedBanner === banner.url
                      ? 'border-[#0B5C9E] bg-blue-50/50 font-semibold text-[#0B5C9E]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {banner.url ? (
                      <div
                        className="w-8 h-8 rounded-lg bg-cover bg-center shrink-0 border border-slate-200"
                        style={{ backgroundImage: `url(${banner.url})` }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#0B5C9E] shrink-0" />
                    )}
                    <span>{banner.name}</span>
                  </div>
                  {selectedBanner === banner.url && (
                    <Check className="w-4 h-4 text-[#0B5C9E]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Title & Description Body */}
      <div className="p-6 md:p-8 space-y-4">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B5C9E]" />
              <span>Instrumen Resmi Ditjen Vokasi</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0B5C9E] border border-blue-200">
              Sasaran: {survey.jenis_responden}
            </span>
          </div>

          {/* Status Toggle Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status Publikasi:</span>
            <button
              type="button"
              onClick={() => handleToggleStatus(!status)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                status
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>{status ? 'Aktif / Dibuka' : 'Ditutup'}</span>
            </button>
          </div>
        </div>

        {/* Editable Survey Title (Google Forms Style) */}
        <div>
          <input
            type="text"
            value={namaSurvey}
            onChange={(e) => setNamaSurvey(e.target.value)}
            onBlur={handleBlur}
            placeholder="Judul Formulir Kuesioner"
            className="w-full text-2xl md:text-3xl font-extrabold text-slate-900 border-b-2 border-transparent hover:border-slate-200 focus:border-[#0B5C9E] focus:outline-none transition-all py-1 placeholder:text-slate-300 bg-transparent"
          />
        </div>

        {/* Editable Survey Description (Google Forms Style) */}
        <div>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            onBlur={handleBlur}
            rows={2}
            placeholder="Deskripsi formulir kuesioner atau petunjuk pengisian..."
            className="w-full text-sm text-slate-600 border-b border-transparent hover:border-slate-200 focus:border-[#0B5C9E] focus:outline-none transition-all py-1 resize-y placeholder:text-slate-400 bg-transparent leading-relaxed"
          />
        </div>

        {/* Autosave Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Perubahan judul dan deskripsi tersimpan otomatis saat kursor berpindah.</span>
          {isSaving && (
            <span className="text-[#0B5C9E] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B5C9E] animate-ping" />
              Menyimpan...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

