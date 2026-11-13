import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

class RespondenItemDto {
    @ApiProperty({ example: 'uuid-responden' })
    @IsNotEmpty()
    @IsString()
    id_responden: string;
}

export class CreateLokasiPetugasDto {
    @ApiProperty({ example: `uuid-survey` })
    @IsNotEmpty()
    @IsString()
    id_survey: string

    @ApiProperty({ example: `uuid-petugas` })
    @IsNotEmpty()
    @IsString()
    id_petugas: string


    @ApiProperty({
        type: [RespondenItemDto],
        description: 'Daftar responden yang akan ditugaskan',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RespondenItemDto)
    responden: RespondenItemDto[];
}
