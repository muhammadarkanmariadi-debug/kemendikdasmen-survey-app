import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import { IJenisResponden } from "@/app/types"
import AddJenisResponden from "./add";
import EditJenisResponden from "./edit";
import DropJenisResponden from "./drop";
import { Users2, CheckCircle2, XCircle } from "lucide-react";

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

const JenisRespondenPage = async () => {
    const jenis = await getJenisResponden()

    return (
        <div className="w-full space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Kategori Jenis Responden</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Konfigurasi grup responden survei (Siswa, Guru, Kepala Sekolah, Tenaga Kependidikan, dsb.).
                    </p>
                </div>
                <div className="shrink-0">
                    <AddJenisResponden />
                </div>
            </div>

            {/* Table */}
            {jenis.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Jenis Responden Belum Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Klik tombol Tambah Jenis Responden untuk membuat grup baru.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Jenis Responden</th>
                                    <th className="px-5 py-3.5">Akses Publik</th>
                                    <th className="px-5 py-3.5">Tipe Instansi Induk</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {jenis.map((item) => (
                                    <tr key={item.uuid} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-bold text-slate-900">
                                            {item.jenis}
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.is_public ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Terbuka untuk Publik
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                                    <XCircle className="w-3.5 h-3.5" /> Internal Khusus
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0B5C9E] border border-blue-200/50">
                                                {item.tipe}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <EditJenisResponden selectedJenis={item} />
                                                <DropJenisResponden selectedJenis={item} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export const dynamic = "force-dynamic";
export default JenisRespondenPage;
