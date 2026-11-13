'use client';

import React, { useState } from 'react';
import Modal, { ModalHeader } from '@/components/Modal';
import { IPertanyaan, IKategori } from '@/app/types';
import { GitFork, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const BRANCHABLE_TYPES = ['PILIHAN', 'PILIHAN_GANDA', 'CHECKBOX', 'KOTAK_CENTANG', 'DROPDOWN'];

interface LogicModalProps {
  isShow: boolean;
  onClose: () => void;
  question: IPertanyaan | null;
  allQuestions: IPertanyaan[];
  allCategories: IKategori[];
  onSaveRule: (rule: any) => Promise<void>;
  onDeleteRule?: (ruleId: string) => Promise<void>;
}

export function LogicModal({
  isShow,
  onClose,
  question,
  allQuestions,
  allCategories,
  onSaveRule,
  onDeleteRule,
}: LogicModalProps) {
  const [sourceQuestionId, setSourceQuestionId] = useState<string>('');
  const [operator, setOperator] = useState<string>('EQUALS');
  const [triggerOptionId, setTriggerOptionId] = useState<string>('');
  const [triggerValue, setTriggerValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Branching logic only applies to Pilihan Ganda, Checkbox, and Dropdown source questions
  const availableSourceQuestions = allQuestions.filter(
    (q) => question && q.uuid !== question.uuid && BRANCHABLE_TYPES.includes(q.jenis)
  );

  const selectedSourceQuestion = availableSourceQuestions.find(
    (q) => q.uuid === sourceQuestionId
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceQuestionId) {
      toast.warning('Pilih pertanyaan pemicu terlebih dahulu.');
      return;
    }
    if (operator !== 'IS_NOT_EMPTY' && !triggerOptionId) {
      toast.warning('Pilih opsi jawaban acuan terlebih dahulu.');
      return;
    }

    const selectedOpt = selectedSourceQuestion?.opsi_pertanyaan?.find(
      (o) => o.uuid === triggerOptionId
    );

    try {
      setIsSubmitting(true);
      await onSaveRule({
        id_target_pertanyaan: question?.uuid,
        id_source_pertanyaan: sourceQuestionId,
        id_opsi_pemicu: operator === 'IS_NOT_EMPTY' ? null : triggerOptionId || null,
        operator,
        nilai_pemicu: selectedOpt?.opsi_jawaban || triggerValue || '',
      });
      setSourceQuestionId('');
      setTriggerOptionId('');
      onClose();
    } catch (err: any) {
      toast.error(`Gagal menyimpan aturan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!question) return null;

  return (
    <Modal isShow={isShow} onClose={onClose}>
      <form onSubmit={handleSave} className="p-6">
        <ModalHeader onClose={onClose}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Atur Logika Percabangan</h3>
              <p className="text-xs text-slate-500">Tentukan kapan pertanyaan ini akan ditampilkan</p>
            </div>
          </div>
        </ModalHeader>

        <div className="my-5 space-y-4">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[11px] font-semibold text-primary block mb-1">Pertanyaan Target:</span>
            <div
              className="text-xs font-medium text-slate-800 tailwind-reset"
              dangerouslySetInnerHTML={{ __html: question.pertanyaan }}
            />
          </div>

          {question.target_rules && question.target_rules.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Aturan Logika Aktif ({question.target_rules.length}):
              </span>
              {question.target_rules.map((r: any) => {
                const srcQ = allQuestions.find((q) => q.uuid === r.id_source_pertanyaan);
                const srcOpt = srcQ?.opsi_pertanyaan?.find((o) => o.uuid === r.id_opsi_pemicu);
                return (
                  <div
                    key={r.uuid}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-purple-50/70 border border-purple-200 text-[11px] text-purple-900"
                  >
                    <span className="truncate">
                      Jika <strong>{srcQ?.pertanyaan.replace(/<[^>]*>?/gm, '').slice(0, 35) || 'Pertanyaan'}</strong>{' '}
                      {r.operator === 'IS_NOT_EMPTY'
                        ? 'sudah dijawab'
                        : r.operator === 'NOT_EQUALS'
                        ? `≠ "${srcOpt?.opsi_jawaban || r.nilai_pemicu}"`
                        : `= "${srcOpt?.opsi_jawaban || r.nilai_pemicu}"`}
                    </span>
                    {onDeleteRule && (
                      <button
                        type="button"
                        onClick={() => onDeleteRule(r.uuid)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer shrink-0"
                        title="Hapus aturan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              1. Tampilkan pertanyaan ini hanya jika pertanyaan berikut dijawab:
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Percabangan logika hanya berlaku untuk pertanyaan bertipe <strong>Pilihan Ganda</strong>, <strong>Checkbox</strong>, dan <strong>Dropdown</strong>.
            </p>
            <select
              value={sourceQuestionId}
              onChange={(e) => {
                setSourceQuestionId(e.target.value);
                setTriggerOptionId('');
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">
                {availableSourceQuestions.length === 0
                  ? '-- Belum ada pertanyaan Pilihan Ganda / Checkbox / Dropdown --'
                  : '-- Pilih Pertanyaan Pemicu --'}
              </option>
              {availableSourceQuestions.map((q, idx) => (
                <option key={q.uuid} value={q.uuid}>
                  {idx + 1}. {q.pertanyaan.replace(/<[^>]*>?/gm, '').substring(0, 70)}...
                </option>
              ))}
            </select>
          </div>

          {selectedSourceQuestion && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. Kondisi Logika:
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="EQUALS">Sama dengan (Equals)</option>
                  <option value="NOT_EQUALS">Tidak sama dengan (Not Equals)</option>
                  <option value="IS_NOT_EMPTY">Sudah dijawab (Is Not Empty)</option>
                </select>
              </div>

              {selectedSourceQuestion.opsi_pertanyaan &&
                selectedSourceQuestion.opsi_pertanyaan.length > 0 &&
                operator !== 'IS_NOT_EMPTY' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      3. Pilih Opsi Jawaban Acuan:
                    </label>
                    <select
                      value={triggerOptionId}
                      onChange={(e) => setTriggerOptionId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">-- Pilih Opsi Jawaban --</option>
                      {selectedSourceQuestion.opsi_pertanyaan.map((opt) => (
                        <option key={opt.uuid} value={opt.uuid}>
                          {opt.opsi_jawaban}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-[#094d84] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Menyimpan...' : 'Terapkan Logika'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

