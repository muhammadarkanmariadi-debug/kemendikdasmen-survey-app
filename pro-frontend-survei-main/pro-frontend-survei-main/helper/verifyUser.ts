import { BASE_API_URL, JWT_SECRET } from "@/global"
import { jwtVerify } from "jose";

export const isVerifiedAdmin = async (token: string): Promise<boolean> => {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET || "")
        const { payload } = await jwtVerify(token, secret)
        if (payload?.role === `ADMIN`) return true
        return false
    } catch (error) {
        console.log(error);
        return false
    }
}

export const isVerifiedPetugas = async (token: string): Promise<boolean> => {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET || "")
        const { payload } = await jwtVerify(token, secret)
        if (payload?.role === `PETUGAS`) return true
        return false
    } catch (error) {
        console.log(error);
        return false
    }
}

export const isVerifiedInstansi = async (token: string): Promise<boolean> => {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET || "")
        const { payload } = await jwtVerify(token, secret)
        if (payload?.role === `SEKOLAH` || payload?.role === `DINAS`) return true
        return false
    } catch (error) {
        console.log(error);
        return false
    }
}