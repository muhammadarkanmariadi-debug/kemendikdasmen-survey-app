import { IAssignment, IInstansi, ISurvei, IUser } from "@/app/types"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { get } from "@/helper/api-bridge"
import { getCookies } from "@/helper/server-cookie"
import AddAssignment from "./add"
import DropAssignment from "./drop"
import Link from "next/link"

const getPetugas = async (id: string): Promise<IUser | null> => {
    try {
        const url = `${BASE_API_URL}/petugas/${id}`
        const TOKEN = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, TOKEN)
        if (data?.success == true) return { ...data.data }
        return null
    } catch (error) {
        console.log(error)
        return null
    }
}

const getAssignment = async (id: string): Promise<IAssignment[]> => {
    try {
        const url = `${BASE_API_URL}/assignments?id_petugas=${id}`
        const TOKEN = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, TOKEN)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getInstansi = async (): Promise<IInstansi[]> => {
    try {
        const url = `${BASE_API_URL}/instansi`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getSurvei = async (): Promise<ISurvei[]> => {
    try {
        const url = `${BASE_API_URL}/surveys`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

type Props = {
    params: Promise<{
        uuid: string
    }>
}

const AssignmentPage = async (prop: Props) => {
    const { uuid } = await prop.params
    const petugas = await getPetugas(uuid)

    if (petugas == null) {
        return (
            <div className="w-full space-y-4">
                <Link
                    href="/admin/user"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Daftar Petugas
                </Link>
                <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
                    <h3 className="font-bold text-slate-800">Petugas Tidak Ditemukan</h3>
                    <p className="text-sm text-slate-500 mt-1">Data petugas tidak ditemukan atau telah dihapus.</p>
                </div>
            </div>
        )
    }

    const assignments = await getAssignment(petugas.uuid)
    const surveys = await getSurvei()
    const instansi = await getInstansi()

    return (
        <div className="w-full space-y-6">
            {/* Top Back & Header Banner */}
            <div>
                <Link
                    href="/admin/user"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Kelola Petugas
                </Link>

                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-[#1E77BD] to-[#FFB703]" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xl shrink-0">
                                {petugas.nama_user?.charAt(0)?.toUpperCase() || "P"}
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
                                    Penugasan Wilayah & Survei
                                </div>
                                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                    {petugas.nama_user}
                                </h1>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    @{petugas.username} &bull; {assignments.length} Instrumen Ditugaskan
                                </p>
                            </div>
                        </div>

                        <div>
                            <AddAssignment instansi={instansi} selectedPetugas={petugas} surveys={surveys} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            {assignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Belum Ada Penugasan Aktif</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Petugas ini belum dialokasikan ke instrumen kuesioner dan sekolah tujuan manapun. Klik tombol &quot;Tambah Penugasan&quot; untuk mulai menugaskan.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                        <div
                            key={`assignment-${index}`}
                            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B5C9E] flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">
                                            {assignment.nama_survey}
                                        </h3>
                                        <span className="text-xs text-slate-400">
                                            {assignment.instansi.length} Instansi Terkait
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                                    Daftar Instansi / Satuan Pendidikan:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {assignment.instansi.map(i => (
                                        <div
                                            key={`keyInstansi-${index}-${i.uuid}`}
                                            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                        >
                                            <span className="font-semibold text-slate-800">{i.nama_instansi}</span>
                                            <DropAssignment uuid={i.uuid} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export const dynamic = "force-dynamic"
export default AssignmentPage
