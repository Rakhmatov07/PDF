import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor( private readonly jwtService: JwtService ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
    
    if(!token) false;

    try {
      const { id } = this.jwtService.verify(token);
      
      req.id = id;
      return true;
    } catch (error) {
      return false;
    }
  }
}