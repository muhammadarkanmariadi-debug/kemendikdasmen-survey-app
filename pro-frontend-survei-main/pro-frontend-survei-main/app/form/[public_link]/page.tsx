import React from 'react';
import { BASE_API_URL } from '@/global';
import { get } from '@/helper/api-bridge';
import { PublicSurveyRunner } from '@/components/survey-runner/PublicSurveyRunner';
import { ISurvei } from '@/app/types';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{
    public_link: string;
  }>;
};

const getPublicSurvey = async (public_link: string): Promise<ISurvei | null> => {
  try {
    const url = `${BASE_API_URL}/surveys/public/${public_link}`;
    const { data } = await get(url, '');
    if (data?.success === true && data?.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching public survey:', error);
    return null;
  }
};

const getAssignedInstitutions = async (public_link: string) => {
  try {
    const url = `${BASE_API_URL}/surveys/public/${public_link}/assigned-institutions`;
    const { data } = await get(url, '');
    if (data?.success === true && data?.data?.institutions) {
      return data.data.institutions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching assigned institutions:', error);
    return [];
  }
};

export default async function PublicFormPage({ params }: Props) {
  const { public_link } = await params;

  const [survey, institutions] = await Promise.all([
    getPublicSurvey(public_link),
    getAssignedInstitutions(public_link),
  ]);

  if (!survey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Kuesioner Tidak Ditemukan</h2>
          <p className="text-sm text-slate-600 mb-6">
            Kuesioner dengan tautan ini tidak tersedia, sudah ditutup, atau tautan salah. Silakan hubungi admin sekolah atau petugas terkait.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <PublicSurveyRunner survey={survey} institutions={institutions} />;
}

export const dynamic = 'force-dynamic';

