"use client"

import { IInstansi, ISurvei, IUser } from "@/app/types"
import { ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import SearchableSelect from "@/components/SelectSearch"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

const AddAssignment = ({ surveys, selectedPetugas, instansi }: {
    surveys: ISurvei[], selectedPetugas: IUser, instansi: IInstansi[]
}) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [id_survey, setIdSurvey] = useState<string>("")
    const [selectedInstansi, setSelectedInstansi] = useState<{ id_instansi: string, nama_instansi: string }[]>([])
    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setIdSurvey("")
        setSelectedInstansi([])
    }

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            if (!id_survey) {
                toast.warning("Pilih instrumen survei terlebih dahulu", { hideProgressBar: true, containerId: `toastAddAssignment` })
                return
            }
            if (selectedInstansi.length == 0) {
                toast.warning("Pilih minimal satu instansi sasaran", { hideProgressBar: true, containerId: `toastAddAssignment` })
                return
            }
            setIsLoad(true)
            const url = `${BASE_API_URL}/assignments`
            const payload = JSON.stringify({
                id_petugas: selectedPetugas.uuid,
                id_survey,
                instansi: selectedInstansi
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success === true) {
                setIsShow(false)
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastAddAssignment` })
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastAddAssignment` })
            }
        } catch (error) {
            console.log(error)
            toast.error("Gagal menambahkan penugasan", { hideProgressBar: true, containerId: `toastAddAssignment` })
            setIsLoad(false)
        }
    }

    return (
        <div>
            <ToastContainer containerId={`toastAddAssignment`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Tambah Penugasan</span>
            </ButtonSuccess>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="relative px-6 py-5 border-b border-slate-100 bg-white">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-[#1E77BD] to-[#FFB703]" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Tambah Penugasan Survei</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tugaskan {selectedPetugas.nama_user} ke instrumen dan instansi sasaran</p>
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
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Pilih Kuesioner / Instrumen <span className="text-rose-500">*</span>
                            </label>
                            <SearchableSelect
                                options={surveys.map(s => ({ value: s.uuid, label: s.nama_survey }))}
                                value={id_survey}
                                onChange={val => setIdSurvey(val)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Pilih Satuan Pendidikan / Instansi <span className="text-rose-500">*</span>
                            </label>
                            <SearchableSelect
                                options={instansi.map(s => ({ value: s.uuid, label: `${s.nama_instansi} (${s.kode_instansi})` }))}
                                value={""}
                                onChange={val => {
                                    const temp = [...selectedInstansi]
                                    const findInstansi = instansi.find(it => it.uuid === val)
                                    const findSelectedInstansi = temp.find(it => it.id_instansi === val)
                                    if (findInstansi && !findSelectedInstansi) {
                                        temp.push({
                                            id_instansi: val,
                                            nama_instansi: findInstansi.nama_instansi
                                        })
                                    }
                                    setSelectedInstansi([...temp])
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                                Instansi Terpilih ({selectedInstansi.length})
                            </label>
                            {selectedInstansi.length === 0 ? (
                                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
                                    Belum ada instansi yang dipilih. Silakan cari dan pilih pada dropdown di atas.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                                    {selectedInstansi.map((ins, index) => (
                                        <div
                                            key={`keySelectedInstansi-${ins.id_instansi}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#0B5C9E] font-medium"
                                        >
                                            <span>{ins.nama_instansi}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const temp = [...selectedInstansi]
                                                    temp.splice(index, 1)
                                                    setSelectedInstansi([...temp])
                                                }}
                                                className="hover:text-rose-600 transition-colors p-0.5"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all disabled:opacity-50"
                        >
                            {isLoad ? "Menyimpan..." : "Simpan Penugasan"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AddAssignment
