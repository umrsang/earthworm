import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export const UncheckAuth = () => SetMetadata("uncheck", true);
export const Permissions = (...permissions: string[]) => SetMetadata("permissions", permissions);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const uncheck = Reflect.getMetadata("uncheck", context.getHandler());
    const permissions = Reflect.getMetadata("permissions", context.getHandler());

    if (!token && uncheck) {
      request["userId"] = null;
      return true;
    }

    if (!token) {
      throw new UnauthorizedException("未提供认证令牌");
    }

    try {
      const payload = this.jwtService.verify(token);

      if (permissions && permissions.length > 0) {
        const scopes = typeof payload.scope === "string" ? payload.scope.split(" ") : [];
        if (!permissions.every((scope) => scopes.includes(scope))) {
          throw new UnauthorizedException("权限不足");
        }
      }

      request["userId"] = payload.sub;
    } catch (e) {
      if (!uncheck) {
        throw new UnauthorizedException("认证令牌无效");
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
