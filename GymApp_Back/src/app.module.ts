import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service'; // <--- 1. IMPORT AJOUTÉ
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { ClassesModule } from './classes/classes.module';
import { ProductsModule } from './products/products.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChallengesModule } from './challenges/challenges.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    WalletModule, 
    ClassesModule, 
    ProductsModule,
    ScheduleModule.forRoot(),
    ChallengesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService // <--- 2. AJOUT INDISPENSABLE ICI
  ],
})
export class AppModule {}