"use client"
import { ReactElement } from "react"
import { useRouter } from "next/navigation"

type PropsPagination = {
    url?: string,
    keyword?: string,
    count: number,
    perPage: number,
    currentPage: number,
    id: string,
    colorActive: string,
    colorPage: string,
    optionPerPage: number[],
    isConcatQuery?: boolean
}



const Pagination = ({ count, perPage, currentPage, id, colorActive, colorPage, optionPerPage }: PropsPagination) => {
    const countPage = Math.ceil(count / perPage)
    const router = useRouter()
    const changePage = (pageNumber: number) => {
        const params = new URLSearchParams(window.location.search)
        params.set("page", pageNumber.toString())
        params.set("quantity", perPage.toString())
        router.push(`?${params.toString()}`)
        // if (isConcatQuery) router.push(`${url}&page=${pageNumber}&quantity=${perPage}${keyword ? `&search=${keyword}` : ``}`)
        // else router.push(`${url}?page=${pageNumber}&quantity=${perPage}${keyword ? `&search=${keyword}` : ``}`)
    }

    const changePerPage = (limit: number) => {
        const params = new URLSearchParams(window.location.search)
        params.set("page", `1`)
        params.set("quantity", limit.toString())
        router.push(`?${params.toString()}`)
        // if (isConcatQuery) router.push(`${url}&page=${1}&quantity=${limit}${keyword ? `&search=${keyword}` : ``}`)
        // else router.push(`${url}?page=${1}&quantity=${limit}${keyword ? `&search=${keyword}` : ``}`)
    }

    const lessFive = (): ReactElement => {
        return (
            <>
                {[...Array(countPage)].map((page, index) => (
                    <button
                        key={`firstPagination${id}-${index}`} type="button"
                        className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${index + 1 == currentPage ? colorActive : colorPage}`}
                        onClick={() => changePage(index + 1)}>
                        {index + 1}
                    </button>
                ))}
            </>
        )
    }

    const firstFiveAndLast = (): ReactElement => {
        return (
            <>
                {[...Array(5)].map((page, index) => (
                    <button
                        key={`firstPagination${id}-${index}`} type="button"
                        className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${index + 1 == currentPage ? colorActive : colorPage}`}
                        onClick={() => changePage(index + 1)}>
                        {index + 1}
                    </button>
                ))}

                {(countPage - 5 > 1) ?
                    (
                        <button
                            type="button" className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`} disabled>
                            ...
                        </button>
                    ) :
                    (
                        <></>
                    )
                }


                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`}
                    onClick={() => changePage(countPage)}>
                    {countPage}
                </button>
            </>
        )
    }

    const lastFive = (): ReactElement => {
        const arr: number[] = []
        const limit = 5
        for (let i = limit - 1; i >= 0; i--) {
            arr.push(i)
        }
        return (
            <>
                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`}
                    onClick={() => changePage(1)}>
                    1
                </button>

                {(countPage - 5 > 1) ?
                    (
                        <button type="button"
                            className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`} disabled>
                            ...
                        </button>
                    ) :
                    (
                        <></>
                    )
                }

                {arr.map((page, index) => (
                    <button
                        key={`lastPagination${id}-${index}`} type="button"
                        className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${countPage - page == currentPage ? colorActive : colorPage}`}
                        onClick={() => changePage(countPage - page)}>
                        {countPage - page}
                    </button>
                ))}
            </>
        )
    }

    const middlePage = (): ReactElement => {
        return (
            <>
                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`}
                    onClick={() => changePage(1)}>
                    1
                </button>

                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`} disabled>
                    ...
                </button>

                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`}
                    onClick={() => changePage(currentPage - 1)}>
                    {currentPage - 1}
                </button>

                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorActive}`}
                    onClick={() => changePage(currentPage)}>
                    {currentPage}
                </button>

                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`}
                    onClick={() => changePage(currentPage + 1)}>
                    {currentPage + 1}
                </button>

                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`} disabled>
                    ...
                </button>

                <button type="button"
                    className={`rounded-md m-0.5 text-white text-xs px-2 py-1 ${colorPage}`}
                    onClick={() => changePage(countPage)}>
                    {countPage}
                </button>
            </>
        )
    }

    const releaseComponent = (): ReactElement => {
        if (countPage <= 5) {
            return lessFive()
        } else {
            if (currentPage < 5) return firstFiveAndLast()
            else if (currentPage >= 5 && (countPage - currentPage < 5)) return lastFive()
            else return middlePage()
        }
    }

    const stringPagination = (): ReactElement => {
        const start = ((currentPage - 1) * perPage) + 1
        const end = (start + perPage - 1) < count ? (start + perPage - 1) : count
        return (
            <small className="italic text-sm text-black">
                {`Showing ${start} to ${end} of ${count} entries`}
            </small>
        )
    }

    const optionPage = (): ReactElement => {
        return (
            <>
                <small className="italic text-black">Show</small>
                <select value={perPage} className="mx-1 p-1 border text-black" id={`optionPerPageOfPaginate`}
                    onChange={(e) => changePerPage(Number(e.target.value))}>
                    {optionPerPage.map((opt, index) => (
                        <option value={opt} key={`perPage${id}-${index}`}>
                            {opt}
                        </option>
                    ))}
                </select>
                <small className="italic text-black"> / page</small>
            </>

        )
    }

    return (
        <div className="w-full flex flex-wrap">
            <div className="w-full lg:w-3/12 text-center lg:text-left">
                {optionPage()}
            </div>
            <div className="w-full lg:w-5/12 text-center">
                {stringPagination()}
            </div>
            <div className="w-full lg:w-4/12 lg:text-right flex items-center justify-center lg:justify-end">
                {/* prev button */}
                <button className={`rounded-md text-white text-xs px-2 py-1 ${colorPage}`}
                    type="button"
                    disabled={(currentPage <= 1)}
                    onClick={() => changePage(currentPage - 1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* main pagitnation */}
                {releaseComponent()}

                {/* next button */}
                <button
                    className={`rounded-md text-white text-xs px-2 py-1 ${colorPage}`}
                    type="button"
                    disabled={(currentPage >= countPage)}
                    onClick={() => changePage(currentPage + 1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>

                </button>
            </div>

        </div>
    )

}

export default Pagination