"use client"

import { ReactNode } from "react"

const Modal = ({ children, isShow, onClose }: { children: ReactNode, isShow: boolean, onClose: (status: boolean) => void }) => {
    return (
        <div className={`w-full h-dvh z-[1024] bg-slate-900/60 backdrop-blur-sm fixed top-0 left-0 ${isShow ? `flex` : `hidden`} justify-center items-center p-4 transition-all duration-200`}>
            <div className="w-full max-w-2xl overflow-hidden max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="overflow-y-auto w-full flex flex-col max-h-[92vh]">
                    {children}
                </div>
            </div>
        </div>
    )
}
export default Modal

export const ModalHeader = ({ children, onClose }: { children: ReactNode, onClose: (status: boolean) => void }) => {
    return (
        <div className="w-full flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="font-bold text-slate-800 text-lg">{children}</div>
            <button
                type="button"
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => onClose(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}
