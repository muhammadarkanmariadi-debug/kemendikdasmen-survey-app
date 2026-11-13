import { NextResponse, NextRequest } from "next/server";
import { TOKEN_KEY_ADMIN, TOKEN_KEY_INSTANSI, TOKEN_KEY_PETUGAS } from "./global";
import { isVerifiedAdmin, isVerifiedInstansi, isVerifiedPetugas } from "./helper/verifyUser";

export const middleware = async (request: NextRequest) => {
    if (request.nextUrl.pathname.startsWith('/admin')) {
        let redirectAdmin = request.nextUrl.clone()
        redirectAdmin.pathname = '/'

        let cookie = request.cookies.get(TOKEN_KEY_ADMIN)?.value

        if (typeof cookie === "undefined") {
            return NextResponse.redirect(redirectAdmin)
        }
        const isVerify: boolean = await isVerifiedAdmin(cookie)

        if (!isVerify) return NextResponse.redirect(redirectAdmin)

        let response = NextResponse.next()
        response.headers.set("x-middleware-cache", "no-cache")
        return response
    }

    if (request.nextUrl.pathname.startsWith('/petugas')) {
        let redirectAdmin = request.nextUrl.clone()
        redirectAdmin.pathname = '/'

        let cookie = request.cookies.get(TOKEN_KEY_PETUGAS)?.value

        if (typeof cookie === "undefined") {
            return NextResponse.redirect(redirectAdmin)
        }
        const isVerify: boolean = await isVerifiedPetugas(cookie)

        if (!isVerify) return NextResponse.redirect(redirectAdmin)

        let response = NextResponse.next()
        response.headers.set("x-middleware-cache", "no-cache")
        return response
    }

    if (request.nextUrl.pathname.startsWith('/instansi')) {
        let redirectAdmin = request.nextUrl.clone()
        redirectAdmin.pathname = '/'

        let cookie = request.cookies.get(TOKEN_KEY_INSTANSI)?.value

        if (typeof cookie === "undefined") {
            return NextResponse.redirect(redirectAdmin)
        }
        const isVerify: boolean = await isVerifiedInstansi(cookie)

        if (!isVerify) return NextResponse.redirect(redirectAdmin)

        let response = NextResponse.next()
        response.headers.set("x-middleware-cache", "no-cache")
        return response
    }

    return NextResponse.next()
}
export const config = {
    matcher: [
        "/admin/:path*", "/petugas/:path*", "/instansi/:path*"
        // "/"
    ]
}