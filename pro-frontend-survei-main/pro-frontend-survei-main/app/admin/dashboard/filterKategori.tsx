"use client"

import { IKategori } from "@/app/types"
import { useRouter } from "next/navigation"

const FilterKategori = ({ categories, id_kategori, url }: { categories: IKategori[], id_kategori: string, url: string }) => {
    const router = useRouter()

    const handleChange = (option: string) => {
        router.replace(`${url}&id_kategori=${option}`)
    }

    return (
        <div className="w-full flex flex-wrap">
            <div className="w-full p-2">
                <label htmlFor={`jenis-kategori`} className="text-sm text-primary">Pilih Kategori</label>
                <select id={`jenis-kategori`} required={true} value={id_kategori}
                    onChange={e => handleChange(e.target.value)}
                    className="w-full p-2 rounded-md border border-primary">
                    <option value="">Pilih Jenis Kategori</option>
                    {
                        categories.map((kategori, index) => (
                            <option key={`keyOpsiKategori-${index}`} value={kategori.uuid}>
                                {kategori.nama_kategori}
                            </option>
                        ))
                    }
                </select>
            </div>
        </div>
    )

}
export default FilterKategori