"use client"

import { useRouter } from "next/navigation"
import { KeyboardEvent, useState } from "react"

type Props = {
    url: string,
    quantity: number,
    search: string
}
const Search = ({ url, quantity, search }: Props) => {
    const [keyword, setKeyword] = useState<string>(search)
    const router = useRouter()

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.key === "Enter") {
            router.push(`${url}?search=${encodeURIComponent(keyword)}&quantity=${quantity}`)
        }
    }

    return (
        <div>
            <input id="keyword" type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                placeholder="Keyword Pencarian" onKeyUp={event => handleSearch(event)}
                className="w-full border border-primary rounded-md p-2 bg-white text-black"
            />
        </div>
    )
}
export default Search