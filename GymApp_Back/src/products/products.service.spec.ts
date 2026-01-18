import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Le produit #${id} n'existe pas.`);
    return product;
  }

  async requestOrder(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    if (!product) throw new NotFoundException('Produit inconnu');
    if (!wallet) throw new NotFoundException('Wallet introuvable');
    if (product.stock <= 0) throw new BadRequestException('Produit épuisé');

    if (wallet.balance < product.price) {
      throw new BadRequestException('Solde insuffisant ! Veuillez recharger votre compte.');
    }

    await this.prisma.order.create({
      data: {
        userId,
        total: product.price,
        status: 'PENDING', 
        isValidated: false, 
        items: {
          create: { productId: productId, quantity: 1 }
        }
      }
    });

    return { message: "Commande créée ! Va voir le staff pour valider." };
  }

  async validateOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } },
        user: true 
      }
    });

    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.status === 'COMPLETED') return;

    const userId = order.userId;
    const amount = order.total;
    const product = order.items[0].product; 

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    
    if (!wallet) throw new NotFoundException('Wallet introuvable');
    if (wallet.balance < amount) throw new BadRequestException('Solde client insuffisant !');
    if (product.stock <= 0) throw new BadRequestException('Plus de stock !');

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } }
      }),
      this.prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } }
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          amount: amount,
          type: 'DEBIT',
          description: `Achat Validé: ${product.name}`
        }
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
      })
    ]);

    this.logger.log(`💰 Paiement validé pour ${order.user.name} (-${amount}DH)`);
  }

  @Cron('*/5 * * * * *')
  async handleCron() {
    const ordersToValidate = await this.prisma.order.findMany({
      where: { 
        isValidated: true, 
        status: 'PENDING' 
      }
    });

    if (ordersToValidate.length > 0) {
      this.logger.log(`🤖 J'ai trouvé ${ordersToValidate.length} commandes cochées à traiter...`);

      for (const order of ordersToValidate) {
        try {
          await this.validateOrder(order.id);
          this.logger.log(`✅ SUCCÈS : Commande #${order.id} terminée !`);
        } catch (error) {
          this.logger.error(`❌ ÉCHEC Commande #${order.id}: ${error.message}`);
          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: 'ERROR' } 
          });
        }
      }
    }
  }
}