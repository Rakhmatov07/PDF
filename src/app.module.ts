import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FileSocketModule } from './file-socket/file-socket.module';

@Module({
  imports: [AuthModule, PrismaModule, FileSocketModule],
})
export class AppModule {}
