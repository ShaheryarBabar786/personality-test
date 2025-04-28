// personality.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigDto } from '../test-config.dto';

@Injectable()
export class PersonalityService {

  private readonly dataDir = path.join(process.cwd(), 'src', 'data');
  async getAllTests() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        return [];
      }
  
      const files = fs.readdirSync(this.dataDir)
        .filter(file => file.endsWith('.json'));
  
      const tests = files.map(file => {
        const filePath = path.join(this.dataDir, file);
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        } catch (error) {
          console.error(`Failed to parse ${file}:`, error.message);
          return null;
        }
      }).filter(Boolean);
      return tests;
    } catch (error) {
      console.error('getAllTests error:', error);
      throw error;
    }
  }

  async getTest(id: string) {
    const filePath = path.join(this.dataDir, `${id}.json`);
  
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
  
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return null;
    }
  }

  async createTest(testConfig: TestConfigDto) {
    const filePath = path.join(this.dataDir, `${testConfig.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(testConfig, null, 2));
    return testConfig;
  }

  async updateTest(id: string, testConfig: TestConfigDto) {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(testConfig, null, 2));
      return testConfig;
    }
    return null;
  }

  async deleteTest(id: string) {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false };
  }

  async getBigFive() {
    return this.getTest('big-five');
  }

  async getMBTI() {
    return this.getTest('mbti');
  }

  async calculateScore(testId: string, answers: any[]) {
    const testConfig = await this.getTest(testId);
    if (!testConfig) return null;
    
    return {
      testId,
      testName: testConfig.name,
      outcomes: [],
      result: 'Temporary result'
    };
  }
}