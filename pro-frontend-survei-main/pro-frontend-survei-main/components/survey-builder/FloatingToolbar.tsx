'use client';

import React from 'react';
import { Plus, Layers, Eye, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface FloatingToolbarProps {
  onAddQuestion: () => void;
  onAddSection: () => void;
  onPreview: () => void;
  publicLink?: string;
}

export function FloatingToolbar({
  onAddQuestion,
  onAddSection,
  onPreview,
  publicLink,
}: FloatingToolbarProps) {
  const handleCopyLink = () => {
    if (!publicLink) {
      toast.info('Tautan publik belum diaktifkan.');
      return;
    }
    const fullUrl = `${window.location.origin}/form/${publicLink}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Tautan kuesioner publik berhasil disalin!');
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-auto md:top-36 md:right-8 z-40 flex flex-row md:flex-col items-center gap-2 p-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200">
      <button
        type="button"
        onClick={onAddQuestion}
        className="w-11 h-11 rounded-xl bg-primary hover:bg-[#094d84] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer group relative"
        title="Tambah Pertanyaan"
      >
        <Plus className="w-5 h-5" />
        <span className="hidden md:group-hover:block absolute right-14 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg shadow-md font-medium">
          Tambah Pertanyaan
        </span>
      </button>

      <button
        type="button"
        onClick={onAddSection}
        className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-primary flex items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer group relative"
        title="Tambah Bagian / Halaman Baru"
      >
        <Layers className="w-5 h-5" />
        <span className="hidden md:group-hover:block absolute right-14 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg shadow-md font-medium">
          Tambah Bagian Baru
        </span>
      </button>

      <div className="w-px h-6 md:w-6 md:h-px bg-slate-200 my-1" />

      <button
        type="button"
        onClick={onPreview}
        className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer group relative"
        title="Pratinjau Kuesioner"
      >
        <Eye className="w-5 h-5" />
        <span className="hidden md:group-hover:block absolute right-14 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg shadow-md font-medium">
          Pratinjau
        </span>
      </button>

      {publicLink && (
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 flex items-center justify-center transition-all border border-slate-200 active:scale-95 cursor-pointer group relative"
          title="Salin Tautan Publik"
        >
          <LinkIcon className="w-5 h-5" />
          <span className="hidden md:group-hover:block absolute right-14 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg shadow-md font-medium">
            Salin Link Publik
          </span>
        </button>
      )}
    </div>
  );
}

