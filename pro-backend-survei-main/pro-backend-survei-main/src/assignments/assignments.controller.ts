import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import FormatValidation from 'src/helper/validation-format';
import { RoleGuard, Roles } from 'src/helper/roles-guard';

@Controller('assignments')
@ApiTags(`assignments`)
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth(`access-token`)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) { }

  @Post()
  @ApiBody({ type: CreateAssignmentDto })
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  findAll(@Query() queryData: QueryAssignmentDto) {
    return this.assignmentsService.findAll(queryData);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentsService.update(+id, updateAssignmentDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}
