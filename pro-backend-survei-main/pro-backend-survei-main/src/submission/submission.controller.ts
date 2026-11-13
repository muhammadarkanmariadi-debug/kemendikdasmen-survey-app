import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UsePipes, ValidationPipe, Query, UseInterceptors, UploadedFiles, Put } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/helper/roles-guard';
import FormatValidation from 'src/helper/validation-format';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileUploadDocument, FileUploadDocumentation } from './upload.config';
import { SignatureRespondenDto } from './dto/signature-responden.dto';

@ApiTags(`submission`)
@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) { }

  @Post()
  @ApiBody({ type: CreateSubmissionDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
    // try {
    //   return {
    //     success: true,
    //     message: `hello world`,
    //     data: createSubmissionDto
    //   }
    // } catch (error) {
    //   console.log(error);
    //   return {
    //     success: false,
    //     message: `Something were wrong. ${error}`,
    //     data: null
    //   }
    // }
    return this.submissionService.create(createSubmissionDto, req.user.uuid);
  }

  @Post('public')
  @ApiBody({ type: CreateSubmissionDto })
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  createPublic(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
    return this.submissionService.createPublic(createSubmissionDto);
  }

  @Post("upload-documents/:id_hasil_survey")
  @UseInterceptors(AnyFilesInterceptor(FileUploadDocument))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload documentation and document files',
    schema: {
      type: 'object',
      properties: {
        documentation_files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        document_files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  createUploadDocuments(
    @Param("id_hasil_survey") id_hasil_survey: string,
    @UploadedFiles() document_files: Express.Multer.File[],
  ) {
    return this.submissionService.upload_documents(
      id_hasil_survey,
      document_files,
    );
  }

  @Delete('document/:id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  removeDocument(@Param('id') id: string) {
    return this.submissionService.remove_document(id);
  }

  @Post("upload-documentations/:id_hasil_survey")
  @UseInterceptors(AnyFilesInterceptor(FileUploadDocumentation))
  createUploadDocumentations(
    @Param("id_hasil_survey") id_hasil_survey: string,
    @UploadedFiles() document_files: Express.Multer.File[],
  ) {
    return this.submissionService.upload_documentations(
      id_hasil_survey,
      document_files,
    );
  }

  @Delete('documentation/:id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  removeDocumentation(@Param('id') id: string) {
    return this.submissionService.remove_documentation(id);
  }

  @Post("upload/:id_hasil_survey")
  @UseInterceptors(AnyFilesInterceptor(FileUploadDocumentation))
  @UseInterceptors(AnyFilesInterceptor(FileUploadDocument))
  createUpload(
    @Param("id_hasil_survey") id_hasil_survey: string,
    @UploadedFiles() documentation_files: Express.Multer.File[],
    @UploadedFiles() document_files: Express.Multer.File[],
  ) {
    return this.submissionService.create_upload(
      id_hasil_survey,
      documentation_files,
      document_files,
    );
  }

  @Post('signature')
  @ApiBody({ type: SignatureRespondenDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  createSignature(@Body() signatureRespondenDto: SignatureRespondenDto) {
    return this.submissionService.createSignature(signatureRespondenDto);
  }

  @Put(':id')
  @ApiBody({ type: UpdateSubmissionDto })
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto, @Request() req) {
    return this.submissionService.update(id, updateSubmissionDto, req.user.uuid);
  }

  @Get('avalaible')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findSubmissionAvailable(@Query() query: QuerySubmissionDto, @Request() req) {
    const id_petugas = req.user.uuid;
    return this.submissionService.findSubmissionAvailable(query, id_petugas);
  }

  @Get('instansi/avalaible')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findSubmissionInstansiAvailable(@Query() query: QuerySubmissionDto, @Request() req) {
    const id_instansi = req.user.uuid;
    return this.submissionService.findSubmissionInstansiAvailable(query, id_instansi);
  }

  @Get('public/available')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findSubmissionPublicAvailable(@Query() query: QuerySubmissionDto) {
    return this.submissionService.findSubmissionPublicAvailable(query);
  }

  @Get()
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() query: QuerySubmissionDto, @Request() req) {
    return this.submissionService.findAll(query, req.user.uuid);
  }

  @Get('all')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAllAdmin(@Query() query: QuerySubmissionDto) {
    return this.submissionService.findAllAdmin(query);
  }

  @Get('result')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findResult(@Query() query: QuerySubmissionDto) {
    return this.submissionService.findSubmissionResult(query);
  }

  @Get('result/count')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findResultCount() {
    return this.submissionService.findResultCount();
  }

  @Get(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`PETUGAS`)
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth(`access-token`)
  @UseGuards(AuthGuard('jwt'))
  @Roles(`ADMIN`)
  remove(@Param('id') id: string) {
    return this.submissionService.remove(id);
  }
}
