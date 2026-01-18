import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createAuthDto: CreateAuthDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: createAuthDto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createAuthDto.email,
        password: hashedPassword,
        name: createAuthDto.name,
        wallet: { create: { balance: 0.0 } }
      },
    });

    return { message: 'Compte créé avec succès', userId: user.id };
  }

  async login(user: any) {
    const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });

    if (fullUser.isActive === false) {
        throw new ForbiddenException("Ton compte est en attente de validation par le Staff du Gym. ⏳");
    }

    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role
      }
    };
  }
}