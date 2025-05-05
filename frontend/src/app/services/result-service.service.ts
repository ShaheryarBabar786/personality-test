// src/app/services/results.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
  private latestResults = new BehaviorSubject<any>(null);

  storeResults(results: any) {
    const resultWithTimestamp = {
      ...results,
      timestamp: new Date().toISOString(),
    };
    this.latestResults.next(resultWithTimestamp);
    localStorage.setItem('latestTestResults', JSON.stringify(resultWithTimestamp));
  }

  getLatestResults() {
    const storedResults = localStorage.getItem('latestTestResults');
    return storedResults ? JSON.parse(storedResults) : null;
  }
}
