import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateJenisRespondenDto } from './dto/create-jenis-responden.dto';
import { UpdateJenisRespondenDto } from './dto/update-jenis-responden.dto';
import { UuidService } from 'src/uuid/uuid.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JenisRespondenService {
  constructor(
    private readonly uuid: UuidService,
    private readonly prisma: PrismaService,
  ) { }
  async create(createJenisRespondenDto: CreateJenisRespondenDto) {
    try {
      const { jenis, tipe, is_public } = createJenisRespondenDto
      const saveJenisResponden = await this.prisma.jenis_responden.create({
        data: {
          uuid: this.uuid.generateUUID(),
          jenis,
          tipe,
          is_public,
        },
      })
      return {
        success: true,
        message: 'Jenis Responden berhasil dibuat',
        data: saveJenisResponden,
      }
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findAll() {
    try {
      const allJenisResponden = await this.prisma.jenis_responden.findMany()
      return {
        success: true,
        message: 'Jenis Responden berhasil ditemukan',
        data: allJenisResponden,
      }
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findOne(id: string) {
    try {
      const findJenisResponden = await this.prisma.jenis_responden.findFirst({
        where: {
          uuid: id,
        },
      })
      if (!findJenisResponden) {
        return {
          success: false,
          message: 'Jenis Responden tidak ditemukan',
          data: null
        }
      }
      return {
        success: true,
        message: 'Jenis Responden berhasil ditemukan',
        data: findJenisResponden,
      }

    } catch (error) {
      return new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async update(id: string, updateJenisRespondenDto: UpdateJenisRespondenDto) {
    try {
      const findJenisResponden = await this.prisma.jenis_responden.findFirst({
        where: {
          uuid: id,
        },
      })
      if (!findJenisResponden) {
        return {
          success: false,
          message: 'Jenis Responden tidak ditemukan',
          data: null
        }
      }

      const { jenis, tipe, is_public } = updateJenisRespondenDto
      const updatedJenisResponden = await this.prisma.jenis_responden.update({
        where: {
          uuid: id,
        },
        data: {
          jenis: jenis ?? findJenisResponden.jenis,
          tipe: tipe ?? findJenisResponden.tipe,
          is_public: is_public ?? findJenisResponden.is_public,
        },
      })
      return {
        success: true,
        message: 'Jenis Responden berhasil diubah',
        data: updatedJenisResponden,
      }

    } catch (error) {
      return new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async remove(id: string) {
    try {
      const findJenisResponden = await this.prisma.jenis_responden.findFirst({
        where: {
          uuid: id,
        },
      })
      if (!findJenisResponden) {
        return {
          success: false,
          message: 'Jenis Responden tidak ditemukan',
          data: null
        }
      }

      const dropJenisResponden = await this.prisma.jenis_responden.delete({
        where: {
          uuid: id,
        },
      })
      return {
        success: true,
        message: 'Jenis Responden berhasil dihapus',
        data: dropJenisResponden,
      }
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }
}
