import { BASE_API_URL } from "@/global"
import { IInstansi, IJenisResponden, ISurvei } from "../types"
import { get } from "@/helper/api-bridge"
import Image from "next/image"
import Form from "./form"

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
        <div className="w-dvw min-h-dvh flex flex-col md:flex-row bg-slate-50">
            {/* Left Branding Panel */}
            <div className="w-full md:w-5/12 bg-[#0B5C9E] text-white flex flex-col justify-between p-8 md:p-14 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm inline-block">
                        <Image src="/images/logo_jenama_primer.png" width={56} height={56} alt="Kemendikbud Logo" className="object-contain" />
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-widest text-blue-100 font-bold">Kementerian Pendidikan Dasar dan Menengah</span>
                        <h2 className="text-lg font-bold text-white">Direktorat SMK</h2>
                    </div>
                </div>

                <div className="relative z-10 my-auto py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-4 border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Portal Kuesioner Publik
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                        Instrumen Digital Penjaminan Mutu & Peserta Didik
                    </h1>
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                        Pengisian kuesioner tanpa perlu login kredensial. Cukup pilih instansi/sekolah yang dituju, tentukan peran Anda, dan isi instrumen secara terstruktur.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-white/60 border-t border-white/10 pt-4">
                    &copy; {new Date().getFullYear()} Direktorat SMK &bull; Hak Cipta Dilindungi
                </div>
            </div>

            {/* Right Interactive Form Area */}
            <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
                <div className="w-full max-w-xl">
                    <Form surveys={surveys} instansi={instansi} jenis={jenis} />
                </div>
            </div>
        </div>
    )
}
export const dynamic = 'force-dynamic';
export default PublicFrontPage
