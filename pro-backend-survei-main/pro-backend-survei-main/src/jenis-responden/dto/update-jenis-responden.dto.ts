import { Type } from "class-transformer"
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator"
import { TipeInstansi } from "generated/prisma"

export class UpdateJenisRespondenDto {
    @IsOptional()
    @IsString()
    jenis?: string

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_public?: boolean

    @IsOptional()
    @IsEnum(TipeInstansi)
    tipe?: TipeInstansi
}
