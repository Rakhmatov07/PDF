import { SubscribeMessage, MessageBody, ConnectedSocket, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateFileSocketDto } from './dto/create-file-socket.dto';
import { Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { FileSocketService } from './file-socket.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequest } from 'src/auth/user.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@WebSocketGateway()
@ApiTags('Pdf')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class FileSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly fileService: FileSocketService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`${client.id} is connected`);
    
  }

  handleDisconnect(client: Socket) {
    console.log(`${client.id} is disconnected`);
  }

  @SubscribeMessage('pdf')
  @UseInterceptors(FilesInterceptor('pdf', 10))
  async mergePdfFiles(@MessageBody() bodyDto: CreateFileSocketDto, @UploadedFiles() pdfs: Express.Multer.File[], @ConnectedSocket() client: Socket, @Req() req: IRequest) {
    try {
      const pdfPaths = pdfs.map((pdf) => pdf.path);
      
      const outputFilePath = `./uploads/merged-${uuid()}.pdf`;
      const pdfFileDetails = await this.fileService.mergePdfFiles(pdfPaths, outputFilePath, bodyDto, req);

      client.emit('pdfs', { pdfFileDetails });
    } catch (error) {
      client.emit('errorMessage', 'Failed to process the uploaded file.');
    }    
  }
}
