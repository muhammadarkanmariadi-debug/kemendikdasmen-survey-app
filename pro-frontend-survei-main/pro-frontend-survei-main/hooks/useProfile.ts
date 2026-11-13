import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileApiService } from '@/services/profile.service';
import { IUser } from '@/app/types';
import { toast } from 'react-toastify';

export const PROFILE_QUERY_KEY = ['admin', 'profile'] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => ProfileApiService.getProfile(),
    staleTime: 1000 * 60 * 10, // 10 menit
  });
}

export function useProfileMutations() {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { nama_user: string; username: string }) =>
      ProfileApiService.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated);
      toast.success('Profil administrator berhasil diperbarui');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal memperbarui profil');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) => ProfileApiService.resetPassword(password),
    onSuccess: () => {
      toast.success('Kata sandi berhasil diatur ulang');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal mengubah kata sandi');
    },
  });

  return {
    updateProfile: updateProfileMutation,
    resetPassword: resetPasswordMutation,
  };
}

