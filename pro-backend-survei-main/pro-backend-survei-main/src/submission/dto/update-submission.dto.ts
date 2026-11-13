import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubmissionDto {
    @ApiProperty({ example: `sad-sad-sad-sad-sda` })
    @IsNotEmpty()
    @IsString()
    id_survey: string

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