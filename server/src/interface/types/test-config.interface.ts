// src/app/interfaces/test-config.interface.ts
export interface Question {
    id: string;
    text: string;
    translations: Record<string, string>;
    isReversed: boolean;
    target: string;
    weight?: number;
  }
  
  export interface Outcome {
    id: string;
    name: string;
    translations: Record<string, string>;
    description: string;
  }
  
  export interface TestConfig {
    id: string;
    name: string;
    type: string;
    scoringType: string;
    description: string;
    questions: Question[];
    outcomes: Outcome[];
    customScoring?: string;
  }