import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { KategoriBySurveyDto, QueryKategoriDto } from './dto/query-kategori.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class KategoriService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService
  ) { }
  async create(createKategoriDto: CreateKategoriDto) {
    try {
      const { id_survey, nama_kategori } = createKategoriDto;
      const createKategori = await this.prisma.kategori.create({
        data: {
          uuid: this.uuid.generateUUID(),
          id_survey: id_survey,
          nama_kategori: nama_kategori
        }
      })

      return {
        success: true,
        message: 'Category created successfully',
        data: createKategori
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findAll(query: QueryKategoriDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();

      const whereCondition: any = search ? {
        OR: [
          { nama_kategori: { contains: search } },
        ]
      } : {};

      const findKategori = await this.prisma.kategori.findMany({
        where: whereCondition,
        take, skip
      })

      const totalKategori = await this.prisma.kategori.count({
        where: whereCondition
      })

      return {
        success: true,
        message: 'Categories found successfully',
        data: findKategori,
        meta: {
          page: page ?? 1,
          quantity: quantity ?? totalKategori,
          totalData: totalKategori
        }
      }
    } catch (error) {
      console.error('Error in kategori.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findBySurvey(query: KategoriBySurveyDto) {
    try {
      const { id_survey } = query;
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();

      const whereCondition: any = {
        id_survey: id_survey,
        ...(search ? {
          OR: [
            { nama_kategori: { contains: search } },
          ]
        } : {})
      };

      const findKategori = await this.prisma.kategori.findMany({
        where: whereCondition,
        orderBy: { order_index: 'asc' },
        take, skip
      })

      const totalKategori = await this.prisma.kategori.count({
        where: whereCondition
      })

      return {
        success: true,
        message: 'Categories found successfully',
        data: findKategori,
        meta: {
          page: page ?? 1,
          quantity: quantity ?? totalKategori,
          totalData: totalKategori
        }
      }
    } catch (error) {
      console.error('Error in kategori.findBySurvey:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async reorder(reorderDto: { id_survey: string; items: { uuid: string; order_index: number }[] }) {
    try {
      const { items } = reorderDto;
      const updates = items.map((item) =>
        this.prisma.kategori.update({
          where: { uuid: item.uuid },
          data: { order_index: item.order_index },
        }),
      );
      await this.prisma.$transaction(updates);
      return {
        success: true,
        message: 'Categories reordered successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to reorder categories: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const findKategori = await this.prisma.kategori.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findKategori) {
        return {
          success: false,
          message: 'Category does not exists',
          data: null
        }
      }
      return {
        success: true,
        message: 'Category found successfully',
        data: findKategori
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async update(id: string, updateKategoriDto: UpdateKategoriDto) {
    try {
      const { nama_kategori, id_survey } = updateKategoriDto
      const findKategori = await this.prisma.kategori.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findKategori) {
        return {
          success: false,
          message: 'Category does not exists',
          data: null
        }
      }
      const updateKategori = await this.prisma.kategori.update({
        where: {
          uuid: id
        },
        data: {
          nama_kategori: nama_kategori ?? findKategori.nama_kategori,
          id_survey: id_survey ?? findKategori.id_survey
        }
      })

      return {
        success: true,
        message: 'Category updated successfully',
        data: updateKategori
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const findKategori = await this.prisma.kategori.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findKategori) {
        return {
          success: false,
          message: 'Category does not exists',
          data: null
        }
      }

      const isAnswered = await this.prisma.hasil_survey.findFirst({
        where: {
          id_survey: findKategori.id_survey,
        },
      })
      if (isAnswered) {
        return {
          success: false,
          message: `Survey has been answered, cannot be deleted`,
          data: null
        }
      }

      // Get instrument
      const pertanyaanList = await this.prisma.pertanyaan.findMany({
        where: { 
          id_survey: findKategori.id_survey,
          id_kategori: findKategori.uuid
        },
        select: { uuid: true, jenis: true },
      });

      // Delete option
      const pertanyaanIds = pertanyaanList.map(p => p.uuid);
      const pilihanIds = pertanyaanList
        .filter(p => p.jenis !== 'ISIAN')
        .map(p => p.uuid);

      if (pilihanIds.length > 0) {
        await this.prisma.opsi_pertanyaan.deleteMany({
          where: {
            id_pertanyaan: { in: pilihanIds },
          },
        });
      }

      // Delete instrument
      if (pertanyaanIds.length > 0) {
        await this.prisma.pertanyaan.deleteMany({
          where: {
            uuid: { in: pertanyaanIds },
          },
        });
      }

      const deletedKategori = await this.prisma.kategori.delete({
        where: { uuid: id },
      })

      return {
        success: true,
        message: 'Kategori deleted successfully',
        data: deletedKategori
      }

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
