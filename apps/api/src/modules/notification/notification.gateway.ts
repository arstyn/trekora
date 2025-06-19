import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: any) {
    // Expect JWT in query: ?token=...
    const token = client.handshake.query.token;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'your_access_token_secret',
      });
      // Join user to a room named by their userId
      if (payload && payload.id) {
        client.join(`user_${payload.id}`);
      } else {
        client.disconnect();
      }
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    // Nothing special for now
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
