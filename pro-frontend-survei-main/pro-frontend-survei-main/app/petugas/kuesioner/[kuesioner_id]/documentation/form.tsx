'use client';

import Modal from '@/components/Modal';
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from '@/global';
import { postFile } from '@/helper/api-bridge';
import { getCookie } from '@/helper/client-cookie';
import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

type UploadFile = {
    file: File;
    id: string;
};

export default function DragAndDropUploader({ submission_id, survey_id }: { submission_id: string, survey_id: string }) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [isShow, setIsShow] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null);
    const TOKEN = getCookie(TOKEN_KEY_PETUGAS) || ""

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            if (files.length == 0) {
                toast.warning(`Unggah minimal satu berkas foto dokumentasi`, { hideProgressBar: true, containerId: `toastUploadDoc` })
                return;
            }
            const MAX_SIZE = 15 * 1024 * 1024; // 15MB
            const oversized = files.find(f => f.file.size > MAX_SIZE);
            if (oversized) {
                const sizeMb = (oversized.file.size / (1024 * 1024)).toFixed(2);
                toast.error(`Foto "${oversized.file.name}" terlalu besar (${sizeMb} MB). Batas maksimal per foto adalah 15 MB.`, { hideProgressBar: true, containerId: `toastUploadDoc` })
                return;
            }
            setIsLoad(true)
            const url = `${BASE_API_URL}/submission/upload-documentations/${submission_id}`
            const formData = new FormData();
            files.forEach((f) => {
                formData.append('files', f.file);
            });
            const { data } = await postFile(url, formData, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message || 'Foto dokumentasi lapangan berhasil diunggah', { hideProgressBar: true, containerId: `toastUploadDoc` })
                setIsShow(true)
            } else {
                toast.warning(data?.message || 'Gagal mengunggah foto dokumentasi', { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        } catch (error: any) {
            setIsLoad(false)
            if (error?.response?.status === 413 || error?.message?.includes('413') || error?.code === 'ERR_BAD_RESPONSE') {
                toast.error('Ukuran berkas terlalu besar (Maksimal 15 MB). Silakan kompres atau pilih foto lain.', { hideProgressBar: true, containerId: `toastUploadDoc` })
            } else {
                toast.error(`Terjadi kesalahan unggah: ${error?.message || error}`, { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        }
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB

    const handleFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const acceptedFiles: UploadFile[] = [];
        Array.from(selectedFiles).forEach((file) => {
            if (file.size > MAX_SIZE) {
                const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
                toast.error(`Foto "${file.name}" ditolak karena melebihi batas 15 MB (${sizeMb} MB).`, { hideProgressBar: true, containerId: `toastUploadDoc` });
            } else {
                acceptedFiles.push({
                    file,
                    id: URL.createObjectURL(file),
                });
            }
        });
        if (acceptedFiles.length > 0) {
            setFiles((prev) => [...prev, ...acceptedFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleRemove = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-3xl shadow-sm text-slate-800 space-y-5">
            <ToastContainer containerId={`toastUploadDoc`} />
            
            <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5C9E] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Tahap 3 dari 3: Foto Dokumentasi Lapangan
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Unggah Dokumentasi Foto Kegiatan Lapangan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Unggah bukti foto pelaksanaan wawancara atau tinjauan sarpras di sekolah (format JPG, PNG maks. 2MB).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div
                    className="p-8 border-2 border-dashed border-slate-300 hover:border-[#0B5C9E] rounded-2xl text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all group"
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5C9E] group-hover:bg-[#0B5C9E] group-hover:text-white transition-all flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                        Klik atau seret foto dokumentasi ke sini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Mendukung JPG, JPEG, PNG (Maksimal 2 MB per berkas)
                    </p>
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={inputRef}
                        accept={`image/jpeg,image/png`}
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </div>

                {files.length > 0 && (
                    <ul className="space-y-2">
                        {files.map(({ file, id }) => (
                            <li key={id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B5C9E] flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex flex-col">
                                        <span className="text-xs font-semibold text-slate-800 truncate">{file.name}</span>
                                        <span className="text-[10px] text-slate-400">
                                            {file.size ? (file.size / 1024 > 1000 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`) : ''}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    onClick={() => handleRemove(id)}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="w-full pt-3 flex justify-between items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsShow(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all"
                    >
                        Lewati Tahap Ini
                    </button>

                    <button
                        type="submit"
                        disabled={isLoad}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isLoad ? 'Mengunggah...' : 'Unggah & Selesaikan Supervisi'}
                    </button>
                </div>
            </form>

            <Modal isShow={isShow} onClose={s => setIsShow(s)}>

                <div className="p-5 text-black flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-32 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                    <p className='text-center'>
                        Terima kasih telah mengisi kuesioner dan mengunggah dokumentasi kegiatan. Partisipasi Anda sangat berarti dalam mendukung kelancaran proses survei ini.
                    </p>

                </div>

                {/* modal footer */}
                <div className="w-full p-5 flex rounded-b-2xl shadow">
                    <div className="flex mx-auto gap-2">
                        <Link href={`/petugas/kuesioner`}>
                            <button type="button" className='rounded-md px-4 py-2 bg-white text-primary border border-primary hover:bg-primary hover:text-white'>
                                Kembali ke halaman kuesioner
                            </button>
                        </Link>
                    </div>
                </div>
                {/* end modal footer */}
            </Modal>
        </div>
    );
}
