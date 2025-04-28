// personality.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigDto } from '../test-config.dto';

@Injectable()
export class PersonalityService {
  private readonly dataDir = path.join(__dirname, '../data');

  // async getAllTests() {
  //   if (!fs.existsSync(this.dataDir)) {
  //     fs.mkdirSync(this.dataDir, { recursive: true });
  //     return []; 
  //   }
  //   const files = fs.readdirSync(this.dataDir);
  //   return files.map(file => {
  //     const filePath = path.join(this.dataDir, file);
  //     return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  //   });
  // }

  async getAllTests() {
    try {
      // Create data directory if it doesn't exist
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        
        // Create initial big-five.json if it doesn't exist
        const initialData = {
          id: "big-five",
          name: "Big Five Personality Test",
          type: "Big Five",
          scoringType: "sum",
          description: "Measures five broad personality traits",
          questions: [
            {
              id: "q1",
              text: "I am outgoing.",
              translations: {
                French: "Je suis extraverti.",
                Spanish: "Soy extrovertido."
              },
              isReversed: false,
              target: "extraversion",
              weight: 1
            },
            {
              id: "q2",
              text: "I avoid socializing.",
              translations: {
                French: "J'évite de socialiser.",
                Spanish: "Evito socializar."
              },
              isReversed: true,
              target: "extraversion",
              weight: 1
            }
          ],
          outcomes: [
            {
              id: "openness",
              name: "Openness",
              translations: {
                French: "Ouverture",
                Spanish: "Apertura"
              },
              description: "Openness to experience"
            },
            {
              id: "conscientiousness",
              name: "Conscientiousness",
              translations: {
                French: "Conscience",
                Spanish: "Responsabilidad"
              },
              description: "Tendency to be organized and dependable"
            }
          ],
          customScoring: ""
        };
        
        fs.writeFileSync(
          path.join(this.dataDir, 'big-five.json'),
          JSON.stringify(initialData, null, 2)
        );
      }

      const files = fs.readdirSync(this.dataDir)
        .filter(file => file.endsWith('.json'));

      return files.map(file => {
        const filePath = path.join(this.dataDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      });
    } catch (error) {
      console.error('Error in getAllTests:', error);
      throw error;
    }
  }

  async getTest(id: string) {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
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
    console.log("filePath",filePath)
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

    // Implement scoring logic similar to frontend
    // This should match the frontend ScoringService logic
    // ...
    
    return {
      testId,
      testName: testConfig.name,
      outcomes: [],
      result: 'Temporary result'
    };
  }
}