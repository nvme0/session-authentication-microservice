import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { buildContext } from "graphql-passport";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Configuration } from "./shared/configuration/configuration.enum";
import { ConfigurationService } from "./shared/configuration/configuration.service";
import { SharedModule } from "./shared/shared.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

import { User } from "./user/models/user.entity";

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UserModule,
    GraphQLModule.forRootAsync({
      useFactory: async ({ isDevelopment }: ConfigurationService) => ({
        autoSchemaFile: "schema.gql",
        playground: isDevelopment
          ? {
              settings: {
                "request.credentials": "include"
              }
            }
          : false,
        debug: isDevelopment,
        context: ({ req, res }) => buildContext({ req, res, User }),
        cors: isDevelopment
          ? {
              credentials: true,
              origin: "http://localhost:3000"
            }
          : false
      }),
      inject: [ConfigurationService]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async ({ typeOrmConfig }: ConfigurationService) => {
        return {
          ...typeOrmConfig,
          autoLoadEntities: false,
          entities: ["./**/*.entity.js"]
        };
      },
      inject: [ConfigurationService]
    })
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_PIPE, useClass: ValidationPipe }]
})
export class AppModule {
  static host: string;
  static port: number | string;
  static redisHost: string;
  static redisPort: number;
  static secret: string;
  static maxAge: number;
  static isDev: boolean;
  static sessionMiddleware: any;
  static passportMiddleware: any;
  static passportSessionMiddleware: any;

  constructor(private configurationService: ConfigurationService) {
    AppModule.port = configurationService.get(Configuration.APP_PORT);
    AppModule.host = configurationService.get(Configuration.APP_HOST);
    AppModule.redisHost = configurationService.get(Configuration.REDIS_HOST);
    AppModule.redisPort = Number(
      configurationService.get(Configuration.REDIS_PORT)
    );
    AppModule.secret = configurationService.get(Configuration.SESSION_SECRET);
    AppModule.maxAge = Number(
      configurationService.get(Configuration.SESSION_EXPIRE_TIME_MS)
    );
    AppModule.isDev = configurationService.isDevelopment;

    AppModule.sessionMiddleware = ConfigurationService.sessionMiddleware;
    AppModule.passportMiddleware = ConfigurationService.passportMiddleware;
    AppModule.passportSessionMiddleware =
      ConfigurationService.passportSessionMiddleware;
  }
}
