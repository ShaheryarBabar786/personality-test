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
  private scoringFunctions = new Map<string, (outcomes: any[], testConfig: TestConfig, answers: any[]) => OutcomeResult>();

  constructor(private resultsService: ResultsService) {
    // Register default scoring functions
    this.registerScoringFunction('sum', (outcomes, testConfig) => this.calculateSumScore(outcomes, testConfig));
    this.registerScoringFunction('compare', (outcomes, testConfig, answers) => this.calculateCompareScore(outcomes, testConfig, answers));
    this.registerScoringFunction('weighted', (outcomes, testConfig) => this.calculateWeightedResult(outcomes, testConfig));
    this.registerScoringFunction('workplace-scoring', (outcomes) => this.workplaceScoring(outcomes));
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
        result = this.calculateCompareScore(outcomes, testConfig, answers);
        break;
      case 'weighted':
        result = this.calculateWeightedResult(outcomes, testConfig);
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
      finalResult: result.result || 'Unknown',
      detailedResults: result.detailedResult,
      resultWithPercentages: result.resultWithPercentages,
      outcomes: result.outcomes,
    };

    this.resultsService.storeResults(fullResult);
    return fullResult;
  }

  private calculateSumScore(outcomes: any[], testConfig: TestConfig): OutcomeResult {
    const questionsByOutcome: Record<string, any[]> = {};
    outcomes.forEach((o) => {
      questionsByOutcome[o.id] = testConfig.questions.filter((q) => q.target === o.id);
    });

    const outcomesWithPercentages = outcomes.map((o) => {
      const questions = questionsByOutcome[o.id] || [];
      const maxPossible = questions.length * 5;
      const percentage = maxPossible > 0 ? Math.round((o.score / maxPossible) * 100) : 0;

      return {
        ...o,
        percentage,
        maxPossible,
      };
    });

    return {
      outcomes: outcomesWithPercentages,
      result: outcomesWithPercentages.map((o) => `${o.name}: ${o.percentage}%`).join(', '),
      detailedResult: outcomesWithPercentages,
    };
  }

  private calculateCompareScore(outcomes: any[], testConfig: TestConfig, answers: any[]): OutcomeResult {
    const dichotomies = [
      ['E', 'I'],
      ['S', 'N'],
      ['T', 'F'],
      ['J', 'P'],
    ];

    const outcomeScores = outcomes.map((o) => ({
      ...o,
      score: 0,
    }));

    testConfig.questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === null || answer === undefined) return;

      const dichotomy = dichotomies.find((d) => d.includes(question.target));
      if (!dichotomy) return;

      const [first, second] = dichotomy;
      const isFirst = question.target === first;
      let points = answer;

      if (question.isReversed) {
        points = 6 - answer;
      }

      if (points > 3) {
        const outcome = outcomeScores.find((o) => o.id === (isFirst ? first : second));
        if (outcome) outcome.score += points - 3;
      } else if (points < 3) {
        const outcome = outcomeScores.find((o) => o.id === (isFirst ? second : first));
        if (outcome) outcome.score += 3 - points;
      }
    });

    const detailedResults = dichotomies.map(([a, b]) => {
      const aScore = outcomeScores.find((o) => o.id === a)?.score || 0;
      const bScore = outcomeScores.find((o) => o.id === b)?.score || 0;
      const total = aScore + bScore || 1;

      return {
        dichotomy: `${a}/${b}`,
        [a]: Math.round((aScore / total) * 100),
        [b]: Math.round((bScore / total) * 100),
        winner: aScore > bScore ? a : b,
      };
    });

    const type = detailedResults.map((d) => d.winner).join('');

    const percentageString = detailedResults
      .map((d) => {
        const letters = d.dichotomy.split('/');
        return `${letters[0]}/${letters[1]}: ${d[letters[0]]}%/${d[letters[1]]}%`;
      })
      .join('; ');

    return {
      outcomes: outcomeScores,
      result: type,
      detailedResult: detailedResults,
      resultWithPercentages: percentageString,
    };
  }

  private calculateWeightedResult(outcomes: any[], testConfig: TestConfig): OutcomeResult {
    const totalWeight = testConfig.questions.reduce((sum, q) => sum + (q.weight || 1), 0);

    const maxPossibleScore = totalWeight * 5;

    const outcomesWithPercentages = outcomes.map((o) => ({
      ...o,
      percentage: Math.round((o.score / maxPossibleScore) * 100),
    }));

    const sorted = [...outcomesWithPercentages].sort((a, b) => b.percentage - a.percentage);

    return {
      outcomes: sorted,
      result: `${sorted[0].name} (${sorted[0].percentage}%)`,
      detailedResult: sorted,
    };
  }

  private workplaceScoring(outcomes: any[]): OutcomeResult {
    const maxScore = 20 * 5;
    const threshold = 0.7 * maxScore;

    outcomes.forEach((o) => (o.score = Math.round((o.score / maxScore) * 100)));

    const sorted = [...outcomes].sort((a, b) => b.score - a.score);
    let result;

    if (sorted[0].score >= threshold) {
      result = sorted[0].name;
    } else if (sorted[0].score - sorted[1].score <= 10) {
      result = `${sorted[0].name}/${sorted[1].name} Hybrid`;
    } else {
      result = sorted[0].name;
    }

    return {
      outcomes: outcomes,
      result: result,
      detailedResult: sorted,
    };
  }

  private executeCustomScoring(config: TestConfig, outcomes: any[]): OutcomeResult {
    if (!config.customScoring) {
      return { outcomes, result: 'No custom scoring function provided' };
    }
    if (this.scoringFunctions.has(config.customScoring)) {
      return this.scoringFunctions.get(config.customScoring)(outcomes, config, []);
    }

    try {
      const customFn = new Function(`return ${config.customScoring}`)();
      return customFn(outcomes);
    } catch (e) {
      console.error('Custom scoring error:', e);
      return { outcomes, result: 'Error in custom scoring' };
    }
  }

  registerScoringFunction(name: string, fn: (outcomes: any[], testConfig?: TestConfig, answers?: any[]) => OutcomeResult) {
    this.scoringFunctions.set(name, fn);
  }
}
