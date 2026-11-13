"use client"

import { useRouter } from "next/navigation"

const FilterProvinsi = ({ provinces, provinsi }: { provinces: string[], provinsi: string, url: string }) => {
    const router = useRouter()

    const handleChange = (option: string) => {
        const params = new URLSearchParams(window.location.search);
        if (option) {
            params.set('provinsi', option);
        } else {
            params.delete('provinsi');
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <div className="w-full flex flex-wrap">
            <div className="w-full p-2">
                <label htmlFor={`provinsi-survey`} className="text-sm text-primary">Pilih Provinsi</label>
                <select id={`provinsi-survey`} required={true} value={provinsi}
                    onChange={e => handleChange(e.target.value)}
                    className="w-full p-2 rounded-md border border-primary">
                    <option value="">Semua Provinsi</option>
                    {
                        provinces.map((prov, index) => (
                            <option key={`keyOpsiProv-${index}`} value={prov}>
                                {prov}
                            </option>
                        ))
                    }
                </select>
            </div>
        </div>
    )

}
export default FilterProvinsi