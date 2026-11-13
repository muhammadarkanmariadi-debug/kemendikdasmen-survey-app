import { z } from 'zod';

export const SubRoleEnum = z.enum(['SISWA', 'GURU', 'KEPALA_SEKOLAH']);

export const PublicIdentitySchema = z.object({
  id_survey: z.string().min(1, 'ID Survei wajib disertakan'),
  id_instansi: z.string().min(1, 'Instansi/sekolah wajib dipilih'),
  sub_role: SubRoleEnum,
  nama_lengkap: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama lengkap maksimal 150 karakter'),
  nomor_identitas: z
    .string()
    .min(3, 'Nomor identitas (NIS/NUPTK) minimal 3 digit')
    .max(150, 'Nomor identitas maksimal 150 karakter'),
  kontak: z
    .string()
    .max(30, 'Nomor kontak maksimal 30 karakter')
    .optional()
    .or(z.literal('')),
});

export type PublicIdentityInput = z.infer<typeof PublicIdentitySchema>;

export const SingleAnswerSchema = z.object({
  id_pertanyaan: z.string().min(1, 'ID Pertanyaan wajib ada'),
  jawaban: z.any().refine((val) => {
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }, {
    message: 'Pertanyaan ini wajib dijawab',
  }),
  catatan: z.string().optional(),
});

export const PublicSubmissionPayloadSchema = z.object({
  id_survey: z.string().min(1),
  id_instansi: z.string().min(1),
  sub_role: SubRoleEnum,
  nama_lengkap: z.string().min(2),
  nomor_identitas: z.string().min(3),
  kontak: z.string().optional(),
  jawaban: z.array(
    z.object({
      id_pertanyaan: z.string(),
      jawaban: z.string(),
      catatan: z.string().optional(),
    })
  ),
});

export type PublicSubmissionPayload = z.infer<typeof PublicSubmissionPayloadSchema>;

export const PetugasFieldSubmissionSchema = z.object({
  id_survey: z.string().min(1, 'ID Survei wajib diisi'),
  id_instansi: z.string().min(1, 'Instansi wajib dipilih'),
  sub_role: SubRoleEnum,
  nama_lengkap: z.string().min(2, 'Nama responden wajib diisi'),
  nomor_identitas: z.string().min(3, 'Nomor identitas (NIS/NUPTK) wajib diisi'),
  tanda_tangan: z.string().min(1, 'Tanda tangan digital responden/petugas wajib dibubuhkan'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  akurasi_gps: z.number().optional(),
  waktu_lapangan: z.string().optional(),
  jawaban: z.array(
    z.object({
      id_pertanyaan: z.string(),
      jawaban: z.string(),
      catatan: z.string().optional(),
    })
  ),
});

export type PetugasFieldSubmission = z.infer<typeof PetugasFieldSubmissionSchema>;

