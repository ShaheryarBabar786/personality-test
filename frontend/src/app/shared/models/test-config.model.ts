export interface Translations {
  English?: string;
  French?: string;
  Spanish?: string;
  [key: string]: string | undefined;
}

export interface Question {
  id: string;
  text: string;
  translations: Translations;
  isReversed: boolean;
  target: string;
  weight: number;
}

export interface Outcome {
  id: string;
  name: string;
  translations: Translations;
  description: string;
  score?: number;
  maxPossible?: number;
  percentage?: number;
  rawScore?: number;
  normalizedScore?: number;
}

export interface TestConfig {
  id: string;
  name: string;
  description?: string;
  type?: string; // 'custom', 'big-five', 'mbti', etc.
  scoringType: 'sum' | 'compare' | 'weighted' | 'custom';

  questions: Question[];
  outcomes: Outcome[];
  customScoring?: string; // Function as string
  results?: any[]; // Historical results
}
