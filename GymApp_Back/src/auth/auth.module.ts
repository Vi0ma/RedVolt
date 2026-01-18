import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy'; // <--- 1. IMPORT AJOUTÉ

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Vérifie que c'est bien la même clé qu'à l'étape 2
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    PrismaService, 
    LocalStrategy, 
    JwtStrategy // <--- 2. AJOUT INDISPENSABLE ICI
  ], 
  exports: [AuthService]
})
export class AuthModule {}