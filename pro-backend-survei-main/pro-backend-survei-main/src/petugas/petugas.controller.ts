import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Put, Request } from '@nestjs/common';
import { PetugasService } from './petugas.service';
import { CreatePetugasDto } from './dto/create-petugas.dto';
import { UpdatePetugasDto } from './dto/update-petugas.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { BasicGuard } from 'src/helper/basic-auth';
import FormatValidation from 'src/helper/validation-format';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/helper/roles-guard';
import { QueryPetugasDto } from './dto/query-admin.dto';
import { SignaturePetugasDto } from './dto/signature-petugas.dto';

@ApiTags('petugas')
@Controller('petugas')
export class PetugasController {
  constructor(private readonly petugasService: PetugasService) {}

  @Post()
  @ApiBody({ type: CreatePetugasDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createPetugasDto: CreatePetugasDto) {
    return this.petugasService.create(createPetugasDto);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryPetugasDto) {
    return this.petugasService.findAll(query);
  }

  @Get('me')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  findMe(@Request() req) {
    const id = req.user.uuid
    return this.petugasService.findOne(id);
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  findOne(@Param('id') id: string) {
    return this.petugasService.findOne(id);
  }

  @Put('me')
  @ApiBody({ type: UpdatePetugasDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  updateMe(@Body() updatePetugasDto: UpdatePetugasDto, @Request() req) {
    const id = req.user.uuid
    return this.petugasService.update(id, updatePetugasDto);
  }

  @Put(':id')
  @ApiBody({ type: UpdatePetugasDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updatePetugasDto: UpdatePetugasDto) {
    return this.petugasService.update(id, updatePetugasDto);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  remove(@Param('id') id: string) {
    return this.petugasService.remove(id);
  }
    
  @Post('signature')
  @ApiBody({ type: SignaturePetugasDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`, `PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  createSignature(@Body() signaturePetugasDto: SignaturePetugasDto, @Request() req) {
    return this.petugasService.saveSignature(signaturePetugasDto, req.user.uuid);
  }
}
