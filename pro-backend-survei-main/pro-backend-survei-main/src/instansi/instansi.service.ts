import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInstansiDto } from './dto/create-instansi.dto';
import { UpdateInstansiDto } from './dto/update-instansi.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { QueryInstansiDto } from './dto/query-instansi.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class InstansiService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uuid: UuidService,
    private readonly bcrypt: BcryptService,
  ) { }

  async create(createInstansiDto: CreateInstansiDto) {
    try {
      const { alamat, kota, provinsi, nama_instansi, tipe, kode_instansi, password, id_jenis_responden } = createInstansiDto
      const uuid = this.uuid.generateUUID();

      const saveUser = await this.prismaService.users.create({
        data: {
          uuid,
          username: kode_instansi,
          password: await this.bcrypt.hashPassword(password),
          role: tipe,
          nama_user: nama_instansi,
        }
      })

      const saveInstansi = await this.prismaService.instansi.create({
        data: {
          uuid,
          nama_instansi,
          kode_instansi,
          alamat,
          kota,
          provinsi,
          tipe,
          user_id: saveUser.uuid,
          id_jenis_responden
        }
      })
      return {
        success: true,
        message: 'Instansi created successfully',
        data: saveInstansi,
      };
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong: ${error.message}`);
    }
  }

  async findAll(queryData: QueryInstansiDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(queryData);
      const search = queryData.search?.trim();

      const whereCondition: any = search ? {
        OR: [
          { nama_instansi: { contains: search } },
          { kode_instansi: { contains: search } },
          { alamat: { contains: search } },
          { kota: { contains: search } },
          { provinsi: { contains: search } },
        ]
      } : {};

      const counts = await this.prismaService.instansi.count({
        where: whereCondition
      })

      const findInstansi = await this.prismaService.instansi.findMany({
        skip, take,
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              responden_sekolah: true,
              assignments: true,
            },
          },
        },
      })

      return {
        success: true,
        message: 'Instansi found successfully',
        data: findInstansi,
        meta: {
          page: page ?? 1,
          quantity: quantity ?? counts,
          totalData: counts
        }
      }
    } catch (error) {
      console.error('Error in instansi.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const findInstansi = await this.prismaService.users.findUnique({
        where: {
          uuid: id,
        },
        include: {
          instansi: true,
        }
      });
      if (!findInstansi) {
        return {
          success: false,
          message: 'Instansi not found',
          data: null
        }
      }

      return {
        success: true,
        message: 'Instansi fount',
        data: findInstansi
      }
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong: ${error.message}`);

    }
  }

  async update(id: string, updateInstansiDto: UpdateInstansiDto) {
    try {
      const findInstansi = await this.prismaService.instansi.findUnique({
        where: {
          uuid: id,
        },
        include: {
          user: true,
        }
      });
      if (!findInstansi) {
        return {
          success: false,
          message: 'Instansi not found',
          data: null
        }
      }

      const { nama_instansi, tipe, alamat, kota, provinsi, kode_instansi, password, id_jenis_responden } = updateInstansiDto;

      const updateUser = await this.prismaService.users.update({
        where: {
          uuid: findInstansi.user_id,
        },
        data: {
          nama_user: nama_instansi ?? findInstansi.nama_instansi,
          username: kode_instansi ?? findInstansi.kode_instansi,
          role: tipe,
          password: password ? await this.bcrypt.hashPassword(password) : findInstansi.user?.password,
        }
      });

      const updateInstansi = await this.prismaService.instansi.update({
        where: {
          uuid: id,
        },
        data: {
          nama_instansi: nama_instansi ?? findInstansi.nama_instansi,
          tipe: tipe ?? findInstansi.tipe,
          alamat: alamat ?? findInstansi.alamat,
          kota: kota ?? findInstansi.kota,
          provinsi: provinsi ?? findInstansi.provinsi,
          kode_instansi: kode_instansi ?? findInstansi.kode_instansi,
          id_jenis_responden: id_jenis_responden ?? findInstansi.id_jenis_responden,
        }
      });

      return {
        success: true,
        message: 'Instansi updated successfully',
        data: updateInstansi,
      };
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const findInstansi = await this.prismaService.instansi.findUnique({
        where: {
          uuid: id,
        },
        include: {
          user: true,
        }
      });
      if (!findInstansi) {
        return {
          success: false,
          message: 'Instansi not found',
          data: null
        }
      }
      const dropInstansi = await this.prismaService.instansi.delete({
        where: {
          uuid: id,
        }
      });

      const dropUser = await this.prismaService.users.delete({
        where: {
          uuid: findInstansi.user_id,
        }
      });
      return {
        success: true,
        message: 'Instansi deleted successfully',
        data: dropInstansi,
      }
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong: ${error.message}`);
    }
  }

  async getRespondenSekolah(id_instansi: string) {
    try {
      const respondents = await this.prismaService.responden_sekolah.findMany({
        where: { id_instansi },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { hasil_survey: true },
          },
        },
      });

      return {
        success: true,
        message: 'Daftar sub-responden berhasil diambil',
        data: respondents,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Something were wrong: ${error.message}`);
    }
  }
}
