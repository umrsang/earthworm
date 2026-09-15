import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ERROR_MESSAGES, USER_ROLES } from "../common/constants";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenException(ERROR_MESSAGES.ADMIN_REQUIRED);
    }
    return true;
  }
}
