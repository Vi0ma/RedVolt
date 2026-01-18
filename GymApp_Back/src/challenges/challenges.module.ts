import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { PrismaService } from 'src/prisma.service'; // <--- IMPORTANT

@Module({
  controllers: [ChallengesController],
  providers: [ChallengesService, PrismaService], // <--- AJOUTE-LE ICI
})
export class ChallengesModule {}