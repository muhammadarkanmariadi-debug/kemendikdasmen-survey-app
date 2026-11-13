import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRespondenDto } from './create-responden.dto';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Responden } from 'generated/prisma';

export class UpdateRespondenDto extends PartialType(CreateRespondenDto) {
    @ApiProperty({ example: `SEKOLAH` })
    @IsOptional()
    @IsEnum(Responden)
    jenis_responden?: Responden

    @ApiProperty({ example: `SMK Telkom Malang` })
    @IsOptional()
    @IsString()
    nama?: string

    @ApiProperty({ example: `Jalan Danau Ranau` })
    @IsOptional()
    @IsString()
    alamat?: string

    @ApiProperty({ example: `Jawa Timur` })
    @IsOptional()
    @IsString()
    provinsi?: string

    @ApiProperty({ example: `Kota Malang` })
    @IsOptional()
    @IsString()
    kab_kota?: string
}
