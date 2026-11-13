import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from "multer";
import { ROOT_DIRECTORY } from "src/global";

export const FileUploadDocument: MulterOptions = {
    storage: diskStorage({
        destination(req, file, callback) {
            callback(null, `${ROOT_DIRECTORY}/public/documents`)
        },
        filename(req, file, callback) {
            const uniqueSuffix = new Date().getTime().toString()
            const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            callback(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedOriginalName}`)
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    fileFilter(req, file, callback) {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new BadRequestException(`Format berkas '${file.originalname}' tidak didukung. Harap unggah PDF, DOCX, XLSX, atau Gambar (JPG/PNG).`), false)
        }
        callback(null, true)
    },
}

export const FileUploadDocumentation: MulterOptions = {
    storage: diskStorage({
        destination(req, file, callback) {
            callback(null, `${ROOT_DIRECTORY}/public/documentations`)
        },
        filename(req, file, callback) {
            const uniqueSuffix = new Date().getTime().toString()
            const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            callback(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedOriginalName}`)
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    fileFilter(req, file, callback) {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new BadRequestException(`Format foto dokumentasi '${file.originalname}' tidak didukung. Harap gunakan format gambar (JPG, PNG, atau WEBP).`), false)
        }
        callback(null, true)
    },
}