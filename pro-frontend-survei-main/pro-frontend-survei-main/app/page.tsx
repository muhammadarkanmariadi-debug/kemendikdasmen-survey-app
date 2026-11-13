"use client"

import { BASE_API_URL, BASIC_AUTH_PASSWORD, BASIC_AUTH_USERNAME, TOKEN_KEY_ADMIN, TOKEN_KEY_INSTANSI, TOKEN_KEY_PETUGAS } from "@/global"
import { post } from "@/helper/api-bridge"
import { storeCookie } from "@/helper/client-cookie"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, GraduationCap, Building2 } from "lucide-react"
import SmkMascot, { MascotState } from "@/components/mascot/SmkMascot"

const LoginPage = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [mascotState, setMascotState] = useState<MascotState>("idle")
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false)
  const router = useRouter()

  const handleTogglePassword = () => {
    const nextState = !isShowPassword
    setIsShowPassword(nextState)
    if (isPasswordFocused) {
      setMascotState(nextState ? "peek" : "password")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault()
      setIsLoading(true)
      setMascotState("loading")
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
          setMascotState("idle")
          toast.warning("Username atau password tidak valid", { hideProgressBar: true, containerId: "toastLogin" })
        }
      } else {
        setMascotState("idle")
        toast.warning(data?.message || "Login gagal, periksa kredensial Anda", { hideProgressBar: true, containerId: "toastLogin" })
      }
    } catch (error) {
      setIsLoading(false)
      setMascotState("idle")
      toast.error("Terjadi kesalahan koneksi ke server", { hideProgressBar: true, containerId: "toastLogin" })
    }
  }

  return (
    <div className="w-screen min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      <ToastContainer containerId="toastLogin" autoClose={3000} hideProgressBar />

      {/* Left Branding Hero Panel with Animated SMK Mascot */}
      <div className="w-full md:w-5/12 bg-[#0B5C9E] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm inline-block">
            <Image
              src="/images/logo_jenama_primer.png"
              width={52}
              height={52}
              alt="Logo Kemendikbudristek"
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-blue-100 font-bold block">
              Kementerian Pendidikan Dasar & Menengah
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Direktorat SMK</h2>
          </div>
        </div>

        {/* Center: Animated Person Mascot (Topi & Seragam SMK Biru-Putih Peeking in) */}
        <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center">
          {/* Peeking Mascot Component */}
          <div className="relative w-full flex justify-center animate-mascot-peek">
            <SmkMascot
              state={mascotState}
              className="w-full max-w-[280px]"
            />
          </div>

          {/* Subtitle & Badge */}
          <div className="mt-4 max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-2 border border-white/20">
              <GraduationCap className="w-3.5 h-3.5 text-blue-200" />
              Maskot Siswa SMK &bull; Sahabat Survei
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Sistem Survei & Instrumen Mutu
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-1 leading-relaxed">
              Karakter siswa SMK ini akan memandu Anda dan menjaga keamanan privasi sandi Anda saat masuk.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/60 border-t border-white/10 pt-4 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Direktorat SMK</span>
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Terlindungi & Terenkripsi
          </span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-md">
          {/* Card Form Container */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 relative">
            <div className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B5C9E] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Portal Otentikasi
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">Masuk ke Akun Anda</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Gunakan kredensial resmi Admin, Petugas Lapangan, atau Instansi Sekolah untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="username-survei">
                  Username / NPSN
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    id="username-survei"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setMascotState("username")
                    }}
                    onFocus={() => {
                      setIsPasswordFocused(false)
                      setMascotState("username")
                    }}
                    onBlur={() => {
                      if (!isPasswordFocused) setMascotState("idle")
                    }}
                    required
                    placeholder="Masukkan username atau NPSN sekolah"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] bg-slate-50/50 transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password-survei">
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={isShowPassword ? "text" : "password"}
                    id="password-survei"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setMascotState(isShowPassword ? "peek" : "password")
                    }}
                    onFocus={() => {
                      setIsPasswordFocused(true)
                      setMascotState(isShowPassword ? "peek" : "password")
                    }}
                    onBlur={() => {
                      setIsPasswordFocused(false)
                      setMascotState("idle")
                    }}
                    required
                    placeholder="Masukkan kata sandi akun"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] bg-slate-50/50 transition-all text-slate-900"
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
                className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-[#0B5C9E] text-white hover:bg-[#073B66] transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            {/* Separator / Public Survey Gateway */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 mb-3">
                Responden publik (Siswa, Guru, Kepala Sekolah)?
              </p>
              <Link
                href="/public"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-[#FFB703] bg-amber-50/60 hover:bg-amber-100/60 text-slate-800 text-xs font-bold transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Isi Kuesioner Tanpa Login (Portal Publik)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
