import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from 'src/prisma.service'; // <--- IMPORTANT

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService], // <--- N'oublie pas PrismaService
})
export class ProductsModule {}