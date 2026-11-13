import { ApiProperty } from "@nestjs/swagger"
import { PartialType } from '@nestjs/mapped-types';
import { CreateSurveyDto } from './create-survey.dto';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Responden } from 'generated/prisma';
import { Type } from "class-transformer";

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
    @ApiProperty({ example: `Instrumen Pra Pelaksanaan Sistem Penerimaan Murid Baru (SPMB) Tahun 2025`, required: true })
    @IsOptional()
    @IsString()
    nama_survey?: string;

    @ApiProperty({ example: `ALL`, required: true })
    @IsOptional()
    @IsEnum(Responden)
    jenis_responden?: Responden;

    @ApiProperty({ example: `true`, required: true })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    status?: boolean;

    @ApiProperty({ example: `['GURU','KEPALA SEKOLAH', 'SISWA']`, required: true})
    @IsOptional()
    @IsString()
    responden_group?: string;
}
