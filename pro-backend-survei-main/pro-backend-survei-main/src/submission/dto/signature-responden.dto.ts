import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator"

export class SignatureRespondenDto {
    
    @ApiProperty({ example: `uuid hasil survey` })
    @IsNotEmpty()
    @IsString()
    id_hasil_survey: string

    @ApiProperty({ example: `nama responden` })
    @IsNotEmpty()
    @IsString()
    nama_responden: string
    
    @ApiProperty({ example: `ttd` })
    @IsNotEmpty()
    @IsString()
    ttd: string

    @ApiProperty({ example: `20` })
    @IsOptional()
    @IsNumber()
    top: Number

    @ApiProperty({ example: `20` })
    @IsOptional()
    @IsNumber()
    width: Number

    @ApiProperty({ example: `20` })
    @IsOptional()
    @IsNumber()
    left: Number
}
