import axios from "axios";
import { BASE_API_URL } from "@/global";

const axiosInstance = axios.create({
    baseURL: BASE_API_URL
})

type HeadersType = { "Authorization"?: string, "Content-Type"?: string }
type AuthType = { username: string, password: string }
type ResponseType = {
    status: boolean
    message?: string
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data?: any
}


export const get = async (url: string, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const headers: HeadersType | undefined = typeof credential === "string" ? {
            "Authorization": `Bearer ${credential}` || ``
        } : undefined
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.get(url, {
            headers, auth
        })

        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        console.log(error);
        
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong: ${error}`
        }
    }
}

export const drop = async (url: string, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const headers: HeadersType | undefined = typeof credential === "string" ? {
            "Authorization": `Bearer ${credential}` || ``
        } : undefined
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.delete(url, {
            headers, auth
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const post = async (url: string, data: string | FormData, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const typed: string = (typeof data == 'string') ? "application/json" : "multipart/form-data"
        const headers: HeadersType | undefined = {
            "Authorization": (typeof credential === 'string') ? `Bearer ${credential}` : undefined,
            "Content-Type": typed
        }
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.post(url, data, {
            headers, auth
        })

        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.response.data.message}`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const put = async (url: string, data: string | FormData, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const type: string = (typeof data == 'string') ? "application/json" : "multipart/form-data"
        const headers: HeadersType | undefined = {
            "Authorization": (typeof credential === 'string') ? `Bearer ${credential}` : undefined,
            "Content-Type": type
        }
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.put(url, data, {
            headers, auth
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const patch = async (url: string, data: any, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const payload = (typeof data === 'object' && !(data instanceof FormData)) ? JSON.stringify(data) : data
        const type: string = (typeof payload == 'string') ? "application/json" : "multipart/form-data"
        const headers: HeadersType | undefined = {
            "Authorization": (typeof credential === 'string') ? `Bearer ${credential}` : undefined,
            "Content-Type": type
        }
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.patch(url, payload, {
            headers, auth
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        const err: any = error
        if (err.response) {
            console.log(err.response.data?.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        return {
            status: false,
            message: `Something went wrong: ${error}`
        }
    }
}

export const putFile = async (url: string, data: string | FormData, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const type: string = (typeof data == 'string') ? "application/json" : "multipart/form-data"
        const headers: HeadersType | undefined = {
            "Authorization": (typeof credential === 'string') ? `Bearer ${credential}` : undefined,
            "Content-Type": type
        }
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.put(url, data, {
            headers, auth
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const postFile = async (url: string, data: string | FormData, credential: string | AuthType): Promise<ResponseType> => {
    try {
        const type: string = (typeof data == 'string') ? "application/json" : "multipart/form-data"
        const headers: HeadersType | undefined = {
            "Authorization": (typeof credential === 'string') ? `Bearer ${credential}` : undefined,
            "Content-Type": type
        }
        const auth: AuthType | undefined = typeof credential !== "string" ? credential : undefined
        const result = await axiosInstance.post(url, data, {
            headers, auth
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const getBlob = async (url: string, token: string): Promise<ResponseType> => {
    try {
        const result = await axiosInstance.request({
            url: url,
            responseType: "blob",
            method: "get",
            headers: {
                "Content-Type": 'blob',
                "Authorization": `Bearer ${token}` || '',
            }
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}

export const postBlob = async (url: string, payload: string, token: string): Promise<ResponseType> => {
    try {
        const result = await axiosInstance.request({
            url: url,
            responseType: "blob",
            method: "post",
            data: payload,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` || ''
            }
        })
        return {
            status: true,
            data: result.data
        }
    } catch (error) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const err: any = error
        if (err.response) {
            console.log(err.response.data.message);
            return {
                status: false,
                message: `${err.code}: something wrong`
            }
        }
        console.log(err.response);
        return {
            status: false,
            message: `Something were wrong`
        }
    }
}