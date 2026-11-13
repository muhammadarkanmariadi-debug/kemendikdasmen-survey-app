'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IPertanyaan } from '@/app/types';
import {
  GripVertical,
  Trash2,
  Copy,
  GitFork,
  CircleDot,
  CheckSquare,
  ChevronDown,
  AlignLeft,
  FileText,
  UploadCloud,
  SlidersHorizontal,
  Calendar,
  Plus,
  X,
  Check,
  Image as ImageIcon,
  AlignJustify,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

export const QUESTION_TYPES = [
  { id: 'PILIHAN', label: 'Pilihan Ganda', icon: CircleDot, color: 'text-slate-700' },
  { id: 'CHECKBOX', label: 'Kotak Centang', icon: CheckSquare, color: 'text-slate-700' },
  { id: 'DROPDOWN', label: 'Dropdown', icon: ChevronDown, color: 'text-slate-700' },
  { id: 'ISIAN', label: 'Jawaban Singkat', icon: AlignLeft, color: 'text-slate-700' },
  { id: 'PARAGRAF', label: 'Paragraf', icon: FileText, color: 'text-slate-700' },
  { id: 'UPLOAD_FILE', label: 'Upload Berkas', icon: UploadCloud, color: 'text-slate-700' },
  { id: 'SKALA_LINEAR', label: 'Skala Linear', icon: SlidersHorizontal, color: 'text-slate-700' },
  { id: 'TANGGAL', label: 'Tanggal', icon: Calendar, color: 'text-slate-700' },
];

export interface QuestionImageConfig {
  image_url?: string;
  image_caption?: string;
  image_align?: 'left' | 'center' | 'right';
}

interface GoogleFormsQuestionCardProps {
  question: IPertanyaan;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (qId: string, payload: any) => void;
  onDelete: (qId: string) => void;
  onDuplicate: (q: IPertanyaan) => void;
  onLogic: (q: IPertanyaan) => void;
}

const parseImageConfig = (configStr?: string | null): QuestionImageConfig => {
  try {
    if (!configStr) return {};
    const parsed = JSON.parse(configStr);
    return parsed?.image_url ? parsed : {};
  } catch (e) {
    return {};
  }
};

export function GoogleFormsQuestionCard({
  question,
  index,
  isActive,
  onActivate,
  onUpdate,
  onDelete,
  onDuplicate,
  onLogic,
}: GoogleFormsQuestionCardProps) {
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

  // Local draft states
  const [pertanyaan, setPertanyaan] = useState(
    question.pertanyaan.replace(/<[^>]*>?/gm, '')
  );
  const [deskripsiBantuan, setDeskripsiBantuan] = useState(
    question.deskripsi_bantuan || ''
  );
  const [jenis, setJenis] = useState(question.jenis);
  const [required, setRequired] = useState(question.required);
  const [imageConfig, setImageConfig] = useState<QuestionImageConfig>(() =>
    parseImageConfig(question.file_config)
  );

  // Image insertion modal / popover
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempCaption, setTempCaption] = useState('');
  const [tempAlign, setTempAlign] = useState<'left' | 'center' | 'right'>('center');

  const [opsiList, setOpsiList] = useState<
    { opsi_jawaban: string; ada_catatan: boolean }[]
  >(
    question.opsi_pertanyaan && question.opsi_pertanyaan.length > 0
      ? question.opsi_pertanyaan.map((o) => ({
          opsi_jawaban: o.opsi_jawaban,
          ada_catatan: o.ada_catatan,
        }))
      : [
          { opsi_jawaban: 'Opsi 1', ada_catatan: false },
          { opsi_jawaban: 'Opsi 2', ada_catatan: false },
        ]
  );
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPertanyaan(question.pertanyaan.replace(/<[^>]*>?/gm, ''));
    setDeskripsiBantuan(question.deskripsi_bantuan || '');
    setJenis(question.jenis);
    setRequired(question.required);
    setImageConfig(parseImageConfig(question.file_config));

    if (question.opsi_pertanyaan && question.opsi_pertanyaan.length > 0) {
      setOpsiList(
        question.opsi_pertanyaan.map((o) => ({
          opsi_jawaban: o.opsi_jawaban,
          ada_catatan: o.ada_catatan,
        }))
      );
    }
  }, [question]);

  // Click outside to close type menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveChanges = (override?: Partial<any>) => {
    const currentImg = override?.imageConfig ?? imageConfig;
    const payload = {
      pertanyaan: override?.pertanyaan ?? (pertanyaan.trim() || 'Pertanyaan Tanpa Judul'),
      deskripsi_bantuan: override?.deskripsiBantuan ?? deskripsiBantuan.trim(),
      jenis: override?.jenis ?? jenis,
      required: override?.required ?? required,
      file_config: currentImg?.image_url ? JSON.stringify(currentImg) : '{}',
      opsi_pertanyaan: ['PILIHAN', 'CHECKBOX', 'DROPDOWN', 'PILIHAN_GANDA', 'KOTAK_CENTANG'].includes(
        override?.jenis ?? jenis
      )
        ? override?.opsiList ?? opsiList
        : [],
    };
    onUpdate(question.uuid, payload);
  };

  const handleSelectType = (newType: string) => {
    setJenis(newType);
    setIsTypeDropdownOpen(false);
    saveChanges({ jenis: newType });
  };

  const handleToggleRequired = (val: boolean) => {
    setRequired(val);
    saveChanges({ required: val });
  };

  const handleOptionChange = (idx: number, text: string) => {
    const updated = [...opsiList];
    updated[idx].opsi_jawaban = text;
    setOpsiList(updated);
  };

  const handleOptionBlur = () => {
    saveChanges();
  };

  const handleAddOption = (defaultText?: string) => {
    const nextNum = opsiList.length + 1;
    const newOptions = [
      ...opsiList,
      { opsi_jawaban: defaultText || `Opsi ${nextNum}`, ada_catatan: false },
    ];
    setOpsiList(newOptions);
    saveChanges({ opsiList: newOptions });
  };

  const handleRemoveOption = (idx: number) => {
    if (opsiList.length <= 1) return;
    const updated = opsiList.filter((_, i) => i !== idx);
    setOpsiList(updated);
    saveChanges({ opsiList: updated });
  };

  // Image actions
  const handleOpenImageModal = () => {
    setTempImageUrl(imageConfig.image_url || '');
    setTempCaption(imageConfig.image_caption || '');
    setTempAlign(imageConfig.image_align || 'center');
    setIsImageModalOpen(true);
  };

  const handleApplyImage = () => {
    const newConfig: QuestionImageConfig = tempImageUrl.trim()
      ? {
          image_url: tempImageUrl.trim(),
          image_caption: tempCaption.trim(),
          image_align: tempAlign,
        }
      : {};
    setImageConfig(newConfig);
    setIsImageModalOpen(false);
    saveChanges({ imageConfig: newConfig });
  };

  const handleRemoveImage = () => {
    const newConfig: QuestionImageConfig = {};
    setImageConfig(newConfig);
    setIsImageModalOpen(false);
    saveChanges({ imageConfig: newConfig });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentTypeMeta =
    QUESTION_TYPES.find((t) => t.id === jenis || (t.id === 'PILIHAN' && jenis === 'PILIHAN_GANDA')) ||
    QUESTION_TYPES[0];
  const CurrentIcon = currentTypeMeta.icon;

  const isChoiceType = ['PILIHAN', 'CHECKBOX', 'DROPDOWN', 'PILIHAN_GANDA', 'KOTAK_CENTANG'].includes(jenis);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onActivate}
      className={`group relative bg-white rounded-2xl transition-all duration-150 border ${
        isActive
          ? 'border-slate-300 border-l-4 border-l-[#0B5C9E] shadow-sm p-6'
          : 'border-slate-200/90 hover:border-slate-300 p-5 cursor-pointer shadow-xs'
      }`}
    >
      {/* Top Drag Handle Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Tarik untuk memindahkan urutan butir"
        >
          <GripVertical className="w-3.5 h-3.5" />
          <span className="text-[11px] text-slate-500">Butir #{index + 1}</span>
        </div>

        {/* Inactive Mode Badges (Clean & Minimalist) */}
        {!isActive && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
              <CurrentIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTypeMeta.label}</span>
            </div>
            {imageConfig.image_url && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                <ImageIcon className="w-3 h-3 text-slate-500" />
                <span>Gambar</span>
              </span>
            )}
            {required ? (
              <span className="text-[11px] font-medium text-rose-600">
                Wajib
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Opsional
              </span>
            )}
          </div>
        )}
      </div>

      {/* ACTIVE MODE: Google Forms-grade Inline Editor */}
      {isActive ? (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Question Title, Image Button & Type Selector Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                onBlur={() => saveChanges()}
                placeholder="Tuliskan butir pertanyaan di sini..."
                className="w-full text-base font-semibold text-slate-900 border-b-2 border-slate-200 focus:border-[#0B5C9E] focus:outline-none transition-colors py-1.5 bg-slate-50/40 px-2 rounded-t placeholder:text-slate-300"
                autoFocus
              />

              {/* Insert Image Button (Google Forms Icon beside title) */}
              <button
                type="button"
                onClick={handleOpenImageModal}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  imageConfig.image_url
                    ? 'border-[#0B5C9E] bg-blue-50 text-[#0B5C9E]'
                    : 'border-slate-200 text-slate-700 hover:text-[#0B5C9E] hover:border-blue-300 hover:bg-blue-50/50 bg-white'
                }`}
                title="Sisipkan gambar pada butir pertanyaan"
              >
                <ImageIcon className="w-4 h-4 text-[#0B5C9E]" />
                <span className="hidden sm:inline">
                  {imageConfig.image_url ? 'Ubah Gambar' : 'Sisipkan Gambar'}
                </span>
              </button>
            </div>

            {/* Inline Question Type Dropdown */}
            <div className="relative shrink-0" ref={typeMenuRef}>
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer transition-all"
              >
                <CurrentIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>{currentTypeMeta.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Type Dropdown Menu */}
              {isTypeDropdownOpen && (
                <div className="absolute right-0 top-11 z-30 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tipe Jawaban
                  </div>
                  {QUESTION_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectType(t.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                          jenis === t.id
                            ? 'bg-slate-100 text-[#0B5C9E] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.label}</span>
                        </div>
                        {jenis === t.id && <Check className="w-3.5 h-3.5 text-[#0B5C9E]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Optional Help / Description Text */}
          <div>
            <input
              type="text"
              value={deskripsiBantuan}
              onChange={(e) => setDeskripsiBantuan(e.target.value)}
              onBlur={() => saveChanges()}
              placeholder="Deskripsi petunjuk jawaban (opsional)..."
              className="w-full text-xs text-slate-500 border-b border-dashed border-slate-200 focus:border-[#0B5C9E] focus:outline-none py-1 bg-transparent placeholder:text-slate-300"
            />
          </div>

          {/* Question Embedded Image Display (If Attached) */}
          {imageConfig.image_url && (
            <div
              className={`my-3 flex flex-col ${
                imageConfig.image_align === 'left'
                  ? 'items-start'
                  : imageConfig.image_align === 'right'
                  ? 'items-end'
                  : 'items-center'
              }`}
            >
              <div className="relative group/img inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageConfig.image_url}
                  alt={imageConfig.image_caption || 'Ilustrasi butir pertanyaan'}
                  className="max-h-72 max-w-full rounded-xl border border-slate-200 object-contain shadow-xs bg-slate-50"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={handleOpenImageModal}
                    className="p-1 text-slate-600 hover:text-[#0B5C9E] text-xs font-medium cursor-pointer"
                    title="Ubah gambar"
                  >
                    Ubah
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 text-rose-600 hover:text-rose-700 text-xs font-medium cursor-pointer"
                    title="Hapus gambar"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              {imageConfig.image_caption && (
                <span className="text-xs text-slate-500 italic mt-1.5">
                  {imageConfig.image_caption}
                </span>
              )}
            </div>
          )}

          {/* Dynamic Inputs Based On Selected Type */}
          <div className="pt-1">
            {/* Multiple Choice / Checkbox / Dropdown Option Editor */}
            {isChoiceType && (
              <div className="space-y-2">
                {opsiList.map((opsi, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 group/opt">
                    {jenis === 'CHECKBOX' || jenis === 'KOTAK_CENTANG' ? (
                      <div className="w-4 h-4 rounded border border-slate-300 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                    )}

                    <input
                      type="text"
                      value={opsi.opsi_jawaban}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      onBlur={handleOptionBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder={`Opsi ${idx + 1}`}
                      className="flex-1 text-xs md:text-sm text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-[#0B5C9E] focus:outline-none py-1 bg-transparent transition-colors"
                    />

                    {opsiList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-300 hover:text-rose-600 p-1 transition-colors opacity-0 group-hover/opt:opacity-100 cursor-pointer"
                        title="Hapus opsi"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Option Actions (Google Forms Pattern) */}
                <div className="flex items-center gap-2 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddOption()}
                    className="inline-flex items-center gap-1.5 text-[#0B5C9E] hover:text-[#094B82] font-semibold hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Opsi</span>
                  </button>
                  <span className="text-slate-300">atau</span>
                  <button
                    type="button"
                    onClick={() => handleAddOption('Lainnya...')}
                    className="text-slate-500 hover:text-[#0B5C9E] hover:underline cursor-pointer"
                  >
                    Tambahkan &quot;Lainnya&quot;
                  </button>
                </div>
              </div>
            )}

            {/* Short Answer Preview */}
            {(jenis === 'ISIAN' || jenis === 'ISIAN_SINGKAT') && (
              <div className="py-2 text-xs text-slate-400 border-b border-slate-200 w-full max-w-sm">
                Teks jawaban singkat responden...
              </div>
            )}

            {/* Paragraph Preview */}
            {jenis === 'PARAGRAF' && (
              <div className="py-2 text-xs text-slate-400 border-b border-slate-200 w-full max-w-lg">
                Teks jawaban paragraf panjang responden...
              </div>
            )}

            {/* Upload File Preview */}
            {jenis === 'UPLOAD_FILE' && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Responden akan mengunggah file dokumen lampiran (PDF/JPG/PNG).</span>
              </div>
            )}

            {/* Linear Scale Preview */}
            {jenis === 'SKALA_LINEAR' && (
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <span>1 (Rendah)</span>
                <div className="flex gap-2 mx-auto">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <div
                      key={val}
                      className="w-7 h-7 rounded-full bg-white border border-slate-300 flex items-center justify-center font-semibold text-xs text-slate-700"
                    >
                      {val}
                    </div>
                  ))}
                </div>
                <span>5 (Tinggi)</span>
              </div>
            )}

            {/* Date Preview */}
            {jenis === 'TANGGAL' && (
              <div className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-500 bg-white">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>HH / BB / TTTT</span>
              </div>
            )}
          </div>

          {/* Active Card Bottom Toolbar (Minimalist & Professional) */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onLogic(question)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5 text-slate-500" />
              <span>Logika Percabangan</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              {/* Duplicate Question */}
              <button
                type="button"
                onClick={() => onDuplicate(question)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Duplikat butir pertanyaan"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Delete Question */}
              <button
                type="button"
                onClick={() => onDelete(question.uuid)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus butir"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-200" />

              {/* Required Switch Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Wajib diisi</span>
                <button
                  type="button"
                  onClick={() => handleToggleRequired(!required)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    required ? 'bg-[#0B5C9E]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      required ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INACTIVE MODE: Clean Read-Only Preview */
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 text-xs font-semibold text-slate-500 pt-0.5">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {pertanyaan}
                {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
              </h4>
              {deskripsiBantuan && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{deskripsiBantuan}</p>
              )}
            </div>
          </div>

          {/* Embedded Image In Inactive Mode */}
          {imageConfig.image_url && (
            <div
              className={`pl-5 my-2 flex flex-col ${
                imageConfig.image_align === 'left'
                  ? 'items-start'
                  : imageConfig.image_align === 'right'
                  ? 'items-end'
                  : 'items-center'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageConfig.image_url}
                alt={imageConfig.image_caption || 'Ilustrasi butir pertanyaan'}
                className="max-h-60 max-w-full rounded-lg border border-slate-200 object-contain shadow-xs bg-slate-50"
              />
              {imageConfig.image_caption && (
                <span className="text-xs text-slate-500 italic mt-1">
                  {imageConfig.image_caption}
                </span>
              )}
            </div>
          )}

          {/* Options Preview for Choice Types */}
          {isChoiceType && (
            <div className="pl-5 space-y-1 pt-0.5">
              {opsiList.map((opsi, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2 text-xs text-slate-600">
                  {jenis === 'CHECKBOX' || jenis === 'KOTAK_CENTANG' ? (
                    <div className="w-3.5 h-3.5 rounded border border-slate-300 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{opsi.opsi_jawaban}</span>
                </div>
              ))}
            </div>
          )}

          {(jenis === 'ISIAN' || jenis === 'ISIAN_SINGKAT') && (
            <div className="pl-5 pt-0.5">
              <span className="text-xs text-slate-400 border-b border-dotted border-slate-300 pb-0.5 inline-block w-44">
                Teks jawaban singkat
              </span>
            </div>
          )}

          {jenis === 'PARAGRAF' && (
            <div className="pl-5 pt-0.5">
              <span className="text-xs text-slate-400 border-b border-dotted border-slate-300 pb-0.5 inline-block w-60">
                Teks jawaban panjang
              </span>
            </div>
          )}
        </div>
      )}

      {/* Image Insertion Dialog / Popover */}
      {isImageModalOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0B5C9E]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Sisipkan Gambar pada Pertanyaan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Image Source Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Gambar atau Unggah Berkas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="https://contoh.kemdikbud.go.id/bagan.png"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B5C9E]"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                  >
                    Pilih File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mendukung format PNG, JPG, WebP, SVG (Maksimal 5MB).
                </span>
              </div>

              {/* Image Preview */}
              {tempImageUrl && (
                <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tempImageUrl}
                    alt="Pratinjau gambar"
                    className="max-h-48 max-w-full mx-auto rounded-lg object-contain"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Gambar / Caption (Opsional)
                </label>
                <input
                  type="text"
                  value={tempCaption}
                  onChange={(e) => setTempCaption(e.target.value)}
                  placeholder="Contoh: Gambar 1.1 Bagan Alur Kerja Penjaminan Mutu"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B5C9E]"
                />
              </div>

              {/* Alignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Posisi Perataan Gambar
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTempAlign('left')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      tempAlign === 'left'
                        ? 'border-[#0B5C9E] bg-blue-50 text-[#0B5C9E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                    <span>Rata Kiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempAlign('center')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      tempAlign === 'center'
                        ? 'border-[#0B5C9E] bg-blue-50 text-[#0B5C9E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>Rata Tengah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempAlign('right')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      tempAlign === 'right'
                        ? 'border-[#0B5C9E] bg-blue-50 text-[#0B5C9E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                    <span>Rata Kanan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {imageConfig.image_url ? (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                >
                  Hapus Gambar
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyImage}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0B5C9E] hover:bg-[#094B82] text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Terapkan Gambar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
