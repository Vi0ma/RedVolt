import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        wallet: true, 
      }, 
    });

    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  async findOne(id: number) {
    return this.getMyProfile(id);
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      take: 10,
      orderBy: { totalPoints: 'desc' },
      select: {
        id: true,
        name: true,
        totalPoints: true,
        sessionsCount: true,
        createdAt: true,
      },
    });
  }

  async scanEntry(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    const today = new Date().toDateString();
    
    if (user.lastScanAt) {
        const lastScanDate = user.lastScanAt.toDateString();
        
        if (lastScanDate === today) {
            throw new HttpException(
                "Tu as déjà scanné aujourd'hui ! Reviens demain champion 💪", 
                HttpStatus.CONFLICT
            );
        }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        sessionsCount: { increment: 1 },
        totalPoints: { increment: 100 },
        lastScanAt: new Date(),
      },
    });
  }

  async getMyUpcomingClasses(userId: number) {
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        userId: userId,
        class: {
          date: { gt: now },
        },
      },
      include: { class: true },
      orderBy: {
        class: { date: 'asc' },
      },
    });

    return bookings.map((booking) => {
      const c = booking.class;
      const dateObj = new Date(c.date);
      
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');

      return {
        id: booking.id,
        name: c.title,
        coach: c.coach,
        time: `${hours}:${minutes}`,
        dateStr: dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'numeric' }),
        fullDate: dateObj.toISOString()
      };
    });
  }

  async cancelBooking(userId: number, bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) {
        throw new NotFoundException("Réservation introuvable");
    }

    if (booking.userId !== userId) {
        throw new UnauthorizedException("Ce n'est pas ta réservation !");
    }

    return this.prisma.$transaction([
        this.prisma.booking.delete({
            where: { id: bookingId }
        }),
        this.prisma.class.update({
            where: { id: booking.classId },
            data: { 
                booked: { decrement: 1 } 
            }
        })
    ]);
  }
}