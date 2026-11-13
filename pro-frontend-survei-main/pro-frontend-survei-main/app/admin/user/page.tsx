import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import { IUser } from "@/app/types"
import AddUser from "./add";
import EditUser from "./edit";
import DropUser from "./drop";
import Search from "./search";
import Pagination from "@/components/Paginate";
import ResetPassword from "./reset";
import Link from "next/link";
import { Users, UserCheck, Settings } from "lucide-react";

const getUser = async (page: number, quantity: number, search: string): Promise<{ users: IUser[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/petugas?page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            users: [...data.data],
            counts: data.meta.totalData
        }
        return { users: [], counts: 0 }
    } catch (error) {
        console.error(error);
        return { users: [], counts: 0 }
    }
}

type Props = {
    searchParams: Promise<{
        page?: number
        quantity?: number
        search?: string
    }>
}

const UserPage = async (prop: Props) => {
    const page = (await prop.searchParams).page ?? 1
    const quantity = (await prop.searchParams).quantity ?? 50
    const search = (await prop.searchParams).search ?? ""
    const { users, counts } = await getUser(page, quantity, search)

    return (
        <div className="w-full space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Manajemen Petugas Lapangan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola akun petugas pewawancara dan atur penugasan multi-instansi sekolah binaan.
                    </p>
                </div>
                <div className="shrink-0">
                    <AddUser />
                </div>
            </div>

            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <Search quantity={quantity} search={search} url="/admin/user" />
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Data Petugas Belum Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {search ? "Tidak ditemukan petugas yang cocok dengan kata kunci." : "Belum ada petugas yang didaftarkan ke sistem."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Petugas</th>
                                    <th className="px-5 py-3.5">Username</th>
                                    <th className="px-5 py-3.5">Peran</th>
                                    <th className="px-5 py-3.5 text-center">Penugasan Sekolah</th>
                                    <th className="px-5 py-3.5 text-right">Aksi Akun</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {users.map((user) => (
                                    <tr key={user.uuid} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 font-bold text-slate-900">
                                            {user.nama_user}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-mono text-slate-600">
                                            {user.username}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                                PETUGAS LAPANGAN
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <Link href={`/admin/user/${user.uuid}`}>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B5C9E] font-semibold text-xs transition-colors cursor-pointer border border-blue-200/60"
                                                    title="Atur penugasan sekolah binaan"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                    <span>Atur Penugasan</span>
                                                </button>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <EditUser selectedUser={user} />
                                                <DropUser selectedUser={user} />
                                                <ResetPassword selectedUser={user} />
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
                            url={`/admin/user?`}
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
export default UserPage;
