import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Environment } from './app.types';
import { CommonConfigService } from './common/common.config';
import { CommonModule } from './common/common.module';
import { DatabaseConfigService } from './database/database.config';
import { DatabaseModule } from './database/database.module';
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule, CommonModule],
      useFactory: (
        databaseConfigService: DatabaseConfigService,
        commonConfigService: CommonConfigService,
      ) => {
        return {
          type: 'postgres',
          host: databaseConfigService.host,
          port: databaseConfigService.port,
          username: databaseConfigService.username,
          password: databaseConfigService.password,
          database: databaseConfigService.database,
          synchronize: commonConfigService.env === Environment.Development,
          autoLoadEntities: true,
        };
      },
      inject: [DatabaseConfigService, CommonConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
