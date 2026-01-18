import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getMyWallet(userId: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return { balance: 0 };
    return wallet;
  }

  async getHistory(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  async creditWallet(userId: number, amount: number) {
    const wallet = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } }
    });

    await this.prisma.transaction.create({
      data: {
        userId,
        amount: amount,
        type: 'CREDIT',
        description: 'Recharge Compte'
      }
    });

    return wallet;
  }
}