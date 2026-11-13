import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { BasicGuard } from 'src/helper/basic-auth';
import { ApiBasicAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import FormatValidation from 'src/helper/validation-format';
import { AuthGuard } from '@nestjs/passport';

@ApiTags(`auth`)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  @UseGuards(BasicGuard)
  @ApiBasicAuth()
  @ApiBody({ type: AuthDto })
  @UsePipes(new ValidationPipe({ exceptionFactory: FormatValidation }))
  auth(@Body() authDto: AuthDto) {
    return this.authService.auth(authDto);
  }

  @Post('logout')
  logout() {
    return {
      success: true,
      message: 'Logout berhasil. Hapus token di sisi klien.'
    };
  }

}
