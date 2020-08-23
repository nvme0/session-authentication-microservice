import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const ContextGql = createParamDecorator<
  unknown,
  ExecutionContext,
  GqlExecutionContext
>((_, context) => {
  return GqlExecutionContext.create(context).getContext();
});
