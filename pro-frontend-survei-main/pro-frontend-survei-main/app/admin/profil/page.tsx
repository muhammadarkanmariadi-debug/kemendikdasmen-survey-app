"use client";

import { useEffect, useState } from "react";
import { useProfile, useProfileMutations } from "@/hooks/useProfile";
import { ToastContainer } from "react-toastify";
import ResetPassword from "./reset";
import { User, ShieldCheck, Mail, Save, RefreshCw } from "lucide-react";

const ProfilPage = () => {
  const { data: user, isLoading, isError, error } = useProfile();
  const { updateProfile } = useProfileMutations();
  const [form, setForm] = useState({ nama_user: "", username: "" });

  useEffect(() => {
    if (user) {
      setForm({
        nama_user: user.nama_user || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      nama_user: form.nama_user,
      username: form.username,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-60 bg-white rounded-3xl border border-slate-200 p-12">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-[#0B5C9E]" />
          <span>Memuat data profil...</span>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center min-h-60 bg-white rounded-3xl border border-red-200 p-12">
        <span className="text-red-500 text-sm font-semibold">
          {error?.message || "Data user tidak ditemukan. Silakan login kembali."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <ToastContainer containerId="toastProfil" autoClose={3000} hideProgressBar />

      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-[#0B5C9E] via-[#1E77BD] to-[#FFB703]" />
        <div className="p-6 md:p-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0B5C9E] text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-900/15 shrink-0">
            {form.nama_user ? form.nama_user.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{form.nama_user || "Administrator"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0B5C9E] border border-blue-200/50">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">@{form.username}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h3 className="text-base font-bold text-slate-900 mb-1">Informasi Akun</h3>
        <p className="text-xs text-slate-500 mb-6">Perbarui nama tampilan dan nama pengguna administrator Anda.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="nama_user"
                value={form.nama_user}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5C9E]/20 focus:border-[#0B5C9E] transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <ResetPassword />
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{updateProfile.isPending ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilPage;
