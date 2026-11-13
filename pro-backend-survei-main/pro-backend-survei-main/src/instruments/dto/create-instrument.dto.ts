import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, ValidateNested } from "class-validator";
import { JenisPertanyaan } from "generated/prisma";
import { CreateOpsiDto } from "./create-opsi.dto";
import { Type } from "class-transformer";

export class CreateInstrumentDto {
    @ApiProperty({ example: `uuid-kategori`, required: true })
    @IsNotEmpty()
    @IsString()
    id_kategori: string

    @ApiProperty({ example: "Persiapan Awal dan Petunjuk Teknis", required: false })
    @IsOptional()
    @IsString()
    kategori?: string

    @ApiProperty({ example: "Apakah sekolah telah menerima petunjuk teknis?", required: true })
    @IsNotEmpty()
    @IsString()
    pertanyaan: string

    @ApiProperty({ example: "PILIHAN", required: true })
    @IsNotEmpty()
    @IsEnum(JenisPertanyaan)
    jenis: JenisPertanyaan

    @ApiProperty({ example: "true", required: true })
    @IsNotEmpty()
    @IsBoolean()
    @Type(() => Boolean)
    required: boolean

    @ApiProperty({ example: "uuid-survey", required: true })
    @IsNotEmpty()
    @IsString()
    id_survey: string

    @ApiProperty({ example: "['KEPALA SKEOLAH','GURU','SISWA']", required: false })
    @IsOptional()
    @IsString()
    for_responden_group?: string

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    order_index?: number;

    @ApiProperty({ example: "Petunjuk pengisian", required: false })
    @IsOptional()
    @IsString()
    deskripsi_bantuan?: string;

    @ApiProperty({ example: "[\"SISWA\",\"GURU\"]", required: false })
    @IsOptional()
    @IsString()
    for_sub_role?: string;

    @ApiProperty({ example: "{\"max_size_mb\":5}", required: false })
    @IsOptional()
    @IsString()
    file_config?: string;

    @ApiProperty({ example: "{\"min\":1,\"max\":5}", required: false })
    @IsOptional()
    @IsString()
    scale_config?: string;

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
