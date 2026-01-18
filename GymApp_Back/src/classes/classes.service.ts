import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.class.findMany({
      orderBy: { date: 'asc' },
      where: {
        date: { gte: new Date() }
      }
    });
  }

  async bookClass(userId: number, classId: number) {
    const course = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!course) throw new NotFoundException('Cours introuvable');

    if (course.booked >= course.capacity) {
      throw new BadRequestException('Cours complet ! Désolé.');
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where: { userId, classId }
    });
    if (existingBooking) throw new BadRequestException('Tu es déjà inscrit à ce cours.');

    await this.prisma.$transaction([
      this.prisma.booking.create({
        data: { userId, classId }
      }),
      this.prisma.class.update({
        where: { id: classId },
        data: { booked: { increment: 1 } }
      })
    ]);

    return { message: 'Inscription validée !' };
  }
}