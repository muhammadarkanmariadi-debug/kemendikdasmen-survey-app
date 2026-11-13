import { ReactNode } from "react";

type Props = {
    children: ReactNode
    type: "button" | "submit" | "reset"
    onClick?: () => void
    className?: string
    disabled?: boolean
}

export const ButtonSuccess = ({ children, type, onClick, className = "", disabled }: Props) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={() => { if (onClick) onClick() }}
            className={`inline-flex items-center justify-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl py-2.5 px-4 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    )
}

export const ButtonPrimary = ({ children, type, onClick, className = "", disabled }: Props) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={() => { if (onClick) onClick() }}
            className={`inline-flex items-center justify-center gap-2 text-sm font-semibold bg-[#0B5C9E] hover:bg-[#073B66] active:bg-[#052847] text-white rounded-xl py-2.5 px-4 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    )
}

export const ButtonDanger = ({ children, type, onClick, className = "", disabled }: Props) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={() => { if (onClick) onClick() }}
            className={`inline-flex items-center justify-center gap-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl py-2.5 px-4 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    )
}

export const ButtonWarning = ({ children, type, onClick, className = "", disabled }: Props) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={() => { if (onClick) onClick() }}
            className={`inline-flex items-center justify-center gap-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl py-2.5 px-4 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    )
}
