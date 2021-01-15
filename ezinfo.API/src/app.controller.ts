import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get()
  async yeah(@Req() req, @Res() response: Response)
  {
    console.log("co tam?");
    response.cookie('XSRF-TOKEN', req.csrfToken())
    response.json({});
  }
}
