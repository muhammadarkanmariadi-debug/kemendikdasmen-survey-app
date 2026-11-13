import { IKategori, ISurvei } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import { SurveyBuilderView } from "@/components/survey-builder/SurveyBuilderView"

const getSurveiById = async (id: string): Promise<ISurvei | null> => {
    try {
        const url = `${BASE_API_URL}/surveys/${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
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
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}

type Props = {
    params: Promise<{
        kuesioner_id: string
    }>
}

const DetailKuesionerPage = async (prop: Props) => {
    const { kuesioner_id } = await prop.params
    const survey = await getSurveiById(kuesioner_id)
    const detailSurveys = await getDetailSurvey(kuesioner_id)

    if (!survey) {
        return (
            <div className="w-full max-w-xl mx-auto my-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <h3 className="text-base font-bold text-rose-700">Kuesioner Tidak Ditemukan</h3>
                <p className="text-xs text-rose-600 mt-1">Data kuesioner tidak tersedia atau telah dihapus.</p>
            </div>
        )
    }

    return (
        <SurveyBuilderView survey={survey} detailSurveys={detailSurveys} />
    )
}

export const dynamic = "force-dynamic";
export default DetailKuesionerPage;
