import { Controller, Get, Post, Body, Request, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { LokasiPetugasService } from './lokasi_petugas.service';
import { CreateLokasiPetugasDto } from './dto/create-lokasi_petugas.dto';
import { UpdateLokasiPetugasDto } from './dto/update-lokasi_petugas.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import FormatValidation from 'src/helper/validation-format';
import { Roles } from 'src/helper/roles-guard';
import { QueryDropLokasiPetugasDto, QueryLokasiPetugasDto } from './dto/query-lokasi_petugas.dto';

@ApiTags(`lokasi-petugas`)
@Controller('lokasi-petugas')
export class LokasiPetugasController {
  constructor(private readonly lokasiPetugasService: LokasiPetugasService) { }

  @Post()
  @ApiBody({ type: CreateLokasiPetugasDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createLokasiPetugasDto: CreateLokasiPetugasDto) {
    return this.lokasiPetugasService.create(createLokasiPetugasDto);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryLokasiPetugasDto) {
    return this.lokasiPetugasService.findAll(query);
  }

  @Get('pilihan-responden')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findResponden(@Request() req) {
    return this.lokasiPetugasService.findResponden(req.user.uuid);
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  findOne(@Param('id') id: string) {
    return this.lokasiPetugasService.findOne(id);
  }

  @Delete()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  remove(@Query() queryData: QueryDropLokasiPetugasDto) {
    return this.lokasiPetugasService.remove(queryData);
  }
}
