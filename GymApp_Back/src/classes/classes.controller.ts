import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get() // GET /classes -> Affiche le planning
  findAll() {
    return this.classesService.findAll();
  }

  @UseGuards(AuthGuard('jwt')) // Il faut être connecté pour réserver
  @Post(':id/book') // POST /classes/1/book -> Réserver le cours n°1
  book(@Request() req, @Param('id') id: string) {
    return this.classesService.bookClass(req.user.userId, +id);
  }
}