import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLokasiPetugasDto } from './create-lokasi_petugas.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RespondenItemDto {
    @ApiProperty({ example: 'uuid-responden' })
    @IsOptional()
    @IsString()
    id_responden: string;

    @ApiProperty({ example: 'nama-responden' })
    @IsOptional()
    @IsString()
    nama_responden: string;
}

export class UpdateLokasiPetugasDto extends PartialType(CreateLokasiPetugasDto) {
    @ApiProperty({ example: `uuid-survey` })
    @IsOptional()
    @IsString()
    id_survey: string

    @ApiProperty({ example: `nama-petugas` })
    @IsOptional()
    @IsString()
    nama_survey: string

    @ApiProperty({ example: `uuid-petugas` })
    @IsOptional()
    @IsString()
    id_petugas: string

    @ApiProperty({ example: `uuid-petugas` })
    @IsOptional()
    @IsString()
    nama_petugas: string

    @ApiProperty({
        type: [RespondenItemDto],
        description: 'Daftar responden yang akan ditugaskan',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RespondenItemDto)
    responden: RespondenItemDto[];
}
