"use client"

import { BASE_API_URL, BASIC_AUTH_PASSWORD, BASIC_AUTH_USERNAME, TOKEN_KEY_ADMIN, TOKEN_KEY_INSTANSI, TOKEN_KEY_PETUGAS } from "@/global"
import { post } from "@/helper/api-bridge"
import { storeCookie } from "@/helper/client-cookie"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Building2, CheckCircle2, Award, FileText } from "lucide-react"

const LoginPage = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleTogglePassword = () => {
    setIsShowPassword(!isShowPassword)
  }

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault()
      setIsLoading(true)
      const url = `${BASE_API_URL}/auth`
      const payload = JSON.stringify({ username, password })
      const { data } = await post(url, payload, { username: BASIC_AUTH_USERNAME, password: BASIC_AUTH_PASSWORD })
      setIsLoading(false)

      if (data?.success === true) {
        const token: string | undefined = data?.data?.token
        if (token) {
          const role: string | undefined = data?.data.role
          toast.success("Login Berhasil! Mengalihkan...", { hideProgressBar: true, containerId: "toastLogin" })
          if (role === "ADMIN") {
            storeCookie(TOKEN_KEY_ADMIN, token)
            setTimeout(() => router.replace(`/admin/dashboard`), 800)
          } else if (role === "PETUGAS") {
            storeCookie(TOKEN_KEY_PETUGAS, token)
            setTimeout(() => router.replace(`/petugas/kuesioner`), 800)
          } else if (role === "DINAS" || role === "SEKOLAH") {
            storeCookie(TOKEN_KEY_INSTANSI, token)
            setTimeout(() => router.replace(`/instansi/dashboard`), 800)
          } else {
            router.replace(`/admin/dashboard`)
          }
        } else {
          toast.warning("Username atau password tidak valid", { hideProgressBar: true, containerId: "toastLogin" })
        }
      } else {
        toast.warning(data?.message || "Login gagal, periksa kredensial Anda", { hideProgressBar: true, containerId: "toastLogin" })
      }
    } catch (error) {
      setIsLoading(false)
      toast.error("Terjadi kesalahan koneksi ke server", { hideProgressBar: true, containerId: "toastLogin" })
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#FAF4ED] relative overflow-hidden">
      <ToastContainer containerId="toastLogin" autoClose={3000} hideProgressBar />

      {/* Warm Ambient Decorative Shapes in Background */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#FFE8D1]/60 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E2EEF8]/60 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

      {/* Main Unified Professional Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl shadow-amber-950/5 border border-amber-100/60 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
        {/* Left Section: Official Kemendikbudristek Branding Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
          <div>
            {/* Top Logo Badge */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                <Image
                  src="/images/logo_jenama_primer.png"
                  width={46}
                  height={46}
                  alt="Kemendikbud"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E] block">
                  Kementerian Pendidikan Dasar & Menengah
                </span>
                <h3 className="text-base font-extrabold text-slate-800 leading-tight">Direktorat SMK</h3>
              </div>
            </div>

            {/* Title & Description */}
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B5C9E] text-xs font-semibold mb-3 border border-blue-100">
                <Award className="w-3.5 h-3.5 text-[#0B5C9E]" />
                <span>Portal Otentikasi Resmi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Sistem Supervisi & Penjaminan Mutu SMK
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                Platform digital pemantauan dan evaluasi program Bantuan Pemerintah Sertifikasi Kompetensi Siswa SMK tahun 2026.
              </p>
            </div>

            {/* Feature Points */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instrumen Supervisi Sekolah & Kepala Sekolah terstruktur</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instrumen Respon Murid SMK penerima bantuan sertifikasi</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verifikasi asesor, TUK, LSP-P2/P3, industri mitra & bukti dukung</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>&copy; {new Date().getFullYear()} Direktorat SMK</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Terenkripsi Aman
            </span>
          </div>
        </div>

        {/* Right Section: Clean Rounded Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Log in</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Masuk menggunakan kredensial resmi Admin, Petugas Lapangan, atau NPSN Sekolah.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / NPSN Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="username-survei">
                Username / NPSN Sekolah
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  id="username-survei"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan username atau NPSN"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] bg-slate-100/70 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password-survei">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type={isShowPassword ? "text" : "password"}
                  id="password-survei"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan kata sandi akun"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] bg-slate-100/70 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                  title={isShowPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                >
                  {isShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#0B5C9E] text-white hover:bg-[#073B66] active:scale-[0.99] transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Memverifikasi akun...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Public Survey Option */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2.5">
              Responden publik (Murid SMK, Guru, Kepala Sekolah)?
            </p>
            <Link
              href="/public"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-slate-800 text-xs font-bold transition-all"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Isi Kuesioner Supervisi Tanpa Login (Portal Publik)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
