import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { QueryAdminDto } from './dto/query-admin.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService,
    private readonly bcrypt: BcryptService
  ) { }
  async create(createAdminDto: CreateAdminDto) {
    try {
      const { username, nama_user, password } = createAdminDto
      const findUser = await this.prisma.users.findFirst({ where: { username } })
      if (findUser) {
        return {
          success: false,
          message: `User has already exists`,
          data: null
        }
      }

      const createUser = await this.prisma.users.create({
        data: {
          uuid: this.uuid.generateUUID(),
          nama_user, username,
          password: await this.bcrypt.hashPassword(password)
        }
      })

      return {
        success: true,
        message: `New User has created`,
        data: createUser
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findAll(query: QueryAdminDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(query);
      const search = query.search?.trim();

      const whereCondition: any = {
        role: `ADMIN` as const,
        ...(search ? {
          OR: [
            { nama_user: { contains: search } },
            { username: { contains: search } }
          ]
        } : {})
      };

      const findAdmin = await this.prisma.users.findMany({
        where: whereCondition,
        take, skip,
        orderBy: { createdAt: 'desc' }
      })

      const countsData = await this.prisma.users.count({
        where: whereCondition,
      })

      return {
        success: true,
        message: `Admin has retrieved`,
        data: findAdmin,
        meta: {
          page: page ?? 1,
          quantity: quantity ?? countsData,
          totalData: countsData
        }
      }
    } catch (error) {
      console.error('Error in admins.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const findUser = await this.prisma.users.findFirst({ where: { uuid: id } })
      if (!findUser) {
        return {
          success: false,
          message: `User does not exists`,
          data: null
        }
      }
      return {
        success: true,
        message: `User has retrieved`,
        data: findUser
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    try {
      const { username, nama_user, password } = updateAdminDto
      const findUser = await this.prisma.users.findFirst({ where: { uuid: id } })
      if (!findUser) {
        return {
          success: false,
          message: `User does not exists`,
          data: null
        }
      }

      const updateUser = await this.prisma.users.update({
        where: { uuid: id },
        data: {
          nama_user: nama_user ?? findUser.nama_user,
          username: username ?? findUser.username,
          password: password ? await this.bcrypt.hashPassword(password) : findUser.password
        }
      })

      return {
        success: true,
        message: `New User has updated`,
        data: updateUser
      }


    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
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

  async getDashboard() {
    try {
      const countAdmin = this.prisma.users.count({
        where: {
          role: `ADMIN`,
        }
      })
      const countPetugas = this.prisma.users.count({
        where: {
          role : `PETUGAS`
        }
      })
      const countResponden = this.prisma.responden.count({})
      const countSurvey = this.prisma.survey.count({
        where: {
          status: true
        }
      })

      return {
        success: true,
        message: `User has deleted`,
        data: {
          countAdmin: countAdmin,
          countPetugas: countPetugas,
          countResponden: countResponden,
          countSurvey: countSurvey
        }
      }

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
