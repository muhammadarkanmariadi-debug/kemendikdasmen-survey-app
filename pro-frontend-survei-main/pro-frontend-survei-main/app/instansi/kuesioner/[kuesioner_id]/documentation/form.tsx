'use client';

import Modal from '@/components/Modal';
import { BASE_API_URL, TOKEN_KEY_INSTANSI } from '@/global';
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
    const TOKEN = getCookie(TOKEN_KEY_INSTANSI) || ""

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
                toast.success(data?.message || 'Foto dokumentasi berhasil diunggah', { hideProgressBar: true, containerId: `toastUploadDoc` })
                setIsShow(true)
            } else {
                toast.warning(data?.message || 'Gagal mengunggah foto', { hideProgressBar: true, containerId: `toastUploadDoc` })
            }
        } catch (error: any) {
            setIsLoad(false)
            if (error?.response?.status === 413 || error?.message?.includes('413') || error?.code === 'ERR_BAD_RESPONSE') {
                toast.error('Ukuran berkas melebihi kapasitas server (Maksimal 15 MB). Silakan kompres atau pilih foto lain.', { hideProgressBar: true, containerId: `toastUploadDoc` })
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
        <div className="p-10 border rounded-lg bg-sky-100 text-black">
            <ToastContainer containerId={`toastUploadDoc`} />
            <p className='my-2 font-semibold'>
                Unggah dokumentasi kegiatan pengisian kuesioner
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
                        accept={`image/jpeg,image/png`}
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

                    <button type="button" onClick={() => setIsShow(true)} className='rounded-md px-4 py-2 bg-white text-primary border border-primary hover:bg-primary hover:text-white'>
                        Lewati
                    </button>


                    <button type="submit" disabled={isLoad} className='rounded-md px-4 py-2 bg-primary text-white border border-primary hover:bg-white hover:text-primary'>
                        {isLoad ? `Mengirim...` : `Kirim`}
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
                        <Link href={`/instansi/kuesioner`}>
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
