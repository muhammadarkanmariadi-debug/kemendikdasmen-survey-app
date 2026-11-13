"use client"

import { IDocument, IKategori, IResponden } from "@/app/types"
import SliderPanel from "@/components/Slider"
import { BASE_FILE_DOCUMENTATION, BASE_FILE_DOCUMENTS } from "@/global"
import Link from "next/link"
import { useEffect, useState } from "react"

const FormSubmission = ({ categories, respondents, answer, respondent_id, documentations, documents, id_jenis_responden }: {
    categories: IKategori[],
    respondents: IResponden[],
    respondent_id: string,
    id_jenis_responden: string,
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
    const [filterCategories, setFilterCategories] = useState<IKategori[]>([])
    const [jawaban, setJawaban] = useState<{ [key: string]: { jawaban: string; catatan: string } }>({})

    useEffect(() => {
        let tempAnswer = { ...jawaban }
        for (let i = 0; i < filterCategories.length; i++) {
            const questions = filterCategories[i].pertanyaan.filter(it => it.for_responden_group.some(res => res.uuid === id_jenis_responden))
            for (let j = 0; j < questions.length; j++) {
                if (questions[j].jenis === `ISIAN`) {
                    tempAnswer = {
                        ...tempAnswer,
                        [questions[j].uuid]: {
                            jawaban: answer[questions[j].uuid]?.jawaban.toString(),
                            catatan: answer[questions[j].uuid]?.catatan
                        }
                    }
                } else {
                    tempAnswer = {
                        ...tempAnswer,
                        [questions[j].uuid]: {
                            jawaban: JSON.stringify(answer[questions[j].uuid]?.jawaban),
                            catatan: answer[questions[j].uuid]?.catatan
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
                                                        typeof answer[question.uuid]?.jawaban == "string" ? (
                                                            <div>{(answer[question.uuid]?.jawaban).toString()}</div>
                                                        ) : Array.isArray(answer[question.uuid]?.jawaban) ? (
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
                                                        ) : answer[question.uuid]?.jawaban && typeof answer[question.uuid]?.jawaban === "object" ? (
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
                            </div>
                        ))
                    }
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
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
export default FormSubmission