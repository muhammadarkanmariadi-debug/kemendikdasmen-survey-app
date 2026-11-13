import { HasilSurvey } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import DragAndDropUploader from "./form"

const getSubmissionById = async (id: string): Promise<HasilSurvey | null> => {
    try {
        const url = `${BASE_API_URL}/submission/${id}`
        const token = await getCookies(TOKEN_KEY_PETUGAS)
        const { data } = await get(url, token)
        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}


type Props = {
    searchParams: Promise<{
        submission_id: string
    }>
}
const SubmisionDocuments = async (prop: Props) => {
    const { submission_id } = await prop.searchParams
    const submision = await getSubmissionById(submission_id)
    return (
        <div className="w-full min-h-screen flex justify-center items-center p-5">
            <div className="w-5/6 md:w-1/2">
                {
                    submision == null ?
                        <div className="w-full border-2 border-primary bg-sky-100 text-primary p-3 rounded-lg">
                            Data isian kuesioner tidak tersedia
                        </div> :
                        <div>
                            <DragAndDropUploader submission_id={submission_id} survey_id={submision.id_survey} />
                        </div>
                }
            </div>
        </div>
    )
}
export const dynamic = "force-dynamic";
export default SubmisionDocuments