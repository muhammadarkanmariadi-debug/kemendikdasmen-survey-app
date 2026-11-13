import { HasilSurvey, ISurvei } from "@/app/types"
import Pagination from "@/components/Paginate"
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import FilterSurvey from "./filterSurvey"
import Link from "next/link"
import Search from "./search"

const getSurvei = async (): Promise<ISurvei[]> => {
    try {
        const url = `${BASE_API_URL}/surveys`
        const token = await getCookies(TOKEN_KEY_PETUGAS)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getSubmission = async (page: number, quantity: number, search: string, id_survey: string): Promise<{ submissions: HasilSurvey[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/submission?page=${page}&quantity=${quantity}&search=${search}${id_survey === `` ? `` : `&id_survey=${id_survey}`}`
        const token = await getCookies(TOKEN_KEY_PETUGAS)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            submissions: [...data?.data?.hasil_surveys],
            counts: data?.data?.meta?.total
        }
        return { submissions: [], counts: 0 }
    } catch (error) {
        console.log(error)
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

const getRoleBadgeStyle = (tipe?: string) => {
    const lower = (tipe || "").toLowerCase()
    if (lower.includes("siswa")) {
        return "bg-sky-50 text-sky-700 border-sky-200"
    } else if (lower.includes("guru")) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
    } else if (lower.includes("kepala") || lower.includes("kepsek")) {
        return "bg-amber-50 text-amber-700 border-amber-200"
    } else if (lower.includes("petugas")) {
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
    }
    return "bg-slate-100 text-slate-700 border-slate-200"
}

const HistoryKuesioner = async (prop: Props) => {
    const { page, quantity, id_survey, search } = await prop.searchParams
    const { counts, submissions } = await getSubmission(page ?? 1, quantity ?? 50, search ?? ``, id_survey ?? ``)
    const surveys = await getSurvei()

    return (
        <div className="w-full space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B5C9E]" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
                            Petugas Lapangan
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                            Riwayat Supervisi Lapangan
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                            Daftar kuesioner dan data responden yang telah Anda himpun selama penugasan lapangan.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-right">
                            <span className="text-xs text-slate-400 font-semibold block">Total Dihimpun</span>
                            <span className="text-xl font-bold text-indigo-600">{counts}</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Pilih Kuesioner
                        </label>
                        <FilterSurvey survey={id_survey ?? ``} surveys={surveys} url={`/petugas/history?page=1&quantity=${quantity ?? 50}`} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            Pencarian Responden / Instansi
                        </label>
                        <Search search={search || ""} />
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            {submissions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Riwayat Supervisi</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        {search ? "Tidak ditemukan data yang sesuai dengan kata kunci pencarian Anda." : "Belum ada kuesioner yang berhasil dihimpun untuk filter ini."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {submissions.map((submission, index) => {
                        const dateFormatted = new Date(submission.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })
                        const timeFormatted = new Date(submission.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })

                        return (
                            <Link
                                key={`keySubmission-${index}`}
                                href={`/petugas/history/${submission.uuid}`}
                                className="group block bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                                                {submission.survey.nama_survey}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {submission.responden.nama}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(submission.tipe_responden)}`}>
                                                    {submission.tipe_responden}
                                                </span>
                                                {submission.responden.instansi?.kode_instansi && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                                                            NPSN: {submission.responden.instansi.kode_instansi}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                        <div className="text-left md:text-right">
                                            <span className="text-xs text-slate-400 block font-medium">Tanggal Himpun</span>
                                            <span className="text-xs font-semibold text-slate-700">{dateFormatted}, {timeFormatted}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    <div className="pt-4">
                        <Pagination
                            colorActive="bg-indigo-600 text-white"
                            colorPage="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            count={counts}
                            perPage={Number(quantity) || 50}
                            currentPage={Number(page) || 1}
                            id="pagination-1"
                            optionPerPage={[10, 50, 100, 500, 1000]}
                            url={`/petugas/history?`}
                            keyword={""}
                            isConcatQuery={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export const dynamic = 'force-dynamic'
export default HistoryKuesioner
