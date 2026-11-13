import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePetugasDto } from './create-petugas.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePetugasDto extends PartialType(CreatePetugasDto) {
    @ApiProperty({ example: `Moklet` })
    @IsOptional()
    @IsString()
    nama_user?: string

    @ApiProperty({ example: `moklet` })
    @IsOptional()
    @IsString()
    username?: string

    @ApiProperty({ example: `Moklet@123` })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string
}
