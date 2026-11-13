import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { Responden } from "generated/prisma"

export class QueryRespondenDto {
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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(Responden)
    filter?: Responden

}