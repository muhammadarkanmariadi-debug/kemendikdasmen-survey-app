"use client"

import { IDocument, IKategori, IResponden } from "@/app/types"
import { ButtonPrimary } from "@/components/button"
import Modal from "@/components/Modal"
import { BASE_API_URL, BASE_FILE_DOCUMENTATION, BASE_FILE_DOCUMENTS, TOKEN_KEY_INSTANSI } from "@/global"
import { put } from "@/helper/api-bridge"
import { getCookie } from "@/helper/client-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import UploadDocuments from "./uploadDocument"
import UploadDocumentations from "./uploadDocumentation"
import DropDocumentation from "./dropDocumentations"
import DropDocument from "./dropDocument"
import SliderPanel from "@/components/Slider"

type Answer = {
    id_pertanyaan: string
    jawaban: string
    catatan: string
}
const FormEditSubmission = ({ categories, respondents, survey_id, answer, submission_id, respondent_id, documentations, documents, id_jenis_responden }: {
    submission_id: string,
    categories: IKategori[],
    respondents: IResponden[],
    id_jenis_responden: string,
    survey_id: string,
    respondent_id: string,
    documents: IDocument[],
    documentations: IDocument[],
    answer: {
        [key: string]: {
            jawaban: string | { id_opsi_jawaban: string, text: string } | { id_opsi_jawaban: string, text: string }[],
            catatan: string,
            keterangan_catatan?: string
        }
    }
}) => {
    const [id_responden, setIdResponden] = useState<string>("")
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [jawaban, setJawaban] = useState<{ [key: string]: { jawaban: string; catatan: string } }>({})
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [filterCategories, setFilterCategories] = useState<IKategori[]>([])
    const TOKEN = getCookie(TOKEN_KEY_INSTANSI) || ""
    const router = useRouter()

    useEffect(() => {
        let tempAnswer = { ...jawaban }

        for (let i = 0; i < filterCategories.length; i++) {
            const questions = filterCategories[i].pertanyaan.filter(it => it.for_responden_group.some(res => res.uuid === id_jenis_responden))
            for (let j = 0; j < questions.length; j++) {
                if (questions[j].jenis === `ISIAN`) {
                    tempAnswer = {
                        ...tempAnswer,
                        [questions[j].uuid]: {
                            jawaban: answer[questions[j].uuid].jawaban.toString(),
                            catatan: answer[questions[j].uuid].catatan
                        }
                    }
                } else {
                    tempAnswer = {
                        ...tempAnswer,
                        [questions[j].uuid]: {
                            jawaban: JSON.stringify(answer[questions[j].uuid].jawaban),
                            catatan: answer[questions[j].uuid].catatan
                        }
                    }
                }

            }
        }
        setJawaban({ ...tempAnswer })
        setIdResponden(respondent_id)

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
        try {
            const tempJawaban = jawaban[id_pertanyaan]?.jawaban
            if (isJSON(tempJawaban)) {
                const parsed: { id_opsi_jawaban: string } = JSON.parse(tempJawaban)
                return value === parsed.id_opsi_jawaban
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

    const handleSubmit = async () => {
        try {
            setIsLoad(true)
            const url = `${BASE_API_URL}/submission/${submission_id}`
            const answer: Answer[] = []
            for (const key of Object.keys(jawaban)) {
                answer.push({
                    id_pertanyaan: key,
                    jawaban: jawaban[key].jawaban,
                    catatan: jawaban[key].catatan
                })
            }
            const payload = JSON.stringify({
                id_survey: survey_id,
                id_responden,
                jawaban: answer
            })
            const { data } = await put(url, payload, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                setIsShow(false)
                toast.success(`${data?.message}`, { hideProgressBar: true, containerId: `toastEditSubmission` })
                setTimeout(() => router.refresh())
            } else {
                toast.warning(`${data?.message}`, { hideProgressBar: true, containerId: `toastEditSubmission` })
            }
        } catch (error) {
            toast.error(`Something were worng. ${error}`, { hideProgressBar: true, containerId: `toastEditSubmission` })
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
        <div>
            <form onSubmit={handleConfirmation}>
                <ToastContainer containerId={`toastEditSubmission`} />
                <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="toggle-edit" className="text-primary font-semibold">
                        Edit Mode
                    </label>
                    <button
                        id="toggle-edit"
                        type="button"
                        onClick={() => setIsEdit(!isEdit)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEdit ? 'bg-blue-600' : 'bg-gray-300'}`}
                        aria-pressed={isEdit}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEdit ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
                {
                    isEdit ?
                        <div className="text-black">
                            <div className="font-semibold">
                                Responden: {respondents.find(it => it.uuid === id_responden)?.nama}
                            </div>
                            {/* <div className="my-2">
                                <label htmlFor="list-responden" className="text-primary text-sm font-semibold">Pilih Responden</label>
                                <select id={`list-responden`} required={true} value={id_responden}
                                    onChange={e => setIdResponden(e.target.value)}
                                    className="w-full p-2 rounded-md border border-primary">
                                    <option value="">Pilih Responden </option>
                                    {
                                        respondents.map((responden, index) => (
                                            <option value={responden.uuid} key={`keyResponden-${index}`}>{responden.nama}</option>
                                        ))
                                    }
                                </select>
                            </div> */}

                            <SliderPanel>
                                {
                                    filterCategories.map((kategori, indexKategori) => (
                                        <div key={`keyKategori-${indexKategori}`} id={kategori.nama_kategori} className="my-5">
                                            <strong className="text-lg">{kategori.nama_kategori}</strong>
                                            <ol className="ps-5 list-decimal">
                                                {
                                                    kategori.pertanyaan.map((question, indexQuestion) => (
                                                        <li key={`keyPertanyaan-${indexKategori}-${indexQuestion}`} className="my-3">
                                                            {question.pertanyaan}

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
                            <ButtonPrimary type="submit" className="w-full my-3">
                                Kirim
                            </ButtonPrimary>
                        </div> :
                        <div className="text-black">
                            <div className="font-semibold">
                                Responden: {respondents.find(it => it.uuid === id_responden)?.nama}
                            </div>
                            <SliderPanel>
                                {
                                    filterCategories.map((kategori, indexKategori) => (
                                        <div key={`keyKategori-${indexKategori}`} id={kategori.nama_kategori} className="text-black">
                                            <ol className="ps-5 list-decimal">
                                                {
                                                    kategori.pertanyaan.map((question, indexQuestion) => (
                                                        <li key={`keyPertanyaan-${indexKategori}-${indexQuestion}`} className="my-3">
                                                            <div className="tailwind-reset">
                                                                <div dangerouslySetInnerHTML={{ __html: question.pertanyaan }}></div>
                                                            </div>
                                                            <div className="my-2 border rounded-md p-3">
                                                                {
                                                                    typeof answer[question.uuid].jawaban == "string" ? (
                                                                        <div>{(answer[question.uuid].jawaban).toString()}</div>
                                                                    ) : Array.isArray(answer[question.uuid].jawaban) ? (
                                                                        <div>
                                                                            {(answer[question.uuid].jawaban as { id_opsi_jawaban: string, text: string }[]).map((item, idx) => (
                                                                                <div key={item.id_opsi_jawaban || idx}>
                                                                                    {item.text}
                                                                                    {
                                                                                        getValueOfCatatan(item.id_opsi_jawaban, answer[question.uuid].catatan || "") !== `` &&
                                                                                        <div className="my-2 flex flex-col gap-1">
                                                                                            <div className="text-primary text-sm">{answer[question.uuid].keterangan_catatan}</div>
                                                                                            <div className="p-1 bg-sky-100 rounded-sm text-xs">{getValueOfCatatan(item.id_opsi_jawaban, answer[question.uuid].catatan || "")}</div>
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : answer[question.uuid].jawaban && typeof answer[question.uuid].jawaban === "object" ? (
                                                                        <div>
                                                                            {(answer[question.uuid].jawaban as { id_opsi_jawaban: string, text: string }).text}
                                                                            {
                                                                                answer[question.uuid].keterangan_catatan !== `` ?
                                                                                    <div className="my-2 flex flex-col gap-1">
                                                                                        <div className="text-primary text-sm">{answer[question.uuid].keterangan_catatan}</div>
                                                                                        <div>{answer[question.uuid].catatan}</div>
                                                                                    </div> :
                                                                                    <></>
                                                                            }
                                                                        </div>
                                                                    ) : (
                                                                        <div></div>
                                                                    )
                                                                }


                                                            </div>
                                                        </li>
                                                    ))
                                                }
                                            </ol>
                                        </div>
                                    ))
                                }
                            </SliderPanel>
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
            </form>

            <div className="w-full">
                <h3 className="my-3 text-lg font-semibold text-black">Dokumen Pendukung Kuesioner</h3>
                <div className="w-full">
                    {
                        documents.map((doc, indexDoc) => (
                            <div key={`keyDocument-${indexDoc}`} className="flex items-center gap-2 my-2 text-primary border-b border-primary p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <Link href={`${BASE_FILE_DOCUMENTS}/${doc.nama_file}`} target="_blank" className="font-medium">{doc.nama_file}</Link>
                                <div className="ml-auto">
                                    <DropDocument selectedDoc={doc} />
                                </div>
                            </div>
                        ))
                    }
                    <UploadDocuments submission_id={submission_id} />
                </div>
            </div>

            <div className="w-full my-3">
                <h3 className="my-3 text-lg font-semibold text-black">Dokumentasi Pengisian Kuesioner</h3>
                <div className="w-full">
                    {
                        documentations.map((doc, indexDoc) => (
                            <div key={`keyDocumentation-${indexDoc}`} className="flex items-center gap-2 my-2 text-primary border-b border-primary p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <Link href={`${BASE_FILE_DOCUMENTATION}/${doc.nama_file}`} target="_blank" className="font-medium">{doc.nama_file}</Link>
                                <div className="ml-auto">
                                    <DropDocumentation selectedDoc={doc} />
                                </div>
                            </div>
                        ))
                    }
                    <UploadDocumentations submission_id={submission_id} />
                </div>
            </div>
        </div>
    )
}
export default FormEditSubmission