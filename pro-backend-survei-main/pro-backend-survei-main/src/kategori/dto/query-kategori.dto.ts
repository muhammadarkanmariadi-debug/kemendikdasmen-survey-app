import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QueryKategoriDto {
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

    @ApiPropertyOptional({ example: `` })
    @IsOptional()
    @IsString()
    search?: string
}

export class KategoriBySurveyDto {
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

    @ApiPropertyOptional({ example: `` })
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional({ example: `uuid-survey` })
    @IsOptional()
    @IsString()
    id_survey?: string
}