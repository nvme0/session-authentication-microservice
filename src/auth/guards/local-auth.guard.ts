import { ExecutionContext, Injectable, CanActivate } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") implements CanActivate {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: any): Promise<boolean> {
    try {
      const request = context.getArgs()[2].req;
      if (request.user) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}
