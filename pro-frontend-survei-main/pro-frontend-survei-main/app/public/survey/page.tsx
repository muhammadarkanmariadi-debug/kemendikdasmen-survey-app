import { IInstansi, IKategori, ISurvei, IUser } from "@/app/types"
import { BASE_API_URL } from "@/global"
import { get } from "@/helper/api-bridge"
import FormSubmission from "./form"

type Props = {
    searchParams: Promise<{
        id_survey?: string,
        id_jenis_responden?: string,
        id_instansi?: string
    }>
}

const getSurveiById = async (id: string): Promise<ISurvei | null> => {
    try {
        const url = `${BASE_API_URL}/surveys/${id}`
        const { data } = await get(url, "")
        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}

const getInstansiById = async (id: string): Promise<IUser | null> => {
    try {
        const url = `${BASE_API_URL}/instansi/${id}`
        const { data } = await get(url, "")
        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}

const getDetailSurvey = async (id: string): Promise<IKategori[]> => {
    try {
        const url = `${BASE_API_URL}/instruments/all?id_survey=${id}`
        const { data } = await get(url, "")
        if (data?.success == true) return [...data?.data]
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}

const SurveyPage = async (props: Props) => {
    const { id_instansi, id_survey, id_jenis_responden } = await props.searchParams
    const survey = await getSurveiById(id_survey || "")
    if (survey == null) {
        return (
            <div className="w-full p-3 bg-sky-50 border border-primary rounded-md">
                Survey tidak ditemukan
            </div>
        )
    }
    const instansi = await getInstansiById(id_instansi || "")
    if (instansi == null) {
        return (
            <div className="w-full p-3 bg-sky-50 border border-primary rounded-md">
                Instansi tidak ditemukan
            </div>
        )
    }
    const detailSurveys = await getDetailSurvey(survey.uuid)
    return (
        <div className="bg-slate-50 w-full p-4">
            <h1 className="font-semibold text-black text-lg">Kuesioner {survey.nama_survey}</h1>
            <div className="my-4 text-black">
                <FormSubmission
                    id_jenis_responden={id_jenis_responden || ""} categories={detailSurveys}
                    survey_id={survey.uuid} id_responden={id_instansi || ""} nama_instansi={instansi.instansi?.nama_instansi || ""} />
            </div>
        </div>
    )

}
export const dynamic = 'force-dynamic';
export default SurveyPage