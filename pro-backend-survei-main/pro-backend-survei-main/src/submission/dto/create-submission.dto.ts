import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"

export class CreateSubmissionDto {
    @ApiProperty({ example: `sad-sad-sad-sad-sda` })
    @IsNotEmpty()
    @IsString()
    id_survey: string

    @ApiProperty({ example: `sad-sad-sad-sad-sda` })
    @IsNotEmpty()
    @IsString()
    nama: string

    @ApiProperty({ example: `sad-sad-sad-sad-sda`, required: false })
    @IsOptional()
    @IsString()
    id_jenis_responden?: string

    @ApiProperty({ example: `sad-sad-sad-sad-sda` })
    @IsNotEmpty()
    @IsString()
    id_instansi: string

    @ApiProperty({ example: `SISWA`, required: false })
    @IsOptional()
    @IsString()
    sub_role?: string;

    @ApiProperty({ example: `0051234567`, required: false })
    @IsOptional()
    @IsString()
    nomor_identitas?: string;

    @ApiProperty({ example: `[{"id_pertanyaan": "sad-sad-sad-sad-sda", "jawaban": "Baik", "catatan": "Tidak ada"}]` })
    // @IsNotEmpty()
    // @ValidateNested({ each: true })
    @Type(() => JawabanItemDto)
    jawaban: JawabanItemDto[];
}

export class JawabanItemDto {
    @IsString()
    @IsNotEmpty()
    id_pertanyaan: string;

    @IsString()
    @IsNotEmpty()
    jawaban: string;

    @IsString()
    @IsOptional()
    catatan?: string;
}