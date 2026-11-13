import { Controller, Get, Post, Patch, Body, Param, Delete, UsePipes, ValidationPipe, UseGuards, Query, Put } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/helper/roles-guard';
import FormatValidation from 'src/helper/validation-format';
import { QueryInstrumentDto } from './dto/query-instrument.dto';

@ApiTags(`instruments`)
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) { }

  @Patch('reorder')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  reorder(@Body() reorderDto: { id_survey: string; items: { uuid: string; order_index: number; id_kategori?: string }[] }) {
    return this.instrumentsService.reorder(reorderDto);
  }

  @Post()
  @ApiBody({ type: CreateInstrumentDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createInstrumentDto: CreateInstrumentDto) {
    return this.instrumentsService.create(createInstrumentDto);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryInstrumentDto) {
    return this.instrumentsService.findAll(query);
  }

  @Get('all')
  // @ApiBearerAuth(`access-token`)
  // @UseGuards(AuthGuard('jwt'))
  // @Roles('ADMIN', 'PETUGAS')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  async showAllInstruments(@Query('id_survey') id_survey: string) {
    return this.instrumentsService.showAllInstruments(id_survey);
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.instrumentsService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateInstrumentDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateInstrumentDto: UpdateInstrumentDto) {
    return this.instrumentsService.update(id, updateInstrumentDto);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    
    return this.instrumentsService.remove(id);
  }
}
