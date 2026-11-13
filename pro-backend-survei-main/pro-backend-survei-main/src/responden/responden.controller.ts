import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Put } from '@nestjs/common';
import { RespondenService } from './responden.service';
import { CreateRespondenDto } from './dto/create-responden.dto';
import { UpdateRespondenDto } from './dto/update-responden.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { BasicGuard } from 'src/helper/basic-auth';
import FormatValidation from 'src/helper/validation-format';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/helper/roles-guard';
import { QueryRespondenDto } from './dto/query-responden.dto';

@ApiTags('responden')
@Controller('responden')
export class RespondenController {
  constructor(private readonly respondenService: RespondenService) {}

  @Post()
  @ApiBody({ type: CreateRespondenDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createRespondenDto: CreateRespondenDto) {
    return this.respondenService.create(createRespondenDto);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryRespondenDto) {
    return this.respondenService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  findOne(@Param('id') id: string) {
    return this.respondenService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateRespondenDto: UpdateRespondenDto) {
    return this.respondenService.update(id, updateRespondenDto);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  remove(@Param('id') id: string) {
    return this.respondenService.remove(id);
  }
}
