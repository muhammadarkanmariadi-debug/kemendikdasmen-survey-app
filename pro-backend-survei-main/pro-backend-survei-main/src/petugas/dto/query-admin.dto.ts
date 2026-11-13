import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QueryPetugasDto {
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
}