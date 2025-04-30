import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../services/modal.service';
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
  isSelected = false;
  modalOpen = false;
  selectedTestId: string | null = null;

  constructor(
    private router: Router,
    private testConfigService: TestConfigService,
    private modalService: ModalService,
  ) {
    this.loadTests();
  }

  loadTests() {
    this.testConfigService.getTestList().subscribe({
      next: (tests) => {
        this.tests = tests;
      },
      error: (err) => {
        console.error('Error loading tests:', err);
      },
    });
  }

  startTest(testId: string) {
    this.selectedTestId = testId;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedTestId = null;
  }

  onRadioChange(state: boolean) {
    this.isSelected = state;
  }

  toggleRadio() {
    this.isSelected = !this.isSelected;
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  closeNotification() {
    this.showNotification = false;
  }
}
