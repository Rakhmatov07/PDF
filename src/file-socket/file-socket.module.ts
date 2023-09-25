import { Module } from '@nestjs/common';
import { FileSocketService } from './file-socket.service';
import { FileSocketGateway } from './file-socket.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [FileSocketGateway, FileSocketService],
  imports: [PrismaModule]
})
export class FileSocketModule {}
