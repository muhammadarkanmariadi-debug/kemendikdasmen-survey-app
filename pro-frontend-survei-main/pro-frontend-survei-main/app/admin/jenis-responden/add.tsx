"use client"
import { ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const AddJenisResponden = () => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [jenis, setJenis] = useState<string>("")
    const [is_public, setIsPublic] = useState<boolean>(false)
    const [tipe, setTipe] = useState<string>("SEKOLAH")
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setTipe("SEKOLAH")
        setJenis("")
        setIsPublic(false)
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/jenis-responden`
            const payload = JSON.stringify({
                jenis,
                is_public,
                tipe
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastAddJenisResponden` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastAddJenisResponden` })
            }
        } catch (error) {
            toast.error(`Terjadi kesalahan: ${error}`, { hideProgressBar: true, containerId: `toastAddJenisResponden` })
            setIsLoad(false)
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastAddJenisResponden`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Tambah Jenis Responden</span>
            </ButtonSuccess>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="relative px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B5C9E] via-[#1E77BD] to-[#FFB703]" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Tambah Jenis Responden</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Klasifikasi subjek pengisi kuesioner instrumen</p>
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
                        <div>
                            <label htmlFor="nama-jenis" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Nama Jenis Responden <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nama-jenis"
                                value={jenis}
                                onChange={e => setJenis(e.target.value)}
                                required
                                placeholder="Contoh: Siswa / Guru / Kepala Sekolah"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="tipe-instansi" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Tipe Instansi Naungan <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id="tipe-instansi"
                                required
                                value={tipe}
                                onChange={e => setTipe(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            >
                                <option value="SEKOLAH">SEKOLAH</option>
                                <option value="DINAS">DINAS</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    id="is-public"
                                    checked={is_public}
                                    onChange={e => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#0B5C9E] focus:ring-[#0B5C9E] border-slate-300"
                                />
                                <div>
                                    <span className="font-semibold text-slate-800 block">Dapat Diakses Publik (Tanpa Login)</span>
                                    <span className="text-xs text-slate-500">Jika dicentang, responden kategori ini dapat mengisi form kuesioner melalui portal publik.</span>
                                </div>
                            </label>
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
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0B5C9E] hover:bg-[#073B66] active:bg-[#052847] shadow-sm transition-all disabled:opacity-50"
                        >
                            {isLoad ? "Menyimpan..." : "Simpan Jenis Responden"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AddJenisResponden
