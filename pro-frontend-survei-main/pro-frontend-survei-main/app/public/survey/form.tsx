"use client"

import { IKategori } from "@/app/types"
import { ButtonPrimary } from "@/components/button"
import Modal from "@/components/Modal"
import SliderPanel from "@/components/Slider"
import { BASE_API_URL } from "@/global"
import { post } from "@/helper/api-bridge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"

type Answer = {
    id_pertanyaan: string
    jawaban: string
    catatan: string
}
const FormSubmission = ({ categories, id_responden, survey_id, id_jenis_responden, nama_instansi }: { categories: IKategori[], id_responden: string, survey_id: string, id_jenis_responden: string, nama_instansi: string }) => {

    const [jawaban, setJawaban] = useState<{ [key: string]: { jawaban: string; catatan: string } }>({})
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isShowDone, setIsShowDone] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [nama, setNama] = useState<string>("")
    const [filterCategories, setFilterCategories] = useState<IKategori[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const router = useRouter()

    useEffect(() => {
        let tempAnswer = {}
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
    }, [filterCategories])

    useEffect(() => {
        const filtered = categories.map(kategori => ({
            ...kategori,
            pertanyaan: kategori.pertanyaan.filter(q =>
                q.for_responden_group.some(res => res.uuid === id_jenis_responden)
            )
        })).filter(kategori => kategori.pertanyaan.length > 0)
        setFilterCategories(filtered)
    }, [categories])


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
        const tempJawaban = jawaban[id_pertanyaan]?.jawaban
        if (isJSON(tempJawaban)) {
            const parsed: { id_opsi_jawaban: string } = JSON.parse(tempJawaban)
            return value === parsed.id_opsi_jawaban
        }
        return false
    }

    const handleCheckboxJawaban = (id_pertanyaan: string, value: string): boolean => {
        const tempJawaban = jawaban[id_pertanyaan]?.jawaban
        if (isJSON(tempJawaban)) {
            const parsed: { id_opsi_jawaban: string }[] = JSON.parse(tempJawaban)
            const findAnswer = parsed.find(it => it.id_opsi_jawaban === value)
            if (findAnswer) return true
        }
        return false
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

            const url = `${BASE_API_URL}/submission/public`
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
            const payload = JSON.stringify({
                id_survey: survey_id,
                nama: `${nama} - ${nama_instansi}`,
                id_instansi: id_responden,
                id_jenis_responden,
                jawaban: answer
            })
            const { data } = await post(url, payload, "")
            setIsLoad(false)
            if (data?.success == true) {
                setIsShow(false)
                toast.success(`${data?.message}`, { hideProgressBar: true, containerId: `toastSubmission` })
                setTimeout(() => setIsShowDone(true), 1000)
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
                                    Nama Instansi: <strong>{nama_instansi}</strong>
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
                                                                    )}>
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
                                                                                        className="size-3" />
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
                                                                                        className="size-3" />
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
                <div className="p-5 text-black text-xl text-center">
                    Apakah Anda yakin untuk
                    mengirim kuesioner ini?
                </div>

                {/* modal footer */}
                <div className="w-full p-5 flex rounded-b-2xl shadow">
                    <div className="flex mx-auto gap-2">
                        <button type="button"
                            className={`bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${isLoad ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => setIsShow(false)}>
                            Tidak
                        </button>
                        <button type="button" disabled={isLoad} onClick={() => handleSubmit()}
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${isLoad ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {isLoad ? `Mengirim` : `Kirim`}
                        </button>
                    </div>
                </div>
                {/* end modal footer */}
            </Modal>

            <Modal isShow={isShowDone} onClose={s => router.replace(`/public`)}>

                <div className="p-5 text-black flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-32 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                    <p className='text-center'>
                        Terima kasih telah mengisi kuesioner. Partisipasi Anda sangat berarti dalam mendukung kelancaran proses survei ini.
                    </p>

                </div>

                {/* modal footer */}
                <div className="w-full p-5 flex rounded-b-2xl shadow">
                    <div className="flex mx-auto gap-2">
                        <Link href={`/public`}>
                            <button type="button" className='rounded-md px-4 py-2 bg-white text-primary border border-primary hover:bg-primary hover:text-white'>
                                Kembali ke halaman kuesioner
                            </button>
                        </Link>
                    </div>
                </div>
                {/* end modal footer */}
            </Modal>
        </form>
    )
}
export default FormSubmission