/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken'; // Import TokenExpiredError

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'your_access_token_secret', // Fallback to a default value if process.env.JWT_SECRET is not set
      });

      // Check if token has expired before proceeding
      if (decoded.exp * 1000 < Date.now()) {
        throw new TokenExpiredError(
          'jwt expired',
          new Date(decoded.exp * 1000),
        );
      }

      request.userId = decoded;
      return true;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.error('JWT verification error: Token has expired');
        throw new UnauthorizedException('Token has expired');
      } else {
        console.error('JWT verification error:', err);
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}
