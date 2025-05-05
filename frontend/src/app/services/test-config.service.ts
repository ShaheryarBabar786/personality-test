// test-config.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TestConfig } from '../shared/models/test-config.model';

@Injectable({
  providedIn: 'root',
})
export class TestConfigService {
  private apiUrl = `${environment.apiUrl}/personality`;

  constructor(private http: HttpClient) {}

  getTestList(): Observable<TestConfig[]> {
    return this.http.get<TestConfig[]>(`${this.apiUrl}`);
  }
  getTestConfig(testId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${testId}`).pipe(
      tap({
        next: (res) => console.log('Data received'),
        error: (err) => console.error('Error fetching test:', err),
      }),
    );
  }
  storeTestResults(results: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/results`, results);
  }

  createTestConfig(test: TestConfig): Observable<any> {
    return this.http.post(`${this.apiUrl}`, test);
  }

  updateTestConfig(test: TestConfig): Observable<any> {
    return this.http.put(`${this.apiUrl}/${test.id}`, test);
  }

  deleteTestConfig(testId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${testId}`);
  }
}
