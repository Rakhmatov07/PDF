import { Module } from '@nestjs/common';
import { FileSocketService } from './file-socket.service';
import { FileSocketGateway } from './file-socket.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Module({
  providers: [FileSocketGateway, FileSocketService],
  imports: [PrismaModule,
    MulterModule.register(
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (_, pdf, cb) => {
            const randomName = uuid();
            
            cb(null, `${randomName}${extname(pdf.originalname)}`);
          },
        }),
      } 
    )
  ]
})
export class FileSocketModule {}
