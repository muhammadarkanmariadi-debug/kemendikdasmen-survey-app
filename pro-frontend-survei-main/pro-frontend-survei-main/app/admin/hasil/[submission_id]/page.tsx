import { HasilSurvey, IKategori, IResponden, ISurvei } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import { ModernSubmissionDetailView } from "@/components/submission-view/ModernSubmissionDetailView"
import Link from "next/link"
import { ArrowLeft, Printer, FileText } from "lucide-react"
import DropSubmission from "../drop"

const getSubmissionById = async (id: string): Promise<HasilSurvey | null> => {
    try {
        const url = `${BASE_API_URL}/submission/${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)

        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.error(error);
        return null
    }
}

const getDetailSurvey = async (id: string): Promise<IKategori[]> => {
    try {
        const url = `${BASE_API_URL}/instruments/all?id_survey=${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        return []
    } catch (error) {
        console.error(error);
        return []
    }
}

const getResponden = async (): Promise<IResponden[]> => {
    try {
        const url = `${BASE_API_URL}/responden`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.error(error);
        return []
    }
}

const getSurveiById = async (id: string): Promise<ISurvei | null> => {
    try {
        const url = `${BASE_API_URL}/surveys/${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.error(error);
        return null
    }
}

type Props = {
    params: Promise<{
        submission_id: string
    }>
}

const DetailSubmission = async (prop: Props) => {
    const { submission_id } = await prop.params
    const submision = await getSubmissionById(submission_id)

    if (submision == null) {
        return (
            <div className="w-full max-w-xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
                <h3 className="text-base font-bold text-rose-700">Data Respon Tidak Ditemukan</h3>
                <p className="text-xs text-rose-600 mt-1">Data isian kuesioner tidak tersedia atau telah dihapus.</p>
                <Link
                    href="/admin/hasil"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </Link>
            </div>
        )
    }

    const detailSurveys = await getDetailSurvey(submision.id_survey)
    const respondents = await getResponden()
    const survey = await getSurveiById(submision.id_survey)

    let answer: {
        [key: string]: {
            jawaban: string | { id_opsi_jawaban: string, text: string } | { id_opsi_jawaban: string, text: string }[],
            catatan: string,
            keterangan_catatan?: string
        }
    } = {}

    const allOption = detailSurveys
        .flatMap(it => it.pertanyaan)
        .flatMap(it => it.opsi_pertanyaan)

    for (let i = 0; i < submision.jawaban_survey.length; i++) {
        let keterangan: string = ""
        if (typeof submision.jawaban_survey[i].jawaban === "object") {
            const option = submision.jawaban_survey[i].jawaban as { id_opsi_jawaban: string, text: string }
            const selectedOption = allOption.find(it => it.uuid === option.id_opsi_jawaban)
            if (selectedOption && selectedOption.ada_catatan == true) keterangan = selectedOption.keterangan_catatan

        }
        answer = {
            ...answer,
            [submision.jawaban_survey[i].id_pertanyaan]: {
                jawaban: submision.jawaban_survey[i].jawaban,
                catatan: submision.jawaban_survey[i].catatan,
                keterangan_catatan: keterangan
            }
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/hasil"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                            Detail Lembar Jawaban Responden
                        </span>
                        <h1 className="text-xl font-bold text-slate-900 mt-1">
                            {survey?.nama_survey || "Kuesioner"}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropSubmission selectedSubmission={submision} />
                </div>
            </div>

            {/* Modern Inspection View */}
            <ModernSubmissionDetailView
                submission={submision}
                categories={detailSurveys}
                respondents={respondents}
                id_jenis_responden={submision.responden.id_jenis_responden}
                respondent_id={submision.id_responden}
                documents={submision.dokumen_survey}
                documentations={submision.dokumentasi_survey}
                answer={answer}
                backUrl="/admin/hasil"
            />
        </div>
    )
}

export const dynamic = 'force-dynamic';
export default DetailSubmission
