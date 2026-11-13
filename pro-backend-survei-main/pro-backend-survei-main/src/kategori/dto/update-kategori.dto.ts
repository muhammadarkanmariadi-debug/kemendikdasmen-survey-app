import { PartialType } from '@nestjs/swagger';
import { CreateKategoriDto } from './create-kategori.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateKategoriDto extends PartialType(CreateKategoriDto) {
    @ApiProperty({ example: "uuid-survey", required: false })
    @IsOptional()
    @IsString()
    id_survey?: string

    @ApiProperty({ example: "Persiapan Awal dan Petunjuk Teknis", required: false })
    @IsOptional()
    @IsString()
    nama_kategori?: string
}
