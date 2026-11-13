import { ISurvei } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import Pagination from "@/components/Paginate"
import Link from "next/link"
import { ClipboardList, PenSquare, ArrowRight } from "lucide-react"

const getAvailableSurvei = async (page: number, quantity: number, search: string): Promise<{ surveys: ISurvei[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/submission/avalaible?page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_PETUGAS)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            surveys: [...data.data.surveys],
            counts: data.data.meta.total
        }
        return { surveys: [], counts: 0 }
    } catch (error) {
        console.error(error);
        return { surveys: [], counts: 0 }
    }
}

type Props = {
    searchParams: Promise<{
        page?: number
        quantity?: number
        search?: string
    }>
}

const KuesionerPage = async (prop: Props) => {
    const page = (await prop.searchParams).page ?? 1
    const quantity = (await prop.searchParams).quantity ?? 50
    const search = (await prop.searchParams).search ?? ""
    const { surveys, counts } = await getAvailableSurvei(page, quantity, search)

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900">Daftar Penugasan Kuesioner</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Pilih kuesioner yang ditugaskan kepada Anda untuk memulai wawancara dengan sekolah binaan.
                </p>
            </div>

            {/* Surveys Grid / List */}
            {surveys.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Tidak Ada Kuesioner Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Saat ini belum ada kuesioner yang ditugaskan kepada akun petugas Anda.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {surveys.map((survey) => (
                        <div
                            key={survey.uuid}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                        PENUGASAN RESMI
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    {survey.nama_survey}
                                </h3>
                                {survey.deskripsi && (
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                        {survey.deskripsi}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-medium">Mode Wawancara Lapangan</span>
                                <Link href={`/petugas/kuesioner/${survey.uuid}`}>
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-xl bg-[#0B5C9E] hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                    >
                                        <PenSquare className="w-3.5 h-3.5" />
                                        <span>Isi Kuesioner</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {surveys.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <Pagination
                        colorActive="bg-[#0B5C9E]"
                        colorPage="bg-slate-100 text-slate-700 hover:bg-slate-200"
                        count={counts}
                        perPage={Number(quantity) || 50}
                        currentPage={Number(page) || 1}
                        id="pagination-1"
                        optionPerPage={[10, 50, 100, 500, 1000]}
                        url={`/petugas/kuesioner?`}
                        keyword={search}
                        isConcatQuery={true}
                    />
                </div>
            )}
        </div>
    )
}

export const dynamic = "force-dynamic";
export default KuesionerPage;
