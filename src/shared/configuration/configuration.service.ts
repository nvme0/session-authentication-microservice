import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import * as connectRedis from "connect-redis";
import * as session from "express-session";
import * as passport from "passport";

import { Configuration } from "src/shared/configuration/configuration.enum";

@Injectable()
export class ConfigurationService {
  static store: connectRedis.RedisStore;
  static sessionMiddleware: any;
  static passportMiddleware: any;
  static passportSessionMiddleware: any;

  constructor(private configService: ConfigService) {
    // Setup Redis
    const RedisStore: connectRedis.RedisStore = connectRedis(session);
    const client = new Redis({
      host: this.configService.get<string>(Configuration.REDIS_HOST),
      port: this.configService.get<number>(Configuration.REDIS_PORT)
    });
    ConfigurationService.store = new RedisStore({ client });

    // Setup Express Session
    const sessionOptions: session.SessionOptions = {
      cookie: {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: !(
          this.configService.get(Configuration.NODE_ENV) === "development"
        ),
        maxAge:
          this.configService.get(Configuration.SESSION_EXPIRE_TIME_MS) * 1000,
        signed: false
      },
      name: "sid",
      saveUninitialized: false,
      resave: false,
      secret: this.configService.get(Configuration.SESSION_SECRET) || "",
      store: ConfigurationService.store
    };

    ConfigurationService.sessionMiddleware = (session as any)(sessionOptions);
    ConfigurationService.passportMiddleware = passport.initialize();
    ConfigurationService.passportSessionMiddleware = passport.session();
  }

  get(propertyPath: string) {
    return this.configService.get(propertyPath);
  }

  get typeOrmConfig(): any {
    return {
      type: this.configService.get<string>(Configuration.DB_TYPE),
      host: this.configService.get<string>(Configuration.DB_HOST),
      port: this.configService.get<number>(Configuration.DB_PORT),
      database: this.configService.get<string>(Configuration.DB_NAME),
      username: this.configService.get<string>(Configuration.DB_USERNAME),
      password: this.configService.get<string>(Configuration.DB_PASSWORD),
      synchronize: false,
      logging: this.isDevelopment
    };
  }

  get isDevelopment(): boolean {
    return this.configService.get(Configuration.NODE_ENV) === "development";
  }
}
