import { HasilSurvey, IKategori, IResponden, ISurvei } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_INSTANSI } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import { ModernSubmissionDetailView } from "@/components/submission-view/ModernSubmissionDetailView"
import Link from "next/link"

const getSubmissionById = async (id: string): Promise<HasilSurvey | null> => {
    try {
        const url = `${BASE_API_URL}/submission/${id}`
        const token = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, token)

        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
}

const getDetailSurvey = async (id: string): Promise<IKategori[]> => {
    try {
        const url = `${BASE_API_URL}/instruments/all?id_survey=${id}`
        const token = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getResponden = async (): Promise<IResponden[]> => {
    try {
        const url = `${BASE_API_URL}/responden`
        const token = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getSurveiById = async (id: string): Promise<ISurvei | null> => {
    try {
        const url = `${BASE_API_URL}/surveys/${id}`
        const token = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, token)
        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.log(error)
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
            <div className="w-full space-y-4">
                <Link
                    href="/instansi/history"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0B5C9E] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Riwayat
                </Link>
                <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-800">Data Isian Tidak Ditemukan</h3>
                    <p className="text-sm text-slate-500 mt-1">Data isian kuesioner tidak tersedia atau telah dihapus.</p>
                </div>
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
            <ModernSubmissionDetailView
                submission={submision}
                categories={detailSurveys}
                respondents={respondents}
                id_jenis_responden={submision.responden.id_jenis_responden}
                respondent_id={submision.id_responden}
                documents={submision.dokumen_survey}
                documentations={submision.dokumentasi_survey}
                answer={answer}
                backUrl="/instansi/history"
            />
        </div>
    )
}

export const dynamic = 'force-dynamic'
export default DetailSubmission
