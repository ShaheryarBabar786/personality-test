import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TestConfigService } from '../services/test-config.service';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  showNotification = true;
  tests: any[] = [];

  constructor(
    private router: Router,
    private testConfigService: TestConfigService,
  ) {
    this.loadTests();
  }

  loadTests() {
    this.testConfigService.getTestList().subscribe({
      next: (tests) => {
        this.tests = tests;
      },
      error: (err) => {
        console.error('Error loading tests:', err); // Check for errors
      },
    });
  }

  startTest(testId: string) {
    this.router.navigate(['/test-runner', testId]);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  closeNotification() {
    this.showNotification = false;
  }
}
