import { Controller, Get } from '@nestjs/common';
import { PersonalityService } from './personality.service';

@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  @Get('big-five')
  getBigFive() {
    return this.personalityService.getBigFive();
  }
}
