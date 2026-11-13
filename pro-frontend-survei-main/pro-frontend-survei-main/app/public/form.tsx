"use client"

import { useState } from "react"
import { IInstansi, IJenisResponden, ISurvei } from "../types"
import { useRouter } from "next/navigation"
import { ClipboardList, ArrowRight, Building2, CheckCircle2, Search } from "lucide-react"

type Prop = {
    surveys: ISurvei[]
    instansi: IInstansi[]
    jenis: IJenisResponden[]
}

const Form = ({ surveys }: Prop) => {
    const router = useRouter()
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")

    const filteredSurveys = surveys.filter(s =>
        s.nama_survey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.deskripsi && s.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleSelectSurvey = (survey: ISurvei) => {
        const link = survey.public_link || survey.uuid
        router.push(`/form/${link}`)
    }

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-kemendikbud-blue bg-blue-50 px-3 py-1 rounded-full">
                    Langkah 1 dari 2
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">Pilih Survei / Instrumen</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Silakan tentukan survei yang ditugaskan untuk sekolah Anda saat ini.
                </p>
            </div>

            {/* Search Box */}
            <div className="relative mb-5">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari nama survei atau topik..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kemendikbud-blue focus:border-transparent text-sm bg-slate-50/50"
                />
            </div>

            {/* Survey Cards List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {filteredSurveys.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">Tidak ada survei aktif</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {searchQuery ? "Tidak ditemukan survei yang sesuai pencarian" : "Belum ada survei yang dipublikasikan"}
                        </p>
                    </div>
                ) : (
                    filteredSurveys.map((survey) => {
                        const isSelected = selectedSurveyId === survey.uuid
                        return (
                            <div
                                key={survey.uuid}
                                onClick={() => setSelectedSurveyId(survey.uuid)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                                    isSelected
                                        ? "border-kemendikbud-blue bg-blue-50/50 shadow-sm ring-1 ring-kemendikbud-blue"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            isSelected
                                                ? "bg-kemendikbud-blue text-white"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900 leading-snug">
                                            {survey.nama_survey}
                                        </h3>
                                        {survey.deskripsi && (
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                                {survey.deskripsi}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                                            <span>
                                                {(survey as any)._count?.kategori || 0} Bagian Kategori
                                            </span>
                                            <span>&bull;</span>
                                            <span>Survei Terbuka</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {isSelected ? (
                                        <CheckCircle2 className="w-5 h-5 text-kemendikbud-blue" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border border-slate-300" />
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-5 border-t border-slate-100">
                <button
                    type="button"
                    disabled={!selectedSurveyId}
                    onClick={() => {
                        const s = surveys.find(it => it.uuid === selectedSurveyId)
                        if (s) handleSelectSurvey(s)
                    }}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                        selectedSurveyId
                            ? "bg-kemendikbud-blue text-white hover:bg-blue-800 shadow-blue-500/20 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                >
                    <span>Lanjut ke Pemilihan Sekolah & Pengisian</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                    Pengisian tanpa login akun. Identitas responden dicatat melalui NIS/NUPTK sekolah.
                </p>
            </div>
        </div>
    )
}

export default Form
