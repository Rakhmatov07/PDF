import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register({ email, password }: CreateAuthDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if(user) throw new ConflictException('Email already exists');

      const hashedPass = await argon.hash(password);
      const newUser = await this.prisma.user.create({ data: { email, password: hashedPass } });
      return this.generateToken(newUser.id); 
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async login({ email, password }: CreateAuthDto){
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if(!user) throw new UnauthorizedException('Invalid Email or Password');

      const isPasswordValid = await argon.verify(user.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Email or Password');
      }
            
      return this.generateToken(user.id);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async findOne(userId: number) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  private generateToken(userId: number) {
    return {
      message: 'Success',
      success: true,
      accessToken: this.jwtService.sign({ userId }),
    };
  }
}
