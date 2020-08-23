import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { UserModule } from "src/user/user.module";
import { LocalSerializer } from "./guards/local.serializer";
import { LocalStrategy } from "./guards/local.strategy";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      defaultStrategy: "graphql-local",
      session: true
    })
  ],
  providers: [LocalStrategy, LocalSerializer, LocalAuthGuard]
})
export class AuthModule {}
