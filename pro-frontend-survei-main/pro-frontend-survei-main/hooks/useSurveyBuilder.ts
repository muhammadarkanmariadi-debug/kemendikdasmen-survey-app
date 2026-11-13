import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SurveyApiService } from '@/services/survey.service';
import { ISurvei, IKategori, IPertanyaan } from '@/app/types';
import { toast } from 'react-toastify';

export const SURVEY_QUERY_KEYS = {
  detail: (id: string) => ['survey', id] as const,
  instruments: (surveyId: string) => ['survey', surveyId, 'instruments'] as const,
};

export function useSurveyDetail(surveyId: string, initialSurvey?: ISurvei) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.detail(surveyId),
    queryFn: () => SurveyApiService.getSurveyById(surveyId),
    initialData: initialSurvey,
    enabled: !!surveyId,
  });
}

export function useSurveyInstruments(surveyId: string, initialCategories?: IKategori[]) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.instruments(surveyId),
    queryFn: () => SurveyApiService.getSurveyInstruments(surveyId),
    initialData: initialCategories,
    enabled: !!surveyId,
  });
}

export function useSurveyBuilderMutations(surveyId: string) {
  const queryClient = useQueryClient();

  const invalidateInstruments = () => {
    queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.instruments(surveyId) });
    queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.detail(surveyId) });
  };

  // Update Survey Header & Banner
  const updateHeaderMutation = useMutation({
    mutationFn: (data: { nama_survey: string; deskripsi?: string; status?: boolean; cover_image?: string }) =>
      SurveyApiService.updateSurveyHeader(surveyId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(SURVEY_QUERY_KEYS.detail(surveyId), (old: ISurvei | undefined) =>
        old ? { ...old, ...updated } : updated
      );
      toast.success('Informasi kuesioner berhasil diperbarui');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan perubahan kuesioner');
    },
  });

  // Create Question
  const createQuestionMutation = useMutation({
    mutationFn: (payload: any) => SurveyApiService.createQuestion(payload),
    onSuccess: () => {
      invalidateInstruments();
      toast.success('Pertanyaan baru berhasil ditambahkan');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menambahkan pertanyaan');
    },
  });

  // Update Question (Inline)
  const updateQuestionMutation = useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: any;
    }) => SurveyApiService.updateQuestion(questionId, payload),
    onSuccess: () => {
      invalidateInstruments();
      toast.success('Pertanyaan berhasil disimpan');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan butir pertanyaan');
    },
  });

  // Delete Question
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => SurveyApiService.deleteQuestion(questionId),
    onSuccess: () => {
      invalidateInstruments();
      toast.success('Pertanyaan berhasil dihapus');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menghapus pertanyaan');
    },
  });

  // Reorder Questions
  const reorderQuestionsMutation = useMutation({
    mutationFn: (items: { uuid: string; order_index: number }[]) =>
      SurveyApiService.reorderQuestions(surveyId, items),
    onSuccess: () => {
      invalidateInstruments();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal mengubah urutan butir');
    },
  });

  // Create Category / Section
  const createCategoryMutation = useMutation({
    mutationFn: (payload: { id_survey: string; nama_kategori: string; order_index?: number }) =>
      SurveyApiService.createCategory(payload),
    onSuccess: () => {
      invalidateInstruments();
      toast.success('Bagian / Kategori instrumen berhasil ditambahkan');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal membuat kategori baru');
    },
  });

  // Update Category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: string; payload: { nama_kategori: string } }) =>
      SurveyApiService.updateCategory(categoryId, payload),
    onSuccess: () => {
      invalidateInstruments();
      toast.success('Nama bagian / kategori diperbarui');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal memperbarui kategori');
    },
  });

  // Delete Category
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => SurveyApiService.deleteCategory(categoryId),
    onSuccess: () => {
      invalidateInstruments();
      toast.success('Bagian / Kategori berhasil dihapus');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menghapus kategori');
    },
  });

  return {
    updateHeader: updateHeaderMutation,
    createQuestion: createQuestionMutation,
    updateQuestion: updateQuestionMutation,
    deleteQuestion: deleteQuestionMutation,
    reorderQuestions: reorderQuestionsMutation,
    createCategory: createCategoryMutation,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation,
  };
}

