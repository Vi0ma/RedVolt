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
    if (!product) throw new NotFoundException(`Produit #${id} introuvable.`);
    return product;
  }

  async requestOrder(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    if (!product) throw new NotFoundException('Produit inconnu');
    if (!wallet) throw new NotFoundException('Portefeuille introuvable');
    if (product.stock <= 0) throw new BadRequestException('Produit épuisé');
    if (wallet.balance < product.price) throw new BadRequestException('Solde insuffisant');

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

    return { message: "Commande envoyée ! En attente de validation." };
  }

  async validateOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        user: { include: { wallet: true } }, 
        items: { include: { product: true } } 
      }
    });

    if (!order) return; // Sécurité

    const user = order.user;
    const wallet = user.wallet;
    const item = order.items[0]; 
    const product = item.product;

    if (!wallet || wallet.balance < order.total) {
        throw new Error("Solde insuffisant au moment de la validation");
    }
    if (product.stock < item.quantity) {
        throw new Error("Rupture de stock au moment de la validation");
    }

    await this.prisma.$transaction([
        this.prisma.wallet.update({
            where: { userId: user.id },
            data: { balance: { decrement: order.total } }
        }),
        this.prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } }
        }),
        this.prisma.transaction.create({
            data: {
                userId: user.id,
                amount: order.total,
                type: 'DEBIT',
                description: `Achat Boutique : ${product.name}`
            }
        }),
        this.prisma.order.update({
            where: { id: order.id },
            data: { status: 'COMPLETED' }
        })
    ]);

    this.logger.log(`✅ Commande #${order.id} validée pour ${user.name} (-${order.total} DH)`);
  }

  @Cron('*/5 * * * * *')
  async handleCron() {
    const ordersToProcess = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        isValidated: true
      }
    });

    if (ordersToProcess.length > 0) {
      this.logger.log(`🤖 Robot : J'ai trouvé ${ordersToProcess.length} commandes cochées ! Traitement...`);

      for (const order of ordersToProcess) {
        try {
          await this.validateOrder(order.id);
        } catch (error) {
          this.logger.error(`❌ Erreur Commande #${order.id}: ${error.message}`);
          await this.prisma.order.update({
             where: { id: order.id },
             data: { status: 'ERROR_PAYMENT' }
          });
        }
      }
    }
  }
}