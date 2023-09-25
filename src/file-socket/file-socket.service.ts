import { Injectable } from '@nestjs/common';
import { CreateFileSocketDto } from './dto/create-file-socket.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

@Injectable()
export class FileSocketService {
  constructor(private prisma: PrismaService) {}

  async processUploadedFile(bodyDto: CreateFileSocketDto, pdf: Express.Multer.File) {
    try {
      const { originalname, size } = pdf;
      const buff = fs.readFileSync(pdf.path);
      
      const pdfDoc = await PDFDocument.load(buff);
      const pageCount = pdfDoc.getPageCount();  
      const pdfDetails = { original_name: originalname, file_size: `${(size/1024).toFixed(2)} KB`, page_count: pageCount, input_name: bodyDto.file_name };

      const file = this.prisma.file.create({ data: { ...pdfDetails, userId: 1 } });

      return { message: 'Success', file }
    } catch (error) {
      return error;
    }
  }
}
