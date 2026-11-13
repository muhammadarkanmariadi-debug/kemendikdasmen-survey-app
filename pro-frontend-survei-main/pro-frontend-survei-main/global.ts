export const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || ""
export const BASE_API_URL = `${BASE_DOMAIN}`
export const BASE_FILE_DOCUMENTATION = `${BASE_DOMAIN}/file-documentations`
export const BASE_FILE_DOCUMENTS = `${BASE_DOMAIN}/file-documents`

export const BASIC_AUTH_USERNAME = process.env.NEXT_PUBLIC_BASIC_AUTH_USERNAME || ""
export const BASIC_AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD || ""

export const TOKEN_KEY_PETUGAS = process.env.NEXT_PUBLIC_TOKEN_KEY_PETUGAS || ""
export const TOKEN_KEY_ADMIN = process.env.NEXT_PUBLIC_TOKEN_KEY_ADMIN || ""
export const TOKEN_KEY_INSTANSI = process.env.NEXT_PUBLIC_TOKEN_KEY_INSTANSI || ""

export const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || ""