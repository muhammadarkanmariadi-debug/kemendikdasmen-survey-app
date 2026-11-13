import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QuerySubmissionDto {
    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    id_survey?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    id_kategori?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    id_instansi?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    id_jenis_responden?: string
}