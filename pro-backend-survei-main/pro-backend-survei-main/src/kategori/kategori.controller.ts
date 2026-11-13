import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Put } from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/helper/roles-guard';
import FormatValidation from 'src/helper/validation-format';
import { KategoriBySurveyDto, QueryKategoriDto } from './dto/query-kategori.dto';

@ApiTags(`kategori`)
@Controller('kategori')
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Patch('reorder')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  reorder(@Body() reorderDto: { id_survey: string; items: { uuid: string; order_index: number }[] }) {
    return this.kategoriService.reorder(reorderDto);
  }

  @Post()
  @ApiBody({ type: CreateKategoriDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createKategoriDto: CreateKategoriDto) {
    return this.kategoriService.create(createKategoriDto);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryKategoriDto) {
    return this.kategoriService.findAll(query);
  }

  @Get('bysurvey')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findBySurvey(@Query() query: KategoriBySurveyDto) {
    return this.kategoriService.findBySurvey(query);
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.kategoriService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateKategoriDto})
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateKategoriDto: UpdateKategoriDto) {
    return this.kategoriService.update(id, updateKategoriDto);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.kategoriService.remove(id);
  }
}
