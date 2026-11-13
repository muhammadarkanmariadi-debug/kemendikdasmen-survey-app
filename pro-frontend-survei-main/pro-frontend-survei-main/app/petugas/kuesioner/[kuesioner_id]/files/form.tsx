'use client';

import { BASE_API_URL, TOKEN_KEY_PETUGAS } from '@/global';
import { postFile } from '@/helper/api-bridge';
import { getCookie } from '@/helper/client-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

type UploadFile = {
    file: File;
    id: string;
};

export default function DragAndDropUploader({ submission_id, survey_id }: { submission_id: string, survey_id: string }) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null);
    const TOKEN = getCookie(TOKEN_KEY_PETUGAS) || ""
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            if (files.length == 0) {
                toast.warning(`Unggah minimal satu berkas pendukung`, { hideProgressBar: true, containerId: `toastUploadDoc` })
                return;
            }
            const MAX_SIZE = 20 * 1024 * 1024; // 20MB
            const oversized = files.find(f => f.file.size > MAX_SIZE);
            if (oversized) {
                const sizeMb = (oversized.file.size / (1024 * 1024)).toFixed(2);
                toast.error(`Berkas "${oversized.file.name}" terlalu besar (${sizeMb} MB). Batas maksimal per dokumen adalah 20 MB.`, { hideProgressBar: true, containerId: `toastUploadDoc` })
                return;
            }
            setIsLoad(true)
            const url = `${BASE_API_URL}/submission/upload-documents/${submission_id}`
            const formData = new FormData();
            files.forEach((f) => {
                formData.append('files', f.file);
            });
            const { data } = await postFile(url, formData, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message || 'Dokumen pendukung berhasil diunggah', { hideProgressBar: true, containerId: `toastUploadDoc` })
                setTimeout(() => router.replace(`/petugas/kuesioner/${survey_id}/documentation?submission_id=${submission_id}`), 1000)
            } else {
                toast.warning(data?.message || 'Gagal mengunggah dokumen', { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        } catch (error: any) {
            setIsLoad(false)
            if (error?.response?.status === 413 || error?.message?.includes('413') || error?.code === 'ERR_BAD_RESPONSE') {
                toast.error('Ukuran berkas melebihi kapasitas server (Maksimal 20 MB per file). Silakan pilih berkas yang lebih kecil.', { hideProgressBar: true, containerId: `toastUploadDoc` })
            } else {
                toast.error(`Terjadi kesalahan unggah: ${error?.message || error}`, { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        }
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB

    const handleFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const acceptedFiles: UploadFile[] = [];
        Array.from(selectedFiles).forEach((file) => {
            if (file.size > MAX_SIZE) {
                const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
                toast.error(`Berkas "${file.name}" ditolak karena melebihi batas 20 MB (${sizeMb} MB).`, { hideProgressBar: true, containerId: `toastUploadDoc` });
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
                    Tahap 2 dari 3: Berkas Pendukung
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Unggah Dokumen Pendukung Kuesioner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Unggah bukti fisik seperti SK, MoU Industri, atau sertifikat pendukung (format PDF, JPG, PNG maks. 2MB).
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                        Klik atau seret berkas ke area ini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Mendukung PDF, JPG, PNG (Maksimal 2 MB per berkas)
                    </p>
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={inputRef}
                        accept={`image/jpeg,image/png,application/pdf`}
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </div>

                {files.length > 0 && (
                    <ul className="space-y-2">
                        {files.map(({ file, id }) => (
                            <li key={id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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
                    <Link href={`/petugas/kuesioner/${survey_id}/documentation?submission_id=${submission_id}`}>
                        <button type="button" className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all">
                            Lewati Tahap Ini
                        </button>
                    </Link>

                    <button
                        type="submit"
                        disabled={isLoad}
                        className="px-6 py-2.5 rounded-xl bg-[#0B5C9E] hover:bg-[#094B82] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isLoad ? 'Mengunggah...' : 'Unggah & Lanjut'}
                    </button>
                </div>
            </form>
        </div>
    );
}
