import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator"

export class SignaturePetugasDto {
    
    // @ApiProperty({ example: `MokletUUID` })
    // @IsOptional()
    // @IsString()
    // uuid?: string

    // @ApiProperty({ example: `Moklet` })
    // @IsNotEmpty()
    // @IsString()
    // username: string
    
    // @ApiProperty({ example: `12` })
    // @IsNotEmpty()
    // @IsString()
    // id_user: string

    @ApiProperty({ example: `mokletTtdTop` })
    @IsOptional()
    @IsNumber()
    top: Number

    @ApiProperty({ example: `mokletTtdWidth` })
    @IsOptional()
    @IsNumber()
    width: Number

    @ApiProperty({ example: `mokletTtdLeft` })
    @IsOptional()
    @IsNumber()
    left: Number

    @ApiProperty({ example: `mokletTtd` })
    @IsOptional()
    @IsString()
    ttd: string
}
