'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IPertanyaan, IJenisResponden, IKategori } from '@/app/types';
import { 
  GripVertical, 
  Trash2, 
  Edit3, 
  GitFork, 
  CheckCircle2, 
  CircleDot, 
  CheckSquare, 
  AlignLeft, 
  FileText, 
  UploadCloud, 
  SlidersHorizontal, 
  Calendar, 
  ChevronDown 
} from 'lucide-react';

interface QuestionCardProps {
  question: IPertanyaan;
  index: number;
  isActive?: boolean;
  onSelect?: () => void;
  onEdit: (q: IPertanyaan) => void;
  onDelete: (q: IPertanyaan) => void;
  onLogic: (q: IPertanyaan) => void;
}

export function QuestionCard({
  question,
  index,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onLogic,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const getQuestionTypeLabel = (jenis: string) => {
    switch (jenis) {
      case 'PILIHAN':
      case 'PILIHAN_GANDA':
        return { label: 'Pilihan Ganda', icon: <CircleDot className="w-4 h-4 text-primary" /> };
      case 'CHECKBOX':
      case 'KOTAK_CENTANG':
        return { label: 'Kotak Centang', icon: <CheckSquare className="w-4 h-4 text-emerald-600" /> };
      case 'DROPDOWN':
        return { label: 'Dropdown', icon: <ChevronDown className="w-4 h-4 text-sky-600" /> };
      case 'ISIAN':
      case 'ISIAN_SINGKAT':
        return { label: 'Jawaban Singkat', icon: <AlignLeft className="w-4 h-4 text-amber-600" /> };
      case 'PARAGRAF':
        return { label: 'Paragraf', icon: <FileText className="w-4 h-4 text-purple-600" /> };
      case 'UPLOAD_FILE':
        return { label: 'Upload Berkas', icon: <UploadCloud className="w-4 h-4 text-blue-600" /> };
      case 'SKALA_LINEAR':
        return { label: 'Skala Linear', icon: <SlidersHorizontal className="w-4 h-4 text-teal-600" /> };
      case 'TANGGAL':
        return { label: 'Tanggal', icon: <Calendar className="w-4 h-4 text-rose-600" /> };
      default:
        return { label: jenis, icon: <CircleDot className="w-4 h-4 text-slate-600" /> };
    }
  };

  const typeInfo = getQuestionTypeLabel(question.jenis);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative bg-white rounded-2xl p-5 md:p-6 transition-all duration-200 border ${
        isActive
          ? 'border-blue-400 shadow-lg ring-2 ring-blue-100 border-l-4 border-l-primary'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Drag Handle Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Tarik untuk mengubah urutan"
        >
          <GripVertical className="w-4 h-4" />
          <span className="hidden sm:inline text-slate-400 text-[11px]">Seret Posisi</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Jenis Pertanyaan */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            {typeInfo.icon}
            <span>{typeInfo.label}</span>
          </div>

          {/* Badge Wajib Diisi */}
          {question.required ? (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              Wajib *
            </span>
          ) : (
            <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
              Opsional
            </span>
          )}
        </div>
      </div>

      {/* Konten Pertanyaan */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-blue-50 text-primary font-bold text-xs flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-slate-900 font-semibold text-base leading-relaxed tailwind-reset">
            <div dangerouslySetInnerHTML={{ __html: question.pertanyaan }}></div>
          </div>
          {question.deskripsi_bantuan && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {question.deskripsi_bantuan}
            </p>
          )}

          {/* Target Responden Badge */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {question.for_responden_group && question.for_responden_group.length > 0 && (
              question.for_responden_group.map((rg, i) => (
                <span
                  key={`rg-${i}`}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200"
                >
                  {rg.jenis}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preview Input Berdasarkan Tipe Soal */}
      <div className="mt-4 pt-3 pl-10">
        {/* Pilihan Ganda & Kotak Centang & Dropdown */}
        {['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG', 'DROPDOWN'].includes(question.jenis) && (
          <div className="space-y-2">
            {question.opsi_pertanyaan && question.opsi_pertanyaan.length > 0 ? (
              question.opsi_pertanyaan.map((opsi, oIdx) => (
                <div
                  key={`opsi-${oIdx}`}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-sm text-slate-700"
                >
                  {question.jenis === 'CHECKBOX' || question.jenis === 'KOTAK_CENTANG' ? (
                    <div className="w-4 h-4 rounded border border-slate-300 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span className="flex-1">{opsi.opsi_jawaban}</span>
                  {opsi.ada_catatan && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                      + Catatan
                    </span>
                  )}
                  {opsi.goto_kategori_uuid && (
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      Lompat Bagian
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs italic text-slate-400">Belum ada opsi jawaban.</p>
            )}
          </div>
        )}

        {/* Isian Singkat */}
        {(question.jenis === 'ISIAN' || question.jenis === 'ISIAN_SINGKAT') && (
          <div className="w-full max-w-md border-b-2 border-dotted border-slate-300 py-1.5 text-xs text-slate-400">
            Teks jawaban singkat...
          </div>
        )}

        {/* Paragraf */}
        {question.jenis === 'PARAGRAF' && (
          <div className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs text-slate-400">
            Teks jawaban panjang (paragraf)...
          </div>
        )}

        {/* Upload File */}
        {question.jenis === 'UPLOAD_FILE' && (
          <div className="border border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-4 text-center">
            <UploadCloud className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-xs font-medium text-slate-700">Area Upload Berkas</p>
            <p className="text-[11px] text-slate-400">Format PDF, DOCX, JPG maksimal 5MB</p>
          </div>
        )}

        {/* Skala Linear */}
        {question.jenis === 'SKALA_LINEAR' && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <span>1 (Sangat Kurang)</span>
            <div className="flex gap-2 mx-auto">
              {[1, 2, 3, 4, 5].map((val) => (
                <div key={val} className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                  {val}
                </div>
              ))}
            </div>
            <span>5 (Sangat Baik)</span>
          </div>
        )}

        {/* Tanggal */}
        {question.jenis === 'TANGGAL' && (
          <div className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-500 bg-white">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>HH / BB / TTTT</span>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onLogic(question)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-transparent transition-all cursor-pointer"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Atur Logika Percabangan</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(question)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}

