import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@Request() req) {
    return this.walletService.getMyWallet(req.user.userId);
  }

  @Get('history')
  getHistory(@Request() req) {
    return this.walletService.getHistory(req.user.userId);
  }

  @Post('credit')
  creditWallet(@Request() req, @Body('amount') amount: number) {
    return this.walletService.creditWallet(req.user.userId, Number(amount));
  }
}