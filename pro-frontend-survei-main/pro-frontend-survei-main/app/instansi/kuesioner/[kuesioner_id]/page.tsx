import { IAssignment, IJenisResponden, IKategori, ISurvei, IUser } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_INSTANSI } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import { ModernFieldSurveyRunner } from "@/components/field-mode/ModernFieldSurveyRunner"

const getSurveiById = async (id: string): Promise<ISurvei | null> => {
    try {
        const url = `${BASE_API_URL}/surveys/${id}`
        const token = await getCookies(TOKEN_KEY_INSTANSI)
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
        const token = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}

const getAssignment = async (id: string): Promise<IAssignment[]> => {
    try {
        const url = `${BASE_API_URL}/assignments?id_petugas=${id}`
        const TOKEN = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, TOKEN)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getJenisResponden = async (): Promise<IJenisResponden[]> => {
    try {
        const url = `${BASE_API_URL}/jenis-responden`
        const token = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}

const myProfile = async (): Promise<IUser | null> => {
    try {
        const url = `${BASE_API_URL}/instansi/me`
        const TOKEN = await getCookies(TOKEN_KEY_INSTANSI)
        const { data } = await get(url, TOKEN)
        if (data?.success == true) return { ...data.data }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
}


type Props = {
    params: Promise<{
        kuesioner_id: string
    }>
}
const KuesionerPage = async (prop: Props) => {
    const { kuesioner_id } = await prop.params
    const survey = await getSurveiById(kuesioner_id)
    const detailSurveys = await getDetailSurvey(kuesioner_id)
    const profile = await myProfile()
    const respondent = {
        uuid: profile?.uuid || ``, 
        nama_instansi: profile?.instansi?.nama_instansi || ``, 
        id_instansi: profile?.instansi?.uuid || ``, 
        id_jenis_responden: profile?.instansi?.id_jenis_responden || ``, 
        tipe: profile?.instansi?.tipe || ``
    }
    // const assignment = await getAssignment(profile?.uuid || ``)
    // console.log(assignment)
    // const respondent = assignment.find(it => it.id_survey === kuesioner_id)?.instansi || []
    const jenisResponden = await getJenisResponden()

    // let respondent = respondents.flatMap(it => it.responden)

    // if (survey) {
    //     const { jenis_responden } = survey
    //     if (jenis_responden === `SEKOLAH`) {
    //         respondent = respondent.filter(it => it.jenis_responden.toUpperCase() === `SEKOLAH`)
    //     }
    //     if (jenis_responden === `DINAS`) {
    //         respondent = respondent.filter(it => it.jenis_responden.toUpperCase() === `DINAS`)
    //     }
    // }

    return (
        <div className="w-full">
            {survey == null ? (
                <div className="w-full max-w-xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
                    <h3 className="text-base font-bold text-rose-700">Data Kuesioner Tidak Tersedia</h3>
                    <p className="text-xs text-rose-600 mt-1">Formulir survei tidak ditemukan atau belum dibuka untuk instansi ini.</p>
                </div>
            ) : (
                <ModernFieldSurveyRunner
                    survey_id={survey.uuid}
                    survey_name={survey.nama_survey}
                    categories={detailSurveys}
                    respondents={[respondent]}
                    jenisResponden={jenisResponden}
                    redirectBase="/instansi/kuesioner"
                    tokenKey={TOKEN_KEY_INSTANSI}
                />
            )}
        </div>
    )
}
export const dynamic = "force-dynamic";
export default KuesionerPage