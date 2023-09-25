import { Injectable } from '@nestjs/common';
import { CreateFileSocketDto } from './dto/create-file-socket.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PDFDocument } from 'pdf-lib';
import { promises as fsPromises } from 'fs';
import { IRequest } from 'src/auth/user.type';

@Injectable()
export class FileSocketService {
  constructor(private prisma: PrismaService) {}

  async mergePdfFiles(pdfPaths: string[], outputFilePath: string, bodyDto: CreateFileSocketDto, req: IRequest): Promise<any> {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfPath of pdfPaths) {
        const pdfBytes = await fsPromises.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
  
      const original_name = outputFilePath.split('/')[2];
      const mergedPdfBytes = await mergedPdf.save();
  
      await fsPromises.writeFile(outputFilePath, mergedPdfBytes);
      const stats = await fsPromises.stat(outputFilePath);
      const size = stats.size;
      const pageCount = mergedPdf.getPageCount();
      const pdfDetails = { original_name, file_size: `${(size/1024).toFixed(2)} KB`, page_count: pageCount, input_name: bodyDto.file_name };
  
      await this.prisma.file.create({ data: { ...pdfDetails, userId: req.id } })
  
      return { message: 'Success', pdfDetails }
    } catch (error) {
      return error;
    }
  }
}
