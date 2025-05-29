import { Injectable } from '@angular/core';
import { TestConfig } from '../shared/models/test-config.model';
import { ResultsService } from './result-service.service';

interface OutcomeResult {
  outcomes: any[];
  result: string;
  detailedResult?: any;
  resultWithPercentages?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  private scoringFunctions = new Map<string, (outcomes: any[], testConfig: TestConfig) => OutcomeResult>();

  constructor(private resultsService: ResultsService) {
    // Register default scoring functions
    this.registerScoringFunction('sum', (outcomes, testConfig) => this.calculateSumScore(outcomes, testConfig));
    this.registerScoringFunction('compare', (outcomes) => this.calculateCompareScore(outcomes));
    this.registerScoringFunction('weighted', (outcomes) => this.calculateWeightedResult(outcomes));
  }

  calculateScore(testConfig: TestConfig, answers: any[]): any {
    const outcomes = testConfig.outcomes.map((o) => ({
      ...o,
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

    let result: OutcomeResult;
    switch (testConfig.scoringType) {
      case 'sum':
        result = this.calculateSumScore(outcomes, testConfig);
        break;
      case 'compare':
        result = this.calculateCompareScore(outcomes);
        break;
      case 'weighted':
        result = this.calculateWeightedResult(outcomes);
        break;
      case 'custom':
        result = this.executeCustomScoring(testConfig, outcomes);
        break;
      default:
        result = { outcomes, result: 'Unknown scoring type' };
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

  private calculateSumScore(outcomes: any[], testConfig: TestConfig): OutcomeResult {
    // First group questions by their target outcome
    const questionsByOutcome: Record<string, any[]> = {};
    outcomes.forEach((o) => {
      questionsByOutcome[o.id] = testConfig.questions.filter((q) => q.target === o.id);
    });

    const outcomesWithPercentages = outcomes.map((o) => {
      const maxPossible = questionsByOutcome[o.id].reduce((sum, question) => {
        return sum + 7 * (question.weight || 1);
      }, 0);

      const percentage = maxPossible > 0 ? Math.round((o.score / maxPossible) * 100) : 0;
      return {
        ...o,
        percentage: percentage,
        maxPossible: maxPossible,
      };
    });

    return {
      outcomes: outcomesWithPercentages,
      result: outcomesWithPercentages.map((o) => `${o.name}: ${o.score}/${o.maxPossible} (${o.percentage}%)`).join(', '),
    };
  }

  private calculateCompareScore(outcomes: any[]): OutcomeResult {
    const dichotomies = [
      ['E', 'I'],
      ['S', 'N'],
      ['T', 'F'],
      ['J', 'P'],
    ];

    const detailedResults = dichotomies.map(([a, b]) => {
      const aOutcome = outcomes.find((o) => o.id === a) || { score: 0 };
      const bOutcome = outcomes.find((o) => o.id === b) || { score: 0 };
      const total = aOutcome.score + bOutcome.score || 1;

      return {
        dichotomy: `${a}/${b}`,
        [a]: Math.round((aOutcome.score / total) * 100),
        [b]: Math.round((bOutcome.score / total) * 100),
        winner: aOutcome.score > bOutcome.score ? a : b,
      };
    });

    const type = detailedResults.map((d) => d.winner).join('');

    const resultWithPercentages = detailedResults
      .map((d) => {
        const firstLetter = Object.keys(d)[1];
        return `${d.dichotomy}: ${d[firstLetter]}%/${d[Object.keys(d)[2]]}%`;
      })
      .join('; ');

    return {
      outcomes,
      result: type,
      detailedResult: detailedResults,
      resultWithPercentages,
    };
  }

  private calculateWeightedResult(outcomes: any[]): OutcomeResult {
    const normalizedOutcomes = outcomes.map((o) => ({
      ...o,
      normalizedScore: o.score,
    }));

    const sorted = [...normalizedOutcomes].sort((a, b) => b.normalizedScore - a.normalizedScore);

    return {
      outcomes: sorted,
      result: `${sorted[0].name} (${sorted[0].normalizedScore})`,
      detailedResult: sorted.map((o) => ({
        ...o,
        score: o.normalizedScore,
      })),
    };
  }

  // private executeCustomScoring(config: TestConfig, outcomes: any[]): OutcomeResult {
  //   if (!config.customScoring) {
  //     return { outcomes, result: 'No custom scoring function provided' };
  //   }

  //   if (this.scoringFunctions.has(config.customScoring)) {
  //     return this.scoringFunctions.get(config.customScoring)!(outcomes);
  //   }

  //   try {
  //     const customFn = new Function('outcomes', `return (${config.customScoring})(outcomes);`);
  //     return customFn(outcomes);
  //   } catch (e) {
  //     console.error('Custom scoring error:', e);
  //     return { outcomes, result: 'Error in custom scoring' };
  //   }
  // }
  private executeCustomScoring(config: TestConfig, outcomes: any[]): OutcomeResult {
    if (!config.customScoring) {
      return { outcomes, result: 'No custom scoring function provided' };
    }

    try {
      // Remove the function wrapper if present
      let customFnStr = config.customScoring.trim();
      if (customFnStr.startsWith('function')) {
        customFnStr = `(${customFnStr})`;
      }
      const customFn = new Function(`return ${customFnStr}`)();
      return customFn(outcomes);
    } catch (e) {
      console.error('Custom scoring error:', e);
      return { outcomes, result: 'Error in custom scoring' };
    }
  }

  registerScoringFunction(name: string, fn: (outcomes: any[], testConfig?: TestConfig) => OutcomeResult) {
    this.scoringFunctions.set(name, fn);
  }

  private calculateBigFiveScore(testConfig: TestConfig, answers: any[]): any {
    return this.calculateScore({ ...testConfig, scoringType: 'sum' }, answers);
  }

  private calculateMBTIScore(testConfig: TestConfig, answers: any[]): any {
    return this.calculateScore({ ...testConfig, scoringType: 'compare' }, answers);
  }

  private calculateWeightedScore(testConfig: TestConfig, answers: any[]): any {
    return this.calculateScore({ ...testConfig, scoringType: 'weighted' }, answers);
  }
}
