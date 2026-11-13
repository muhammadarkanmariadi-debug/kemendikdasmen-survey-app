import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { QueryAssignmentDto } from './dto/query-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService
  ) { }
  async create(createAssignmentDto: CreateAssignmentDto) {
    try {
      const { id_petugas, id_survey, instansi } = createAssignmentDto
      const findPetugas = await this.prisma.users.findFirst({
        where: { uuid: id_petugas, role: 'PETUGAS' }
      })
      if (!findPetugas) {
        return {
          success: false,
          message: 'Petugas tidak ditemukan',
          data: null
        }
      }

      const findSurvey = await this.prisma.survey.findFirst({
        where: { uuid: id_survey }
      })
      if (!findSurvey) {
        return {
          success: false,
          message: 'Survey tidak ditemukan',
          data: null
        }
      }

      for (let i = 0; i < instansi.length; i++) {
        await this.prisma.assignments.create({
          data: {
            uuid: this.uuid.generateUUID(),
            id_survey: findSurvey.uuid,
            nama_survey: findSurvey.nama_survey,
            id_petugas: findPetugas.uuid,
            nama_petugas: findPetugas.nama_user,
            id_instansi: instansi[i].id_instansi,
            nama_instansi: instansi[i].nama_instansi
          }
        })
      }

      return {
        success: true,
        message: 'Penugasan berhasil dibuat',
        data: null
      }
    } catch (error) {
      return new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findAll(queryData: QueryAssignmentDto) {
    try {
      const { id_petugas } = queryData
      const findPetugas = await this.prisma.users.findFirst({
        where: { uuid: id_petugas, role: 'PETUGAS' }
      });
      if (!findPetugas) {
        return {
          success: false,
          message: 'Petugas tidak ditemukan',
          data: null
        };
      }
      const assignments = await this.prisma.assignments.findMany({
        where: { id_petugas: findPetugas.uuid },
      });

      const uniqueSurvey = [...new Set(assignments.map(a => a.id_survey))];
      const survey = await this.prisma.survey.findMany();

      const dataAssignment: {
        id_survey: string
        nama_survey: string
        instansi: { uuid: string; id_instansi: string; nama_instansi: string }[]
      }[] = []

      const allInstansi = await this.prisma.instansi.findMany()

      for (let i = 0; i < uniqueSurvey.length; i++) {
        const findSurvey = survey.find(s => s.uuid === uniqueSurvey[i]);
        const surveyAssignments = assignments.filter(a => a.id_survey === uniqueSurvey[i]);
        const instansi = surveyAssignments.map(a => {
          const findInstansi = allInstansi.find(i => i.uuid === a.id_instansi);
          return {
            uuid: a.uuid,
            id_instansi: a.id_instansi,
            nama_instansi: a.nama_instansi,
            tipe: findInstansi?.tipe,
            id_jenis_responden: findInstansi?.id_jenis_responden || "",
          }
        });
        dataAssignment.push({
          id_survey: findSurvey?.uuid || "",
          nama_survey: findSurvey?.nama_survey || "",
          instansi: instansi
        });
      }

      return {
        success: true,
        message: 'Berhasil mengambil data penugasan',
        data: dataAssignment
      };
    } catch (error) {
      return new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} assignment`;
  }

  update(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    return `This action updates a #${id} assignment`;
  }

  async remove(id: string) {
    try {
      const findAssignment = await this.prisma.assignments.findFirst({
        where: { uuid: id }
      });
      if (!findAssignment) {
        return {
          success: false,
          message: 'Penugasan tidak ditemukan',
          data: null
        };
      }

      const dropAssignment = await this.prisma.assignments.delete({
        where: { uuid: id }
      });

      return {
        success: true,
        message: 'Penugasan berhasil dihapus',
        data: dropAssignment
      };
    } catch (error) {
      return new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
