"use client"
import { ILokasiPetugas, IResponden, ISurvei, IUser } from "@/app/types"
import { ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import SelectSearch from "@/components/SelectSearch"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const AddSetPetugas = ({ survey_id, listPetugas, listResponden }: { survey_id: string, listPetugas: IUser[], listResponden: IResponden[] }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [petugasId, setPetugasId] = useState<string>("")
    const [selectedResponden, setSelectedResponden] = useState<string[]>([]);
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoad(true)
            if (selectedResponden.length === 0) {
                toast.warning("Pilih minimal 1 responden", { containerId: "toastLokasiPetugas" });
                setIsLoad(false);
                return;
            }
            const url = `${BASE_API_URL}/lokasi-petugas`
            const payload = JSON.stringify({
                id_survey: survey_id,
                id_petugas: petugasId,
                responden: selectedResponden.map(id => ({ id_responden: id }))
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastLokasiPetugas` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastLokasiPetugas` })
            }
        } catch (error) {
            toast.error(`Something were wrong. ${error}`, { hideProgressBar: true, containerId: `toastKategori` })
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastLokasiPetugas`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Tambah Lokasi Petugas
                </div>
            </ButtonSuccess>
            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit}>
                    {/* modal header */}
                    <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
                        <div className="w-full flex items-center">
                            <div className="flex flex-col">
                                <strong className="font-bold text-2xl text-black">Tambah Penempatan Lokasi Petugas</strong>
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
                            <label htmlFor={`petugas`} className="text-sm">Petugas</label>
                            <select id={`petugas`} required={true} value={petugasId}
                                onChange={e => setPetugasId(e.target.value)}
                                className="w-full p-2 rounded-md border border-primary">
                                <option value="">Pilih Petugas</option>
                                {
                                    listPetugas.map((item, index) => (
                                        <option value={item.uuid} key={`keyPetugas-${index}`}>{item.nama_user}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="my-2">
                            <label className="text-sm">Responden</label>
                            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
                                {listResponden.map((item, index) => (
                                    <div key={`responden-${index}`} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`responden-${index}`}
                                            value={item.uuid}
                                            onChange={(e) => {
                                                const { checked, value } = e.target;
                                                setSelectedResponden(prev =>
                                                    checked
                                                        ? [...prev, value]
                                                        : prev.filter(id => id !== value)
                                                );
                                            }}
                                        />
                                        <label htmlFor={`responden-${index}`}>{item.nama}</label>
                                    </div>
                                ))}
                            </div>
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

export default AddSetPetugas