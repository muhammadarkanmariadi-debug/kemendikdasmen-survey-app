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

const AddInstansi = ({ jenisResponden }: { jenisResponden: IJenisResponden[] }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [nama_instansi, setNamaInstansi] = useState<string>("")
    const [kode_instansi, setKodeInstansi] = useState<string>("")
    const [alamat, setAlamat] = useState<string>("")
    const [provinsi, setProvinsi] = useState<string>("")
    const [kota, setKota] = useState<string>("")
    const [tipe, setTipe] = useState<string>("SEKOLAH")
    const [password, setPassword] = useState<string>("")
    const [id_jenis_responden, setJenisResponden] = useState<string>("")
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setTipe("SEKOLAH")
        setNamaInstansi("")
        setKodeInstansi("")
        setKota("")
        setPassword("")
        setAlamat("")
        setProvinsi("")
        setJenisResponden("")
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/instansi`
            const payload = JSON.stringify({
                nama_instansi,
                kode_instansi,
                alamat,
                kota,
                provinsi,
                tipe,
                password,
                id_jenis_responden
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastAddInstansi` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastAddInstansi` })
            }
        } catch (error) {
            toast.error(`Terjadi kesalahan: ${error}`, { hideProgressBar: true, containerId: `toastAddInstansi` })
            setIsLoad(false)
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastAddInstansi`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Tambah Instansi</span>
            </ButtonSuccess>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="relative px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B5C9E] via-[#1E77BD] to-[#FFB703]" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Tambah Data Instansi</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Daftarkan satuan pendidikan (Sekolah/NPSN) atau dinas pendidikan</p>
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
                                <label htmlFor="kode-instansi" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Kode Instansi / NPSN <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="kode-instansi"
                                    value={kode_instansi}
                                    onChange={e => setKodeInstansi(e.target.value)}
                                    required
                                    placeholder="Contoh: 20101456"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="jenis-instansi" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Tipe Instansi <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="jenis-instansi"
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
                            <label htmlFor="nama-instansi" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Nama Resmi Instansi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nama-instansi"
                                value={nama_instansi}
                                onChange={e => setNamaInstansi(e.target.value)}
                                required
                                placeholder="Contoh: SMA Negeri 1 Jakarta"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="alamat-instansi" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Alamat Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="alamat-instansi"
                                value={alamat}
                                onChange={e => setAlamat(e.target.value)}
                                required
                                placeholder="Nama jalan, nomor, kelurahan, kecamatan"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="kota" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Kabupaten / Kota <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="kota"
                                    value={kota}
                                    onChange={e => setKota(e.target.value)}
                                    required
                                    placeholder="Contoh: Jakarta Pusat"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="provinsi" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Provinsi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="provinsi"
                                    value={provinsi}
                                    onChange={e => setProvinsi(e.target.value)}
                                    required
                                    placeholder="Contoh: DKI Jakarta"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Kata Sandi Akun <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Minimal 6 karakter"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="jenis-responden" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Responden Utama <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="jenis-responden"
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
                            {isLoad ? "Menyimpan..." : "Simpan Instansi"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AddInstansi
