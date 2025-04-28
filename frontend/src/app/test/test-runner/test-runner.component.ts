// test-runner.component.ts
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ScoringService } from '../../services/scoring.service';
import { TestConfigService } from '../../services/test-config.service';

@Component({
  selector: 'app-test-runner',
  standalone: false,
  templateUrl: './test-runner.component.html',
  styleUrl: './test-runner.component.css',
})
export class TestRunnerComponent {
  testForm: FormGroup;
  testConfig: any;
  currentQuestionIndex = 0;
  progress = 0;

  constructor(
    private route: ActivatedRoute,
    private testConfigService: TestConfigService,
    private fb: FormBuilder,
    private scoringService: ScoringService,
  ) {
    this.testForm = this.fb.group({
      answers: this.fb.array([]),
    });
  }

  ngOnInit() {
    const testId = this.route.snapshot.paramMap.get('testId');
    if (!testId) {
      console.error('No test ID provided');
      // Optionally redirect back
      return;
    }

    this.testConfigService.getTestConfig(testId).subscribe({
      next: (config) => {
        this.testConfig = config;
        this.initForm();
      },
      error: (err) => {
        console.error('Failed to load test config:', err);
        // Handle error (show message, redirect, etc.)
      },
    });
  }

  get answers() {
    return this.testForm.get('answers') as FormArray;
  }

  private initForm() {
    this.answers.clear();
    this.testConfig.questions.forEach(() => {
      this.answers.push(this.fb.control(null));
    });
    this.updateProgress();
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.testConfig.questions.length - 1) {
      this.currentQuestionIndex++;
      this.updateProgress();
      this.scrollToQuestion();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.updateProgress();
      this.scrollToQuestion();
    }
  }
  getOptionLabel(value: number): string {
    const labels: { [key: number]: string } = {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree',
    };
    return labels[value] || '';
  }

  submitTest() {
    const results = this.scoringService.calculateScore(this.testConfig, this.testForm.value.answers);
    // Save results or navigate to visualization
  }

  private updateProgress() {
    this.progress = ((this.currentQuestionIndex + 1) / this.testConfig.questions.length) * 100;
  }

  private scrollToQuestion() {
    const element = document.getElementById(`question-${this.currentQuestionIndex}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
