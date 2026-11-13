import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateOpsiDto {
    @ApiProperty({ example: "Sudah" })
    @IsString()
    opsi_jawaban: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    @Type(() => Boolean)
    ada_catatan: boolean;

    @ApiProperty({ example: "Catatan tambahan jika ada", required: false })
    @IsOptional()
    @IsString()
    keterangan_catatan?: string;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    order_index?: number;

    @ApiProperty({ example: "uuid-kategori-tujuan", required: false })
    @IsOptional()
    @IsString()
    goto_kategori_uuid?: string;
}