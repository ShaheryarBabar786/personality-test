import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TestConfig } from '../shared/models/test-config.model';

@Injectable({
  providedIn: 'root',
})
export class TestConfigService {
  private mockTests: TestConfig[] = [
    {
      id: 'big-five',
      name: 'Big Five Personality Test',
      type: 'Big Five',
      scoringType: 'sum',
      description: 'Measures five broad personality traits',
      questions: [
        {
          id: 'q1',
          text: 'I am outgoing.',
          translations: { French: '', Spanish: '' },
          isReversed: false,
          target: 'extraversion',
          weight: 1,
        },
      ],
      outcomes: [
        { id: 'openness', name: 'Openness', translations: { French: '', Spanish: '' }, description: '' },
        { id: 'conscientiousness', name: 'Conscientiousness', translations: { French: '', Spanish: '' }, description: '' },
      ],
      customScoring: '',
    },
  ];

  constructor(private http: HttpClient) {}

  getTestList(): Observable<TestConfig[]> {
    // In a real app, this would be an HTTP call
    return of(this.mockTests);
  }

  getTestConfig(testId: string): Observable<TestConfig> {
    // In a real app, this would be an HTTP call
    const test = this.mockTests.find((t) => t.id === testId);
    return of(test ? { ...test } : this.createBlankTest());
  }

  createTestConfig(test: TestConfig): Observable<any> {
    // In a real app, this would be an HTTP call
    this.mockTests.push(test);
    return of({ success: true });
  }

  updateTestConfig(test: TestConfig): Observable<any> {
    // In a real app, this would be an HTTP call
    const index = this.mockTests.findIndex((t) => t.id === test.id);
    if (index >= 0) {
      this.mockTests[index] = test;
    }
    return of({ success: true });
  }

  deleteTestConfig(testId: string): Observable<any> {
    // In a real app, this would be an HTTP call
    this.mockTests = this.mockTests.filter((t) => t.id !== testId);
    return of({ success: true });
  }

  private createBlankTest(): TestConfig {
    return {
      id: '',
      name: '',
      type: '',
      scoringType: 'sum',
      description: '',
      questions: [],
      outcomes: [],
      customScoring: '',
    };
  }
}
