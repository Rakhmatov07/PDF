import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PDFDocument } from 'pdf-lib';
import { promises as fsPromises } from 'fs';
import { IRequest } from 'src/auth/user.type';

@Injectable()
export class FileSocketService {
  constructor(private prisma: PrismaService) {}

  async mergePdfFiles(pdfPaths: string[], outputFilePath: string, fileName: Object, req: IRequest): Promise<any> {
    try{
      if (pdfPaths.length === 0) {
        throw new Error('No PDF files to merge.');
      }
  
      const mergedPdf = await PDFDocument.create();
      const filename = JSON.parse(JSON.stringify(fileName));
      
      for (const pdfPath of pdfPaths) {
        const pdfBytes = await fsPromises.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
  
      const mergedPdfBytes = await mergedPdf.save();
  
      await fsPromises.writeFile(outputFilePath, mergedPdfBytes);
      const { size } = await fsPromises.stat(outputFilePath);
      const pageCount = mergedPdf.getPageCount();
      
      
      const fileLink = `uploads/${outputFilePath.split('/')[2]}`;
      const pdfDetails = { file_size: `${(size/1024).toFixed(2)} KB`, page_count: pageCount, original_name: outputFilePath.split('/')[2], input_name: `${filename.fileName}.pdf`};
      const newPdf = await this.prisma.file.create({ data: { ...pdfDetails, userId: req.id } })
  
      return { ...newPdf, fileLink };
    } catch (error) {
      return error;
    }
  }
}
