import React from 'react';
import { BASE_API_URL, TOKEN_KEY_ADMIN } from '@/global';
import { get } from '@/helper/api-bridge';
import { getCookies } from '@/helper/server-cookie';
import Link from 'next/link';
import { ArrowLeft, Building2, GraduationCap, Briefcase, Award, Users, Search, FileText } from 'lucide-react';

interface SubResponden {
  uuid: string;
  id_instansi: string;
  nama_lengkap: string;
  sub_role: 'SISWA' | 'GURU' | 'KEPALA_SEKOLAH';
  nomor_identitas: string;
  kontak: string | null;
  createdAt: string;
  _count?: {
    hasil_survey: number;
  };
}

interface InstansiDetail {
  uuid: string;
  nama_instansi: string;
  kode_instansi: string;
  npsn?: string;
  alamat: string;
  kota: string;
  provinsi: string;
  tipe: string;
}

const getInstansiDetail = async (id: string): Promise<InstansiDetail | null> => {
  try {
    const url = `${BASE_API_URL}/instansi/${id}`;
    const token = await getCookies(TOKEN_KEY_ADMIN);
    const { data } = await get(url, token);
    if (data?.success && data?.data) {
      return data.data.instansi || data.data;
    }
    return null;
  } catch (error) {
    console.error('Error getInstansiDetail:', error);
    return null;
  }
};

const getSubRespondents = async (id: string): Promise<SubResponden[]> => {
  try {
    const url = `${BASE_API_URL}/instansi/${id}/responden-sekolah`;
    const token = await getCookies(TOKEN_KEY_ADMIN);
    const { data } = await get(url, token);
    if (data?.success && Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error getSubRespondents:', error);
    return [];
  }
};

type Props = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function DetailInstansiRespondenPage({ params }: Props) {
  const { uuid } = await params;
  const [instansi, respondents] = await Promise.all([
    getInstansiDetail(uuid),
    getSubRespondents(uuid),
  ]);

  const totalSiswa = respondents.filter((r) => r.sub_role === 'SISWA').length;
  const totalGuru = respondents.filter((r) => r.sub_role === 'GURU').length;
  const totalKepsek = respondents.filter((r) => r.sub_role === 'KEPALA_SEKOLAH').length;

  return (
    <div className="w-full space-y-6">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/instansi"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Detail Sub-Responden: {instansi?.nama_instansi || 'Sekolah'}
          </h1>
          <p className="text-xs text-slate-500">
            NPSN / Kode: {instansi?.kode_instansi || '-'} &bull; {instansi?.kota || '-'}, {instansi?.provinsi || '-'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-kemendikbud-blue flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Responden</span>
            <p className="text-2xl font-bold text-slate-900">{respondents.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Siswa (NIS)</span>
            <p className="text-2xl font-bold text-slate-900">{totalSiswa}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Guru (NUPTK)</span>
            <p className="text-2xl font-bold text-slate-900">{totalGuru}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Kepala Sekolah (NUPTK)</span>
            <p className="text-2xl font-bold text-slate-900">{totalKepsek}</p>
          </div>
        </div>
      </div>

      {/* Respondent Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">Daftar Partisipan / Responden Terdaftar</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {respondents.length}
            </span>
          </div>
        </div>

        {respondents.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Belum Ada Sub-Responden</p>
            <p className="text-xs text-slate-400 mt-1">
              Siswa, Guru, atau Kepala Sekolah dari sekolah ini belum mengisi survei publik.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Nama Responden</th>
                  <th className="px-5 py-3.5">Peran</th>
                  <th className="px-5 py-3.5">No. Identitas (NIS/NUPTK)</th>
                  <th className="px-5 py-3.5">Kontak / No. HP</th>
                  <th className="px-5 py-3.5">Waktu Pengisian</th>
                  <th className="px-5 py-3.5 text-center">Survei Diisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {respondents.map((r) => (
                  <tr key={r.uuid} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {r.nama_lengkap}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.sub_role === 'SISWA' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          <GraduationCap className="w-3.5 h-3.5" /> Siswa
                        </span>
                      )}
                      {r.sub_role === 'GURU' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
                          <Briefcase className="w-3.5 h-3.5" /> Guru
                        </span>
                      )}
                      {r.sub_role === 'KEPALA_SEKOLAH' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/50">
                          <Award className="w-3.5 h-3.5" /> Kepala Sekolah
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-800">
                      {r.nomor_identitas || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {r.kontak || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-kemendikbud-blue">
                        <FileText className="w-3 h-3" />
                        {r._count?.hasil_survey || 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

