// test-runner.component.ts
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
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
    this.setMobileSpacing();

    // Wait for next tick to ensure DOM is ready
    setTimeout(() => {
      const container = this.topContainer?.nativeElement?.querySelector('.scrollable-content');
      if (container) {
        container.scrollTop = 0;
      }
    });
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

  selectOption(questionIndex: number, optionValue: number) {
    const currentValue = this.answers.at(questionIndex).value;

    if (currentValue === optionValue) {
      this.answers.at(questionIndex).setValue(null);
    } else {
      this.answers.at(questionIndex).setValue(optionValue);

      this.currentQuestionIndex = questionIndex;

      this.scrollToQuestion();

      if (questionIndex < this.testConfig!.questions.length - 1) {
        setTimeout(() => {
          this.currentQuestionIndex = questionIndex + 1;
          this.scrollToQuestion();
        }, 300);
      }
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

  getMobileSpacing() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const isMobileDevice = this.isRealMobileDevice();

    const defaultSpacing = {
      firstQuestionMargin: 0,
      lastQuestionMargin: 140,
      headerOffset: 10,
      buttonsOffset: -80,
      radioPyramidGap: 6,
    };
    const isExactly100PercentZoom = this.isExactly100PercentZoom();

    if (isExactly100PercentZoom && !this.isDeviceEmulationMode()) {
      return defaultSpacing;
    }
    if (!isMobileDevice && viewportWidth >= 768) {
      return defaultSpacing;
    }

    const aspectRatio = viewportWidth / viewportHeight;

    if (aspectRatio < 0.48) {
      return {
        firstQuestionMargin: 120,
        lastQuestionMargin: 280,
        headerOffset: 15,
        buttonsOffset: -100,
        radioPyramidGap: 4,
      };
    } else if (aspectRatio <= 0.55) {
      return {
        firstQuestionMargin: 60,
        lastQuestionMargin: 220,
        headerOffset: 12,
        buttonsOffset: -90,
        radioPyramidGap: 5,
      };
    } else {
      // return defaultSpacing;

      return {
        ...defaultSpacing,
        radioPyramidGap: viewportWidth <= 320 ? 3 : 6, // Very small devices get 3px, others get 6px
      };
    }
  }

  private isRealMobileDevice(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768 && window.matchMedia('(orientation: portrait)').matches)
    );
  }
  private isExactly100PercentZoom(): boolean {
    try {
      if (window.outerWidth && window.innerWidth) {
        const zoomRatio = window.outerWidth / window.innerWidth;
        return Math.abs(zoomRatio - 1) < 0.001;
      }
    } catch (e) {
      console.warn('Zoom detection failed', e);
    }
    return false;
  }

  private isDeviceEmulationMode(): boolean {
    return window.outerWidth !== window.innerWidth || navigator.userAgent.includes('Mobile') || window.innerWidth < 400;
  }

  setMobileSpacing() {
    const spacing = this.getMobileSpacing();
    const container = this.topContainer?.nativeElement;

    if (!container) return;

    container.style.setProperty('--first-question-margin', `${spacing.firstQuestionMargin}px`);
    container.style.setProperty('--last-question-margin', `${spacing.lastQuestionMargin}px`);
    container.style.setProperty('--header-offset', `${spacing.headerOffset}px`);
    container.style.setProperty('--buttons-offset', `${spacing.buttonsOffset}px`);
    container.style.setProperty('--radio-pyramid-gap', `${spacing.radioPyramidGap}px`);
  }

  scrollToQuestion() {
    setTimeout(() => {
      const element = document.getElementById(`question-${this.currentQuestionIndex}`);
      if (!element || !this.topContainer?.nativeElement) return;

      const container = this.topContainer.nativeElement.querySelector('.scrollable-content');
      const headerHeight = this.topContainer.nativeElement.querySelector('.fixed-header').offsetHeight;
      const isMobile = window.innerWidth < 768;

      if (isMobile && this.currentQuestionIndex === this.testConfig!.questions.length - 1) {
        const scrollTo = element.offsetTop - headerHeight + 20;
        const maxScroll = container.scrollHeight - container.clientHeight;
        container.scrollTo({
          top: Math.min(scrollTo, maxScroll),
          behavior: 'smooth',
        });
      } else {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const idealPosition = containerRect.height / 2 - elementRect.height / 2 - headerHeight;
        const currentPosition = elementRect.top - containerRect.top + container.scrollTop;

        container.scrollTo({
          top: currentPosition - idealPosition,
          behavior: 'smooth',
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
      finalResult: calculatedResults.finalResult,
      detailedResults: calculatedResults.detailedResult,
      resultWithPercentages: calculatedResults.resultWithPercentages,
    };

    this.testConfigService.storeTestResults(resultPayload).subscribe({
      next: () => {
        this.closeModal();
        this.router.navigate(['/'], { state: { testResults: resultPayload } });
      },
      error: (err) => {
        console.error('Failed to save results:', err, 'Payload:', resultPayload);
      },
    });
  }

  closeModal() {
    this.close.emit();
  }
  @HostListener('window:resize')
  onResize() {
    this.setMobileSpacing();
  }
}
