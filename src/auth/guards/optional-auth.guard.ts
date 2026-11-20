import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard.js';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      return true;
    }
  }
}
