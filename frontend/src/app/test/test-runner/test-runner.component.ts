// test-runner.component.ts
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
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
  @ViewChild('topContainer') topContainer!: ElementRef;

  testForm: FormGroup;
  testConfig: TestConfig | null = null;
  currentQuestionIndex = 0;
  selectedLanguage = 'english';

  private hasInitialized = false;

  constructor(
    private testConfigService: TestConfigService,
    private fb: FormBuilder,
    private scoringService: ScoringService,
    private router: Router,
    private resultsService: ResultsService,
    public languageService: LanguageService,
    public translate: TranslateService,
  ) {
    this.testForm = this.fb.group({
      answers: this.fb.array([]),
    });
  }

  ngOnInit() {
    if (this.testId) {
      this.loadTestConfig(this.testId);
    }

    // Subscribe to language changes
    this.languageService.languageChanged.subscribe(() => {
      if (this.testId) {
        this.loadTestConfig(this.testId);
      }
    });
  }
  ngAfterViewInit() {
    this.scrollToQuestion();
    this.scrollToTop();
  }

  loadTestConfig(testId: string) {
    const currentLanguage = this.languageService.getCurrentLanguage();
    this.testConfigService.getTestConfig(testId, currentLanguage).subscribe({
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

  // selectOption(questionIndex: number, optionValue: number) {
  //   this.answers.at(questionIndex).setValue(optionValue);

  //   if (questionIndex < this.testConfig!.questions.length - 1) {
  //     this.currentQuestionIndex = questionIndex + 1;
  //     this.scrollToQuestion();
  //   }
  // }

selectOption(questionIndex: number, optionValue: number) {
  const currentValue = this.answers.at(questionIndex).value;

  if (currentValue === optionValue) {
    this.answers.at(questionIndex).setValue(null);
  } else {
    this.answers.at(questionIndex).setValue(optionValue);
  }

  if (questionIndex < this.testConfig!.questions.length - 1) {
    this.currentQuestionIndex = questionIndex + 1;
    this.scrollToQuestion();
  }
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
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }, 50);
  }
  shouldHighlightDisagree(questionIndex: number): boolean {
    const answer = this.answers.at(questionIndex).value;
    return answer !== null && answer <= 3;
  }

  shouldHighlightAgree(questionIndex: number): boolean {
    const answer = this.answers.at(questionIndex).value;
    return answer !== null && answer >= 5;
  }

  getOptionLabel(value: number): string {
    const labels: Record<number, string> = {
      1: this.translate.instant('TEST.OPTIONS.STRONGLY_DISAGREE'),
      2: this.translate.instant('TEST.OPTIONS.DISAGREE'),
      3: this.translate.instant('TEST.OPTIONS.NEUTRAL'),
      4: this.translate.instant('TEST.OPTIONS.AGREE'),
      5: this.translate.instant('TEST.OPTIONS.STRONGLY_AGREE'),
    };
    return labels[value] || '';
  }
  getTranslatedQuestionText(question: any): string {
    if (typeof question.text === 'string') return question.text;

    const currentLang = this.languageService.getCurrentLanguage();
    switch (currentLang) {
      case 'french':
        return question.translations?.French || question.text;
      case 'spanish':
        return question.translations?.Spanish || question.text;
      default:
        return question.text;
    }
  }

  getTranslatedText(text: string | { translations: any }): string {
    if (typeof text === 'string') return text;
    return text.translations?.[this.selectedLanguage] || text;
  }
  resetScrollPosition() {
    this.hasInitialized = false;
    this.scrollToTop();
  }

  getTranslation(key: string): string {
    return key;
  }
  scrollToTop() {
    setTimeout(() => {
      if (this.topContainer?.nativeElement) {
        this.topContainer.nativeElement.scrollTop = 0;
      }
    });
  }

  // submitTest() {
  //   if (!this.testConfig) {
  //     console.error('Test config not loaded or form incomplete');
  //     return;
  //   }

  //   const answers = this.answers.value.map((val: number | null) => val ?? 3);

  //   const calculatedResults = this.scoringService.calculateScore(this.testConfig, answers);
  //   const resultPayload = {
  //     testId: this.testConfig.id,
  //     testName: this.testConfig.name,
  //     timestamp: new Date().toISOString(),
  //     finalResult: calculatedResults.result,
  //   };

  //   this.testConfigService.storeTestResults(resultPayload).subscribe({
  //     next: () => {
  //       console.log('Results saved successfully');
  //       this.closeModal();
  //       this.router.navigate(['/'], {
  //         state: { testResults: resultPayload },
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Failed to save results:', err);
  //       this.closeModal();
  //       this.router.navigate(['/'], {
  //         state: { testResults: resultPayload },
  //       });
  //     },
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

    // Set the current test ID before storing results
    this.testConfigService.setCurrentTestId(this.testConfig.id);

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
