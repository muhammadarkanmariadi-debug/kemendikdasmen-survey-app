import { IsEnum, IsOptional, IsString } from "class-validator"
import { TipeInstansi } from "generated/prisma"

export class UpdateInstansiDto {
    @IsOptional()
    @IsString()
    nama_instansi?: string

    @IsOptional()
    @IsEnum(TipeInstansi)
    tipe?: TipeInstansi

    @IsOptional()
    @IsString()
    alamat?: string

    @IsOptional()
    @IsString()
    kota?: string

    @IsOptional()
    @IsString()
    provinsi?: string

    @IsOptional()
    @IsString()
    kode_instansi?: string

    @IsOptional()
    @IsString()
    password?: string

    @IsOptional()
    @IsString()
    id_jenis_responden?: string
}
