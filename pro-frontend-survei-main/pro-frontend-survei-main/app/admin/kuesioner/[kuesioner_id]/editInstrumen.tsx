"use client"

import { IJenisResponden, IPertanyaan } from "@/app/types"
import { ButtonPrimary, ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { put } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
const MyEditor = dynamic(() => import('@/components/CKEditor'), {
    ssr: false,
});

type InstrumentOption = {
    opsi_jawaban: string
    ada_catatan: boolean
    keterangan_catatan: string
}
const EditInstrumen = ({ selectedInstrumen, typeRespondents }: { selectedInstrumen: IPertanyaan, typeRespondents: IJenisResponden[] }) => {
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [options, setOptions] = useState<InstrumentOption[]>([])
    const [pertanyaan, setPertanyaan] = useState<string>("")
    const [jenis, setJenis] = useState<string>("")
    const [required, setRequired] = useState<string>("")
    const [responden_group, setRespondenGroup] = useState<IJenisResponden[]>([])

    const TOKEN = getCookie(TOKEN_KEY_ADMIN) || ""
    const router = useRouter()

    const openModal = () => {
        setIsShow(true)
        setPertanyaan(selectedInstrumen.pertanyaan)
        setJenis(selectedInstrumen.jenis)
        setRequired(selectedInstrumen.required == true ? "1" : "0")
        setOptions(selectedInstrumen.opsi_pertanyaan)
        setRespondenGroup(selectedInstrumen.for_responden_group || typeRespondents)
    }

    const handleAddOption = () => {
        const tempOptions = [...options]
        tempOptions.push({
            opsi_jawaban: ``, ada_catatan: false, keterangan_catatan: ``
        })
        setOptions([...tempOptions])
    }

    const handleRemoveOption = (index: number) => {
        const tempOptions = [...options]
        tempOptions.splice(index, 1)
        setOptions([...tempOptions])
    }

    const handleChangeOpsiJawaban = (index: number, value: string) => {
        const tempOptions = [...options]
        tempOptions[index].opsi_jawaban = value
        setOptions([...tempOptions])
    }

    const handleChangeCatatan = (index: number, value: string) => {
        const tempOptions = [...options]
        tempOptions[index].keterangan_catatan = value
        setOptions([...tempOptions])
    }

    const handleChangeEnableCatatan = (index: number, value: string) => {
        const tempOptions = [...options]
        tempOptions[index].ada_catatan = value === "1"
        setOptions([...tempOptions])
    }



    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            const hasOptions = ['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG', 'DROPDOWN'].includes(jenis);
            if (hasOptions) {
                if (options.length == 0) {
                    toast.warning(`Opsi Jawaban harus ditambahkan`, { hideProgressBar: true, containerId: `toastEditInstrumen-${selectedInstrumen.uuid}` })
                    return;
                }
            }
            setIsLoad(true)
            const url = `${BASE_API_URL}/instruments/${selectedInstrumen.uuid}`
            const payload = JSON.stringify({
                id_kategori: selectedInstrumen.id_kategori,
                kategori: selectedInstrumen.kategori,
                pertanyaan,
                jenis,
                required: required === "1",
                id_survey: selectedInstrumen.id_survey,
                for_responden_group: JSON.stringify(responden_group),
                opsi: hasOptions ? options : []
            })
            const { data } = await put(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                setIsShow(false)
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastEditInstrumen-${selectedInstrumen.uuid}` })
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastEditInstrumen-${selectedInstrumen.uuid}` })
            }
        } catch (error) {
            toast.error(`Something were wrong. ${error}`, { hideProgressBar: true, containerId: `toastEditInstrumen-${selectedInstrumen.uuid}` })
        }
    }

    return (
        <div className="text-primary">
            <ToastContainer containerId={`toastEditInstrumen-${selectedInstrumen.uuid}`} />
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
                                <strong className="font-bold text-2xl text-black">Ubah Instrumen Pertanyaan</strong>
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

                    <div className="p-5">
                        <div className="my-2">
                            {/* <label htmlFor={`pertanyaan-${selectedInstrumen.uuid}`} className="text-sm">Deskripsi Pertanyaan</label>
                            <textarea id={`pertanyaan-${selectedInstrumen.uuid}`} value={pertanyaan} rows={5}
                                onChange={e => setPertanyaan(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            /> */}
                            <small className="text-sm">Deskripsi Pertanyaan</small>
                            <MyEditor id={`deskripsi-jalur`} data={pertanyaan} onChange={data => setPertanyaan(data)} />
                        </div>

                        <div className="my-2">
                            <label htmlFor={`jenis-instrumen-${selectedInstrumen.uuid}`} className="text-sm">Jenis Instrumen</label>
                            <select id={`jenis-instrumen-${selectedInstrumen.uuid}`} required={true} value={jenis}
                                onChange={e => setJenis(e.target.value)}
                                className="w-full p-2 rounded-md border border-primary">
                                <option value="">Pilih Jenis Instrumen </option>
                                <option value="PILIHAN">Pilihan Ganda (Single Choice)</option>
                                <option value="CHECKBOX">Kotak Centang (Multiple Choice)</option>
                                <option value="DROPDOWN">Dropdown</option>
                                <option value="ISIAN">Jawaban Singkat</option>
                                <option value="PARAGRAF">Paragraf / Essay</option>
                                <option value="UPLOAD_FILE">Upload Berkas / File</option>
                                <option value="SKALA_LINEAR">Skala Linear (1 - 5)</option>
                                <option value="TANGGAL">Tanggal</option>
                            </select>
                        </div>

                        <div className="my-2">
                            <small className="text-sm">Responden Group</small>
                            <div className="flex flex-col gap-2">
                                {typeRespondents.map(j => (
                                    <label key={j.uuid} className="flex items-center gap-2">
                                        <input
                                            id={`input-checkbox-${selectedInstrumen.uuid}-${j.uuid}`}
                                            type="checkbox"
                                            value={j.uuid}
                                            checked={responden_group.map(it => it.uuid).includes(j.uuid)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setRespondenGroup([...responden_group, j])
                                                } else {
                                                    setRespondenGroup(responden_group.filter(jenis => jenis.uuid !== j.uuid))
                                                }
                                            }}
                                        />
                                        {j.jenis}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={`my-2 ${['PILIHAN', 'CHECKBOX', 'PILIHAN_GANDA', 'KOTAK_CENTANG', 'DROPDOWN'].includes(jenis) ? `block` : `hidden`}`}>


                            <div className="my-3">
                                {
                                    options.map((option, indexOption) => (
                                        <div key={`keyOpsiJawaban-${selectedInstrumen.uuid}-${indexOption}`}
                                            className="w-full flex flex-wrap items-center my-2 border-b">
                                            <div className="w-full md:w-7/12 p-1">
                                                <div className="my-2">
                                                    <label htmlFor={`opsi-jawaban-${selectedInstrumen.uuid}-${indexOption}`} className="text-sm">Opsi Jawaban</label>
                                                    <input type="text" id={`opsi-jawaban-${selectedInstrumen.uuid}-${indexOption}`} value={option.opsi_jawaban}
                                                        onChange={e => handleChangeOpsiJawaban(indexOption, e.target.value)} required={true}
                                                        className="w-full p-2 rounded-md border border-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-full md:w-3/12 p-1">
                                                <div className="my-2">
                                                    <label htmlFor={`opsi-note-${selectedInstrumen.uuid}-${indexOption}`} className="text-sm">Perlu Catatan</label>
                                                    <select id={`opsi-note-${selectedInstrumen.uuid}-${indexOption}`} required={true} value={option.ada_catatan ? `1` : `0`}
                                                        onChange={e => handleChangeEnableCatatan(indexOption, e.target.value)}
                                                        className="w-full p-2 rounded-md border border-primary">
                                                        <option value="0">Tidak</option>
                                                        <option value="1">Ya</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-2/12 p-1">
                                                <div className="my-2">
                                                    <button type="button" onClick={() => handleRemoveOption(indexOption)}
                                                        className="text-4xl font-bold text-red-500">
                                                        &times;
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={`w-full p-1 ${option.ada_catatan ? `block` : `hidden`}`}>
                                                <label htmlFor={`catatan-jawaban-${selectedInstrumen.uuid}-${indexOption}`} className="text-sm">Catatan</label>
                                                <input type="text" id={`catatan-jawaban-${selectedInstrumen.uuid}-${indexOption}`} value={option.keterangan_catatan}
                                                    onChange={e => handleChangeCatatan(indexOption, e.target.value)} required={option.ada_catatan}
                                                    className="w-full p-2 rounded-md border border-primary"
                                                />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <ButtonSuccess type="button" onClick={() => handleAddOption()} className="text-xs">
                                Tambah Opsi Jawaban
                            </ButtonSuccess>
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
export default EditInstrumen