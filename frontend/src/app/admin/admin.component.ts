import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { ResultsService } from '../services/result-service.service';
import { TestConfigService } from '../services/test-config.service';
import { TestConfig } from '../shared/models/test-config.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  adminForm: FormGroup;
  selectedLanguage: string = 'english';
  testData: string = '';
  testList: TestConfig[] = [];
  selectedTest: TestConfig | null = null;
  editingQuestionIndex: number | null = null;
  newQuestion: any = this.createEmptyQuestion();
  textUpdates: any;
  selectedTestId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private resultsService: ResultsService,
    private testConfigService: TestConfigService,
    public languageService: LanguageService,
  ) {
    this.adminForm = this.fb.group({
      language: [this.languageService.getCurrentLanguage()],
      testResultJson: [''],
    });
    this.loadTests();
  }

  ngOnInit() {
    this.loadAllTestResults();
    this.testConfigService.currentTestId$.subscribe((testId) => {
      if (testId) {
        this.loadAllTestResults(testId);
      }
    });
  }

  loadTests() {
    this.testConfigService.getTestList().subscribe((tests) => {
      this.testList = tests;
    });
  }
  onLanguageChange(language: string) {
    this.languageService.setLanguage(language);
  }

  loadAllTestResults(testId?: string): void {
    this.testConfigService.getAllTestResults().subscribe({
      next: (allResults) => {
        // Filter results by testId if provided
        const filteredResults = testId ? allResults.filter((test) => test.id === testId) : allResults;
        this.formatResults(filteredResults);
      },
      error: (err) => {
        console.error('Error loading test results:', err);
        this.testData = 'Error loading test results';
      },
    });
  }

  formatResults(allResults: any[]): void {
    let formattedResults = '';

    allResults.forEach((testConfig) => {
      if (testConfig.results && testConfig.results.length > 0) {
        // Show only the latest result for each test
        const latestResult = [...testConfig.results].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        const dateOnly = latestResult.timestamp.split('T')[0];
        formattedResults += `Test Name: ${testConfig.name}\n`;
        formattedResults += `Test Date: ${dateOnly}\n`;
        formattedResults += `Test Result: ${latestResult.finalResult}\n`;
        formattedResults += '---------------------------------\n';
      }
    });

    this.testData = formattedResults || 'No test results available yet';
  }

  selectTest(testId: string) {
    this.testConfigService.getTestConfig(testId).subscribe({
      next: (test) => {
        this.selectedTest = test;
        this.editingQuestionIndex = null;
        this.newQuestion = this.createEmptyQuestion();
      },
      error: (err) => {
        console.error('Error loading test:', err);
      },
    });
  }

  createEmptyQuestion() {
    return {
      id: `q${Date.now()}`,
      text: '',
      target: '',
      isReversed: false,
      weight: 1,
      translations: {
        french: '',
        spanish: '',
      },
    };
  }

  addQuestion() {
    if (this.selectedTest) {
      this.selectedTest.questions.push({ ...this.newQuestion });
      this.newQuestion = this.createEmptyQuestion();
    }
  }

  editQuestion(index: number) {
    if (this.selectedTest) {
      this.editingQuestionIndex = index;
      const question = this.selectedTest.questions[index];
      this.newQuestion = {
        ...question,
        translations: {
          french: question.translations?.French || '',
          spanish: question.translations?.Spanish || '',
        },
      };
    }
  }
  onTestSelect() {
    if (this.selectedTestId) {
      this.selectTest(this.selectedTestId);
    } else {
      this.selectedTest = null;
    }
  }

  closeModal() {
    this.selectedTest = null;
    this.selectedTestId = null;
  }

  // updateQuestion() {
  //   if (this.selectedTest && this.editingQuestionIndex !== null) {
  //     this.selectedTest.questions[this.editingQuestionIndex] = { ...this.newQuestion };
  //     this.cancelEdit();
  //   }
  // }
  updateQuestion() {
    if (this.selectedTest && this.editingQuestionIndex !== null) {
      // Format translations correctly before updating
      const formattedTranslations = {
        French: this.newQuestion.translations.french,
        Spanish: this.newQuestion.translations.spanish,
      };

      this.selectedTest.questions[this.editingQuestionIndex] = {
        ...this.newQuestion,
        translations: formattedTranslations,
      };
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingQuestionIndex = null;
    this.newQuestion = this.createEmptyQuestion();
  }

  removeQuestion(index: number) {
    if (this.selectedTest && confirm('Are you sure you want to delete this question?')) {
      this.selectedTest.questions.splice(index, 1);
    }
  }

  saveTest() {
    if (this.selectedTest) {
      this.testConfigService.updateTestConfig(this.selectedTest).subscribe({
        next: () => {
          alert('Test updated successfully!');
          this.loadTests();
        },
        error: (err) => {
          console.error('Error saving test:', err);
          alert('Error saving test');
        },
      });
    }
  }

  addNewTextUpdate(): void {
    this.textUpdates.push({ id: 'testupdate' + (this.textUpdates.length + 1), value: '' });
  }

  goToTestRunner(): void {
    this.router.navigate(['/test']);
  }

  showAllResults() {
    this.testConfigService.setCurrentTestId(null);
    this.loadAllTestResults();
  }

  refreshResults() {
    this.loadAllTestResults();
  }

  saveTextUpdates(): void {
    alert('Text updates saved!');
  }
}
