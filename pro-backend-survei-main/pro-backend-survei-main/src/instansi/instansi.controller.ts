import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Put, Request } from '@nestjs/common';
import { InstansiService } from './instansi.service';
import { CreateInstansiDto } from './dto/create-instansi.dto';
import { UpdateInstansiDto } from './dto/update-instansi.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'src/helper/roles-guard';
import FormatValidation from 'src/helper/validation-format';
import { QueryInstansiDto } from './dto/query-instansi.dto';

@Controller('instansi')
@ApiTags('instansi')
export class InstansiController {
  constructor(private readonly instansiService: InstansiService) { }

  @Post()
  @ApiBody({ type: CreateInstansiDto })
  @UseGuards(AuthGuard(`jwt`), RoleGuard)
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createInstansiDto: CreateInstansiDto) {
    return this.instansiService.create(createInstansiDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryInstansiDto) {
    return this.instansiService.findAll(query);
  }

  @Get('me')
  @UseGuards(AuthGuard(`jwt`), RoleGuard)
  @Roles(`SEKOLAH`, `DINAS`)
  findMe(@Request() req) {
    const id = req.user.uuid
    return this.instansiService.findOne(id);
  }

  @Get(':id/responden-sekolah')
  getRespondenSekolah(@Param('id') id: string) {
    return this.instansiService.getRespondenSekolah(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instansiService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth(`access-token`)
  @ApiBody({ type: UpdateInstansiDto })
  @UseGuards(AuthGuard(`jwt`), RoleGuard)
  @Roles(`ADMIN`, `SEKOLAH`, `DINAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateInstansiDto: UpdateInstansiDto) {
    return this.instansiService.update(id, updateInstansiDto);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard(`jwt`), RoleGuard)
  @Roles(`ADMIN`)
  remove(@Param('id') id: string) {
    return this.instansiService.remove(id);
  }
}
