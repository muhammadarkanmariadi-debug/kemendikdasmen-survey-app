import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { Responden } from "generated/prisma"

export class CreateRespondenDto {
    @ApiProperty({ example: `SEKOLAH` })
    @IsNotEmpty()
    @IsEnum(Responden)
    jenis_responden: Responden

    @ApiProperty({ example: `SMK Telkom Malang` })
    @IsNotEmpty()
    @IsString()
    nama: string

    @ApiProperty({ example: `Jalan Danau Ranau` })
    @IsNotEmpty()
    @IsString()
    alamat: string

    @ApiProperty({ example: `Jawa Timur` })
    @IsNotEmpty()
    @IsString()
    provinsi: string

    @ApiProperty({ example: `Kota Malang` })
    @IsNotEmpty()
    @IsString()
    kab_kota: string
}
