import { SubscribeMessage, MessageBody, ConnectedSocket, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateFileSocketDto } from './dto/create-file-socket.dto';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { FileSocketService } from './file-socket.service';

@WebSocketGateway()
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

  @SubscribeMessage('message')
  @UseInterceptors(FileInterceptor('pdf', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => {
        const randomName = uuid();
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))

  handleMessage(@MessageBody() bodyDto: CreateFileSocketDto, @UploadedFile() pdf: Express.Multer.File, @ConnectedSocket() client: Socket) {
    try {
      const fileDetails = this.fileService.processUploadedFile(bodyDto, pdf);

      client.emit('pdf', { fileDetails });
    } catch (error) {
      client.emit('errorMessage', 'Failed to process the uploaded file.');
    }
  }
}
