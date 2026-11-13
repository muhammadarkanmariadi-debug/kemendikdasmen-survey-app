import { HasilSurvey, ISurvei } from "@/app/types"
import Pagination from "@/components/Paginate"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import FilterSurvey from "./filterSurvey"
import Link from "next/link"
import Search from "./search"
import { FileText, ArrowRight, UserCheck, Calendar, Building2 } from "lucide-react"

const getSurvei = async (): Promise<ISurvei[]> => {
    try {
        const url = `${BASE_API_URL}/surveys`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.error(error);
        return []
    }
}

const getSubmission = async (page: number, quantity: number, search: string, id_survey: string): Promise<{ submissions: HasilSurvey[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/submission/all?page=${page}&quantity=${quantity}&search=${search}${id_survey === `` ? `` : `&id_survey=${id_survey}`}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            submissions: [...data?.data?.hasil_surveys],
            counts: data?.data?.meta?.total
        }
        return { submissions: [], counts: 0 }
    } catch (error) {
        console.error(error);
        return { submissions: [], counts: 0 }
    }
}

type Props = {
    searchParams: Promise<{
        page?: number
        quantity?: number
        id_survey?: string
        search?: string
    }>
}

const HistoryKuesioner = async (prop: Props) => {
    const { page, quantity, id_survey, search } = await prop.searchParams
    const { counts, submissions } = await getSubmission(page ?? 1, quantity ?? 50, search ?? ``, id_survey ?? ``)
    const surveys = await getSurvei()

    return (
        <div className="w-full space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900">Hasil & Riwayat Pengisian Kuesioner</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Daftar respon jawaban yang masuk dari wawancara lapangan maupun pengisian instansi.
                </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Filter Berdasarkan Kuesioner
                    </label>
                    <FilterSurvey survey={id_survey ?? ``} surveys={surveys} url={`/admin/hasil?page=1&quantity=${quantity ?? 50}`} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pencarian Nama Responden / Sekolah
                    </label>
                    <Search search={search || ""} />
                </div>
            </div>

            {/* Submissions List */}
            {submissions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Histori Pengisian Belum Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Belum ada responden yang mengisi kuesioner dengan kriteria filter saat ini.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {submissions.map((submission) => (
                            <Link
                                key={submission.uuid}
                                href={`/admin/hasil/${submission.uuid}`}
                                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0B5C9E] group-hover:bg-[#0B5C9E] group-hover:text-white transition-all flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B5C9E] transition-colors leading-snug">
                                            {submission.survey.nama_survey}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span className="font-semibold text-slate-800">
                                                Responden: {submission.responden?.nama || "-"}
                                            </span>
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                {submission.responden?.instansi?.nama_instansi || submission.responden?.instansi?.kode_instansi || "-"}
                                            </span>
                                            <span>&bull;</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-[#0B5C9E] border border-blue-200/50">
                                                {submission.tipe_responden}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <div className="text-left md:text-right">
                                        <span className="text-[11px] text-slate-400 block">Petugas Lapangan</span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {submission.user?.nama_user || "Publik / Mandiri"}
                                        </span>
                                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(submission.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0B5C9E] group-hover:text-white transition-all flex items-center justify-center text-slate-400">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-100">
                        <Pagination
                            colorActive="bg-[#0B5C9E]"
                            colorPage="bg-slate-100 text-slate-700 hover:bg-slate-200"
                            count={counts}
                            perPage={Number(quantity) || 50}
                            currentPage={Number(page) || 1}
                            id="pagination-1"
                            optionPerPage={[10, 50, 100, 500, 1000]}
                            url={`/admin/hasil?`}
                            keyword={""}
                            isConcatQuery={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export const dynamic = 'force-dynamic';
export default HistoryKuesioner;
