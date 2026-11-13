import Link from "next/link";
import { Building2, ClipboardList, History, ArrowRight, Award, GraduationCap } from "lucide-react";

export default function InstansiDashboardPage() {
  return (
    <div className="w-full space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 inline-block mb-3">
            Portal Satuan Pendidikan (NPSN)
          </span>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Dashboard Penjaminan Mutu Satuan Pendidikan
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Selamat datang di portal kuesioner mandiri sekolah. Lengkapi instrumen evaluasi pendidikan yang ditugaskan oleh Direktorat SMK kepada sekolah Anda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/instansi/kuesioner"
              className="px-5 py-2.5 rounded-xl bg-[#0B5C9E] text-white font-semibold text-xs hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Isi Kuesioner Sekolah</span>
            </Link>
            <Link
              href="/instansi/history"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              <span>Riwayat Pengisian</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Respondent Categories Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Responden Siswa</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Pengisian kuesioner evaluasi dan kepuasan peserta didik terverifikasi dengan NIS / NISN.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Responden Guru</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Pengisian instrumen kurikulum dan pembelajaran terverifikasi dengan NUPTK resmi pendidik.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Responden Kepala Sekolah</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Pengisian instrumen manajerial dan kepemimpinan sekolah terverifikasi dengan NUPTK kepsek.
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
