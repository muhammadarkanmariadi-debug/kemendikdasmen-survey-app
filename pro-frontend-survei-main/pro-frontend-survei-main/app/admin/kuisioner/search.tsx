"use client"

import { useRouter } from "next/navigation"
import { KeyboardEvent, useState } from "react"
import { Search as SearchIcon, X } from "lucide-react"

type Props = {
    search: string
}
const Search = ({ search }: Props) => {
    const [keyword, setKeyword] = useState<string>(search || "")
    const router = useRouter()

    const executeSearch = (val: string) => {
        const params = new URLSearchParams(window.location.search)
        const trimmed = val.trim()
        if (trimmed) {
            params.set("search", trimmed)
        } else {
            params.delete("search")
        }
        params.set("page", "1")
        router.push(`?${params.toString()}`)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            executeSearch(keyword)
        }
    }

    const handleClear = () => {
        setKeyword("")
        executeSearch("")
    }

    return (
        <div className="relative w-full">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Cari data survei..."
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-9 py-2 border border-slate-200 focus:border-[#0B5C9E] focus:ring-2 focus:ring-[#0B5C9E]/20 rounded-xl text-sm bg-white text-slate-900 transition-all outline-none"
            />
            {keyword && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Hapus pencarian"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
export default Search
