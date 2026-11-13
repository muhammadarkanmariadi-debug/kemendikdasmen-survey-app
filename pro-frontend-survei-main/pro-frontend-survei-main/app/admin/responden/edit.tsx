"use client"
import { ButtonPrimary } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { put } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { IResponden } from "@/app/types"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const EditResponden = ({ selectedResponden }: { selectedResponden: IResponden }) => {
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
        setNama(selectedResponden.nama)
        setJenisResponden(selectedResponden.jenis_responden)
        setAlamat(selectedResponden.alamat)
        setKabKota(selectedResponden.kab_kota)
        setProvinsi(selectedResponden.provinsi)
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            const url = `${BASE_API_URL}/responden/${selectedResponden.uuid}`
            const payload = JSON.stringify({
                jenis_responden, nama,
                alamat, provinsi, kab_kota
            })
            const { data } = await put(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastResponden-${selectedResponden.uuid}` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastResponden-${selectedResponden.uuid}` })
            }
        } catch (error) {
            toast.error(`Something were wrong. ${error}`, { hideProgressBar: true, containerId: `toastResponden-${selectedResponden.uuid}` })
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastResponden-${selectedResponden.uuid}`} />
            <ButtonPrimary type="button" onClick={() => openModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </ButtonPrimary>
            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit}>
                    {/* modal header */}
                    <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
                        <div className="w-full flex items-center">
                            <div className="flex flex-col">
                                <strong className="font-bold text-2xl text-black">Edit Data Responden</strong>
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
                            <label htmlFor={`nama-responden-${selectedResponden.uuid}`} className="text-sm">Nama Responden</label>
                            <input type="text" id={`nama-responden-${selectedResponden.uuid}`} value={nama}
                                onChange={e => setNama(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
                        <div className="my-2">
                            <label htmlFor={`jenis-responden-${selectedResponden.uuid}`} className="text-sm">Jenis Responden</label>
                            <select id={`jenis-responden-${selectedResponden.uuid}`} required={true} value={jenis_responden}
                                onChange={e => setJenisResponden(e.target.value)}
                                className="w-full p-2 rounded-md border border-primary">
                                <option value="">Pilih Jenis Responden</option>
                                <option value="SEKOLAH">SEKOLAH</option>
                                <option value="DINAS">DINAS</option>
                            </select>
                        </div>
                        <div className="my-2">
                            <label htmlFor={`alamat-responden-${selectedResponden.uuid}`} className="text-sm">Alamat</label>
                            <input type="text" id={`alamat-responden-${selectedResponden.uuid}`} value={alamat}
                                onChange={e => setAlamat(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
                        <div className="my-2">
                            <label htmlFor={`kota-${selectedResponden.uuid}`} className="text-sm">Kota / Kabupaten</label>
                            <input type="text" id={`kota-${selectedResponden.uuid}`} value={kab_kota}
                                onChange={e => setKabKota(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            />
                        </div>
                        <div className="my-2">
                            <label htmlFor={`provinsi-${selectedResponden.uuid}`} className="text-sm">Provinsi</label>
                            <input type="text" id={`provinsi-${selectedResponden.uuid}`} value={provinsi}
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
export default EditResponden