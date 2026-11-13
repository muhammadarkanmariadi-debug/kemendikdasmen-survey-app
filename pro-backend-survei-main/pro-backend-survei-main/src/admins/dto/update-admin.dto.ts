import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, MinLength } from "class-validator"

export class UpdateAdminDto {
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
