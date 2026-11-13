import { ILokasiPetugas, IResponden, IUser } from "@/app/types";
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import Link from "next/link";
import { FiArrowLeftCircle } from "react-icons/fi";
import AddSetPetugas from "./addSetPetugas";
import Pagination from "@/components/Paginate";
import Search from "./search";
import DropSetPetugas from "./dropSetPetugas";

const getPetugas = async (): Promise<IUser[]> => {
    try {
        const url = `${BASE_API_URL}/petugas`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        else return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getResponden = async (): Promise<IResponden[]> => {
    try {
        const url = `${BASE_API_URL}/responden`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        else return []
    } catch (error) {
        console.log(error)
        return []
    }
}

const getSetPetugas = async (id: string, page: number, quantity: number, search: string): Promise<{ data: ILokasiPetugas[], counts: number }> => {
    try {
        const url = `${BASE_API_URL}/lokasi-petugas?id=${id}&page=${page}&quantity=${quantity}&search=${search}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return {
            data: [...data.data],
            counts: data.meta.totalData
        }
        else return { data: [], counts: 0 }
    } catch (error) {
        console.log(error)
        return { data: [], counts: 0 }
    }
}

type Props = {
    searchParams: Promise<{
        page?: number
        quantity?: number
        search?: string
    }>
    params: Promise<{
        survey_id: string
    }>
}

const SetPetugas = async (prop: Props) => {
    const { survey_id } = await prop.params
    const page = (await prop.searchParams).page ?? 1
    const quantity = (await prop.searchParams).quantity ?? 50
    const search = (await prop.searchParams).search ?? ""
    const { data, counts } = await getSetPetugas(survey_id, page, quantity, search)
    const petugas = await getPetugas()
    const responden = await getResponden()

    return (
        <div className="w-full">
            {
                data == null ?
                    <div className="w-full border-2 border-primary bg-sky-100 text-primary p-3 rounded-lg">
                        Data kuesioner tidak tersedia
                    </div> :
                    <div>
                        <div className="my-4">
                            <div className="my-2 flex gap-1">
                                <Link href={`/admin/kuisioner`}>
                                    <button className="py-2 px-4 text-xl bg-secondary text-white rounded-md" type="button">
                                        <FiArrowLeftCircle />
                                    </button>
                                </Link>
                                <AddSetPetugas survey_id={survey_id} listPetugas={petugas} listResponden={responden} />
                            </div>
                        </div>
                        {
                            data.length == 0 ?
                                <div className="w-full border-2 border-primary bg-sky-100 text-primary p-3 rounded-lg">
                                    Data Penempatan Lokasi Petugas Belum Tersedia
                                </div> :
                                <div className="w-full overflow-auto text-sm text-black">
                                    <div className="my-2">
                                        <Search quantity={quantity} search={search} url={`/admin/setpetugas/${survey_id}`} />
                                    </div>
                                    {
                                        data.map((item, index) => (
                                            <div key={`keyUser-${index}`} className={`w-full flex flex-wrap border border-primary ${index == 0 ? `` : `border-t-0`}`}>
                                                <div className="w-full md:w-4/12 p-2 flex flex-col gap-1">
                                                    <small className="text-primary font-semibold">Nama</small>
                                                    {item.nama_petugas}
                                                </div>
                                                <div className="w-full md:w-8/12 p-2 flex flex-col gap-1">
                                                    <small className="text-primary font-semibold">Responden</small>
                                                    {item.responden.map((res, i) => (
                                                        <div key={res.id_responden} className="w-full flex flex-row gap-1 py-1">
                                                            <DropSetPetugas selectedPetugas={item} selectedResponden={res} />
                                                            <span>{res.nama_responden}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                        }
                        <div className="my-3">
                            <Pagination colorActive="bg-primary" colorPage="bg-secondary" count={counts} perPage={Number(quantity) || 50}
                                currentPage={Number(page) || 1} id="pagination-1" optionPerPage={[10, 50, 100, 500, 1000]}
                                url={`/admin/setpetugas/${survey_id}?`} keyword={search} isConcatQuery={true} />
                        </div>
                    </div>
            }

        </div>
    )
}

export const dynamic = "force-dynamic";
export default SetPetugas