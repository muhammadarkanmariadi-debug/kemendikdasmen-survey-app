import { Type } from "class-transformer"
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator"
import { TipeInstansi } from "generated/prisma"

export class CreateJenisRespondenDto {
    @IsNotEmpty()
    @IsString()
    jenis: string

    @IsNotEmpty()
    @IsBoolean()
    @Type(() => Boolean)
    is_public: boolean

    @IsNotEmpty()
    @IsEnum(TipeInstansi)
    tipe: TipeInstansi
}
