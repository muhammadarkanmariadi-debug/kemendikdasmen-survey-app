"use client"

import { useState } from "react"
import { IInstansi, IJenisResponden, ISurvei } from "../types"
import { useRouter } from "next/navigation"
import { ClipboardList, ArrowRight, CheckCircle2, Search, ArrowLeft, ShieldCheck, X } from "lucide-react"
import Link from "next/link"

type Prop = {
    surveys: ISurvei[]
    instansi: IInstansi[]
    jenis: IJenisResponden[]
}

const Form = ({ surveys }: Prop) => {
    const router = useRouter()
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Strictly case-insensitive survey filtering
    const filteredSurveys = surveys.filter(s => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        const nameMatch = (s.nama_survey?.toLowerCase() || "").includes(query)
        const descMatch = (s.deskripsi?.toLowerCase() || "").includes(query)
        return nameMatch || descMatch
    })

    const handleSelectSurvey = (survey: ISurvei) => {
        const link = survey.public_link || survey.uuid
        router.push(`/form/${link}`)
    }

    return (
        <div className="w-full flex flex-col justify-between h-full">
            <div>
                {/* Header Section */}
                <div className="mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B5C9E] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        Portal Kuesioner Publik
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                        Pilih Instrumen Supervisi
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                        Silakan cari dan tentukan instrumen supervisi yang ditugaskan kepada satuan pendidikan atau Anda.
                    </p>
                </div>

                {/* Case-Insensitive Search Box */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Cari nama survei atau topik (tidak peka huruf besar/kecil)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] text-sm bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                            title="Hapus pencarian"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Survey Cards List */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {filteredSurveys.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <ClipboardList className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">Tidak ada survei yang cocok</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {searchQuery ? `Tidak ditemukan survei dengan kata kunci "${searchQuery}"` : "Belum ada survei yang dipublikasikan"}
                            </p>
                        </div>
                    ) : (
                        filteredSurveys.map((survey) => {
                            const isSelected = selectedSurveyId === survey.uuid
                            return (
                                <div
                                    key={survey.uuid}
                                    onClick={() => setSelectedSurveyId(survey.uuid)}
                                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                        isSelected
                                            ? "border-[#0B5C9E] bg-blue-50/60 shadow-sm ring-2 ring-blue-100"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                                isSelected
                                                    ? "bg-[#0B5C9E] text-white"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            <ClipboardList className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                                                {survey.nama_survey}
                                            </h3>
                                            {survey.deskripsi && (
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                    {survey.deskripsi}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                                                <span>
                                                    {(survey as any)._count?.kategori || 0} Bagian Instrumen
                                                </span>
                                                <span>&bull;</span>
                                                <span className="text-emerald-600 font-semibold">Aktif Publik</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {isSelected ? (
                                            <CheckCircle2 className="w-5 h-5 text-[#0B5C9E]" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border border-slate-300" />
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Action Bottom Section */}
            <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    disabled={!selectedSurveyId}
                    onClick={() => {
                        const s = surveys.find(it => it.uuid === selectedSurveyId)
                        if (s) handleSelectSurvey(s)
                    }}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                        selectedSurveyId
                            ? "bg-[#0B5C9E] text-white hover:bg-[#073B66] shadow-blue-900/10 cursor-pointer active:scale-[0.99]"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                >
                    <span>Lanjut ke Pengisian Survei</span>
                    <ArrowRight className="w-4 h-4" />
                </button>

                {/* Back to Login link */}
                <div className="mt-4 flex items-center justify-between text-xs">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#0B5C9E] font-medium transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Masuk sebagai Admin / Petugas</span>
                    </Link>
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Resmi Direktorat SMK
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Form
