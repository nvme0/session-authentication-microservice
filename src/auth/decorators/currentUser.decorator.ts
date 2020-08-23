import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

import { User } from "src/user/models/user.entity";

export const CurrentUser = createParamDecorator<
  unknown,
  ExecutionContext,
  User
>((_, context) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
