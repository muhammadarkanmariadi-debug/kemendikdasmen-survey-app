import { BASE_API_URL } from '@/global';
import { getCookie } from '@/helper/client-cookie';
import { TOKEN_KEY_ADMIN } from '@/global';
import { IUser } from '@/app/types';

const getAuthHeaders = () => {
  const token = getCookie(TOKEN_KEY_ADMIN) || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const ProfileApiService = {
  getProfile: async (): Promise<IUser> => {
    const res = await fetch(`${BASE_API_URL}/admins/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal memuat profil pengguna');
    const json = await res.json();
    return json.data;
  },

  updateProfile: async (payload: { nama_user: string; username: string }): Promise<IUser> => {
    const res = await fetch(`${BASE_API_URL}/admins/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal memperbarui profil pengguna');
    const json = await res.json();
    return json.data;
  },

  resetPassword: async (password: string): Promise<void> => {
    const res = await fetch(`${BASE_API_URL}/admins/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Gagal mengubah password');
  },
};

