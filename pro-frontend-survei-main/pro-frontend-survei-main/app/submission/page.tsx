import { BASE_API_URL, BASE_FILE_DOCUMENTATION, BASE_FILE_DOCUMENTS, TOKEN_KEY_ADMIN } from "@/global"
import { HasilSurvey, IJenisResponden, IKategori, IUser } from "../types"
import { getCookies } from "@/helper/server-cookie"
import { get } from "@/helper/api-bridge"
import Image from "next/image"

const getSubmissionById = async (id: string): Promise<HasilSurvey | null> => {
    try {
        const url = `${BASE_API_URL}/submission/${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)

        if (data?.success == true) return { ...data?.data }
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}

const getDetailSurvey = async (id: string): Promise<IKategori[]> => {
    try {
        const url = `${BASE_API_URL}/instruments/all?id_survey=${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data?.data]
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}

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

const getJenisResponden = async (): Promise<IJenisResponden[]> => {
    try {
        const url = `${BASE_API_URL}/jenis-responden`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return [...data.data]
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}

const getInstansi = async (id: string): Promise<IUser | null> => {
    try {
        const url = `${BASE_API_URL}/instansi/${id}`
        const token = await getCookies(TOKEN_KEY_ADMIN)
        const { data } = await get(url, token)
        if (data?.success == true) return { ...data.data }
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}

type Props = {
    searchParams: Promise<{
        submission_id: string
    }>
}

const SubmissionPage = async (props: Props) => {
    const submission_id = (await props.searchParams)?.submission_id || ``
    const submision = await getSubmissionById(submission_id)

    if (submision == null) {
        return (
            <div className="w-full p-5">
                <div className="w-full border-2 border-primary bg-sky-100 text-primary p-3 rounded-lg">
                    Data isian kuesioner tidak tersedia
                </div>
            </div>
        )
    }

    const detailSurveys = await getDetailSurvey(submision.id_survey)
    const jenis_responden = await getJenisResponden()
    const selectedInstansi = await getInstansi(submision.responden?.id_instansi || "")

    let answer: {
        [key: string]: {
            jawaban: string | { id_opsi_jawaban: string, text: string } | { id_opsi_jawaban: string, text: string }[],
            catatan: string,
            keterangan_catatan?: string
        }
    } = {}

    const allOption = detailSurveys
        .flatMap(it => it.pertanyaan)
        .flatMap(it => it.opsi_pertanyaan)

    for (let i = 0; i < submision.jawaban_survey.length; i++) {
        let keterangan: string = ""
        if (typeof submision.jawaban_survey[i].jawaban === "object") {
            const option = submision.jawaban_survey[i].jawaban as { id_opsi_jawaban: string, text: string }
            const selectedOption = allOption.find(it => it.uuid === option.id_opsi_jawaban)
            if (selectedOption && selectedOption.ada_catatan == true) keterangan = selectedOption.keterangan_catatan

        }
        answer = {
            ...answer,
            [submision.jawaban_survey[i].id_pertanyaan]: {
                jawaban: submision.jawaban_survey[i].jawaban,
                catatan: submision.jawaban_survey[i].catatan,
                keterangan_catatan: keterangan
            }
        }
    }


    const categories = detailSurveys
        .map(kategori => ({
            ...kategori,
            pertanyaan: kategori.pertanyaan.filter(q =>
                q.for_responden_group.some(res => res.uuid === submision.responden.id_jenis_responden)
            )
        }))
        .filter(kategori => kategori.pertanyaan.length > 0)


    let jawaban: { [key: string]: { jawaban: string; catatan: string } } = {}
    for (let i = 0; i < categories.length; i++) {
        const questions = categories[i].pertanyaan.filter(it => it.for_responden_group.some(res => res.uuid === submision.responden.id_jenis_responden))
        for (let j = 0; j < questions.length; j++) {
            if (questions[j].jenis === `ISIAN`) {
                jawaban = {
                    ...jawaban,
                    [questions[j].uuid]: {
                        jawaban: answer[questions[j].uuid]?.jawaban.toString(),
                        catatan: answer[questions[j].uuid]?.catatan
                    }
                }
            } else {
                jawaban = {
                    ...jawaban,
                    [questions[j].uuid]: {
                        jawaban: JSON.stringify(answer[questions[j].uuid]?.jawaban),
                        catatan: answer[questions[j].uuid]?.catatan
                    }
                }
            }

        }
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

    const responden = submision.responden.nama
    const [namaResponden, instansi] = responden?.split("-") || ""
    return (
        <div className="p-2 bg-white min-h-dvh text-black">
            <div className="w-full">
                <h1 className="text-center font-semibold">INSTRUMEN PEMANTAUAN DAN EVALUASI DIREKTORAT SMK</h1>
                <div className="my-3 w-full flex justify-center">
                    <table className="border">
                        <tbody>
                            <tr>
                                <td className="p-3 border-r">
                                    <Image width={80} height={80} alt="tut wuri handayani"
                                        src={`/images/tut wuri handayani.jpeg`} />
                                </td>
                                <td className="p-3 text-center border-r">
                                    {submision.survey.nama_survey}
                                </td>
                                <td className="p-3">
                                    MONEV {new Date().getFullYear()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="w-full flex justify-center my-3">
                    <table className="font-medium">
                        <tbody>
                            <tr>
                                <td className="px-2 font-semibold">Nama Responden</td>
                                <td className="px-2 font-semibold">:</td>
                                <td className="px-2 font-semibold">{namaResponden}</td>
                            </tr>
                            <tr>
                                <td className="px-2 font-semibold">Jabatan</td>
                                <td className="px-2 font-semibold">:</td>
                                <td className="px-2 font-semibold">{jenis_responden.find(it => it.uuid === submision.responden.id_jenis_responden)?.jenis}</td>
                            </tr>
                            <tr>
                                <td className="px-2 font-semibold">Nama Instansi</td>
                                <td className="px-2 font-semibold">:</td>
                                <td className="px-2 font-semibold">{instansi}</td>
                            </tr>
                            <tr>
                                <td className="px-2 font-semibold">NPSN</td>
                                <td className="px-2 font-semibold">:</td>
                                <td className="px-2 font-semibold">{selectedInstansi?.instansi?.kode_instansi}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {
                    categories.map((kategori, indexKategori) => (
                        <div key={`keyKategori-${indexKategori}`} id={kategori.nama_kategori} className="text-black p-3">
                            <strong>{kategori.nama_kategori}</strong>
                            <ol className="ps-8 list-decimal">
                                {
                                    kategori.pertanyaan.map((question, indexQuestion) => (
                                        <li key={`keyPertanyaan-${indexKategori}-${indexQuestion}`} className="my-3">
                                            <div className="tailwind-reset">
                                                <div dangerouslySetInnerHTML={{ __html: question.pertanyaan }}></div>
                                            </div>
                                            {
                                                question.jenis === `ISIAN` ?
                                                    <div className="p-3 border">{(answer[question.uuid]?.jawaban).toString()}</div>
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
                                                                        {
                                                                            handleCheckJawaban(question.uuid, option.uuid) ?
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="currentColor"
                                                                                    className="size-4"
                                                                                >
                                                                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                                                                </svg> :
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                    className="size-4"
                                                                                >
                                                                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                                                                </svg>

                                                                        }
                                                                        {option.opsi_jawaban}
                                                                    </div>
                                                                    {
                                                                        option.ada_catatan && handleCheckJawaban(question.uuid, option.uuid) ?
                                                                            <div className="ms-5 flex flex-col">
                                                                                <small
                                                                                    className="font-semibold text-sm">
                                                                                    {option.keterangan_catatan}
                                                                                </small>
                                                                                {
                                                                                    getValueOfCatatan(option.uuid, jawaban[question.uuid]?.catatan || "")
                                                                                }
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
                                                                        {
                                                                            handleCheckboxJawaban(question.uuid, option.uuid) ?
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="currentColor"
                                                                                    className="size-4"
                                                                                >
                                                                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                                                                </svg> :
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                    className="size-4"
                                                                                >
                                                                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                                                                </svg>

                                                                        }


                                                                        {option.opsi_jawaban}
                                                                    </div>
                                                                    {
                                                                        option.ada_catatan && handleCheckboxJawaban(question.uuid, option.uuid) ?
                                                                            <div className="ms-5 flex flex-col">
                                                                                <small
                                                                                    className="font-semibold text-sm">
                                                                                    {option.keterangan_catatan}
                                                                                </small>
                                                                                {getValueOfCatatan(option.uuid, jawaban[question.uuid]?.catatan || "")}
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
            </div>

            <div className="w-full ">
                <strong>Dokumen Pendukung</strong>
                <div className="w-full flex flex-wrap gap-5 justify-center">
                    {
                        submision.dokumen_survey
                            .filter(document => {
                                const { nama_file } = document
                                const splitName = nama_file.split(`.`)
                                return [`png`, `jpg`, `jpeg`].includes(splitName[splitName.length - 1])
                            })
                            .map(document => (
                                <div key={`keyDocument-${document.uuid}`} className="p-4 border">
                                    <Image alt={document.nama_file} width={100} height={100}
                                        className="h-80 w-auto"
                                        src={`${BASE_FILE_DOCUMENTS}/${document.nama_file}`} />
                                </div>
                            ))
                    }
                </div>
            </div>

            <div className="w-full ">
                <strong>Dokumentasi Monitoring dan Evaluasi</strong>
                <div className="w-full flex flex-wrap gap-5 justify-center">
                    {
                        submision.dokumentasi_survey
                            .filter(document => {
                                const { nama_file } = document
                                const splitName = nama_file.split(`.`)
                                return [`png`, `jpg`, `jpeg`].includes(splitName[splitName.length - 1])
                            })
                            .map(document => (
                                <div key={`keyDocument-${document.uuid}`} className="p-4 border">
                                    <Image alt={document.nama_file} width={100} height={100}
                                        className="h-80 w-auto"
                                        src={`${BASE_FILE_DOCUMENTATION}/${document.nama_file}`} />
                                </div>
                            ))
                    }
                </div>
            </div>

            <div className="my-5 w-full flex justify-around">
                <div className="flex flex-col items-center">
                    <span className="font-semibold">Responden</span>
                    <div className="my-10"></div>
                    <span>{namaResponden}</span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="font-semibold">Petugas Monitoring dan Evaluasi</span>
                    <div className="my-10"></div>
                    <span>{submision.user?.nama_user || "Responden Mandiri (Publik)"}</span>
                </div>
            </div>
        </div>
    )

}
export const dynamic = 'force-dynamic';
export default SubmissionPage