// scoring.service.ts
import { Injectable } from '@angular/core';
import { TestConfig } from '../shared/models/test-config.model';

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  calculateScore(testConfig: TestConfig, answers: any[]): any {
    console.log('test result api');
    switch (testConfig.scoringType) {
      case 'sum':
        return this.calculateSumScore(testConfig, answers);
      case 'compare':
        return this.calculateCompareScore(testConfig, answers);
      case 'weighted':
        return this.calculateWeightedScore(testConfig, answers);
      default:
        return this.calculateSumScore(testConfig, answers);
    }
  }

  private calculateSumScore(testConfig: TestConfig, answers: any[]): any {
    const outcomes = testConfig.outcomes.map((outcome) => ({
      ...outcome,
      score: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find((o) => o.id === question.target);
      if (outcome) {
        outcome.score += score * (question.weight || 1);
      }
    });

    return {
      testId: testConfig.id,
      testName: testConfig.name,
      outcomes,
      result: outcomes.map((o) => `${o.name}: ${o.score}`).join(', '),
    };
  }

  private calculateCompareScore(testConfig: TestConfig, answers: any[]): any {
    // MBTI-style scoring implementation
    const outcomes = testConfig.outcomes.map((outcome) => ({
      ...outcome,
      score: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find((o) => o.id === question.target);
      if (outcome) {
        outcome.score += score > 3 ? score - 3 : 0;
      }
    });

    // MBTI specific - compare dichotomies
    const pairs = [
      ['E', 'I'],
      ['S', 'N'],
      ['T', 'F'],
      ['J', 'P'],
    ];
    const result = pairs
      .map((pair) => {
        const [a, b] = pair.map((id) => outcomes.find((o) => o.id === id));
        return a.score > b.score ? a.id : b.id;
      })
      .join('');

    return {
      testId: testConfig.id,
      testName: testConfig.name,
      outcomes,
      result,
    };
  }

  private calculateWeightedScore(testConfig: TestConfig, answers: any[]): any {
    // For tests like Enneagram or DISC
    const outcomes = testConfig.outcomes.map((outcome) => ({
      ...outcome,
      score: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find((o) => o.id === question.target);
      if (outcome) {
        outcome.score += score * (question.weight || 1);
      }
    });

    // Normalize scores
    const total = outcomes.reduce((sum, o) => sum + o.score, 0) || 1;
    outcomes.forEach((o) => (o.score = Math.round((o.score / total) * 100)));

    // Sort by score
    const sorted = [...outcomes].sort((a, b) => b.score - a.score);
    const primaryType = sorted[0];

    return {
      testId: testConfig.id,
      testName: testConfig.name,
      outcomes,
      result: primaryType.name,
      detailedResult: sorted,
    };
  }
}
