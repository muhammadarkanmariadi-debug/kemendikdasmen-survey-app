"use client"
import { IInstansi } from "@/app/types"
import { ButtonWarning } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { put } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const ResetInstansi = ({ selectedInstansi }: { selectedInstansi: IInstansi }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [password, setPassword] = useState<string>("")
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setPassword("")
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/instansi/${selectedInstansi.uuid}`
            const payload = JSON.stringify({
                password
            })
            const { data } = await put(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastResetInstansi-${selectedInstansi.uuid}` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastResetInstansi-${selectedInstansi.uuid}` })
            }
        } catch (error) {
            toast.error(`Terjadi kesalahan: ${error}`, { hideProgressBar: true, containerId: `toastResetInstansi-${selectedInstansi.uuid}` })
            setIsLoad(false)
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastResetInstansi-${selectedInstansi.uuid}`} />
            <ButtonWarning type="button" onClick={() => openModal()} className="!py-1.5 !px-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
                <span className="text-xs">Reset Kata Sandi</span>
            </ButtonWarning>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="relative px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Reset Kata Sandi Instansi</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Ubah kata sandi login untuk satuan pendidikan atau dinas</p>
                            </div>
                            <button
                                type="button"
                                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                                onClick={() => setIsShow(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-4 text-slate-700 overflow-y-auto">
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800">
                            Mengatur ulang kata sandi login untuk: <strong className="font-semibold text-slate-800">{selectedInstansi.nama_instansi}</strong> (NPSN: {selectedInstansi.kode_instansi})
                        </div>

                        <div>
                            <label htmlFor={`password-reset-instansi-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Kata Sandi Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                id={`password-reset-instansi-${selectedInstansi.uuid}`}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="Masukkan minimal 6 karakter kata sandi baru"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsShow(false)}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoad}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-sm transition-all disabled:opacity-50"
                        >
                            {isLoad ? "Menyimpan..." : "Perbarui Kata Sandi"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ResetInstansi
