// test-runner.component.ts
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultsService } from 'src/app/services/result-service.service';
import { ScoringService } from '../../services/scoring.service';
import { TestConfigService } from '../../services/test-config.service';
import { TestConfig } from '../../shared/models/test-config.model';

@Component({
  selector: 'app-test-runner',
  templateUrl: './test-runner.component.html',
  styleUrls: ['./test-runner.component.css'],
})
export class TestRunnerComponent implements OnInit, AfterViewInit {
  @Input() testId: string | null = null;
  @Output() close = new EventEmitter<void>();

  testForm: FormGroup;
  testConfig: TestConfig | null = null;
  currentQuestionIndex = 0;
  selectedLanguage = 'english'; // Default language

  constructor(
    private testConfigService: TestConfigService,
    private fb: FormBuilder,
    private scoringService: ScoringService,
    private router: Router,
    private resultsService: ResultsService,
  ) {
    this.testForm = this.fb.group({
      answers: this.fb.array([]),
    });
  }

  ngOnInit() {
    if (this.testId) {
      this.loadTestConfig(this.testId);
    }
  }

  ngAfterViewInit() {
    this.scrollToQuestion();
  }

  loadTestConfig(testId: string) {
    this.testConfigService.getTestConfig(testId).subscribe({
      next: (config) => {
        this.testConfig = config;
        this.initForm();
      },
      error: (err) => {
        console.error('Failed to load test config:', err);
      },
    });
  }

  initForm() {
    this.answers.clear();
    this.testConfig?.questions.forEach(() => {
      this.answers.push(this.fb.control(null));
    });
  }

  selectOption(questionIndex: number, optionValue: number) {
    this.answers.at(questionIndex).setValue(optionValue);
  }

  get answers(): FormArray {
    return this.testForm.get('answers') as FormArray;
  }

  get answeredQuestionsCount(): number {
    return this.answers.controls.filter((control) => control.value !== null).length;
  }

  get progressPercentage(): number {
    return this.testConfig?.questions?.length ? (this.answeredQuestionsCount / this.testConfig.questions.length) * 100 : 0;
  }

  nextQuestion() {
    if (this.testConfig && this.currentQuestionIndex < this.testConfig.questions.length - 1) {
      this.currentQuestionIndex++;
      this.scrollToQuestion();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.scrollToQuestion();
    }
  }

  scrollToQuestion() {
    setTimeout(() => {
      const element = document.getElementById(`question-${this.currentQuestionIndex}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  getOptionLabel(value: number): string {
    const labels: Record<number, string> = {
      1: this.getTranslation('Strongly Disagree'),
      2: this.getTranslation('Disagree'),
      3: this.getTranslation('Neutral'),
      4: this.getTranslation('Agree'),
      5: this.getTranslation('Strongly Agree'),
    };
    return labels[value] || '';
  }

  getTranslatedText(text: string | { translations: any }): string {
    if (typeof text === 'string') return text;
    return text.translations?.[this.selectedLanguage] || text;
  }

  getTranslation(key: string): string {
    return key;
  }

  // submitTest() {
  //   if (!this.testConfig) {
  //     console.error('Test config not loaded or form incomplete');
  //     return;
  //   }

  //   // Get answers (default to 3 if null)
  //   const answers = this.answers.value.map((val: number | null) => val ?? 3);

  //   // Calculate scores
  //   const results = this.scoringService.calculateScore(this.testConfig, answers);

  //   // Log results to console
  //   console.log('Test Results:', {
  //     testId: this.testConfig.id,
  //     testName: this.testConfig.name,
  //     answers: answers,
  //     calculatedResults: results,
  //   });

  //   // Detailed breakdown
  //   console.group('Detailed Results Breakdown');
  //   console.log('Outcomes:', results.outcomes);
  //   console.log('Final Result:', results.result);
  //   if (results.detailedResult) {
  //     console.log('Detailed Analysis:', results.detailedResult);
  //   }
  //   console.groupEnd();

  //   // Close modal and navigate
  //   this.closeModal();
  //   this.router.navigate(['/'], {
  //     state: { testResults: results },
  //   });
  // }
  submitTest() {
    if (!this.testConfig) {
      console.error('Test config not loaded or form incomplete');
      return;
    }

    const answers = this.answers.value.map((val: number | null) => val ?? 3);

    const calculatedResults = this.scoringService.calculateScore(this.testConfig, answers);
    const resultPayload = {
      testId: this.testConfig.id,
      testName: this.testConfig.name,
      timestamp: new Date().toISOString(),
      finalResult: calculatedResults.result,
    };

    this.testConfigService.storeTestResults(resultPayload).subscribe({
      next: () => {
        console.log('Results saved successfully');
        this.closeModal();
        this.router.navigate(['/'], {
          state: { testResults: resultPayload },
        });
      },
      error: (err) => {
        console.error('Failed to save results:', err);
        this.closeModal();
        this.router.navigate(['/'], {
          state: { testResults: resultPayload },
        });
      },
    });
  }

  closeModal() {
    this.close.emit();
  }
}
