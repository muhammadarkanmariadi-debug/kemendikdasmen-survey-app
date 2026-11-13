'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ISurvei } from '@/app/types';
import {
  ShieldCheck,
  Image as ImageIcon,
  Check,
  Palette,
  Upload,
  Link as LinkIcon,
  Trash2,
  X,
  Pipette,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface HeaderCardProps {
  survey: ISurvei;
  onUpdateHeader: (data: {
    nama_survey: string;
    deskripsi?: string;
    status?: boolean;
    cover_image?: string;
    theme_color?: string;
  }) => void;
  isSaving?: boolean;
}

const PRESET_COLORS = [
  { name: 'Kemendikbud Bahari', hex: '#0B5C9E' },
  { name: 'Deep Navy', hex: '#0F172A' },
  { name: 'Emerald Vokasi', hex: '#059669' },
  { name: 'Indigo Modern', hex: '#4F46E5' },
  { name: 'Royal Purple', hex: '#7C3AED' },
  { name: 'Sunset Amber', hex: '#D97706' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Teal Bahari', hex: '#0D9488' },
];

const PRESET_BANNERS = [
  {
    id: 'vokasi',
    name: 'SMK Pusat Keunggulan',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'digital',
    name: 'IoT & Digitalisasi Vokasi',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'campus',
    name: 'Satuan Pendidikan SMK',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  },
];

export function GoogleFormsHeaderCard({ survey, onUpdateHeader, isSaving }: HeaderCardProps) {
  const [namaSurvey, setNamaSurvey] = useState(survey.nama_survey);
  const [deskripsi, setDeskripsi] = useState(survey.deskripsi || '');
  const [status, setStatus] = useState(survey.status);

  // Theme states
  const [themeColor, setThemeColor] = useState<string>('#0B5C9E');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved theme on mount
  useEffect(() => {
    setNamaSurvey(survey.nama_survey);
    setDeskripsi(survey.deskripsi || '');
    setStatus(survey.status);

    try {
      const savedThemeStr = localStorage.getItem(`survey_theme_${survey.uuid}`);
      if (savedThemeStr) {
        const parsed = JSON.parse(savedThemeStr);
        if (parsed.theme_color) setThemeColor(parsed.theme_color);
        if (parsed.cover_image) setCoverImage(parsed.cover_image);
      } else if ((survey as any).cover_image) {
        setCoverImage((survey as any).cover_image);
      }
    } catch {
      // ignore
    }
  }, [survey]);

  const saveThemeToLocal = (color: string, cover: string) => {
    try {
      localStorage.setItem(
        `survey_theme_${survey.uuid}`,
        JSON.stringify({
          theme_color: color,
          cover_image: cover,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (
      namaSurvey !== survey.nama_survey ||
      deskripsi !== (survey.deskripsi || '') ||
      status !== survey.status
    ) {
      onUpdateHeader({
        nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
        deskripsi: deskripsi.trim(),
        status,
        cover_image: coverImage,
        theme_color: themeColor,
      });
    }
  };

  const handleToggleStatus = (newStatus: boolean) => {
    setStatus(newStatus);
    onUpdateHeader({
      nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
      deskripsi: deskripsi.trim(),
      status: newStatus,
      cover_image: coverImage,
      theme_color: themeColor,
    });
  };

  const handleChangeThemeColor = (color: string) => {
    setThemeColor(color);
    saveThemeToLocal(color, coverImage);
    onUpdateHeader({
      nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
      deskripsi: deskripsi.trim(),
      status,
      cover_image: coverImage,
      theme_color: color,
    });
  };

  const handleSelectCover = (url: string) => {
    setCoverImage(url);
    saveThemeToLocal(themeColor, url);
    onUpdateHeader({
      nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
      deskripsi: deskripsi.trim(),
      status,
      cover_image: url,
      theme_color: themeColor,
    });
    toast.success('Cover instrumen kuesioner berhasil diperbarui');
  };

  const handleRemoveCover = () => {
    setCoverImage('');
    saveThemeToLocal(themeColor, '');
    onUpdateHeader({
      nama_survey: namaSurvey.trim() || 'Kuesioner Tanpa Judul',
      deskripsi: deskripsi.trim(),
      status,
      cover_image: '',
      theme_color: themeColor,
    });
    toast.info('Cover instrumen dihapus. Menggunakan aksen warna tema.');
  };

  // Upload Cover from local computer
  const handleUploadCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Specific file size check (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(
        `Ukuran file cover terlalu besar (${actualSizeMB} MB). Maksimal ukuran file cover adalah 5 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Format file tidak didukung. Harap pilih gambar (JPEG, PNG, WebP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleSelectCover(base64);
    };
    reader.onerror = () => {
      toast.error('Gagal membaca file gambar lokal.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    if (!customUrlInput.startsWith('http://') && !customUrlInput.startsWith('https://')) {
      toast.error('Tautan harus diawali dengan http:// atau https://');
      return;
    }
    handleSelectCover(customUrlInput.trim());
    setCustomUrlInput('');
  };

  return (
    <div
      onClick={() => setIsFocused(true)}
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden mb-6 transition-all duration-200 relative ${
        isFocused
          ? 'ring-2 ring-blue-100/60 shadow-md border-slate-300'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      style={{
        borderTopWidth: coverImage ? '4px' : '10px',
        borderTopColor: themeColor,
      }}
    >
      {/* Cover Banner Area */}
      <div className="relative group">
        {coverImage ? (
          <div
            className="w-full h-40 md:h-52 bg-cover bg-center transition-all relative"
            style={{ backgroundImage: `url(${coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
            <div className="absolute bottom-3 left-4 text-white/90 text-xs font-medium drop-shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <span>Tema: {themeColor}</span>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-4 transition-all"
            style={{ backgroundColor: themeColor }}
          />
        )}

        {/* Action Button: Customize Theme & Cover */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsThemePickerOpen(!isThemePickerOpen);
            }}
            className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-white shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Palette className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>Kustomisasi Tema & Cover</span>
          </button>
        </div>

        {/* Theme & Cover Popover Drawer */}
        {isThemePickerOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-3 z-30 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengaturan Tema & Cover
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsThemePickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Color Wheel Picker & Presets */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Warna Tema Kuesioner</span>
                <span className="font-mono text-[11px] text-slate-500 font-semibold uppercase">
                  {themeColor}
                </span>
              </label>

              {/* Native Color Wheel Picker + Hex Input */}
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="relative flex items-center justify-center">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => handleChangeThemeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shadow-xs"
                    title="Buka Color Wheel Picker"
                  />
                  <Pipette className="w-3.5 h-3.5 text-slate-700 absolute pointer-events-none drop-shadow" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => handleChangeThemeColor(e.target.value)}
                    placeholder="#0B5C9E"
                    className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0B5C9E]"
                  />
                </div>
              </div>

              {/* Preset Swatches */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => handleChangeThemeColor(col.hex)}
                    className="flex flex-col items-center gap-1 p-1 rounded-lg border border-transparent hover:border-slate-300 transition-all text-[10px] text-slate-600 font-medium"
                  >
                    <div
                      className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: col.hex }}
                    >
                      {themeColor.toLowerCase() === col.hex.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </div>
                    <span className="truncate max-w-[65px] text-center">{col.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Gambar Cover Header
              </label>

              {/* Upload Local File */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleUploadCover}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#0B5C9E] bg-blue-50/50 hover:bg-blue-50 text-[#0B5C9E] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Cover dari Komputer (Maks. 5 MB)</span>
              </button>

              {/* Paste URL */}
              <form onSubmit={handleApplyCustomUrl} className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="Atau tempel URL gambar (https://...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0B5C9E]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Gunakan
                </button>
              </form>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Contoh Cover Siap Pakai:</span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_BANNERS.map((banner) => (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => handleSelectCover(banner.url)}
                      className={`relative h-14 rounded-lg overflow-hidden border transition-all text-left group ${
                        coverImage === banner.url
                          ? 'border-2 border-[#0B5C9E] ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${banner.url})` }}
                      />
                      {coverImage === banner.url && (
                        <div className="absolute inset-0 bg-[#0B5C9E]/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remove Cover Option */}
              {coverImage && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="w-full py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Cover (Gunakan Warna Tema Saja)</span>
                </button>
              )}
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
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: themeColor }} />
              <span>Instrumen Resmi Ditjen Pendidikan Vokasi</span>
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: `${themeColor}15`,
                color: themeColor,
                borderColor: `${themeColor}30`,
              }}
            >
              Sasaran: {survey.jenis_responden}
            </span>
          </div>

          {/* Status Toggle Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status Kuesioner:</span>
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
            className="w-full text-2xl md:text-3xl font-extrabold text-slate-900 border-b-2 border-transparent hover:border-slate-200 focus:outline-none transition-all py-1 placeholder:text-slate-300 bg-transparent"
            style={{
              borderColor: isFocused ? themeColor : 'transparent',
            }}
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
            className="w-full text-sm text-slate-600 border-b border-transparent hover:border-slate-200 focus:outline-none transition-all py-1 resize-y placeholder:text-slate-400 bg-transparent leading-relaxed"
            style={{
              borderColor: isFocused ? `${themeColor}60` : 'transparent',
            }}
          />
        </div>

        {/* Autosave Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Perubahan judul dan deskripsi tersimpan otomatis saat berpindah kursor.</span>
          {isSaving && (
            <span className="font-medium flex items-center gap-1" style={{ color: themeColor }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
              Menyimpan...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
