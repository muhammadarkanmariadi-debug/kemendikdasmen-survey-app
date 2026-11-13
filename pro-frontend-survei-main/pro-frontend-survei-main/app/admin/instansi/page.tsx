import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import { IInstansi, IJenisResponden } from "@/app/types";
import EditResponden from "./edit";
import DropResponden from "./drop";
import AddInstansi from "./add";
import Pagination from "@/components/Paginate";
import Search from "./search";
import ResetInstansi from "./reset";
import Link from "next/link";
import { Building2, Users, MapPin } from "lucide-react";

const getInstansi = async (page: number, quantity: number, search: string): Promise<{ instansi: IInstansi[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/instansi?page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            instansi: [...data.data],
            counts: data.meta.totalData
        }
        return { instansi: [], counts: 0 }
    } catch (error) {
        console.error(error);
        return { instansi: [], counts: 0 }
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

const RespondenPage = async (prop: Props) => {
    const page = (await prop.searchParams).page ?? 1
    const quantity = (await prop.searchParams).quantity ?? 50
    const search = (await prop.searchParams).search ?? ""
    const { instansi, counts } = await getInstansi(page, quantity, search)
    const jenisResponden = await getJenisResponden()

    return (
        <div className="w-full space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Manajemen Satuan Pendidikan & Sekolah</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Daftar sekolah binaan (NPSN) dan rekapitulasi data sub-responden (Siswa, Guru, Kepala Sekolah).
                    </p>
                </div>
                <div className="shrink-0">
                    <AddInstansi jenisResponden={jenisResponden} />
                </div>
            </div>

            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <Search search={search} />
            </div>

            {/* Instansi Table */}
            {instansi.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Data Sekolah Belum Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {search ? "Tidak ditemukan sekolah yang sesuai dengan kata kunci pencarian." : "Belum ada data sekolah yang terdaftar."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Sekolah & NPSN</th>
                                    <th className="px-5 py-3.5">Wilayah & Alamat</th>
                                    <th className="px-5 py-3.5">Tipe Instansi</th>
                                    <th className="px-5 py-3.5 text-center">Partisipan</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {instansi.map((item) => (
                                    <tr key={item.uuid} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-900">{item.nama_instansi}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                                                NPSN / Kode: {item.kode_instansi}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-xs text-slate-700 font-medium">
                                                Kota {item.kota}, {item.provinsi}
                                            </div>
                                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                {item.alamat}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                                {item.tipe}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <Link href={`/admin/instansi/${item.uuid}`}>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#0B5C9E] hover:bg-blue-100 border border-blue-200/60 font-semibold text-xs transition-colors cursor-pointer"
                                                    title="Lihat Sub-Responden Siswa, Guru, Kepsek"
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>Sub-Responden {(item as any)._count?.responden_sekolah ? `(${(item as any)._count.responden_sekolah})` : "(0)"}</span>
                                                </button>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <EditResponden selectedInstansi={item} jenisResponden={jenisResponden} />
                                                <DropResponden selectedInstansi={item} />
                                                <ResetInstansi selectedInstansi={item} />
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
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export const dynamic = "force-dynamic";
export default RespondenPage
