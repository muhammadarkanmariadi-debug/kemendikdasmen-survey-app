import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePetugasDto } from './dto/create-petugas.dto';
import { UpdatePetugasDto } from './dto/update-petugas.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { QueryPetugasDto } from './dto/query-admin.dto';
import { SignaturePetugasDto } from './dto/signature-petugas.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class PetugasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService,
    private readonly bcrypt: BcryptService
  ) { }
  async create(createPetugasDto: CreatePetugasDto) {
    try {
      const { username, nama_user, password } = createPetugasDto
      const findPetugas = await this.prisma.users.findFirst({ where: { username } })
      if (findPetugas) {
        return {
          success: false,
          message: `Petugas has already exists`,
          data: null
        }
      }

      const createPetugas = await this.prisma.users.create({
        data: {
          uuid: this.uuid.generateUUID(),
          nama_user, username,
          role: "PETUGAS",
          password: await this.bcrypt.hashPassword(password)
        }
      })

      return {
        success: true,
        message: `New Petugas has created`,
        data: createPetugas
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
    // return 'This action adds a new petugas';
  }

  async findAll(query: QueryPetugasDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();

      const whereCondition: any = {
        role: `PETUGAS` as const,
        ...(search ? {
          OR: [
            { nama_user: { contains: search } },
            { username: { contains: search } }
          ]
        } : {})
      };

      const findPetugas = await this.prisma.users.findMany({
        where: whereCondition,
        take, skip,
        orderBy: { createdAt: 'desc' }
      })

      const countsData = await this.prisma.users.count({
        where: whereCondition,
      })

      return {
        success: true,
        message: `Petugas has retrieved`,
        data: findPetugas,
        meta: {
          page: page ?? 1,
          quantity: quantity ?? countsData,
          totalData: countsData
        }
      }
    } catch (error) {
      console.error('Error in petugas.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
    // return `This action returns all petugas`;
  }

  async findOne(id: string) {
    try {
      const findPetugas = await this.prisma.users.findFirst({ where: { uuid: id } })
      if (!findPetugas) {
        return {
          success: false,
          message: `Petugas does not exists`,
          data: null
        }
      }
      return {
        success: true,
        message: `Petugas has retrieved`,
        data: findPetugas
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
    // return `This action returns a #${id} petugas`;
  }

  async update(id: string, updatePetugasDto: UpdatePetugasDto) {
    try {
      const { username, nama_user, password } = updatePetugasDto
      const findUser = await this.prisma.users.findFirst({ where: { uuid: id } })
      if (!findUser) {
        return {
          success: false,
          message: `Petugas does not exists`,
          data: null
        }
      }

      const updateUser = await this.prisma.users.update({
        where: { uuid: id },
        data: {
          nama_user: nama_user ?? findUser.nama_user,
          username: username ?? findUser.username,
          role: "PETUGAS",
          password: password ? await this.bcrypt.hashPassword(password) : findUser.password
        }
      })

      return {
        success: true,
        message: `New Petugas has updated`,
        data: updateUser
      }


    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
    // return `This action updates a #${id} petugas`;
  }

  async saveSignature(SignaturePetugasDto: SignaturePetugasDto, id_user: string) {
    try {
      const findUser = await this.prisma.users.findFirst({ where: { uuid: id_user } })
      if (!findUser) {
        return {
          success: false,
          message: `Petugas not exists`,
          data: null
        }
      }
      const { top, width, left, ttd } = SignaturePetugasDto;

      const findSignature = await this.prisma.tanda_tangan_petugas.findFirst({ where: { id_user: findUser.uuid } })
      let saveSignature
      if (findSignature) {
        saveSignature = await this.prisma.tanda_tangan_petugas.update({
          data: {
            ttd, top: Number(top), width: Number(width), left: Number(left), nama_petugas: findUser.nama_user
          },
          where: { uuid: findUser.uuid }
        })
      } else {
        saveSignature = await this.prisma.tanda_tangan_petugas.create({
          data: {
            uuid: this.uuid.generateUUID(),
            id_user,
            ttd, top: Number(top), width: Number(width), left: Number(left), nama_petugas: findUser.nama_user
          }
        })
      }
      return {
        success: true,
        message: 'tandatangan created',
        data: saveSignature
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
    // return `This action returns a #${id} petugas`;
  }

  async remove(id: string) {
    try {
      const findUser = await this.prisma.users.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findUser) {
        return {
          success: false,
          message: `User does not exists`,
          data: null
        }
      }

      const deletedUser = await this.prisma.users.delete({
        where: {
          uuid: id
        }
      })
      return {
        success: true,
        message: `User has deleted`,
        data: deletedUser
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
