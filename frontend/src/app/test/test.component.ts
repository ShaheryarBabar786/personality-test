import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ModalService } from '../services/modal.service';
import { TestConfigService } from '../services/test-config.service';
import { TestRunnerComponent } from './test-runner/test-runner.component';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  @ViewChild(TestRunnerComponent) testRunner!: TestRunnerComponent;
  showNotification = true;
  tests: any[] = [];
  isSelected = false;
  modalOpen = false;
  selectedTestId: string | null = null;
  max: number = 1;
  value: number = 0;
  imageUrl: string =
    'assets/african-american-boy-with-black-power-hair-yellow-smiling-black-kid-with-black-power-hair-black-boy-with-black-power-hair-african-descent_63135-682.jpg';

  constructor(
    private router: Router,
    private testConfigService: TestConfigService,
    private modalService: ModalService,
    public languageService: LanguageService,
    public translate: TranslateService,
  ) {
    this.loadTests();
  }
  progressColors = {
    background: '#000000',
    foreground: '#000000',
  };

  loadTests() {
    this.testConfigService.getTestList().subscribe({
      next: (tests) => {
        this.tests = tests;
        console.log('Available tests:', tests);
      },
      error: (err) => {
        console.error('Error loading tests:', err);
      },
    });
  }

  startTest(testId: string) {
    this.selectedTestId = testId;
    this.modalOpen = true;
    this.toggleBodyScroll(false);

    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }

      if (this.testRunner) {
        this.testRunner.scrollToTop();
      }
    }, 100);
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedTestId = null;
    this.toggleBodyScroll(true);
  }

  onRadioChange(state: boolean) {
    this.isSelected = state;
  }

  toggleRadio() {
    this.isSelected = !this.isSelected;
  }

  goToAdmin() {
    this.router.navigate(['/']);
  }
  private toggleBodyScroll(enable: boolean): void {
    if (enable) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }

  closeNotification() {
    this.showNotification = false;
  }
}
