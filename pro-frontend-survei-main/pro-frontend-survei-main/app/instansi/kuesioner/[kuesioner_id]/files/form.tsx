'use client';

import { BASE_API_URL, TOKEN_KEY_INSTANSI } from '@/global';
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
    const TOKEN = getCookie(TOKEN_KEY_INSTANSI) || ""
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            if (files.length == 0) {
                toast.warning(`Unggah minimal satu berkas dokumen`, { hideProgressBar: true, containerId: `toastUploadDoc` })
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
                setTimeout(() => router.replace(`/instansi/kuesioner/${survey_id}/documentation?submission_id=${submission_id}`), 1000)
            } else {
                toast.warning(data?.message || 'Gagal mengunggah dokumen', { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        } catch (error: any) {
            setIsLoad(false)
            if (error?.response?.status === 413 || error?.message?.includes('413') || error?.code === 'ERR_BAD_RESPONSE') {
                toast.error('Ukuran berkas melebihi kapasitas server (Maksimal 20 MB). Silakan pilih berkas yang lebih kecil.', { hideProgressBar: true, containerId: `toastUploadDoc` })
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
            file,
            id: URL.createObjectURL(file),
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleRemove = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className="p-10 border rounded-lg bg-sky-100 text-black">
            <ToastContainer containerId={`toastUploadDoc`} />
            <p className='my-2 font-semibold'>
                Unggah berkas pendukung untuk kuesioner ini
            </p>
            <form onSubmit={handleSubmit}>
                <div
                    className="p-6 border-2 border-dashed border-sky-600 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <p>Drag & drop files here or click to select</p>
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
                    <ul className="mt-4 space-y-2">
                        {files.map(({ file, id }) => (
                            <li key={id} className="flex items-center justify-between bg-sky-100 p-2 rounded-md">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </div>
                                    <div className="text-sm truncate max-w-[200px] flex flex-col gap-1">
                                        {file.name}
                                        <div className="text-xs text-gray-500">
                                            {file.size ? (file.size / 1024 > 1000 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`) : 'Ukuran tidak diketahui'}
                                        </div>
                                    </div>
                                </div>
                                <button type='button'
                                    className="text-red-500 text-3xl"
                                    onClick={() => handleRemove(id)}
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="w-full my-5 flex justify-between items-center">
                    <Link href={`/instansi/kuesioner/${survey_id}/documentation?submission_id=${submission_id}`}>
                        <button type="button" className='rounded-md px-4 py-2 bg-white text-primary border border-primary hover:bg-primary hover:text-white'>
                            Lewati
                        </button>
                    </Link>

                    <button type="submit" disabled={isLoad} className='rounded-md px-4 py-2 bg-primary text-white border border-primary hover:bg-white hover:text-primary'>
                        {isLoad ? `Mengirim...` : `Kirim`}
                    </button>
                </div>
            </form>
        </div>
    );
}
