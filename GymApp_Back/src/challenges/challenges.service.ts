import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}


  async findAllActiveChallenges() {
    return this.prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }, // Les plus récents en premier
    });
  }
}