import { PartialType } from '@nestjs/swagger';
import { CreateInstrumentDto } from './create-instrument.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsBoolean, ValidateNested } from "class-validator";
import { JenisPertanyaan } from "generated/prisma";
import { CreateOpsiDto } from "./create-opsi.dto";
import { Type } from "class-transformer";

export class UpdateInstrumentDto extends PartialType(CreateInstrumentDto) {
    @ApiProperty({ example: `uuid-kategori`, required: false })
    @IsOptional()
    @IsString()
    id_kategori: string

    @ApiProperty({ example: "A. Persiapan Awal dan Petunjuk Teknis", required: false })
    @IsOptional()
    @IsString()
    kategori?: string

    @ApiProperty({ example: "Apakah sekolah telah menerima petunjuk teknis?", required: false })
    @IsOptional()
    @IsString()
    pertanyaan?: string

    @ApiProperty({ example: "PILIHAN", required: false })
    @IsOptional()
    @IsEnum(JenisPertanyaan)
    jenis?: JenisPertanyaan

    @ApiProperty({ example: "true", required: false })
    @IsOptional()
    @IsBoolean()
    required?: boolean

    @ApiProperty({ example: "uuid-survey", required: false })
    @IsOptional()
    @IsString()
    id_survey?: string

    @ApiProperty({ example: "['KEPALA SKEOLAH','GURU','SISWA']", required: true })
    @IsOptional()
    @IsString()
    for_responden_group?: string

    @ApiProperty({
        type: [CreateOpsiDto],
        required: false,
        description: 'Hanya diisi jika jenis pertanyaan adalah PILIHAN'
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateOpsiDto)
    opsi?: CreateOpsiDto[];
}
