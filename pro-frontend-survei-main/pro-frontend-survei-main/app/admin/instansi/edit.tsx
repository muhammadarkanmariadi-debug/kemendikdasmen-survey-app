"use client"
import { IInstansi, IJenisResponden } from "@/app/types"
import { ButtonPrimary } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { put } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const EditInstansi = ({ selectedInstansi, jenisResponden }: { selectedInstansi: IInstansi, jenisResponden: IJenisResponden[] }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [nama_instansi, setNamaInstansi] = useState<string>("")
    const [kode_instansi, setKodeInstansi] = useState<string>("")
    const [alamat, setAlamat] = useState<string>("")
    const [provinsi, setProvinsi] = useState<string>("")
    const [kota, setKota] = useState<string>("")
    const [tipe, setTipe] = useState<string>("")
    const [id_jenis_responden, setJenisResponden] = useState<string>("")
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setTipe(selectedInstansi.tipe)
        setNamaInstansi(selectedInstansi.nama_instansi)
        setKodeInstansi(selectedInstansi.kode_instansi)
        setKota(selectedInstansi.kota)
        setAlamat(selectedInstansi.alamat)
        setProvinsi(selectedInstansi.provinsi)
        setJenisResponden(selectedInstansi.id_jenis_responden)
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/instansi/${selectedInstansi.uuid}`
            const payload = JSON.stringify({
                nama_instansi,
                kode_instansi,
                alamat,
                kota,
                provinsi,
                tipe,
                id_jenis_responden
            })
            const { data } = await put(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastEditInstansi-${selectedInstansi.uuid}` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastEditInstansi-${selectedInstansi.uuid}` })
            }
        } catch (error) {
            toast.error(`Terjadi kesalahan: ${error}`, { hideProgressBar: true, containerId: `toastEditInstansi-${selectedInstansi.uuid}` })
            setIsLoad(false)
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastEditInstansi-${selectedInstansi.uuid}`} />
            <ButtonPrimary type="button" onClick={() => openModal()} className="!py-1.5 !px-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </ButtonPrimary>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="relative px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B5C9E] via-[#1E77BD] to-[#FFB703]" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Ubah Data Instansi</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Perbarui informasi profil dan wilayah instansi</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor={`kode-instansi-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Kode Instansi / NPSN <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id={`kode-instansi-${selectedInstansi.uuid}`}
                                    value={kode_instansi}
                                    onChange={e => setKodeInstansi(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor={`jenis-instansi-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Tipe Instansi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id={`jenis-instansi-${selectedInstansi.uuid}`}
                                    required
                                    value={tipe}
                                    onChange={e => setTipe(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                >
                                    <option value="SEKOLAH">SEKOLAH (Satuan Pendidikan)</option>
                                    <option value="DINAS">DINAS (Dinas Pendidikan)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`nama-instansi-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Nama Resmi Instansi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id={`nama-instansi-${selectedInstansi.uuid}`}
                                value={nama_instansi}
                                onChange={e => setNamaInstansi(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor={`alamat-instansi-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Alamat Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id={`alamat-instansi-${selectedInstansi.uuid}`}
                                value={alamat}
                                onChange={e => setAlamat(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor={`kota-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Kabupaten / Kota <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id={`kota-${selectedInstansi.uuid}`}
                                    value={kota}
                                    onChange={e => setKota(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor={`provinsi-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Provinsi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id={`provinsi-${selectedInstansi.uuid}`}
                                    value={provinsi}
                                    onChange={e => setProvinsi(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`jenis-responden-${selectedInstansi.uuid}`} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Responden Utama <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id={`jenis-responden-${selectedInstansi.uuid}`}
                                required
                                value={id_jenis_responden}
                                onChange={e => setJenisResponden(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            >
                                <option value="">Pilih Kelompok Responden</option>
                                {jenisResponden.map((jenis, index) => (
                                    <option value={jenis.uuid} key={`keyJenis-${index}`}>
                                        {jenis.jenis}
                                    </option>
                                ))}
                            </select>
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
                            {isLoad ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default EditInstansi
