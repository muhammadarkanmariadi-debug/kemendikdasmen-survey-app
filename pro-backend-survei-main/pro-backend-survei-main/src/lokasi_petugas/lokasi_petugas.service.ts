import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLokasiPetugasDto } from './dto/create-lokasi_petugas.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { QueryDropLokasiPetugasDto, QueryLokasiPetugasDto } from './dto/query-lokasi_petugas.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class LokasiPetugasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService
  ) { }
  async create(createLokasiPetugasDto: CreateLokasiPetugasDto) {
    try {
      const { id_survey, id_petugas, responden } = createLokasiPetugasDto
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id_survey,
        }
      })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survey does not exists`,
          data: null
        }
      }
      const nama_survey = findSurvey.nama_survey

      const getPetugas = await this.prisma.users.findFirst({
        where: {
          uuid: id_petugas,
        }
      })
      if (!getPetugas) {
        return {
          success: false,
          message: `Petugas does not exists`,
          data: null
        }
      }
      const nama_petugas = getPetugas.nama_user

      const findResponden = await this.prisma.responden.findMany({
        where: {
          uuid: {
            in: responden.map(item => item.id_responden),
          }
        },
        select: {
          uuid: true,
          nama: true,
        }
      });

      if (findResponden.length !== responden.length) {
        return {
          success: false,
          message: `Some Responden does not exists`,
          data: null
        }
      }

      const data = responden.map((item) => ({
        uuid: this.uuid.generateUUID(),
        id_survey,
        nama_survey,
        id_petugas,
        nama_petugas,
        id_responden: item.id_responden,
        nama_responden: findResponden.find(res => res.uuid === item.id_responden)?.nama || '',
      }));

      const lokasiPetugas = await this.prisma.lokasi_petugas.createMany({
        data,
        skipDuplicates: true,
      });
      return {
        success: true,
        message: 'Lokasi Petugas has created',
        data: lokasiPetugas
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findAll(query: QueryLokasiPetugasDto) {
    try {
      const { id } = query;
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();

      const whereCondition: any = {
        id_survey: id,
        ...(search ? {
          OR: [
            { nama_petugas: { contains: search, mode: 'insensitive' } },
            { nama_responden: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const rawData = await this.prisma.lokasi_petugas.findMany({
        where: whereCondition,
        orderBy: {
          nama_petugas: 'asc',
        },
        take, skip
      })

      const groupedMap = new Map();

      for (const item of rawData) {
        const key = `${item.id_survey}_${item.id_petugas}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id_survey: item.id_survey,
            nama_survey: item.nama_survey,
            id_petugas: item.id_petugas,
            nama_petugas: item.nama_petugas,
            responden: [],
          });
        }

        groupedMap.get(key).responden.push({
          id_responden: item.id_responden,
          nama_responden: item.nama_responden,
        });
      }

      const grouped = Array.from(groupedMap.values());

      const countsData = await this.prisma.lokasi_petugas.count({
        where: {
          id_survey: id,
          OR: [
            { nama_petugas: { contains: search || "", mode: 'insensitive' } },
            { nama_responden: { contains: search || "", mode: 'insensitive' } }
          ]
        }
      })

      return {
        success: true,
        message: `Lokasi Petugas has retrieved`,
        data: grouped,
        meta: {
          page, quantity, totalData: countsData
        }
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findOne(id: string) {
    try {
      const findLokasiPetugas = await this.prisma.lokasi_petugas.findFirst({
        where: {
          uuid: id,
        }
      })
      if (!findLokasiPetugas) {
        return {
          success: false,
          message: `Lokasi Petugas does not exists`,
          data: null
        }
      }

      return {
        success: true,
        message: `Lokasi Petugas has retrieved`,
        data: findLokasiPetugas
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findResponden(id_petugas: string) {
    try {

      const rawData = await this.prisma.lokasi_petugas.findMany({
        where: {
          id_petugas
        },
        include: {
          survey: true
        }
      })

      const groupedMap = new Map();

      for (const item of rawData) {
        const key = `${item.id_survey}_${item.id_petugas}`;
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id_survey: item.id_survey,
            nama_survey: item.nama_survey,
            id_petugas: item.id_petugas,
            nama_petugas: item.nama_petugas,
            responden: [],
          });
        }

        groupedMap.get(key).responden.push({
          id_responden: item.id_responden,
          nama_responden: item.nama_responden,
          jenis_responden: item.survey?.jenis_responden
        });
      }

      const grouped = Array.from(groupedMap.values());

      const countsData = await this.prisma.lokasi_petugas.count({
        where: {
          id_petugas
        }
      })

      return {
        success: true,
        message: `Pilihan Responden has retrieved`,
        data: grouped,
        meta: {
          totalData: countsData
        }
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async remove(queryData: QueryDropLokasiPetugasDto) {
    try {
      const { id_petugas, id_responden, id_survey } = queryData
      const findLokasiPetugas = await this.prisma.lokasi_petugas.findFirst({
        where: {
          id_survey, id_responden, id_petugas
        }
      })
      if (!findLokasiPetugas) {
        return {
          success: false,
          message: `Lokasi Petugas does not exists`,
          data: null
        }
      }

      const deletedLokasiPetugas = await this.prisma.lokasi_petugas.deleteMany({
        where: {
          id_survey, id_responden, id_petugas
        }
      })

      return {
        success: true,
        message: `Lokasi Petugas has retrieved`,
        data: deletedLokasiPetugas
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }
}
