import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { TipeInstansi } from "generated/prisma"

export class CreateInstansiDto {
    @IsNotEmpty()
    @IsString()
    nama_instansi: string

    @IsNotEmpty()
    @IsString()
    kode_instansi: string

    @IsNotEmpty()
    @IsString()
    alamat: string

    @IsNotEmpty()
    @IsString()
    kota: string

    @IsNotEmpty()
    @IsString()
    provinsi: string

    @IsNotEmpty()
    @IsEnum(TipeInstansi)
    tipe: TipeInstansi

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    id_jenis_responden: string

}
