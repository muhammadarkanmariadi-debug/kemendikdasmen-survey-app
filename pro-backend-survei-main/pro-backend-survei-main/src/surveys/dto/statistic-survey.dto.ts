import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class QueryStatisticDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    id_survey: string;

    @ApiPropertyOptional({ required: true })
    @IsOptional()
    provinsi?: string;
}