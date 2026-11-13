import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateKategoriDto {
    @ApiProperty({ example: "uuid-survey", required: true })
    @IsNotEmpty()
    @IsString()
    id_survey: string

    @ApiProperty({ example: "Persiapan Awal dan Petunjuk Teknis", required: true })
    @IsNotEmpty()
    @IsString()
    nama_kategori: string
}
