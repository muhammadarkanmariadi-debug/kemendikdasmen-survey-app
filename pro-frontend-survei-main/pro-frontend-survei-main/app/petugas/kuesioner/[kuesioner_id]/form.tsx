"use client"

import { IInstansi, IJenisResponden, IKategori, IResponden } from "@/app/types"
import { ButtonPrimary } from "@/components/button"
import Modal from "@/components/Modal"
import SliderPanel from "@/components/Slider"
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from "@/global"
import { post } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import { SignaturePad } from "@/components/field-mode/SignaturePad"
import { GeolocationCapture } from "@/components/field-mode/GeolocationCapture"

type Answer = {
    id_pertanyaan: string
    jawaban: string
    catatan: string
}
const FormSubmission = ({ categories, respondents, survey_id, jenisResponden }: { categories: IKategori[], respondents: { uuid: string, nama_instansi: string, id_instansi: string, id_jenis_responden: string, tipe: string }[], survey_id: string, jenisResponden: IJenisResponden[] }) => {
    const [id_responden, setIdResponden] = useState<string>("")
    const [jawaban, setJawaban] = useState<{ [key: string]: { jawaban: string; catatan: string } }>({})
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [nama, setNama] = useState<string>("")
    const [filterCategories, setFilterCategories] = useState<IKategori[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const TOKEN = getCookie(TOKEN_KEY_PETUGAS) || ""
    const router = useRouter()

    /** ini untuk petugas hilangkan jika untuk instansi */
    const [id_jenis_responden, setIdJenisResponden] = useState<string>(``)
    const [signature, setSignature] = useState<string>('')
    const [gpsCoords, setGpsCoords] = useState<{ latitude: number, longitude: number, accuracy: number } | null>(null)

    useEffect(() => {
        let tempAnswer = {}
        /** aktifkan baris ini jika untuk instansi */
        // const id_jenis_responden = respondents.find(it => it.id_instansi === id_responden)?.id_jenis_responden || ``
        for (let i = 0; i < filterCategories.length; i++) {
            const questions = filterCategories[i].pertanyaan.filter(it => it.for_responden_group.some(res => res.uuid === id_jenis_responden))
            for (let j = 0; j < questions.length; j++) {
                tempAnswer = {
                    ...tempAnswer,
                    [questions[j].uuid]: {
                        jawaban: ``,
                        catatan: ``
                    }
                }
            }
        }
        setJawaban({ ...tempAnswer })
    }, [filterCategories, id_jenis_responden]) /** hilangkan id_jenis_responden jika untuk instansi */

    useEffect(() => {
        setFilterCategories(categories.filter(it => it.pertanyaan.length > 0))
    }, [categories])

    useEffect(() => {
        /** aktifkan baris ini jika untuk instansi */
        // const id_jenis_responden = respondents.find(it => it.id_instansi === id_responden)?.id_jenis_responden || ""

        if (id_jenis_responden !== ``) {
            const filtered = categories.map(kategori => ({
                ...kategori,
                pertanyaan: kategori.pertanyaan.filter(q =>
                    q.for_responden_group.some(res => res.uuid === id_jenis_responden)
                )
            })).filter(kategori => kategori.pertanyaan.length > 0)
            setFilterCategories(filtered)
        } else {
            setFilterCategories([])
        }

        /** hilangkan baris ini jika untuk instansi */
        setIdJenisResponden(id_jenis_responden)
    }, [id_responden, id_jenis_responden]) /** hilangkan id_jenis_responden jika untuk instansi */

    const isJSON = (plainText: string): boolean => {
        try {
            JSON.parse(plainText)
            return true
        } catch (error) {
            return false
        }
    }

    const handleFillJawaban = (id_pertanyaan: string, value: string) => {
        const tempAnswer = { ...jawaban }
        tempAnswer[id_pertanyaan].jawaban = value
        setJawaban({ ...tempAnswer })
    }

    const handleChooseAnswer = (id_pertanyaan: string, value: string, text: string) => {
        const tempAnswer = { ...jawaban }
        tempAnswer[id_pertanyaan].jawaban = JSON.stringify({ id_opsi_jawaban: value, text })
        setJawaban({ ...tempAnswer })
    }

    const handleCheckAnswer = (id_pertanyaan: string, value: string, text: string) => {
        const tempAnswer = { ...jawaban }
        const tmp = tempAnswer[id_pertanyaan].jawaban
        if (isJSON(tmp)) {
            const parsed: { id_opsi_jawaban: string, text: string }[] = JSON.parse(tmp)
            const findIndex = parsed.findIndex(it => it.id_opsi_jawaban === value)
            if (findIndex < 0) {
                parsed.push({ id_opsi_jawaban: value, text })
            } else {
                parsed.splice(findIndex, 1)
            }
            tempAnswer[id_pertanyaan].jawaban = JSON.stringify(parsed)
        } else {
            tempAnswer[id_pertanyaan].jawaban = JSON.stringify([{ id_opsi_jawaban: value, text }])
        }
        setJawaban({ ...tempAnswer })
    }

    const handleCheckJawaban = (id_pertanyaan: string, value: string): boolean => {
        try {
            const tempJawaban = jawaban[id_pertanyaan]?.jawaban
            if (isJSON(tempJawaban)) {
                const parsed: { id_opsi_jawaban: string } = JSON.parse(tempJawaban)
                return value === parsed?.id_opsi_jawaban
            }
            return false
        } catch (error) {
            return false
        }
    }

    const handleCheckboxJawaban = (id_pertanyaan: string, value: string): boolean => {
        try {
            const tempJawaban = jawaban[id_pertanyaan]?.jawaban
            if (isJSON(tempJawaban)) {
                const parsed: { id_opsi_jawaban: string }[] = JSON.parse(tempJawaban)
                const findAnswer = parsed.find(it => it.id_opsi_jawaban === value)
                if (findAnswer) return true
            }
            return false
        } catch (error) {
            return false
        }
    }

    const handleFillCatatan = (id_pertanyaan: string, option_id: string, type: string, value: string) => {
        const tempAnswer = { ...jawaban }
        if (type === `CHECKBOX`) {
            const tmp = tempAnswer[id_pertanyaan].catatan
            if (isJSON(tmp)) {
                const parsed: { option_id: string, value: string }[] = JSON.parse(tmp)
                const findIndex = parsed.findIndex(it => it.option_id === option_id)
                if (findIndex < 0) {
                    parsed.push({ option_id, value })
                } else {
                    parsed[findIndex].value = value
                }
                tempAnswer[id_pertanyaan].catatan = JSON.stringify(parsed)
            } else {
                tempAnswer[id_pertanyaan].catatan = JSON.stringify([{ option_id, value }])
            }
        } else {
            tempAnswer[id_pertanyaan].catatan = value
        }
        setJawaban({ ...tempAnswer })
    }

    const handleConfirmation = async (e: FormEvent) => {
        e.preventDefault()
        setIsShow(true)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const tag = (e.target as HTMLElement).tagName
        if (e.key === 'Enter' && tag !== 'TEXTAREA') {
            e.preventDefault()
        }
    }

    const handleSubmit = async () => {
        try {
            const url = `${BASE_API_URL}/submission`
            const answer: Answer[] = []
            for (const key of Object.keys(jawaban)) {
                answer.push({
                    id_pertanyaan: key,
                    jawaban: jawaban[key].jawaban,
                    catatan: jawaban[key].catatan
                })
            }
            const findEmpty = answer.find(it => it.jawaban === ``)
            if (findEmpty) {
                const findCategory = filterCategories.find(it => it.pertanyaan.find(item => item.uuid === findEmpty.id_pertanyaan) !== null)
                if (findCategory) {
                    toast.warning(`Masih ada pertanyaan yang belum diisi pada kategori ${findCategory.nama_kategori}`, { hideProgressBar: true, containerId: `toastSubmission` })
                    setIsShow(false)
                    return;
                }
            }
            setIsLoad(true)
            const nama_instansi = respondents.find(it => it.id_instansi === id_responden)?.nama_instansi || `-`
            const payload = JSON.stringify({
                id_survey: survey_id,
                nama: `${nama} - ${nama_instansi}`,
                id_instansi: id_responden,
                /** aktifkan baris ini jika untuk instansi */
                // id_jenis_responden: respondents.find(it => it.id_instansi === id_responden)?.id_jenis_responden || ``,

                /** hapus baris ini jika untuk instansi */
                id_jenis_responden,
                jawaban: answer,
                signature: signature || undefined,
                gps: gpsCoords || undefined,
            })
            const { data } = await post(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                setIsShow(false)
                toast.success(`${data?.message}`, { hideProgressBar: true, containerId: `toastSubmission` })
                setTimeout(() => router.replace(`/petugas/kuesioner/${survey_id}/files?submission_id=${data?.data?.uuid}`), 1000)
            } else {
                toast.warning(`${data?.message}`, { hideProgressBar: true, containerId: `toastSubmission` })
            }
        } catch (error) {
            toast.error(`Something were worng. ${error}`, { hideProgressBar: true, containerId: `toastSubmission` })
        }
    }

    const getValueOfCatatan = (option_id: string, catatan: string): string => {
        if (isJSON(catatan)) {
            const parsed = JSON.parse(catatan) as { option_id: string, value: string }[]
            if (Array.isArray(parsed)) {
                const find = parsed.find(it => it.option_id === option_id)
                return find ? find.value : ``
            }
        }
        return catatan
    }

    return (
        <form onSubmit={handleConfirmation} onKeyDown={handleKeyDown}>
            <ToastContainer containerId={`toastSubmission`} />
            {/* hilangkan satu div ini jika untuk instansi */}
            <div className="my-2">
                <label htmlFor="list-responden" className="text-primary text-sm font-semibold">Pilih Responden</label>
                <select id={`list-responden`} required={true} value={id_responden}
                    onChange={e => setIdResponden(e.target.value)}
                    className="w-full p-2 rounded-md border border-primary">
                    <option value="">Pilih Responden </option>
                    {
                        respondents.map((responden, index) => (
                            <option value={responden.id_instansi} key={`keyResponden-${index}`}>{responden.nama_instansi}</option>
                        ))
                    }
                </select>
            </div>

            {/* hilangkan satu div ini jika untuk instansi */}
            <div className="my-2">
                <label htmlFor="tipe-responden" className="text-primary text-sm font-semibold">Pilih Tipe Responden</label>
                <select id={`tipe-responden`} required={true} value={id_jenis_responden}
                    onChange={e => setIdJenisResponden(e.target.value)}
                    className="w-full p-2 rounded-md border border-primary">
                    <option value="">Pilih Tipe Responden </option>
                    {
                        jenisResponden.filter(it => it.tipe === respondents.find(it => it.id_instansi === id_responden)?.tipe).map((jenis, index) => (
                            <option value={jenis.uuid} key={`keyJenis-${index}`}>{jenis.jenis}</option>
                        ))
                    }
                    {/* {
                        jenisResponden.map((jenis, index) => (
                            <option value={jenis.uuid} key={`keyJenis-${index}`}>{jenis.jenis}</option>
                        ))
                    } */}
                </select>
            </div>

            {
                filterCategories.length == 0 ?
                    <div className="w-full border-2 border-primary bg-sky-100 text-primary p-3 rounded-lg">
                        Tidak ada pertanyaan yang tersedia untuk responden ini.
                    </div> :
                    <div>
                        <SliderPanel onChange={index => setSelectedIndex(index)}>
                            <div id="Identitas Responden">
                                <strong className="text-lg">Identitas Responden</strong>
                                <p className="text-sm text-gray-500">Isi identitas responden sebelum mengisi kuesioner.</p>

                                <div className="my-3">
                                    Nama Instansi: <strong>{respondents.find(it => it.id_instansi === id_responden)?.nama_instansi || `-`}</strong>
                                </div>
                                <div className="my-3">
                                    Nama Responden
                                    <input type="text" id={`nama-responden`} required={true} value={nama}
                                        onChange={e => setNama(e.target.value)}
                                        className="w-full p-2 border border-primary rounded-md" />
                                </div>
                            </div>
                            {
                                filterCategories.map((kategori, indexKategori) => (
                                    <div key={`keyKategori-${indexKategori}`} id={kategori.nama_kategori}>
                                        <strong className="text-lg">{kategori.nama_kategori}</strong>
                                        <ol className="ps-5 list-decimal">
                                            {
                                                kategori.pertanyaan.map((question, indexQuestion) => (
                                                    <li key={`keyPertanyaan-${indexKategori}-${indexQuestion}`} className="my-3">
                                                        <div className="tailwind-reset">
                                                            <div dangerouslySetInnerHTML={{ __html: question.pertanyaan }}></div>
                                                        </div>
                                                        {
                                                            question.jenis === `ISIAN` ?
                                                                <textarea id={`jawaban-${indexKategori}-${indexQuestion}`}
                                                                    required={question.required} defaultValue={jawaban[question.uuid]?.jawaban || ""}
                                                                    placeholder="Tuliskan Jawaban Anda disini"
                                                                    className="w-full border border-primary rounded-md p-2"
                                                                    onChange={e => handleFillJawaban(
                                                                        question.uuid, e.target.value
                                                                    )}
                                                                    disabled={
                                                                        indexQuestion > 0 && // bukan pertanyaan pertama
                                                                        !jawaban[kategori.pertanyaan[indexQuestion - 1].uuid]?.jawaban // cek kalau sebelumnya kosong
                                                                    }>
                                                                </textarea>
                                                                : <></>
                                                        }
                                                        {
                                                            question.jenis === `PILIHAN` ?
                                                                <div>
                                                                    {
                                                                        question.opsi_pertanyaan.map((option, indexOption) => (
                                                                            <div key={`keyOpsi-${indexKategori}-${indexQuestion}-${indexOption}`}
                                                                                className="flex flex-col gap-1">
                                                                                <div className="flex flex-nowrap gap-1 items-center">
                                                                                    <input type="radio" name={question.uuid}
                                                                                        id={`opsi-${indexKategori}-${indexQuestion}-${indexOption}`}
                                                                                        required={question.required}
                                                                                        value={option.uuid}
                                                                                        onChange={e => handleChooseAnswer(question.uuid, e.target.value, option.opsi_jawaban)}
                                                                                        checked={handleCheckJawaban(question.uuid, option.uuid)}
                                                                                        className="size-3"
                                                                                        disabled={
                                                                                            indexQuestion > 0 &&
                                                                                            !jawaban[kategori.pertanyaan[indexQuestion - 1].uuid]?.jawaban
                                                                                        } />
                                                                                    <label className="grow" htmlFor={`opsi-${indexKategori}-${indexQuestion}-${indexOption}`}>
                                                                                        {option.opsi_jawaban}
                                                                                    </label>
                                                                                </div>
                                                                                {
                                                                                    option.ada_catatan && handleCheckJawaban(question.uuid, option.uuid) ?
                                                                                        <div className="flex flex-col">
                                                                                            <label htmlFor={`jawaban-keterangan-catatan-${option.uuid}`}
                                                                                                className="font-semibold text-sm text-primary">
                                                                                                {option.keterangan_catatan}
                                                                                            </label>
                                                                                            <input type="text" id={`jawaban-keterangan-catatan-${option.uuid}`}
                                                                                                required={true} defaultValue={getValueOfCatatan(option.uuid, jawaban[question.uuid]?.catatan || "")}
                                                                                                className="w-full border border-primary rounded-md p-2"
                                                                                                onChange={e => handleFillCatatan(
                                                                                                    question.uuid, option.uuid, question.jenis, e.target.value
                                                                                                )} />
                                                                                        </div> :
                                                                                        <></>
                                                                                }
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                                : <></>
                                                        }
                                                        {
                                                            question.jenis === `CHECKBOX` ?
                                                                <div>
                                                                    {
                                                                        question.opsi_pertanyaan.map((option, indexOption) => (
                                                                            <div key={`keyOpsi-${indexKategori}-${indexQuestion}-${indexOption}`}
                                                                                className="flex flex-col gap-1">
                                                                                <div className="flex flex-nowrap gap-1 items-center">
                                                                                    <input type="checkbox" name={question.uuid}
                                                                                        id={`opsi-${indexKategori}-${indexQuestion}-${indexOption}`}
                                                                                        value={option.uuid}
                                                                                        onChange={e => handleCheckAnswer(question.uuid, e.target.value, option.opsi_jawaban)}
                                                                                        checked={handleCheckboxJawaban(question.uuid, option.uuid)}
                                                                                        className="size-3"
                                                                                        disabled={
                                                                                            indexQuestion > 0 &&
                                                                                            !jawaban[kategori.pertanyaan[indexQuestion - 1].uuid]?.jawaban
                                                                                        } />
                                                                                    <label className="grow" htmlFor={`opsi-${indexKategori}-${indexQuestion}-${indexOption}`}>
                                                                                        {option.opsi_jawaban}
                                                                                    </label>
                                                                                </div>
                                                                                {
                                                                                    option.ada_catatan && handleCheckboxJawaban(question.uuid, option.uuid) ?
                                                                                        <div className="flex flex-col">
                                                                                            <label htmlFor={`jawaban-keterangan-catatan-${option.uuid}`}
                                                                                                className="font-semibold text-sm text-primary">
                                                                                                {option.keterangan_catatan}
                                                                                            </label>
                                                                                            <input type="text" id={`jawaban-keterangan-catatan-${option.uuid}`}
                                                                                                required={true} defaultValue={getValueOfCatatan(option.uuid, jawaban[question.uuid]?.catatan || "")}
                                                                                                className="w-full border border-primary rounded-md p-2"
                                                                                                onChange={e => handleFillCatatan(
                                                                                                    question.uuid, option.uuid, question.jenis, e.target.value
                                                                                                )} />
                                                                                        </div> :
                                                                                        <></>
                                                                                }
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div> : <></>
                                                        }
                                                    </li>
                                                ))
                                            }
                                        </ol>
                                    </div>
                                ))
                            }
                        </SliderPanel>
                        {
                            selectedIndex == filterCategories.length &&
                            <ButtonPrimary type="submit" className="w-full my-3">
                                Kirim
                            </ButtonPrimary>
                        }
                    </div>
            }




            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <div className="p-6 text-black space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="text-center">
                        <strong className="text-lg font-bold text-slate-900">Verifikasi Lapangan Petugas</strong>
                        <p className="text-xs text-slate-500 mt-1">Lengkapi bukti verifikasi lapangan (GPS & Tanda Tangan) sebelum mengirim kuesioner.</p>
                    </div>

                    <GeolocationCapture onLocationCaptured={setGpsCoords} />
                    <SignaturePad onSave={setSignature} />

                    <div className="text-center text-sm font-medium text-slate-700 pt-2 border-t border-slate-100">
                        Kirim data kuesioner untuk responden <strong>{nama}</strong> ({respondents.find(it => it.id_instansi === id_responden)?.nama_instansi})?
                    </div>
                </div>

                {/* modal footer */}
                <div className="w-full p-4 flex rounded-b-2xl shadow bg-slate-50 border-t border-slate-100">
                    <div className="flex ml-auto gap-2">
                        <button type="button"
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer" onClick={() => setIsShow(false)}>
                            Batal
                        </button>
                        <button type="button" disabled={isLoad} onClick={() => handleSubmit()}
                            className={`bg-kemendikbud-blue hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg text-xs shadow-md cursor-pointer ${isLoad ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {isLoad ? `Mengirim...` : `Kirim Kuesioner`}
                        </button>
                    </div>
                </div>
            </Modal>
        </form>
    )
}
export default FormSubmission