import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getMyProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('scan')
  scanQrCode(@Request() req) {
    return this.usersService.scanEntry(req.user.userId);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('next-class')
  getMyUpcomingClasses(@Request() req) {
    return this.usersService.getMyUpcomingClasses(req.user.userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete('booking/:id')
  cancelBooking(@Request() req, @Param('id') id: string) {
    return this.usersService.cancelBooking(req.user.userId, Number(id));
  }
}