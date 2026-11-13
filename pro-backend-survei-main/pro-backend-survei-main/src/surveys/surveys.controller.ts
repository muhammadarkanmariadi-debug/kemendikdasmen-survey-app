import { Controller, Get, Post, Body, Param, Delete, Request, UsePipes, ValidationPipe, UseGuards, Query, Put, Res } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/helper/roles-guard';
import { AuthGuard } from '@nestjs/passport';
import FormatValidation from 'src/helper/validation-format';
import { QuerySurveyDto } from './dto/query-survey.dto';
import { QueryStatisticDto } from './dto/statistic-survey.dto';

@ApiTags(`surveys`)
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) { }

  @Post()
  @ApiBody({ type: CreateSurveyDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createSurveyDto: CreateSurveyDto, @Request() req) {
    return this.surveysService.create(createSurveyDto, req.user.uuid);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN', 'PETUGAS')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QuerySurveyDto) {
    return this.surveysService.findAll(query);
  }

  @Get('kategori')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN', 'PETUGAS')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findKategori() {
    return this.surveysService.findKategori();
  }

  @Get('statistics')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN', 'PETUGAS')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findStatistic(@Query() query: QueryStatisticDto) {
    const { id_survey, provinsi } = query;
    return this.surveysService.getSurveiResponden(id_survey, provinsi);
  }

  @Get('excel')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN', 'PETUGAS')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  downloadExcel(@Query() query: QueryStatisticDto, @Res() res) {
    const { id_survey } = query;
    return this.surveysService.downloadSurvey(id_survey, res);
  }

  @Get('public-list')
  findAllPublicSurveys() {
    return this.surveysService.findAllPublicSurveys();
  }

  @Get('public/:public_link')
  findPublicSurvey(@Param('public_link') public_link: string) {
    return this.surveysService.findPublicSurvey(public_link);
  }

  @Get('public/:public_link/assigned-institutions')
  getAssignedInstitutions(@Param('public_link') public_link: string) {
    return this.surveysService.getAssignedInstitutionsByPublicLink(public_link);
  }

  @Get(':id')
  // @ApiBearerAuth(`access-token`)
  // @UseGuards(AuthGuard('jwt'))
  // @Roles('ADMIN', 'PETUGAS')
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateSurveyDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto, @Request() req) {
    return this.surveysService.update(id, updateSurveyDto, req.user.uuid);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }
}
