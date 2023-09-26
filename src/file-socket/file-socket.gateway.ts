import { SubscribeMessage, MessageBody, ConnectedSocket, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { FileSocketService } from './file-socket.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequest } from 'src/auth/user.type';

@UseGuards(AuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  }
})

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

  @SubscribeMessage('msg')
  showMsg(@MessageBody() body: any, @ConnectedSocket() client: Socket){
    console.log(body);
    
  }

  @SubscribeMessage('uploadFile')
  @UseInterceptors(FilesInterceptor('pdf', 10))
  async mergePdfFiles(@MessageBody() fileName: any, @UploadedFiles() pdfs: Express.Multer.File[], @ConnectedSocket() client: Socket, @Req() req: IRequest) {
    try {
      const pdfPaths = pdfs.map((pdf) => pdf.path);
      
      const outputFilePath = `./uploads/merged-${uuid()}.pdf`;
      const pdfFileDetails = await this.fileService.mergePdfFiles(pdfPaths, outputFilePath, fileName, req);

      client.emit('uploadComplete', { pdfFileDetails });
    } catch (error) {
      client.emit('errorMessage', 'Failed to process the uploaded file.');
      throw new WsException(error)
    }    
  }
}
