"use client"
import { IPertanyaan } from "@/app/types"
import { ButtonDanger } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { drop } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const DropInstrumen = ({ selectedInstrumen }: { selectedInstrumen: IPertanyaan }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/instruments/${selectedInstrumen.uuid}`

            const { data } = await drop(url, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastDropInstrument-${selectedInstrumen.uuid}` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastDropInstrument-${selectedInstrumen.uuid}` })
            }
        } catch (error) {
            toast.error(`Something were wrong. ${error}`, { hideProgressBar: true, containerId: `toastDropInstrument-${selectedInstrumen.uuid}` })
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastDropInstrument-${selectedInstrumen.uuid}`} />
            <ButtonDanger type="button" onClick={() => openModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </ButtonDanger>
            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit}>
                    {/* modal header */}
                    <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
                        <div className="w-full flex items-center">
                            <div className="flex flex-col">
                                <strong className="font-bold text-2xl text-black">Hapus Instrumen Pertanyaan</strong>
                                <small className="text-slate-400 text-sm">Pastikan pengisian data telah sesuai</small>
                            </div>
                            <div className="ml-auto">
                                <button type="button" className="text-slate-400" onClick={() => setIsShow(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* end modal header */}

                    <div className="p-5 text-black">
                        Apakah Anda yakin ingin menghapus data instrumen ini?
                    </div>

                    {/* modal footer */}
                    <div className="w-full p-5 flex rounded-b-2xl shadow">
                        <div className="flex ml-auto gap-2">
                            <button type="button" onClick={() => setIsShow(false)}
                                className={`bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${isLoad ? "opacity-50 cursor-not-allowed" : ""}`}>
                                Batal
                            </button>
                            <button type="submit" disabled={isLoad}
                                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${isLoad ? "opacity-50 cursor-not-allowed" : ""}`}>
                                {isLoad ? `Menghapus` : `Hapus`}
                            </button>
                        </div>
                    </div>
                    {/* end modal footer */}
                </form>
            </Modal>
        </div>
    )
}
export default DropInstrumen