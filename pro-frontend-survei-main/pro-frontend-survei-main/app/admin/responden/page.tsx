import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import { IResponden } from "@/app/types"
import AddResponden from "./add";
import EditResponden from "./edit";
import DropResponden from "./drop";

const getResponden = async (page: number, quantity: number, search: string): Promise<{ responden: IResponden[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/responden?page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            responden: [...data.data],
            counts: data.meta.totalData
        }
        return { responden: [], counts: 0 }
    } catch (error) {
        console.log(error);
        return { responden: [], counts: 0 }
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
    const { responden, counts } = await getResponden(page, quantity, search)

    return (
        <div className="w-full">
            <div className="my-3">
                <AddResponden />
            </div>
            {
                responden.length == 0 ?
                    <div className="w-full border-2 border-primary bg-sky-100 text-primary p-3 rounded-lg">
                        Data responden belum tersedia
                    </div> :
                    <div className="w-full overflow-auto text-sm text-black">
                        {
                            responden.map((respon, index) => (
                                <div key={`keyResponden-${index}`} className={`w-full flex flex-wrap border border-primary ${index > 0 || responden.length == 1 ? `` : `border-b-0`}`}>
                                    <div className="w-full md:w-3/12 p-2 flex flex-col gap-1">
                                        <small className="text-primary font-semibold">Nama</small>
                                        {respon.nama}
                                    </div>
                                    <div className="w-full md:w-4/12 p-2 flex flex-col gap-1">
                                        <small className="text-primary font-semibold">Alamat</small>
                                        {respon.nama} <br />
                                        Kota {respon.kab_kota} Provinsi {respon.provinsi}
                                    </div>
                                    <div className="w-full md:w-3/12 p-2 flex flex-col gap-1">
                                        <small className="text-primary font-semibold">Jenis</small>
                                        {respon.jenis_responden}
                                    </div>
                                    <div className="w-full md:w-2/12 p-2 flex flex-col gap-1">
                                        <small className="text-primary font-semibold">Aksi</small>
                                        <div className="flex gap-1">
                                            <EditResponden selectedResponden={respon} />
                                            <DropResponden selectedResponden={respon} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
            }
        </div>
    )
}
export const dynamic = "force-dynamic";
export default RespondenPage