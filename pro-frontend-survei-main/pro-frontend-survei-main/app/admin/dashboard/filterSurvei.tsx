"use client"

import { ISurvei } from "@/app/types"
import { useRouter } from "next/navigation"

const FilterSurvey = ({ surveys, id_survey, url }: { surveys: ISurvei[], id_survey: string, url: string }) => {
    const router = useRouter()

    const handleChange = (option: string) => {
        router.replace(`${url}?id_survei=${option}`)
    }

    return (
        <div className="w-full flex flex-wrap">
            <div className="w-full p-2">
                <label htmlFor={`jenis-survey`} className="text-sm text-primary">Pilih Kuesioner</label>
                <select id={`jenis-survey`} required={true} value={id_survey}
                    onChange={e => handleChange(e.target.value)}
                    className="w-full p-2 rounded-md border border-primary">
                    <option value="">Pilih Jenis Kuesioner</option>
                    {
                        surveys.map((survey, index) => (
                            <option key={`keyOpsiSurvei-${index}`} value={survey.uuid}>
                                {survey.nama_survey}
                            </option>
                        ))
                    }
                </select>
            </div>
        </div>
    )

}
export default FilterSurvey