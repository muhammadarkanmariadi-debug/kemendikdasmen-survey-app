'use client';

import React from 'react';
import { Plus, Type, FolderPlus, Eye, Link2 } from 'lucide-react';

interface GoogleFormsToolbarProps {
  onAddQuestion: () => void;
  onFocusHeader: () => void;
  onAddCategory: () => void;
  onPreview: () => void;
  onCopyLink: () => void;
}

export function GoogleFormsToolbar({
  onAddQuestion,
  onFocusHeader,
  onAddCategory,
  onPreview,
  onCopyLink,
}: GoogleFormsToolbarProps) {
  return (
    <aside className="fixed right-4 md:right-8 top-1/3 z-40 flex flex-col items-center bg-white border border-slate-200/90 shadow-xl rounded-2xl p-1.5 space-y-1.5 transition-all">
      {/* Tambah Pertanyaan */}
      <button
        type="button"
        onClick={onAddQuestion}
        className="w-10 h-10 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white flex items-center justify-center transition-all shadow-sm hover:scale-105 cursor-pointer group relative"
        title="Tambahkan Pertanyaan Baru"
      >
        <Plus className="w-5 h-5" />
        <span className="absolute right-12 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md">
          Tambah Pertanyaan
        </span>
      </button>

      {/* Fokus ke Header */}
      <button
        type="button"
        onClick={onFocusHeader}
        className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#0B5C9E] flex items-center justify-center transition-all cursor-pointer group relative"
        title="Edit Judul & Deskripsi"
      >
        <Type className="w-4 h-4" />
        <span className="absolute right-12 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md">
          Edit Judul & Deskripsi
        </span>
      </button>

      {/* Tambah Bagian / Kategori */}
      <button
        type="button"
        onClick={onAddCategory}
        className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#0B5C9E] flex items-center justify-center transition-all cursor-pointer group relative"
        title="Tambahkan Bagian / Halaman Baru"
      >
        <FolderPlus className="w-4 h-4" />
        <span className="absolute right-12 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md">
          Tambah Bagian / Kategori
        </span>
      </button>

      <div className="w-6 h-px bg-slate-200 my-0.5" />

      {/* Pratinjau Kuesioner */}
      <button
        type="button"
        onClick={onPreview}
        className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-all cursor-pointer group relative"
        title="Pratinjau Kuesioner Publik"
      >
        <Eye className="w-4 h-4" />
        <span className="absolute right-12 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md">
          Pratinjau Responden
        </span>
      </button>

      {/* Salin Tautan Publik */}
      <button
        type="button"
        onClick={onCopyLink}
        className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-all cursor-pointer group relative"
        title="Salin Tautan Publik"
      >
        <Link2 className="w-4 h-4" />
        <span className="absolute right-12 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md">
          Salin Tautan Publik
        </span>
      </button>
    </aside>
  );
}

