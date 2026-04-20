import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthenticationModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
