import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRespondenDto } from './dto/create-responden.dto';
import { UpdateRespondenDto } from './dto/update-responden.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { QueryRespondenDto } from './dto/query-responden.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class RespondenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService
  ) { }
  async create(createRespondenDto: CreateRespondenDto) {
    try {
      const { jenis_responden, nama, alamat, provinsi, kab_kota } = createRespondenDto;
      const findUser = await this.prisma.responden.findFirst({ where: { nama } })
      if (findUser) {
        return {
          success: false,
          message: `Responden has already exists`,
          data: null
        }
      }

      const createResponden = await this.prisma.responden.create({
        data: {
          uuid: this.uuid.generateUUID(),
          jenis_responden, nama, alamat, provinsi, kab_kota
        }
      })

      return {
        success: true,
        message: `New Responden has created`,
        data: createResponden
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findAll(query: QueryRespondenDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();

      const whereCondition: any = {
        jenis_responden: {
          not: 'PUBLIC' // Exclude public respondents
        },
        ...(search ? {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { provinsi: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const findResponden = await this.prisma.responden.findMany({
        where: whereCondition,
        take,
        skip,
        orderBy: { createdAt: 'desc' }
      });

      const countsData = await this.prisma.responden.count({
        where: whereCondition,
      });

      return {
        success: true,
        message: `Responden has retrieved`,
        data: findResponden,
        meta: {
          page: page ?? 1,
          quantity: quantity ?? countsData,
          totalData: countsData
        }
      }
    } catch (error) {
      console.error('Error in responden.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const findResponden = await this.prisma.responden.findFirst({ where: { uuid: id } })
      if (!findResponden) {
        return {
          success: false,
          message: `Responden does not exists`,
          data: null
        }
      }
      return {
        success: true,
        message: `Responden has retrieved`,
        data: findResponden
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
    // return `This action returns a #${id} responden`;
  }

  async update(id: string, updateRespondenDto: UpdateRespondenDto) {
    try {
      const { jenis_responden, nama, alamat, provinsi, kab_kota } = updateRespondenDto
      const findResponden = await this.prisma.responden.findFirst({ where: { uuid: id } })
      if (!findResponden) {
        return {
          success: false,
          message: `Responden does not exists`,
          data: null
        }
      }

      const updateResponden = await this.prisma.responden.update({
        where: { uuid: id },
        data: {
          jenis_responden: jenis_responden ?? findResponden.jenis_responden,
          nama: nama ?? findResponden.nama,
          alamat: alamat ?? findResponden.alamat,
          provinsi: provinsi ?? findResponden.provinsi,
          kab_kota: kab_kota ?? findResponden.kab_kota
        }
      })

      return {
        success: true,
        message: `Responden has updated`,
        data: updateResponden
      }

    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async remove(id: string) {
    try {
      const findResponden = await this.prisma.responden.findFirst({ where: { uuid: id } })
      if (!findResponden) {
        return {
          success: false,
          message: `Responden does not exists`,
          data: null
        }
      }

      const deletedResponden = await this.prisma.responden.delete({ where: { uuid: id } })
      return {
        success: true,
        message: `Responden has deleted`,
        data: deletedResponden
      }
    } catch (error) {

    }
  }
}
