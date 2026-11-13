'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GoogleFormsQuestionCard } from './GoogleFormsQuestionCard';
import { IPertanyaan } from '@/app/types';
import { PlusCircle, HelpCircle } from 'lucide-react';

interface CanvasProps {
  surveyId: string;
  categoryId: string;
  initialQuestions: IPertanyaan[];
  activeQuestionId: string | null;
  onSetActiveQuestionId: (id: string | null) => void;
  onUpdateQuestion: (qId: string, payload: any) => void;
  onDeleteQuestion: (qId: string) => void;
  onDuplicateQuestion: (q: IPertanyaan) => void;
  onLogicQuestion: (q: IPertanyaan) => void;
  onReorderQuestions: (items: { uuid: string; order_index: number }[]) => void;
  onQuickAddQuestion: () => void;
}

export function SurveyBuilderCanvas({
  surveyId,
  categoryId,
  initialQuestions,
  activeQuestionId,
  onSetActiveQuestionId,
  onUpdateQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onLogicQuestion,
  onReorderQuestions,
  onQuickAddQuestion,
}: CanvasProps) {
  const [questions, setQuestions] = useState<IPertanyaan[]>(initialQuestions);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.uuid === active.id);
      const newIndex = questions.findIndex((q) => q.uuid === over.id);
      const newQuestions = arrayMove(questions, oldIndex, newIndex);

      setQuestions(newQuestions);

      const itemsPayload = newQuestions.map((q, idx) => ({
        uuid: q.uuid,
        order_index: idx + 1,
      }));

      onReorderQuestions(itemsPayload);
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((q) => q.uuid)}
          strategy={verticalListSortingStrategy}
        >
          {questions.map((question, index) => (
            <GoogleFormsQuestionCard
              key={question.uuid}
              question={question}
              index={index}
              isActive={activeQuestionId === question.uuid}
              onActivate={() => onSetActiveQuestionId(question.uuid)}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              onDuplicate={onDuplicateQuestion}
              onLogic={onLogicQuestion}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Empty State / Add First Question */}
      {questions.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5C9E] flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Belum Ada Butir Pertanyaan di Bagian Ini
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Klik tombol di bawah atau gunakan toolbar di sebelah kanan untuk menambahkan pertanyaan pertama ala Google Forms.
          </p>
          <button
            type="button"
            onClick={onQuickAddQuestion}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambahkan Pertanyaan Sekarang</span>
          </button>
        </div>
      )}
    </div>
  );
}
