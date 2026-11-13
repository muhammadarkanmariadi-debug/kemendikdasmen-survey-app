import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class CreatePetugasDto {
    @ApiProperty({ example: `Moklet` })
    @IsNotEmpty()
    @IsString()
    nama_user: string

    @ApiProperty({ example: `mokletUsername` })
    @IsNotEmpty()
    @IsString()
    username: string
    
    @ApiProperty({ example: `Moklet@123` })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string
}
