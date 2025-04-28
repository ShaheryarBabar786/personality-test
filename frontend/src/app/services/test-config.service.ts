// test-config.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment
import { TestConfig } from '../shared/models/test-config.model';

@Injectable({
  providedIn: 'root',
})
export class TestConfigService {
  private apiUrl = `${environment.apiUrl}/personality`; // NestJS endpoint

  constructor(private http: HttpClient) {}

  getTestList(): Observable<TestConfig[]> {
    return this.http.get<TestConfig[]>(`${this.apiUrl}`); // GET /personality
  }

  // getTestConfig(testId: string): Observable<TestConfig> {
  //   return this.http.get<TestConfig>(`${this.apiUrl}/${testId}`); // GET /personality/:id
  // }
  getTestConfig(testId: string): Observable<any> {
    console.log('Requesting test:', testId);
    return this.http.get<any>(`${this.apiUrl}/${testId}`).pipe(
      tap({
        next: (res) => console.log('Received test config:', res),
        error: (err) => console.error('Error fetching test:', err),
      }),
    );
  }

  createTestConfig(test: TestConfig): Observable<any> {
    return this.http.post(`${this.apiUrl}`, test); // POST /personality
  }

  updateTestConfig(test: TestConfig): Observable<any> {
    return this.http.put(`${this.apiUrl}/${test.id}`, test); // PUT /personality/:id
  }

  deleteTestConfig(testId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${testId}`); // DELETE /personality/:id
  }
}
