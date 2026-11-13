import { BASE_API_URL } from "@/global"
import { IInstansi, IJenisResponden, ISurvei } from "../types"
import { get } from "@/helper/api-bridge"
import Image from "next/image"
import Form from "./form"
import { Award, CheckCircle2, ShieldCheck, FileCheck2 } from "lucide-react"

const getPublicSurveys = async (): Promise<ISurvei[]> => {
    try {
        const url = `${BASE_API_URL}/surveys/public-list`
        const { data } = await get(url, "")
        if (data?.success === true && data?.data) return [...data.data]
        return []
    } catch (error) {
        console.error("Error getPublicSurveys:", error);
        return []
    }
}

const getInstansi = async (): Promise<IInstansi[]> => {
    try {
        const url = `${BASE_API_URL}/instansi`
        const { data } = await get(url, "")
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.error("Error getInstansi:", error);
        return []
    }
}

const getJenisResponden = async (): Promise<IJenisResponden[]> => {
    try {
        const url = `${BASE_API_URL}/jenis-responden`
        const { data } = await get(url, "")
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.error("Error getJenisResponden:", error);
        return []
    }
}

const PublicFrontPage = async () => {
    const [surveys, instansi, jenis] = await Promise.all([
        getPublicSurveys(),
        getInstansi(),
        getJenisResponden()
    ]);

    return (
        <div className="w-screen min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#FAF4ED] relative overflow-hidden">
            {/* Warm Ambient Decorative Shapes in Background */}
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#FFE8D1]/60 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E2EEF8]/60 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

            {/* Main Unified Professional Card */}
            <div className="relative z-10 w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-amber-950/5 border border-amber-100/60 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-stretch gap-8 md:gap-12 min-h-[580px]">
                {/* Left Section: Official Kemendikbudristek Branding Panel */}
                <div className="w-full md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
                    <div>
                        {/* Top Branding Logo */}
                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                                <Image
                                    src="/images/logo_jenama_primer.png"
                                    width={48}
                                    height={48}
                                    alt="Kemendikbud"
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E] block">
                                    Kementerian Pendidikan Dasar dan Menengah
                                </span>
                                <h2 className="text-base font-extrabold text-slate-800 leading-tight">Direktorat SMK</h2>
                            </div>
                        </div>

                        {/* Portal Info */}
                        <div className="mt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B5C9E] text-xs font-semibold mb-3 border border-blue-100">
                                <FileCheck2 className="w-3.5 h-3.5 text-[#0B5C9E]" />
                                <span>Portal Kuesioner Publik 2026</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                Instrumen Supervisi Bantuan Sertifikasi Kompetensi
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                                Pengisian instrumen resmi evaluasi pelaksanaan Bantuan Pemerintah Sertifikasi Kompetensi (Serkom) Murid SMK Tahun 2026.
                            </p>
                        </div>

                        {/* Panduan Singkat */}
                        <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Petunjuk Pengisian:
                            </h4>
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0B5C9E] flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                                <span>Pilih instrumen yang ditugaskan (Supervisi Sekolah atau Supervisi Murid).</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0B5C9E] flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                                <span>Tentukan satuan pendidikan (SMK) dan peran Anda sebagai responden.</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-[#0B5C9E] flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                                <span>Jawab setiap butir instrumen secara objektif sesuai kondisi nyata di lapangan.</span>
                            </div>
                        </div>
                    </div>

                    {/* Left footer note */}
                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>&copy; {new Date().getFullYear()} Direktorat SMK</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> Resmi Kemendikbudristek
                        </span>
                    </div>
                </div>

                {/* Right Interactive Form Area */}
                <div className="w-full md:w-7/12 flex flex-col justify-between">
                    <Form surveys={surveys} instansi={instansi} jenis={jenis} />
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic';
export default PublicFrontPage
