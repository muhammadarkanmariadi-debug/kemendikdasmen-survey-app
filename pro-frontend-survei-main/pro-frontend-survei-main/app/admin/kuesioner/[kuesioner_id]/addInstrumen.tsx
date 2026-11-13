"use client"

import { IJenisResponden, IKategori } from "@/app/types"
import { ButtonSuccess } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import dynamic from "next/dynamic"

const MyEditor = dynamic(() => import('@/components/CKEditor'), {
    ssr: false,
});

type InstrumentOption = {
    opsi_jawaban: string
    ada_catatan: boolean
    keterangan_catatan: string
}
const AddInstrumen = ({ selectedKategori, typeRespondents }: { selectedKategori: IKategori, typeRespondents: IJenisResponden[] }) => {
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
        setPertanyaan("")
        setJenis("")
        setRequired("")
        setOptions([])
        setRespondenGroup([...typeRespondents])
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
                    toast.warning(`Opsi Jawaban harus ditambahkan`, { hideProgressBar: true, containerId: `toastInstrumen-${selectedKategori.uuid}` })
                    return;
                }
            }
            setIsLoad(true)
            const url = `${BASE_API_URL}/instruments`
            const payload = JSON.stringify({
                id_kategori: selectedKategori.uuid,
                kategori: selectedKategori.nama_kategori,
                pertanyaan,
                jenis,
                required: required === "1",
                id_survey: selectedKategori.id_survey,
                opsi: hasOptions ? options : [],
                for_responden_group: JSON.stringify(responden_group)
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                setIsShow(false)
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastInstrumen-${selectedKategori.uuid}` })
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastInstrumen-${selectedKategori.uuid}` })
            }
        } catch (error) {
            toast.error(`Something were wrong. ${error}`, { hideProgressBar: true, containerId: `toastInstrumen-${selectedKategori.uuid}` })
        }
    }

    return (
        <div className="text-primary">
            <ToastContainer containerId={`toastInstrumen-${selectedKategori.uuid}`} />
            <ButtonSuccess type="button" onClick={() => openModal()}>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 20 20">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Buat Instrumen Pertanyaan
                </div>
            </ButtonSuccess>
            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit}>
                    {/* modal header */}
                    <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
                        <div className="w-full flex items-center">
                            <div className="flex flex-col">
                                <strong className="font-bold text-2xl text-black">Buat Instrumen Pertanyaan</strong>
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
                            {/* <label htmlFor={`pertanyaan-${selectedKategori.uuid}`} className="text-sm">Deskripsi Pertanyaan</label>
                            <textarea id={`pertanyaan-${selectedKategori.uuid}`} value={pertanyaan} rows={5}
                                onChange={e => setPertanyaan(e.target.value)} required={true}
                                className="w-full p-2 rounded-md border border-primary"
                            /> */}
                            <small className="text-sm">Deskripsi Pertanyaan</small>
                            <MyEditor id={`deskripsi-jalur`} data={pertanyaan} onChange={data => setPertanyaan(data)} />
                        </div>

                        <div className="my-2">
                            <label htmlFor={`jenis-instrumen-${selectedKategori.uuid}`} className="text-sm">Jenis Instrumen</label>
                            <select id={`jenis-instrumen-${selectedKategori.uuid}`} required={true} value={jenis}
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
                                            id={`input-checkbox-${j.uuid}`}
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
                                        <div key={`keyOpsiJawaban-${selectedKategori.uuid}-${indexOption}`}
                                            className="w-full flex flex-wrap items-center my-2 border-b">
                                            <div className="w-full md:w-7/12 p-1">
                                                <div className="my-2">
                                                    <label htmlFor={`opsi-jawaban-${selectedKategori.uuid}-${indexOption}`} className="text-sm">Opsi Jawaban</label>
                                                    <input type="text" id={`opsi-jawaban-${selectedKategori.uuid}-${indexOption}`} value={option.opsi_jawaban}
                                                        onChange={e => handleChangeOpsiJawaban(indexOption, e.target.value)} required={true}
                                                        className="w-full p-2 rounded-md border border-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-full md:w-3/12 p-1">
                                                <div className="my-2">
                                                    <label htmlFor={`opsi-note-${selectedKategori.uuid}-${indexOption}`} className="text-sm">Perlu Catatan</label>
                                                    <select id={`opsi-note-${selectedKategori.uuid}-${indexOption}`} required={true} value={option.ada_catatan ? `1` : `0`}
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
                                                <label htmlFor={`catatan-jawaban-${selectedKategori.uuid}-${indexOption}`} className="text-sm">Catatan</label>
                                                <input type="text" id={`catatan-jawaban-${selectedKategori.uuid}-${indexOption}`} value={option.keterangan_catatan}
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
export default AddInstrumen