"use client"

import { ISurvei } from "@/app/types"
import SearchableSelect from "@/components/SelectSearch"
import { useRouter } from "next/navigation"

const FilterSurvey = ({ surveys, url, survey }: { surveys: ISurvei[], url: string, survey: string }) => {
    const router = useRouter()

    const handleChange = (option: string) => {
        router.replace(`${url}&id_survey=${option}`)
    }

    return (
        <div>
            <SearchableSelect onChange={val => handleChange(val)} options={
                surveys.map(s => ({ value: s.uuid, label: s.nama_survey }))
            }
                value={survey ?? ""}
            />
        </div>
    )
}
export default FilterSurvey