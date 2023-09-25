import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

export const jwtSecret = process.env.JWT_SECRET;

@Module({
  imports: [PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '24h' },
      global: true
    })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
