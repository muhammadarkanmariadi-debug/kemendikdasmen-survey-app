'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ISurvei, IKategori, IPertanyaan } from '@/app/types';
import { GoogleFormsHeaderCard } from './GoogleFormsHeaderCard';
import { SurveyBuilderCanvas } from './SurveyBuilderCanvas';
import { GoogleFormsToolbar } from './GoogleFormsToolbar';
import { LogicModal } from './LogicModal';
import {
  useSurveyDetail,
  useSurveyInstruments,
  useSurveyBuilderMutations,
} from '@/hooks/useSurveyBuilder';
import { SurveyApiService } from '@/services/survey.service';
import {
  ArrowLeft,
  Eye,
  Link2,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

interface BuilderProps {
  survey: ISurvei;
  detailSurveys: IKategori[];
}

export function SurveyBuilderView({ survey: initialSurvey, detailSurveys: initialCategories }: BuilderProps) {
  const surveyId = initialSurvey.uuid;

  // TanStack Query
  const { data: survey = initialSurvey } = useSurveyDetail(surveyId, initialSurvey);
  const { data: categories = initialCategories, refetch: refetchInstruments } = useSurveyInstruments(surveyId, initialCategories);
  const mutations = useSurveyBuilderMutations(surveyId);

  const [selectedCatIndex, setSelectedCatIndex] = useState<number>(0);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Category inline edit states
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState<string>('');

  // Logic Modal states
  const [logicTargetQuestion, setLogicTargetQuestion] = useState<IPertanyaan | null>(null);
  const [isLogicModalOpen, setIsLogicModalOpen] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement>(null);

  const currentCategory = categories[selectedCatIndex] || categories[0] || null;
  const currentQuestions = currentCategory?.pertanyaan || [];
  const allQuestions = categories.flatMap((c) => c.pertanyaan || []);

  const handleCopyLink = () => {
    const slug = survey.public_link || survey.uuid;
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Tautan kuesioner publik disalin ke clipboard!');
  };

  const handleFocusHeader = () => {
    headerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPreview = () => {
    const slug = survey.public_link || survey.uuid;
    window.open(`/form/${slug}`, '_blank');
  };

  // Quick Add Question (Google Forms Style)
  const handleQuickAddQuestion = () => {
    if (!currentCategory) {
      toast.warning('Tambahkan bagian kuesioner terlebih dahulu.');
      return;
    }

    const nextOrder = currentQuestions.length + 1;
    const defaultResGroup =
      survey.responden_group && survey.responden_group.length > 0
        ? JSON.stringify(survey.responden_group.map((r) => r.jenis))
        : JSON.stringify(['Kepala Sekolah', 'Guru Kejuruan & Produktif', 'Siswa / Peserta Didik']);

    mutations.createQuestion.mutate(
      {
        id_survey: survey.uuid,
        id_kategori: currentCategory.uuid,
        kategori: currentCategory.nama_kategori,
        pertanyaan: 'Pertanyaan Baru',
        jenis: 'PILIHAN',
        required: false,
        order_index: nextOrder,
        for_responden_group: defaultResGroup,
        for_sub_role: '["SISWA","GURU","KEPALA_SEKOLAH"]',
        file_config: '{}',
        scale_config: '{}',
        opsi: [
          { opsi_jawaban: 'Opsi 1', ada_catatan: false },
          { opsi_jawaban: 'Opsi 2', ada_catatan: false },
        ],
      },
      {
        onSuccess: (newQ) => {
          if (newQ?.uuid) {
            setActiveQuestionId(newQ.uuid);
          }
        },
      }
    );
  };

  // Duplicate Question
  const handleDuplicateQuestion = (q: IPertanyaan) => {
    if (!currentCategory) return;
    const nextOrder = currentQuestions.length + 1;
    const resGroupStr =
      typeof q.for_responden_group === 'string'
        ? q.for_responden_group
        : Array.isArray(q.for_responden_group)
        ? JSON.stringify(
            q.for_responden_group.map((r: any) =>
              typeof r === 'string' ? r : r.jenis || r.name || String(r)
            )
          )
        : survey.responden_group?.length
        ? JSON.stringify(survey.responden_group.map((r) => r.jenis))
        : JSON.stringify(['SEMUA']);

    mutations.createQuestion.mutate({
      id_survey: survey.uuid,
      id_kategori: currentCategory.uuid,
      kategori: q.kategori || currentCategory.nama_kategori,
      pertanyaan: `${q.pertanyaan} (Salinan)`,
      jenis: q.jenis,
      required: Boolean(q.required),
      deskripsi_bantuan: q.deskripsi_bantuan || '',
      for_sub_role: q.for_sub_role || '["SISWA","GURU","KEPALA_SEKOLAH"]',
      file_config: q.file_config || '{}',
      scale_config: q.scale_config || '{}',
      order_index: nextOrder,
      for_responden_group: resGroupStr,
      opsi:
        q.opsi_pertanyaan?.map((o) => ({
          opsi_jawaban: o.opsi_jawaban,
          ada_catatan: Boolean(o.ada_catatan),
        })) || [],
    });
  };

  // Update Question Inline
  const handleUpdateQuestion = (qId: string, payload: any) => {
    mutations.updateQuestion.mutate({ questionId: qId, payload });
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus butir pertanyaan ini?')) {
      mutations.deleteQuestion.mutate(qId);
    }
  };

  // Reorder Questions
  const handleReorderQuestions = (items: { uuid: string; order_index: number }[]) => {
    mutations.reorderQuestions.mutate(items);
  };

  // Logic Modal
  const handleOpenLogic = (q: IPertanyaan) => {
    setLogicTargetQuestion(q);
    setIsLogicModalOpen(true);
  };

  const handleSaveRule = async (rule: any) => {
    await SurveyApiService.createLogicRule(rule);
    await refetchInstruments();
    toast.success('Aturan logika percabangan berhasil disimpan!');
  };

  const handleDeleteRule = async (ruleId: string) => {
    await SurveyApiService.deleteLogicRule(ruleId);
    const updated = await refetchInstruments();
    if (logicTargetQuestion && updated.data) {
      const refreshedQ = updated.data
        .flatMap((c) => c.pertanyaan || [])
        .find((q) => q.uuid === logicTargetQuestion.uuid);
      if (refreshedQ) setLogicTargetQuestion(refreshedQ);
    }
    toast.info('Aturan logika percabangan dihapus.');
  };

  // Categories Handlers
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    mutations.createCategory.mutate(
      {
        id_survey: survey.uuid,
        nama_kategori: newCatName.trim(),
        order_index: categories.length + 1,
      },
      {
        onSuccess: () => {
          setNewCatName('');
          setIsAddingCategory(false);
          setSelectedCatIndex(categories.length);
        },
      }
    );
  };

  const handleSaveEditCategory = (catId: string) => {
    if (!editingCatName.trim()) return;
    mutations.updateCategory.mutate(
      { categoryId: catId, payload: { nama_kategori: editingCatName.trim() } },
      {
        onSuccess: () => {
          setEditingCatId(null);
        },
      }
    );
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Hapus bagian ini beserta seluruh butir pertanyaan di dalamnya?')) {
      mutations.deleteCategory.mutate(catId, {
        onSuccess: () => {
          setSelectedCatIndex(0);
        },
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-32 relative">
      <ToastContainer autoClose={2500} hideProgressBar />

      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <Link
          href="/admin/kuisioner"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0B5C9E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Manajemen Kuesioner</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#0B5C9E]" />
            <span>Pratinjau Kuesioner</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#0B5C9E] hover:bg-[#094B82] shadow-xs transition-all cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Salin Tautan Publik</span>
          </button>
        </div>
      </div>

      {/* Google Forms Header Card with Cover Banner & Live Edit */}
      <div ref={headerRef}>
        <GoogleFormsHeaderCard
          survey={survey}
          onUpdateHeader={(data) => mutations.updateHeader.mutate(data)}
          isSaving={mutations.updateHeader.isPending}
        />
      </div>

      {/* Categories / Sections Ribbon (Google Forms multi-section navigation) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B5C9E]" />
            <h3 className="font-bold text-xs md:text-sm text-slate-800">
              Bagian / Halaman Kuesioner ({categories.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0B5C9E] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bagian</span>
          </button>
        </div>

        {/* Inline Add Category Form */}
        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} className="flex items-center gap-2 mb-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-200/80">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nama bagian / halaman baru..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20"
              autoFocus
            />
            <button
              type="submit"
              disabled={mutations.createCategory.isPending}
              className="px-3 py-1.5 bg-[#0B5C9E] text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
            >
              Batal
            </button>
          </form>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat, idx) => (
            <button
              key={`cat-pill-${cat.uuid}`}
              type="button"
              onClick={() => {
                setSelectedCatIndex(idx);
                setActiveQuestionId(null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCatIndex === idx
                  ? 'bg-[#0B5C9E] text-white shadow-md shadow-blue-900/15'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>
                {idx + 1}. {cat.nama_kategori}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCatIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {cat.pertanyaan ? cat.pertanyaan.length : 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Banner & Questions Canvas */}
      {currentCategory && (
        <div className="space-y-4">
          {/* Section Break Card (Google Forms Section Style) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <span className="text-[11px] font-bold text-[#0B5C9E] uppercase tracking-wider block mb-0.5">
                Bagian {selectedCatIndex + 1} dari {categories.length}
              </span>

              {editingCatId === currentCategory.uuid ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    className="text-base font-bold text-slate-900 border-b border-[#0B5C9E] focus:outline-none bg-slate-50 px-2 py-0.5 rounded"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEditCategory(currentCategory.uuid)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCatId(null)}
                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-slate-900">
                  {currentCategory.nama_kategori}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCatId(currentCategory.uuid);
                  setEditingCatName(currentCategory.nama_kategori);
                }}
                className="p-2 text-slate-500 hover:text-[#0B5C9E] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Ubah nama bagian"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(currentCategory.uuid)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  title="Hapus bagian ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleQuickAddQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B5C9E] hover:bg-[#094B82] transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pertanyaan</span>
              </button>
            </div>
          </div>

          {/* Interactive Google Forms Drag & Drop Canvas */}
          <SurveyBuilderCanvas
            surveyId={survey.uuid}
            categoryId={currentCategory.uuid}
            initialQuestions={currentQuestions}
            activeQuestionId={activeQuestionId}
            onSetActiveQuestionId={setActiveQuestionId}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onLogicQuestion={handleOpenLogic}
            onReorderQuestions={handleReorderQuestions}
            onQuickAddQuestion={handleQuickAddQuestion}
          />
        </div>
      )}

      {/* Floating Google Forms Right Palette */}
      <GoogleFormsToolbar
        onAddQuestion={handleQuickAddQuestion}
        onFocusHeader={handleFocusHeader}
        onAddCategory={() => setIsAddingCategory(true)}
        onPreview={handleOpenPreview}
        onCopyLink={handleCopyLink}
      />

      {/* Branching Logic Modal */}
      <LogicModal
        isShow={isLogicModalOpen}
        onClose={() => setIsLogicModalOpen(false)}
        question={logicTargetQuestion}
        allQuestions={allQuestions}
        allCategories={categories}
        onSaveRule={handleSaveRule}
        onDeleteRule={handleDeleteRule}
      />
    </div>
  );
}
