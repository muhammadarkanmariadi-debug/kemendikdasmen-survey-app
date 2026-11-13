import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator"

export class CreateAssignmentDto {
    @IsNotEmpty()
    @IsString()
    id_survey: string

    @IsNotEmpty()
    @IsString()
    id_petugas: string

    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    instansi: { id_instansi: string, nama_instansi: string }[]
}
