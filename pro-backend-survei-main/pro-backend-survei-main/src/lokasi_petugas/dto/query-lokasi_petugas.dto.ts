import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QueryLokasiPetugasDto {
    @ApiPropertyOptional({example: `1`})
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number

    @ApiPropertyOptional({example: `50`})
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional({example: `uuid-survey`})
    @IsOptional()
    @IsString()
    id?: string
}

export class QueryDropLokasiPetugasDto {
    @ApiPropertyOptional({example: `uuid-survey`})
    @IsOptional()
    @IsString()
    id_survey?: string

    @ApiPropertyOptional({example: `uuid-responden`})
    @IsOptional()
    @IsString()
    id_responden?: string

    @ApiPropertyOptional({example: `uuid-responden`})
    @IsOptional()
    @IsString()
    id_petugas?: string
}