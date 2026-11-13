import { BASE_API_URL } from '@/global';
import { getCookie } from '@/helper/client-cookie';
import { TOKEN_KEY_ADMIN } from '@/global';
import { ISurvei, IKategori, IPertanyaan } from '@/app/types';

const getAuthHeaders = () => {
  const token = getCookie(TOKEN_KEY_ADMIN) || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const SurveyApiService = {
  // Survey Details
  getSurveyById: async (id: string): Promise<ISurvei> => {
    const res = await fetch(`${BASE_API_URL}/surveys/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil data survei');
    const json = await res.json();
    return json.data;
  },

  updateSurveyHeader: async (
    id: string,
    data: { nama_survey: string; deskripsi?: string; status?: boolean; cover_image?: string }
  ): Promise<ISurvei> => {
    const res = await fetch(`${BASE_API_URL}/surveys/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal memperbarui informasi kuesioner');
    const json = await res.json();
    return json.data;
  },

  // Instruments & Categories
  getSurveyInstruments: async (surveyId: string): Promise<IKategori[]> => {
    const res = await fetch(`${BASE_API_URL}/instruments/all?id_survey=${surveyId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal memuat butir pertanyaan instrumen');
    const json = await res.json();
    return json.data || [];
  },

  createQuestion: async (rawPayload: any): Promise<IPertanyaan> => {
    // 1. Normalize kategori
    let kategori = rawPayload.kategori || rawPayload.nama_kategori || '';
    if (!kategori && rawPayload.id_kategori) {
      kategori = 'Bagian Instrumen';
    }
    if (!kategori) kategori = 'Umum';

    // 2. Normalize for_responden_group as string
    let for_responden_group = rawPayload.for_responden_group;
    if (Array.isArray(for_responden_group)) {
      for_responden_group = JSON.stringify(
        for_responden_group.map((r: any) =>
          typeof r === 'string' ? r : r?.jenis || r?.name || String(r)
        )
      );
    } else if (typeof for_responden_group === 'object' && for_responden_group !== null) {
      for_responden_group = JSON.stringify(for_responden_group);
    } else if (typeof for_responden_group !== 'string' || !for_responden_group.trim()) {
      for_responden_group = JSON.stringify(['SEMUA']);
    }

    // 3. Normalize opsi (backend expects `opsi`, not `opsi_pertanyaan`)
    const rawOptions = rawPayload.opsi || rawPayload.opsi_pertanyaan || [];
    const opsi = Array.isArray(rawOptions)
      ? rawOptions.map((o: any) => ({
          opsi_jawaban: o.opsi_jawaban || o.label || '',
          ada_catatan: Boolean(o.ada_catatan),
          keterangan_catatan: o.keterangan_catatan || '',
        }))
      : [];

    const payload = {
      ...rawPayload,
      kategori,
      for_responden_group,
      opsi,
    };
    delete payload.opsi_pertanyaan;

    const res = await fetch(`${BASE_API_URL}/instruments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = Array.isArray(errJson?.message)
        ? errJson.message.join(', ')
        : errJson?.message || 'Gagal menambahkan butir pertanyaan';
      throw new Error(errMsg);
    }
    const json = await res.json();
    return json.data;
  },

  updateQuestion: async (
    questionId: string,
    rawPayload: any
  ): Promise<IPertanyaan> => {
    const payload = { ...rawPayload };

    // Normalize for_responden_group if present
    if (payload.for_responden_group !== undefined) {
      if (Array.isArray(payload.for_responden_group)) {
        payload.for_responden_group = JSON.stringify(
          payload.for_responden_group.map((r: any) =>
            typeof r === 'string' ? r : r?.jenis || r?.name || String(r)
          )
        );
      } else if (typeof payload.for_responden_group === 'object' && payload.for_responden_group !== null) {
        payload.for_responden_group = JSON.stringify(payload.for_responden_group);
      } else if (typeof payload.for_responden_group !== 'string' || !payload.for_responden_group.trim()) {
        payload.for_responden_group = JSON.stringify(['SEMUA']);
      }
    }

    // Normalize opsi
    if (payload.opsi_pertanyaan && !payload.opsi) {
      payload.opsi = Array.isArray(payload.opsi_pertanyaan)
        ? payload.opsi_pertanyaan.map((o: any) => ({
            opsi_jawaban: o.opsi_jawaban || o.label || '',
            ada_catatan: Boolean(o.ada_catatan),
            keterangan_catatan: o.keterangan_catatan || '',
          }))
        : [];
      delete payload.opsi_pertanyaan;
    }

    const res = await fetch(`${BASE_API_URL}/instruments/${questionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = Array.isArray(errJson?.message)
        ? errJson.message.join(', ')
        : errJson?.message || 'Gagal memperbarui butir pertanyaan';
      throw new Error(errMsg);
    }
    const json = await res.json();
    return json.data;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    const res = await fetch(`${BASE_API_URL}/instruments/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus butir pertanyaan');
  },

  reorderQuestions: async (
    surveyId: string,
    items: { uuid: string; order_index: number }[]
  ): Promise<void> => {
    const res = await fetch(`${BASE_API_URL}/instruments/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_survey: surveyId, items }),
    });
    if (!res.ok) throw new Error('Gagal mengubah urutan butir pertanyaan');
  },

  // Categories
  createCategory: async (payload: {
    id_survey: string;
    nama_kategori: string;
    order_index?: number;
  }): Promise<IKategori> => {
    const res = await fetch(`${BASE_API_URL}/kategori`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal membuat kategori baru');
    const json = await res.json();
    return json.data;
  },

  updateCategory: async (
    categoryId: string,
    payload: { nama_kategori: string; order_index?: number }
  ): Promise<IKategori> => {
    const res = await fetch(`${BASE_API_URL}/kategori/${categoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal memperbarui kategori');
    const json = await res.json();
    return json.data;
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    const res = await fetch(`${BASE_API_URL}/kategori/${categoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus kategori');
  },

  createLogicRule: async (rule: {
    id_target_pertanyaan: string;
    id_source_pertanyaan: string;
    id_opsi_pemicu?: string | null;
    operator?: string;
    nilai_pemicu?: string;
  }): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/instruments/logic`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rule),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || 'Gagal menyimpan aturan logika percabangan');
    }
    const json = await res.json();
    return json.data;
  },

  deleteLogicRule: async (ruleId: string): Promise<void> => {
    const res = await fetch(`${BASE_API_URL}/instruments/logic/${ruleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus aturan logika percabangan');
  },
};

