import { Injectable } from '@angular/core';
import { TestConfig } from '../shared/models/test-config.model';
import { ResultsService } from './result-service.service';

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  constructor(private resultsService: ResultsService) {}

  calculateScore(testConfig: TestConfig, answers: any[]): any {
    let result;
    switch (testConfig.scoringType) {
      case 'sum':
        result = this.calculateBigFiveScore(testConfig, answers);
        break;
      case 'compare':
        result = this.calculateMBTIScore(testConfig, answers);
        break;
      case 'weighted':
        result = this.calculateWeightedScore(testConfig, answers);
        break;
      default:
        result = this.calculateBigFiveScore(testConfig, answers);
    }

    const fullResult = {
      testId: testConfig.id,
      testName: testConfig.name,
      configUsed: testConfig,
      answers,
      timestamp: new Date().toISOString(),
      ...result,
    };

    this.resultsService.storeResults(fullResult);
    return fullResult;
  }

  private calculateBigFiveScore(testConfig: TestConfig, answers: any[]): any {
    const outcomes = testConfig.outcomes.map((outcome) => ({
      ...outcome,
      score: 0,
      maxPossible: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find((o) => o.id === question.target);

      if (outcome) {
        outcome.score += score;
        outcome.maxPossible += 5;
      }
    });

    const outcomesWithPercentages = outcomes.map((o) => {
      const percentage = Math.round((o.score / o.maxPossible) * 100);
      return {
        ...o,
        percentage: percentage,
      };
    });

    return {
      outcomes: outcomesWithPercentages,
      result: outcomesWithPercentages.map((o) => `${o.name}: ${o.score}/${o.maxPossible} (${o.percentage}%)`).join(', '),
    };
  }

  private calculateMBTIScore(testConfig: TestConfig, answers: any[]): any {
    const dichotomies = [
      ['E', 'I'],
      ['S', 'N'],
      ['T', 'F'],
      ['J', 'P'],
    ];

    const outcomes = dichotomies.flat().map((id) => ({
      id,
      name: testConfig.outcomes.find((o) => o.id === id)?.name || id,
      score: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const points = Math.abs(answer - 3);
      const pair = dichotomies.find((d) => d.includes(question.target));

      if (pair) {
        const isFirstInPair = pair[0] === question.target;
        const direction = answer > 3 ? 1 : -1;
        const effectiveDirection = question.isReversed ? -direction : direction;

        if (effectiveDirection > 0) {
          outcomes.find((o) => o.id === pair[0])!.score += points;
        } else {
          outcomes.find((o) => o.id === pair[1])!.score += points;
        }
      }
    });

    const type = dichotomies.map(([a, b]) => (outcomes.find((o) => o.id === a)!.score > outcomes.find((o) => o.id === b)!.score ? a : b)).join('');

    return {
      outcomes,
      result: type,
      detailedResult: dichotomies.map(([a, b]) => {
        const aOutcome = outcomes.find((o) => o.id === a)!;
        const bOutcome = outcomes.find((o) => o.id === b)!;
        const total = aOutcome.score + bOutcome.score || 1;
        return {
          dichotomy: `${a}/${b}`,
          [a]: Math.round((aOutcome.score / total) * 100),
          [b]: Math.round((bOutcome.score / total) * 100),
        };
      }),
    };
  }
  private calculateWeightedScore(testConfig: TestConfig, answers: any[]): any {
    const outcomes = testConfig.outcomes.map((outcome) => ({
      ...outcome,
      rawScore: 0,
      normalizedScore: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const score = question.isReversed ? 6 - answer : answer;
      const outcome = outcomes.find((o) => o.id === question.target);
      if (outcome) {
        outcome.rawScore += score * (question.weight || 1);
      }
    });

    const totalWeight = testConfig.questions.reduce((sum, q) => sum + (q.weight || 1), 0);

    outcomes.forEach((o) => {
      o.normalizedScore = Math.round((o.rawScore / (totalWeight * 5)) * 100);
    });

    const sorted = [...outcomes].sort((a, b) => b.normalizedScore - a.normalizedScore);

    return {
      outcomes: sorted,
      result: `${sorted[0].name} (${sorted[0].normalizedScore}%)`,
      detailedResult: sorted.map((o) => ({
        ...o,
        score: o.normalizedScore,
      })),
    };
  }
}
