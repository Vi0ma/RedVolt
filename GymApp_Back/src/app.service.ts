import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AdminNotifier');

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'GymApp Backend is Running!';
  }

  
  @Cron('*/10 * * * * *')
  async checkNewUsers() {
    const pendingUsers = await this.prisma.user.findMany({
      where: { isActive: false }
    });

    if (pendingUsers.length > 0) {
      this.logger.warn(` ATTENTION : Il y a ${pendingUsers.length} nouveaux inscrits à valider !`);
      
      pendingUsers.forEach(u => this.logger.log(`👉 ${u.name} (${u.email}) attend l'activation.`));
    }
  }
}