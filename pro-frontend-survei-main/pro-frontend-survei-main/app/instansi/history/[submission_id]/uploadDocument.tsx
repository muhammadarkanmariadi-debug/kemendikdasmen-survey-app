'use client';

import Modal from '@/components/Modal';
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

export default function UploadDocuments({ submission_id }: { submission_id: string }) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [isShow, setIsShow] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null);
    const TOKEN = getCookie(TOKEN_KEY_INSTANSI) || ""
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            if (files.length == 0) {
                toast.warning(`Unggah minimal satu berkas`, { hideProgressBar: true, containerId: `toastUploadDoc` })
                return;
            }
            if (files.find(f => f.file.size > 2 * 1024 * 1024)) {
                toast.warning(`Ukuran berkas tidak boleh lebih dari 2 MB`, { hideProgressBar: true, containerId: `toastUploadDoc` })
                return;
            }
            setIsLoad(true)
            const url = `${BASE_API_URL}/submission/upload-documents/${submission_id}`
            const formData = new FormData();
            files.forEach((f) => {
                formData.append('files', f.file); // Same key used multiple times
            });
            const { data } = await postFile(url, formData, TOKEN)
            setIsLoad(false)
            if (data?.success == true) {
                toast.success(data?.message, { hideProgressBar: true, containerId: `toastUploadDoc` })
                setIsShow(false)
                setTimeout(() => router.refresh(), 1000)
            } else {
                toast.warning(data?.message, { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        } catch (error) {
            toast.error(`Something wrong.${error}`, { hideProgressBar: true, containerId: `toastUploadDoc` })
        }
    }

    const handleFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const newFiles = Array.from(selectedFiles).map((file) => ({
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
        <div>
            <ToastContainer containerId={`toastUploadDoc`} />
            <div className="flex items-center gap-2 my-2 text-primary border-b border-primary p-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className='cursor-pointer font-bold' onClick={() => {
                    setIsShow(true)
                    setFiles([])
                }}>Tambah Dokumen Pendukung</span>
            </div>
            <Modal isShow={isShow} onClose={s => setIsShow(s)}>
                <form onSubmit={handleSubmit}>
                    {/* modal header */}
                    <div className="sticky top-0 bg-white px-5 pt-5 pb-3 shadow">
                        <div className="w-full flex items-center">
                            <div className="flex flex-col">
                                <strong className="font-bold text-2xl text-black">Unggah Dokumen Pendukung</strong>
                                <small className="text-slate-400 text-sm">Unggah dokumen pendukung kuesioner</small>
                            </div>
                            <div className="ml-auto">
                                <button type="button" className="text-slate-400" onClick={() => setIsShow(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* end modal header */}

                    <div className="p-5 text-black">
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
                    </div>

                    {/* modal footer */}
                    <div className="w-full p-5 flex rounded-b-2xl shadow">
                        <div className="w-full my-5 flex justify-between items-center">
                            <button type="button" onClick={() => setIsShow(false)} className='rounded-md px-4 py-2 bg-white text-primary border border-primary hover:bg-primary hover:text-white'>
                                Batal
                            </button>

                            <button type="submit" disabled={isLoad} className='rounded-md px-4 py-2 bg-primary text-white border border-primary hover:bg-white hover:text-primary'>
                                {isLoad ? `Mengirim...` : `Kirim`}
                            </button>
                        </div>
                    </div>
                    {/* end modal footer */}
                </form>
            </Modal>
        </div>
    );
}
