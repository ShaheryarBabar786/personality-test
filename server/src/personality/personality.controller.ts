// personality.controller.ts
import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { TestConfigDto } from '../test-config.dto';

@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  @Get()
  getAllTests() {
    return this.personalityService.getAllTests();
  }

  @Get(':id')
  getTest(@Param('id') id: string) {
    return this.personalityService.getTest(id);
  }

  @Post()
  createTest(@Body() testConfig: TestConfigDto) {
    return this.personalityService.createTest(testConfig);
  }

  @Put(':id')
  updateTest(@Param('id') id: string, @Body() testConfig: TestConfigDto) {
    return this.personalityService.updateTest(id, testConfig);
  }

  @Delete(':id')
  deleteTest(@Param('id') id: string) {
    return this.personalityService.deleteTest(id);
  }

  @Get('types/big-five')
  getBigFive() {
    return this.personalityService.getBigFive();
  }

  @Get('types/mbti')
  getMBTI() {
    return this.personalityService.getMBTI();
  }

  @Post('score/:testId')
  calculateScore(@Param('testId') testId: string, @Body() answers: any[]) {
    return this.personalityService.calculateScore(testId, answers);
  }
}