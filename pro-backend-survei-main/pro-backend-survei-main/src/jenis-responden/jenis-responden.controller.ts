import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { JenisRespondenService } from './jenis-responden.service';
import { CreateJenisRespondenDto } from './dto/create-jenis-responden.dto';
import { UpdateJenisRespondenDto } from './dto/update-jenis-responden.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import FormatValidation from 'src/helper/validation-format';
import { RoleGuard, Roles } from 'src/helper/roles-guard';

@Controller('jenis-responden')
@ApiTags(`jenis-responden`)

export class JenisRespondenController {
  constructor(private readonly jenisRespondenService: JenisRespondenService) { }

  @Post()
  @ApiBody({ type: CreateJenisRespondenDto })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth(`access-token`)
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createJenisRespondenDto: CreateJenisRespondenDto) {
    return this.jenisRespondenService.create(createJenisRespondenDto);
  }

  @Get()
  findAll() {
    return this.jenisRespondenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jenisRespondenService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: CreateJenisRespondenDto })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth(`access-token`)
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateJenisRespondenDto: UpdateJenisRespondenDto) {
    return this.jenisRespondenService.update(id, updateJenisRespondenDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth(`access-token`)
  @Roles(`ADMIN`)
  remove(@Param('id') id: string) {
    return this.jenisRespondenService.remove(id);
  }
}
