// personality.controller.ts
import { Controller, Get, Param, Post, Body, Put, Delete, BadRequestException, Query } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { TestConfigDto } from '../test-config.dto';

@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  // In personality.controller.ts
@Get()
getAllTests() {
  return this.personalityService.getAllTestsWithResults();
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
  @Get('types/weighted-test')
  getEITEST() {
    return this.personalityService.getEITEST();
  }

  @Post('score/:testId')
  calculateScore(@Param('testId') testId: string, @Body() answers: any[]) {
    return this.personalityService.calculateScore(testId, answers);
  }
  @Post('results')
async storeResults(@Body() body: { 
  testId: string,
  testName: string,
  timestamp: string,
  finalResult: string
}) {
  if (!body.testId || !body.testName || !body.timestamp || !body.finalResult) {
    throw new BadRequestException('Missing required fields');
  }
  return this.personalityService.storeTestResults(body);
}

@Get(':id')
getTest(@Param('id') id: string, @Query('lang') language?: string) {
  return this.personalityService.getTestWithLanguage(id, language);
}
}