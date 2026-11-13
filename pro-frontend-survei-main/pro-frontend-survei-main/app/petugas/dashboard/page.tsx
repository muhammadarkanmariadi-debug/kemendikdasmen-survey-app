import Link from "next/link";
import { PenSquare, MapPin, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";

export default function PetugasDashboardPage() {
  return (
    <div className="w-full space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0B5C9E] border border-blue-200 inline-block mb-3">
            Portal Wawancara Lapangan
          </span>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Selamat Datang, Petugas Survei
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Gunakan aplikasi ini untuk mencatat hasil wawancara langsung dengan responden di sekolah binaan yang ditugaskan kepada Anda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/petugas/kuesioner"
              className="px-5 py-2.5 rounded-xl bg-[#0B5C9E] text-white font-semibold text-xs hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>Buka Penugasan Kuesioner</span>
            </Link>
            <Link
              href="/petugas/history"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <span>Riwayat Pengisian</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Field Mode Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B5C9E] flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">1. Geotagging Lokasi GPS</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Pastikan fitur lokasi browser diaktifkan agar koordinat sekolah otomatis terekam saat wawancara.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">2. Validasi Responden</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Periksa kembali nomor identitas (NIS untuk siswa, NUPTK untuk guru & kepala sekolah).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">3. Tanda Tangan Digital</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Mintakan tanda tangan digital responden pada layar perangkat sebagai bukti keabsahan pengisian.
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
