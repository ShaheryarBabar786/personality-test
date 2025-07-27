import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigDto } from '../test-config.dto';
import { TestConfig } from 'src/interface/types/test-config.interface';

@Injectable()
export class PersonalityService {
  private readonly dataDir = path.join(process.cwd(), 'src', 'data');
  private readonly testsDir = path.join(this.dataDir, 'tests');
  private readonly resultsDir = path.join(this.dataDir, 'results');

  constructor() {
    [this.dataDir, this.testsDir, this.resultsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private getTestFilePath(id: string): string {
    return path.join(this.testsDir, `${id}.json`);
  }

  private getResultFilePath(testId: string): string {
    return path.join(this.resultsDir, `result_${testId}.json`);
  }

  private async readTestConfig(id: string): Promise<any> {
    const filePath = this.getTestFilePath(id);
    if (!fs.existsSync(filePath)) return null;
    
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return null;
    }
  }

  private async writeTestConfig(id: string, config: any): Promise<void> {
    const filePath = this.getTestFilePath(id);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  }

  private async readResultsFile(testId: string): Promise<any[]> {
    const filePath = this.getResultFilePath(testId);
    if (!fs.existsSync(filePath)) return [];
    
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading results file ${filePath}:`, error);
      return [];
    }
  }

  private async writeResultsFile(testId: string, results: any[]): Promise<void> {
    const filePath = this.getResultFilePath(testId);
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  }

  async getAllTests() {
    try {
      const files = fs.readdirSync(this.testsDir)
        .filter(file => file.endsWith('.json'));

      return files.map(file => {
        const filePath = path.join(this.testsDir, file);
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        } catch (error) {
          console.error(`Failed to parse ${file}:`, error.message);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('getAllTests error:', error);
      throw error;
    }
  }

  async getTest(id: string) {
    return this.readTestConfig(id);
  }

  async createTest(testConfig: TestConfigDto) {
    await this.writeTestConfig(testConfig.id, testConfig);
    return testConfig;
  }

  async updateTest(id: string, testConfig: TestConfigDto) {
    const existing = await this.readTestConfig(id);
    if (!existing) return null;
    
    await this.writeTestConfig(id, testConfig);
    return testConfig;
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

  async getEITEST() {
    return this.getTest('weighted-test');
  }

  async calculateScore(testId: string, answers: any[]) {
    const testConfig = await this.readTestConfig(testId);
    if (!testConfig) return null;

    let result;
    switch (testConfig.scoringType) {
      case 'sum':
        result = this.calculateSumScore(testConfig, answers);
        break;
      case 'compare':
        result = this.calculateCompareScore(testConfig, answers);
        break;
      case 'weighted':
        result = this.calculateWeightedScore(testConfig, answers);
        break;
      default:
        result = this.calculateSumScore(testConfig, answers);
    }
    if (!testConfig.results) testConfig.results = [];
    testConfig.results.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    
    await this.writeTestConfig(testId, testConfig);
    return result;
  }

  async storeTestResults(resultData: {
    testId: string,
    testName: string,
    timestamp: string,
    finalResult: string,
    resultWithPercentages?: string
  }) {
    const testId = resultData.testId;
    
    try {
      const existingResults = await this.readResultsFile(testId);
      
      existingResults.push({
        timestamp: resultData.timestamp,
        testId: resultData.testId,
        testName: resultData.testName,
        finalResult: resultData.finalResult,
        resultWithPercentages: resultData.resultWithPercentages
      });
      
      await this.writeResultsFile(testId, existingResults);

      return { 
        success: true,
        savedAt: resultData.timestamp,
        testId: testId
      };
    } catch (error) {
      console.error('Storage error:', error);
      throw new Error('Failed to save results to JSON file');
    }
  }

  async getAllTestsWithResults() {
    try {
      const tests = await this.getAllTests();
      
      const testsWithResults = await Promise.all(tests.map(async test => {
        const results = await this.readResultsFile(test.id);
        return {
          ...test,
          results: results
        };
      }));

      return testsWithResults;
    } catch (error) {
      console.error('getAllTestsWithResults error:', error);
      throw error;
    }
  }
  private calculateSumScore(testConfig: any, answers: any[]): any {
    const outcomes = testConfig.outcomes.map(outcome => ({
      ...outcome,
      score: 0,
      maxPossible: 0
    }));
  
    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;
  
      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find(o => o.id === question.target);
      if (outcome) {
        outcome.score += score;
        outcome.maxPossible += 5;
      }
    });
    
    const results = outcomes.map(o => {
      const percentageValue = Math.round((o.score / o.maxPossible) * 100);
      return {
        id: o.id,
        name: o.name,
        description: o.description,
        score: o.score,
        maxPossible: o.maxPossible,
        percentage: percentageValue,
        translations: o.translations || {}
      };
    });
  
    return {
      outcomes: results,
      result: results.map(o => 
        `${o.name}: ${o.score}/${o.maxPossible} (${o.percentage}%)`
      ).join(', ')
    };
  }

  private calculateCompareScore(testConfig: any, answers: any[]) {
    const dichotomies = [
      ['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']
    ];
    
    const outcomes = dichotomies.flat().map(id => ({
      id,
      name: testConfig.outcomes.find(o => o.id === id)?.name || id,
      score: 0
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;
      
      const points = Math.abs(answer - 3);
      const pair = dichotomies.find(d => d.includes(question.target));
      
      if (pair) {
        const isFirstInPair = pair[0] === question.target;
        const direction = answer > 3 ? 1 : -1;
        const effectiveDirection = question.isReversed ? -direction : direction;
        
        if (effectiveDirection > 0) {
          outcomes.find(o => o.id === pair[0])!.score += points;
        } else {
          outcomes.find(o => o.id === pair[1])!.score += points;
        }
      }
    });
    
    const type = dichotomies.map(([a, b]) => 
      outcomes.find(o => o.id === a)!.score > outcomes.find(o => o.id === b)!.score ? a : b
    ).join('');

    return {
      outcomes,
      result: type,
      detailedResult: dichotomies.map(([a, b]) => {
        const aOutcome = outcomes.find(o => o.id === a)!;
        const bOutcome = outcomes.find(o => o.id === b)!;
        const total = aOutcome.score + bOutcome.score || 1;
        return {
          dichotomy: `${a}/${b}`,
          [a]: Math.round((aOutcome.score / total) * 100),
          [b]: Math.round((bOutcome.score / total) * 100)
        };
      })
    };
  }

  private calculateWeightedScore(testConfig: any, answers: any[]) {
    const outcomes = testConfig.outcomes.map(outcome => ({
      ...outcome,
      rawScore: 0,
      normalizedScore: 0
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find(o => o.id === question.target);
      if (outcome) {
        outcome.rawScore += score * (question.weight || 1);
      }
    });
  
    const totalWeight = testConfig.questions.reduce(
      (sum, q) => sum + (q.weight || 1), 0);
    
    outcomes.forEach(o => {
      o.normalizedScore = Math.round((o.rawScore / (totalWeight * 5)) * 100);
    });

    const sorted = [...outcomes].sort((a, b) => b.normalizedScore - a.normalizedScore);

    return {
      outcomes: sorted,
      result: `${sorted[0].name} (${sorted[0].normalizedScore}%)`,
      detailedResult: sorted.map(o => ({
        ...o,
        score: o.normalizedScore
      }))
    };
  }

async getTestWithLanguage(id: string, language: string = 'english'): Promise<any> {
  const testConfig = await this.readTestConfig(id);
  if (!testConfig) return null;

  if (testConfig.questions) {
    testConfig.questions = testConfig.questions.map(question => {
      const newQuestion = { ...question }; 
      
      if (newQuestion.translations) {
        switch (language.toLowerCase()) {
          case 'french':
            newQuestion.text = newQuestion.translations.French || 
                             newQuestion.translations.french || 
                             newQuestion.text;
            break;
          case 'spanish':
            newQuestion.text = newQuestion.translations.Spanish || 
                             newQuestion.translations.spanish || 
                             newQuestion.text;
            break;
        }
      }
      return newQuestion;
    });
  }

  if (testConfig.outcomes) {
    testConfig.outcomes = testConfig.outcomes.map(outcome => {
      if (outcome.translations) {
        switch (language) {
          case 'french':
            outcome.name = outcome.translations.French || outcome.name;
            outcome.description = outcome.translations.French || outcome.description;
            break;
          case 'spanish':
            outcome.name = outcome.translations.Spanish || outcome.name;
            outcome.description = outcome.translations.Spanish || outcome.description;
            break;
        }
      }
      return outcome;
    });
  }

  return testConfig;
}
}