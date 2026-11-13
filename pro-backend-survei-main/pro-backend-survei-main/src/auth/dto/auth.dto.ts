import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class AuthDto {
    @ApiProperty({example:`moklet`})
    @IsNotEmpty()
    @IsString()
    username: string
    
    @ApiProperty({example:`Moklet@123`})
    @IsNotEmpty()
    @IsString()
    password: string
}