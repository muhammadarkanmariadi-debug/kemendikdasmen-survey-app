"use client"

import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { getBlob } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { saveAs } from "file-saver"
import { useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const DownloadExcel = ({ id, nama }: { id: string, nama?:string }) => {
    const [isDownload, setIsDownload] = useState<boolean>(false)
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ``
    const downloadFormat = async () => {
        try {
            setIsDownload(true)
            const url = `${BASE_API_URL}/surveys/excel?id_survey=${id}`
            let { data, status } = await getBlob(url, TOKEN)
            if (status) {
                setIsDownload(false)
                saveAs(data, `${new Date().toISOString().split(`T`)[0]}-hasil_kuesioner-${nama}.xlsx`)
            } else {
                toast(data?.message, { hideProgressBar: true, containerId: `toastExcel`, type: `warning` })
            }
        } catch (error) {
            console.log(error);
            toast(`Something were wrong`, { hideProgressBar: true, containerId: `toastExcel`, type: `error` })
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastExcel`} />
            <button
                type="button"
                className="text-white text-sm font-semibold bg-green-500 px-2 py-1 rounded-md hover:bg-green-400 disabled:bg-green-300"
                onClick={() => downloadFormat()} disabled={isDownload}>
                <div className="flex flex-wrap gap-1">
                    {
                        isDownload ?
                            <svg className="animate-spin size-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                    }
                    {
                        isDownload ?
                            <>
                                Mengunduh Data
                            </> :
                            <>
                                Unduh Hasil Kuesioner
                            </>
                    }
                </div>
            </button>
        </div>
    )
}
export default DownloadExcel