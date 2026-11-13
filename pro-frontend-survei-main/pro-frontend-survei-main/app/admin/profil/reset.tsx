"use client";
import { ButtonPrimary, ButtonSuccess, ButtonWarning } from "@/components/button";
import Modal from "@/components/Modal";
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { put } from "@/helper/api-bridge";
import { getCookie } from "@/helper/client-cookie";
import { IUser } from "@/app/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const ResetPassword = () => {
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const TOKEN = getCookie(TOKEN_KEY_ADMIN) || "";
  const router = useRouter();

  const openModal = () => {
    setIsShow(true);
    setPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoad(true);
      const url = `${BASE_API_URL}/admins/me`; // Contoh endpoint
      const payload = JSON.stringify({ password });
      const { data } = await put(url, payload, TOKEN);
      setIsLoad(false);

      if (data?.success === true) {
        toast.success(data?.message || "Password berhasil diubah", {
          hideProgressBar: true,
          containerId: "toast-userAdmin",
        });
        setIsShow(false);
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast.warning(data?.message || "Gagal mereset password", {
          hideProgressBar: true,
          containerId: "toast-userAdmin",
        });
      }
    } catch (error) {
      toast.error(`Terjadi kesalahan. ${error}`, {
        hideProgressBar: true,
        containerId: "toast-userAdmin",
      });
      setIsLoad(false);
    }
  };

  return (
    <div>
      <ToastContainer containerId={`toast-userAdmin`} />
      {/* <a type="button" onClick={() => openModal()} className="text-primary underline">
        <span className="text-xs">Reset password</span>
      </a> */}
      <ButtonWarning type="button" onClick={() => openModal()} className="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
        <span className="text-xs">Reset Password</span>
      </ButtonWarning>
      <Modal isShow={isShow} onClose={(s) => setIsShow(s)}>
        <div>
          {/* modal header */}
          <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
            <div className="w-full flex items-center">
              <div className="flex flex-col">
                <strong className="font-bold text-2xl text-black">
                  Reset Password
                </strong>
                <small className="text-slate-400 text-sm">
                  Masukkan Password Baru
                </small>
              </div>
              <div className="ml-auto">
                <button
                  type="button"
                  className="text-slate-400"
                  onClick={() => setIsShow(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* end modal header */}
          <div className="p-5">
            <label htmlFor={`password-baru`} className="text-sm text-black">Password Baru</label>
            <input
              type="password"
              id="password-admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={true}
              className="w-full flex p-2 rounded-md border border-primary text-black"
            />
          </div>

          {/* modal footer */}
          <div className="w-full p-5 flex rounded-b-2xl shadow">
            <div className="flex ml-auto gap-2">
              <button
                type="button"
                className={`bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${isLoad ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                onClick={() => setIsShow(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoad}
                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md ${isLoad ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isLoad ? `Menyimpan` : `Simpan`}
              </button>
            </div>
          </div>
          {/* end modal footer */}
        </div>
      </Modal>
    </div>
  );
};
export default ResetPassword;
