import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class CreateAdminDto {
    @ApiProperty({ example: `Moklet` })
    @IsNotEmpty()
    @IsString()
    nama_user: string

    @ApiProperty({ example: `moklet` })
    @IsNotEmpty()
    @IsString()
    username: string

    @ApiProperty({ example: `Moklet@123` })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string
}
