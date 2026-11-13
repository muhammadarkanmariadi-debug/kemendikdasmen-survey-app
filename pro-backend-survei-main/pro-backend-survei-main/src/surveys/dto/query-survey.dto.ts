import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QuerySurveyDto {
    @ApiPropertyOptional({ example: 1, type: `number`})
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number

    @ApiPropertyOptional({ example: 50, type: `number`, required: false })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number

    @ApiPropertyOptional({ example: ``, required: false })
    @IsOptional()
    @IsString()
    search?: string
}