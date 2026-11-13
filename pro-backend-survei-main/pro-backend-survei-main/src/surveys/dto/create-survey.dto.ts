import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional } from "class-validator";
import { Responden } from "generated/prisma";

export class CreateSurveyDto {
    @ApiProperty({ example: `Instrumen Pra Pelaksanaan Sistem Penerimaan Murid Baru (SPMB) Tahun 2025`, required: true})
    @IsNotEmpty()
    @IsString()
    nama_survey: string;

    @ApiProperty({ example: `ALL`, required: true})
    @IsNotEmpty()
    @IsEnum(Responden)
    jenis_responden: Responden;

    @ApiProperty({ example: `true`, required: true })
    @IsNotEmpty()
    @IsBoolean()
    @Type(() => Boolean)
    status: boolean;

    @ApiProperty({ example: `['GURU','KEPALA SEKOLAH', 'SISWA']`, required: true})
    @IsOptional()
    @IsString()
    responden_group?: string;
}
