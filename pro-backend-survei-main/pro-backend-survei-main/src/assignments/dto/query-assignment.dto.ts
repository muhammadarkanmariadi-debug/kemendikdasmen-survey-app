import { IsNotEmpty, IsString } from "class-validator";

export class QueryAssignmentDto {
    @IsNotEmpty()
    @IsString()
    id_petugas: string
}