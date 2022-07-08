import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Environment } from './app.types';
import { DatabaseConfigService } from './database/database.config';
import { DatabaseModule } from './database/database.module';
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule, AppModule],
      useFactory: (
        databaseConfigService: DatabaseConfigService,
        appConfigService: AppConfigService,
      ) => {
        return {
          type: 'postgres',
          host: databaseConfigService.host,
          port: databaseConfigService.port,
          username: databaseConfigService.username,
          password: databaseConfigService.password,
          database: databaseConfigService.database,
          entities: [],
          synchronize: appConfigService.env === Environment.Development,
        };
      },
      inject: [DatabaseConfigService, AppConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
  exports: [AppConfigService],
})
export class AppModule {}
