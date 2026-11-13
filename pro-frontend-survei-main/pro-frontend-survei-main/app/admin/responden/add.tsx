"use client"
import { ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const AddResponden = () => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [jenis_responden, setJenisResponden] = useState<string>("")
    const [nama, setNama] = useState<string>("")
    const [alamat, setAlamat] = useState<string>("")
    const [provinsi, setProvinsi] = useState<string>("")
    const [kab_kota, setKabKota] = useState<string>("")
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setNama("")
        setJenisResponden("")
        setAlamat("")
        setKabKota("")
        setProvinsi("")
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/responden`
            const payload = JSON.stringify({
                jenis_responden, nama,
                alamat, provinsi, kab_kota
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastResponden` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastResponden` })
            }
        } catch (error) {
            toast.error(`Something were wrong. ${error}`, { hideProgressBar: true, containerId: `toastResponden` })
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastResponden`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Tambah Data Responden
                </div>
            </ButtonSuccess>
            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit}>
                    {/* modal header */}
                    <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
                        <div className="w-full flex items-center">
                            <div className="flex flex-col">
                                <strong className="font-bold text-2xl text-black">Tambah Data Responden</strong>
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
                        <div className="my-2">
                            <label htmlFor={`nama-responden`} className="text-sm">Nama Responden</label>
                            <input type="text" id={`nama-responden`} value={nama}
                                onChange={e => setNama(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
                        <div className="my-2">
                            <label htmlFor={`jenis-responden`} className="text-sm">Jenis Responden</label>
                            <select id={`jenis-responden`} required={true} value={jenis_responden}
                                onChange={e => setJenisResponden(e.target.value)}
                                className="w-full p-2 rounded-md border border-primary">
                                <option value="">Pilih Jenis Responden</option>
                                <option value="SEKOLAH">SEKOLAH</option>
                                <option value="DINAS">DINAS</option>
                            </select>
                        </div>
                        <div className="my-2">
                            <label htmlFor={`alamat-responden`} className="text-sm">Alamat</label>
                            <input type="text" id={`alamat-responden`} value={alamat}
                                onChange={e => setAlamat(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
                        <div className="my-2">
                            <label htmlFor={`kota`} className="text-sm">Kota / Kabupaten</label>
                            <input type="text" id={`kota`} value={kab_kota}
                                onChange={e => setKabKota(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
                        <div className="my-2">
                            <label htmlFor={`provinsi`} className="text-sm">Provinsi</label>
                            <input type="text" id={`provinsi`} value={provinsi}
                                onChange={e => setProvinsi(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
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
                                {isLoad ? `Menyimpan` : `Simpan`}
                            </button>
                        </div>
                    </div>
                    {/* end modal footer */}
                </form>
            </Modal>
        </div>
    )


}
export default AddResponden