import { IJenisResponden, ISurvei } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import AddSurvey from "./add"
import Pagination from "@/components/Paginate"
import EditSurvey from "./edit"
import DropSurvey from "./drop"
import Search from "./search"
import Link from "next/link"
import { ClipboardList, ExternalLink, Sliders, CheckCircle2, XCircle } from "lucide-react"

const getSurvei = async (page: number, quantity: number, search: string): Promise<{ surveys: ISurvei[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/surveys?page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            surveys: [...data.data],
            counts: data.meta.totalData
        }
        return { surveys: [], counts: 0 }
    } catch (error) {
        console.error(error);
        return { surveys: [], counts: 0 }
    }
}

const getJenisResponden = async (): Promise<IJenisResponden[]> => {
    try {
        const url = `${BASE_API_URL}/jenis-responden`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.error(error);
        return []
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
    const { surveys, counts } = await getSurvei(page, quantity, search)
    const jenis = await getJenisResponden()

    return (
        <div className="w-full space-y-5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Manajemen Kuesioner & Instrumen</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola formulir survei digital, drag-and-drop butir instrumen, dan publikasikan ke sekolah.
                    </p>
                </div>
                <div className="shrink-0">
                    <AddSurvey jenis={jenis} />
                </div>
            </div>

            {/* Search Box Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <Search search={search} />
            </div>

            {/* Survey Cards Table */}
            {surveys.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Kuesioner Belum Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {search ? "Tidak ditemukan kuesioner yang cocok dengan pencarian." : "Belum ada kuesioner yang dibuat. Klik tombol Tambah Kuesioner untuk memulai."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Kuesioner</th>
                                    <th className="px-5 py-3.5">Sasaran Responden</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Aksi & Pengaturan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {surveys.map((survey) => (
                                    <tr key={survey.uuid} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-900">{survey.nama_survey}</div>
                                            {survey.deskripsi && (
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                    {survey.deskripsi}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {survey.responden_group.map((r, i) => (
                                                    <span
                                                        key={`res-${i}`}
                                                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0B5C9E] border border-blue-200/50"
                                                    >
                                                        {r.jenis}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {survey.status ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                    <XCircle className="w-3.5 h-3.5" /> Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                {/* Edit Form Canvas Builder */}
                                                <Link href={`/admin/kuesioner/${survey.uuid}`}>
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1.5 rounded-xl bg-[#0B5C9E] hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                        title="Buka Editor Google Forms Drag-and-Drop"
                                                    >
                                                        <Sliders className="w-3.5 h-3.5" />
                                                        <span>Edit Form</span>
                                                    </button>
                                                </Link>

                                                {/* Public Form Preview */}
                                                <Link href={`/form/${survey.public_link || survey.uuid}`} target="_blank">
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                        title="Lihat Tampilan Publik Responden"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Form Publik</span>
                                                    </button>
                                                </Link>

                                                <EditSurvey selectedSurvey={survey} jenis={jenis} />
                                                <DropSurvey selectedSurvey={survey} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                            url={`/admin/kuisioner?`}
                            keyword={search}
                            isConcatQuery={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export const dynamic = "force-dynamic";
export default KuesionerPage
