import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import { IUser } from "@/app/types"
import AddUserAdmin from "./add";
import EditUserAdmin from "./edit";
import DropUserAdmin from "./drop";
import Search from "./search";
import Pagination from "@/components/Paginate";
import ResetPassword from "./reset";
import { ShieldCheck, UserCheck } from "lucide-react";

const getUserAdmin = async (page: number, quantity: number, search: string): Promise<{ users: IUser[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/admins?page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            users: [...data.data],
            counts: data.meta.totalData
        }
        console.log(data)
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

const UserAdminPage = async (prop: Props) => {
    const page = (await prop.searchParams).page ?? 1
    const quantity = (await prop.searchParams).quantity ?? 50
    const search = (await prop.searchParams).search ?? ""
    const { users, counts } = await getUserAdmin(page, quantity, search)

    return (
        <div className="w-full space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Manajemen Administrator Sistem</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Daftar akun administrator dengan hak akses penuh ke instrumen dan analitik.
                    </p>
                </div>
                <div className="shrink-0">
                    <AddUserAdmin />
                </div>
            </div>

            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <Search quantity={quantity} search={search} url="/admin/userAdmin" />
            </div>

            {/* Admin Table */}
            {users.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Data Admin Belum Tersedia</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {search ? "Tidak ditemukan admin yang cocok dengan kata kunci." : "Belum ada akun admin terdaftar."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Administrator</th>
                                    <th className="px-5 py-3.5">Username</th>
                                    <th className="px-5 py-3.5">Hak Akses</th>
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
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0B5C9E] border border-blue-200/50">
                                                SUPER ADMIN
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <EditUserAdmin selectedUserAdmin={user} />
                                                <DropUserAdmin selectedUserAdmin={user} />
                                                <ResetPassword selectedUserAdmin={user} />
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
                            url={`/admin/userAdmin?`}
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
export default UserAdminPage;
