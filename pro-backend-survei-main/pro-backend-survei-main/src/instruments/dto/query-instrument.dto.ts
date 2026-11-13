import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QueryInstrumentDto {
    @ApiPropertyOptional({ example: 1, type: `number` })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number

    @ApiPropertyOptional({ example: 50, type: `number` })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number

    @ApiPropertyOptional({ example: ``, type: `number` })
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional({ example: `uuid-survey` })
    @IsOptional()
    @IsString()
    id_survey?: string

    @ApiPropertyOptional({ example: `uuid-kategori` })
    @IsOptional()
    @IsString()
    id_kategori?: string
}