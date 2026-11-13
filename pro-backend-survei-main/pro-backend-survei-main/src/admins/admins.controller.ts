import { Controller, Get, Post, Body, Param, Delete, UseGuards, UsePipes, ValidationPipe, Put, Request, Query } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { BasicGuard } from 'src/helper/basic-auth';
import FormatValidation from 'src/helper/validation-format';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/helper/roles-guard';
import { QueryAdminDto } from './dto/query-admin.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags(`admins`)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) { }

  @Post()
  @ApiBody({ type: CreateAdminDto })
  @ApiBasicAuth()
  @UseGuards(BasicGuard)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QueryAdminDto) {
    return this.adminsService.findAll(query);
  }

  @Get('me')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  findMe(@Request() req) {
    const id = req.user.uuid
    return this.adminsService.findOne(id);
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Put('me')
  @ApiBody({ type: UpdateAdminDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  updateMe(@Body() updateAdminDto: UpdateAdminDto, @Request() req) {
    const id = req.user.uuid
    return this.adminsService.update(id, updateAdminDto);
  }

  @Put(':id')
  @ApiBody({ type: UpdateAdminDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
