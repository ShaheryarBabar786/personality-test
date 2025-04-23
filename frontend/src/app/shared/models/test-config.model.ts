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
}

export interface TestConfig {
  id: string;
  name: string;
  type: string;
  scoringType: 'sum' | 'compare' | 'weighted' | 'custom';
  description: string;
  questions: Question[];
  outcomes: Outcome[];
  customScoring: string;
}
