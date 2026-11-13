import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcrypt: BcryptService,
    private readonly jwt: JwtService
  ) { }

  async auth(authDto: AuthDto) {
    try {
      const { username, password } = authDto
      const findUser = await this.prisma.users.findFirst({
        where: { username }
      })
      if (!findUser) {
        return {
          success: false,
          message: `Invalid username`,
          data: null
        }
      }

      const isMatchPassword = await this.bcrypt.comparePassword(password, findUser.password)
      if (!isMatchPassword) {
        return {
          success: false,
          message: `Invalid password`,
          data: null
        }
      }

      const token = this.jwt.sign(
        {
          uuid: findUser.uuid, role: findUser.role
        });

      return {
        success: true,
        message: 'Login successful',
        data: { token, role: findUser.role }
      }

    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }
}
