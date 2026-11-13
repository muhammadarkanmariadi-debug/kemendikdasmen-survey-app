"use client"
import { IJenisResponden } from "@/app/types"
import { ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const AddSurvey = ({ jenis }: { jenis: IJenisResponden[] }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [nama_survey, setNamaSurvey] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [responden_group, setRespondenGroup] = useState<IJenisResponden[]>([])
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setNamaSurvey("")
        setStatus("")
        setRespondenGroup([])
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/surveys`
            const payload = JSON.stringify({
                jenis_responden: `ALL`,
                nama_survey,
                status: status == "1",
                responden_group: JSON.stringify(responden_group)
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastSurvey` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastSurvey` })
            }
        } catch (error) {
            toast.error(`Terjadi kesalahan: ${error}`, { hideProgressBar: true, containerId: `toastSurvey` })
            setIsLoad(false)
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastSurvey`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Buat Kuesioner</span>
            </ButtonSuccess>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="relative px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B5C9E] via-[#1E77BD] to-[#FFB703]" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Buat Kuesioner Baru</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tentukan nama instrumen, status publikasi, dan target responden</p>
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
                            <label htmlFor="nama-kuesioner" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Nama Kuesioner / Instrumen <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nama-kuesioner"
                                value={nama_survey}
                                onChange={e => setNamaSurvey(e.target.value)}
                                required
                                placeholder="Contoh: Survei Karakter & Iklim Belajar 2026"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="status-survey" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Status Publikasi <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id="status-survey"
                                required
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            >
                                <option value="">Pilih Status Publikasi</option>
                                <option value="1">Aktif (Dapat diakses responden)</option>
                                <option value="0">Tidak Aktif (Draft / Ditutup)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                                Target Kelompok Responden
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {jenis.map(j => {
                                    const isSelected = responden_group.some(it => it.uuid === j.uuid)
                                    return (
                                        <label
                                            key={j.uuid}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-blue-50/70 border-[#0B5C9E] text-[#0B5C9E]"
                                                    : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                                            }`}
                                        >
                                            <input
                                                id={`input-checkbox-${j.uuid}`}
                                                type="checkbox"
                                                value={j.uuid}
                                                checked={isSelected}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setRespondenGroup([...responden_group, j])
                                                    } else {
                                                        setRespondenGroup(responden_group.filter(res => res.uuid !== j.uuid))
                                                    }
                                                }}
                                                className="w-4 h-4 rounded text-[#0B5C9E] focus:ring-[#0B5C9E] border-slate-300"
                                            />
                                            <span>{j.jenis}</span>
                                        </label>
                                    )
                                })}
                            </div>
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
                            {isLoad ? "Menyimpan..." : "Simpan Kuesioner"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AddSurvey
