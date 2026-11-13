import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { UuidService } from 'src/uuid/uuid.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService, UuidService],
  imports: [PrismaModule]
})
export class AssignmentsModule { }
