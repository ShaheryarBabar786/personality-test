import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { ResultsService } from '../services/result-service.service';
import { ScoringService } from '../services/scoring.service';
import { TestConfigService } from '../services/test-config.service';
import { Outcome, TestConfig } from '../shared/models/test-config.model';

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
  selectedTestId: string | null = null;
  latestTestResult: string = '';
  newTestCustomScoring: string = '';
  copiedToClipboard: boolean = false;

  // Question editing
  editingQuestionIndex: number | null = null;
  newQuestion: any = this.createEmptyQuestion();

  // Outcome editing
  editingOutcomeIndex: number | null = null;
  newOutcome: any = this.createEmptyOutcome();

  // Test creation
  showCreationModal = false;
  newTestType = 'custom';
  newTestName = '';
  newTestDescription = '';
  isCustomTest = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private resultsService: ResultsService,
    private testConfigService: TestConfigService,
    public languageService: LanguageService,
    public scoringService: ScoringService,
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

  // Core methods
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
        let allTestResults: any[] = [];

        allResults.forEach((testConfig) => {
          if (testConfig.results) {
            testConfig.results.forEach((result) => {
              allTestResults.push({
                testConfig,
                result,
              });
            });
          }
        });

        if (testId) {
          allTestResults = allTestResults.filter((item) => item.testConfig.id === testId);
        }

        // Find the single most recent result
        if (allTestResults.length > 0) {
          const mostRecent = allTestResults.reduce((latest, current) => {
            const latestTime = new Date(latest.result.timestamp).getTime();
            const currentTime = new Date(current.result.timestamp).getTime();
            return currentTime > latestTime ? current : latest;
          });

          this.formatLatestResult(mostRecent.testConfig, mostRecent.result);
        } else {
          this.testData = 'No test results available yet';
        }
      },
      error: (err) => {
        console.error('Error loading test results:', err);
        this.testData = 'Error loading test results';
      },
    });
  }

  private formatLatestResult(testConfig: any, result: any): void {
    const dateOnly = result.timestamp.split('T')[0];
    let formattedResult = `Test Name: ${testConfig.name}\n`;
    formattedResult += `Test Date: ${dateOnly}\n`;
    formattedResult += `Test Result: ${result.finalResult}\n`;

    if (result.resultWithPercentages) {
      formattedResult += `Percentages: ${result.resultWithPercentages}\n`;
    }

    this.testData = formattedResult;
  }

  // Test selection and editing
  onTestSelect() {
    if (this.selectedTestId) {
      this.selectTest(this.selectedTestId);
    } else {
      this.selectedTest = null;
    }
  }

  selectTest(testId: string) {
    this.testConfigService.getTestConfig(testId).subscribe({
      next: (test) => {
        this.selectedTest = test;
        this.isCustomTest = test.type === 'custom';
        this.editingQuestionIndex = null;
        this.editingOutcomeIndex = null;
        this.newQuestion = this.createEmptyQuestion();
        this.newOutcome = this.createEmptyOutcome();
      },
      error: (err) => {
        console.error('Error loading test:', err);
      },
    });
  }

  closeModal() {
    this.selectedTest = null;
    this.selectedTestId = null;
  }

  saveTest() {
    if (this.selectedTest) {
      const operation = this.testList.some((t) => t.id === this.selectedTest?.id)
        ? this.testConfigService.updateTestConfig(this.selectedTest)
        : this.testConfigService.createTestConfig(this.selectedTest);

      operation.subscribe({
        next: () => {
          alert('Test saved successfully!');
          this.loadTests();
        },
        error: (err) => {
          console.error('Error saving test:', err);
          alert('Error saving test');
        },
      });
    }
  }

  // Question management
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

  updateQuestion() {
    if (this.selectedTest && this.editingQuestionIndex !== null) {
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

  // Outcome management
  createEmptyOutcome() {
    return {
      id: '',
      name: '',
      description: '',
      translations: {
        french: '',
        spanish: '',
      },
    };
  }

  addOutcome() {
    if (this.selectedTest) {
      this.selectedTest.outcomes.push({ ...this.newOutcome });
      this.newOutcome = this.createEmptyOutcome();
    }
  }

  editOutcome(index: number) {
    if (this.selectedTest) {
      this.editingOutcomeIndex = index;
      this.newOutcome = {
        ...this.selectedTest.outcomes[index],
        translations: {
          french: this.selectedTest.outcomes[index].translations?.French || '',
          spanish: this.selectedTest.outcomes[index].translations?.Spanish || '',
        },
      };
    }
  }

  updateOutcome() {
    if (this.selectedTest && this.editingOutcomeIndex !== null) {
      const formattedTranslations = {
        French: this.newOutcome.translations.french,
        Spanish: this.newOutcome.translations.spanish,
      };

      this.selectedTest.outcomes[this.editingOutcomeIndex] = {
        ...this.newOutcome,
        translations: formattedTranslations,
      };
      this.cancelOutcomeEdit();
    }
  }

  cancelOutcomeEdit() {
    this.editingOutcomeIndex = null;
    this.newOutcome = this.createEmptyOutcome();
  }

  removeOutcome(index: number) {
    if (this.selectedTest && confirm('Are you sure you want to delete this outcome?')) {
      this.selectedTest.outcomes.splice(index, 1);
    }
  }

  // Test creation
  showTestCreationModal() {
    this.showCreationModal = true;
    this.newTestType = 'custom';
    this.newTestName = '';
    this.newTestDescription = '';
  }

  closeCreationModal() {
    this.showCreationModal = false;
  }
  duplicateTest() {
    if (!this.selectedTest) return;

    const confirmDuplicate = confirm(`Are you sure you want to duplicate "${this.selectedTest.name}"?`);
    if (!confirmDuplicate) return;

    // Create a copy of the test with a new ID and "Copy of" prefix
    const duplicatedTest: TestConfig = {
      ...JSON.parse(JSON.stringify(this.selectedTest)),
      id: `${this.selectedTest.id}-copy-${Date.now()}`,
      name: `Copy of ${this.selectedTest.name}`,
      type: 'custom', // Always set to custom when duplicating
    };

    // Set as custom test
    this.isCustomTest = true;

    // Replace the selected test with the duplicated one
    this.selectedTest = duplicatedTest;
    this.selectedTestId = duplicatedTest.id;
  }

  onTestTypeChange() {
    const typeNames = {
      'big-five': 'Big Five Personality Test',
      mbti: '16 Personality Types (MBTI)',
      enneagram: 'Enneagram Personality Test',
      disc: 'DISC Assessment',
      'emotional-intelligence': 'Emotional Intelligence Test',
      'career-aptitude': 'Career Aptitude Test',
      'love-styles': '7 Love Styles Test',
      workplace: 'Workplace Personality Test',
    };

    if (this.newTestType !== 'custom' && !this.newTestName) {
      this.newTestName = typeNames[this.newTestType];
    }
  }
  getPresetScoringLogic(type?: string): string {
    return this.scoringService.getPresetScoringLogic(type || this.newTestType);
  }

  copyScoringLogic() {
    const logic = this.getPresetScoringLogic();
    navigator.clipboard.writeText(logic).then(() => {
      this.copiedToClipboard = true;
      setTimeout(() => (this.copiedToClipboard = false), 2000);
    });
  }

  convertToCustom() {
    if (!this.selectedTest) return;

    if (confirm('Convert this preset test to a custom test? You can then modify the scoring logic.')) {
      this.selectedTest.type = 'custom';
      this.selectedTest.customScoring = this.getPresetScoringLogic(this.selectedTest.type);
      this.isCustomTest = true;
      this.selectedTest.id = `${this.selectedTest.id}-custom-${Date.now()}`;
    }
  }
  private getDefaultScoringType(testType: string): 'custom' | 'sum' | 'compare' | 'weighted' {
    switch (testType) {
      case 'mbti':
      case 'disc':
        return 'compare';
      case 'big-five':
      case 'emotional-intelligence':
        return 'sum';
      case 'enneagram':
      case 'career-aptitude':
      case 'love-styles':
        return 'weighted';
      case 'workplace':
        return 'custom';
      default:
        return 'sum'; // Default for custom tests
    }
  }

  initializeNewTest() {
    const baseTest: TestConfig = {
      id: `${this.newTestType}-${Date.now()}`,
      name: this.newTestName,
      type: this.newTestType,
      scoringType: this.getDefaultScoringType(this.newTestType),
      description: this.newTestDescription,
      questions: [],
      outcomes: [],
      customScoring: this.newTestType === 'custom' ? this.newTestCustomScoring : this.getPresetScoringLogic(),
    };

    // Set up presets based on test type
    switch (this.newTestType) {
      case 'big-five':
        baseTest.scoringType = 'sum';
        baseTest.outcomes = [
          this.createPresetOutcome('openness', 'Openness', 'Openness to experience'),
          this.createPresetOutcome('conscientiousness', 'Conscientiousness', 'Self-discipline and organization'),
          this.createPresetOutcome('extraversion', 'Extraversion', 'Sociability and talkativeness'),
          this.createPresetOutcome('agreeableness', 'Agreeableness', 'Compassion and cooperativeness'),
          this.createPresetOutcome('neuroticism', 'Neuroticism', 'Emotional instability'),
        ];
        this.isCustomTest = false;
        break;

      case 'mbti':
        baseTest.scoringType = 'compare';
        baseTest.outcomes = [
          this.createPresetOutcome('E', 'Extraversion', 'Outgoing, energetic'),
          this.createPresetOutcome('I', 'Introversion', 'Reserved, thoughtful'),
          this.createPresetOutcome('S', 'Sensing', 'Practical, detail-oriented'),
          this.createPresetOutcome('N', 'Intuition', 'Imaginative, big-picture'),
          this.createPresetOutcome('T', 'Thinking', 'Logical, objective'),
          this.createPresetOutcome('F', 'Feeling', 'Empathetic, compassionate'),
          this.createPresetOutcome('J', 'Judging', 'Structured, decisive'),
          this.createPresetOutcome('P', 'Perceiving', 'Flexible, spontaneous'),
        ];
        this.isCustomTest = false;
        break;

      case 'enneagram':
        baseTest.scoringType = 'weighted';
        baseTest.outcomes = Array.from({ length: 9 }, (_, i) => this.createPresetOutcome(`type-${i + 1}`, `Type ${i + 1}`, 'Enneagram type description'));
        this.isCustomTest = false;
        break;

      case 'disc':
        baseTest.scoringType = 'compare';
        baseTest.outcomes = [
          this.createPresetOutcome('D', 'Dominance', 'Direct, results-oriented'),
          this.createPresetOutcome('I', 'Influence', 'Outgoing, enthusiastic'),
          this.createPresetOutcome('S', 'Steadiness', 'Patient, reliable'),
          this.createPresetOutcome('C', 'Conscientiousness', 'Analytical, precise'),
        ];
        this.isCustomTest = false;
        break;

      case 'emotional-intelligence':
        baseTest.scoringType = 'sum';
        baseTest.outcomes = [
          this.createPresetOutcome('self-awareness', 'Self-Awareness', 'Recognizing own emotions'),
          this.createPresetOutcome('self-regulation', 'Self-Regulation', 'Managing emotions'),
          this.createPresetOutcome('motivation', 'Motivation', 'Self-motivation'),
          this.createPresetOutcome('empathy', 'Empathy', 'Understanding others'),
          this.createPresetOutcome('social-skills', 'Social Skills', 'Managing relationships'),
        ];
        this.isCustomTest = false;
        break;

      case 'career-aptitude':
        baseTest.scoringType = 'weighted';
        baseTest.outcomes = [
          this.createPresetOutcome('realistic', 'Realistic', 'Hands-on, practical'),
          this.createPresetOutcome('investigative', 'Investigative', 'Analytical, intellectual'),
          this.createPresetOutcome('artistic', 'Artistic', 'Creative, expressive'),
          this.createPresetOutcome('social', 'Social', 'Helping, teaching'),
          this.createPresetOutcome('enterprising', 'Enterprising', 'Leading, persuading'),
          this.createPresetOutcome('conventional', 'Conventional', 'Organized, detail-oriented'),
        ];
        this.isCustomTest = false;
        break;

      case 'love-styles':
        baseTest.scoringType = 'weighted';
        baseTest.outcomes = [
          this.createPresetOutcome('eros', 'Eros', 'Passionate, romantic love'),
          this.createPresetOutcome('ludus', 'Ludus', 'Game-playing love'),
          this.createPresetOutcome('storge', 'Storge', 'Friendship-based love'),
          this.createPresetOutcome('pragma', 'Pragma', 'Practical, logical love'),
          this.createPresetOutcome('mania', 'Mania', 'Possessive, dependent love'),
          this.createPresetOutcome('agape', 'Agape', 'Selfless, altruistic love'),
          this.createPresetOutcome('philia', 'Philia', 'Deep friendship'),
        ];
        this.isCustomTest = false;
        break;

      case 'workplace':
        baseTest.scoringType = 'custom';
        baseTest.customScoring = 'workplace-scoring';
        baseTest.outcomes = [
          this.createPresetOutcome('leader', 'Leader', 'Takes charge and directs others'),
          this.createPresetOutcome('collaborator', 'Collaborator', 'Works well in teams'),
          this.createPresetOutcome('innovator', 'Innovator', 'Creative problem-solver'),
          this.createPresetOutcome('organizer', 'Organizer', 'Detail-oriented planner'),
        ];
        this.isCustomTest = true;
        break;

      default:
        baseTest.scoringType = 'sum';
        this.isCustomTest = true;
    }

    this.selectedTest = baseTest;
    this.selectedTestId = baseTest.id;
    this.showCreationModal = false;
  }

  private getDefaultCustomScoring(testType: string): string {
    switch (testType) {
      case 'workplace':
        return `function(outcomes) {
        const maxScore = 20 * 5;
        const threshold = 0.7 * maxScore;

        outcomes.forEach(o => o.score = Math.round((o.score / maxScore) * 100));

        const sorted = outcomes.sort((a, b) => b.score - a.score);
        let result;

        if (sorted[0].score >= threshold) {
          result = sorted[0].name;
        } else if (sorted[0].score - sorted[1].score <= 10) {
          result = \`\${sorted[0].name}/\${sorted[1].name} Hybrid\`;
        } else {
          result = sorted[0].name;
        }

        return {
          outcomes: outcomes,
          result: result
        };
      }`;
      default:
        return `function(outcomes) {
        const total = outcomes.reduce((sum, o) => sum + o.score, 0);
        const normalized = outcomes.map(o => ({
          ...o,
          percentage: Math.round((o.score / total) * 100)
        }));

        return {
          outcomes: normalized,
          result: normalized.map(o => \`\${o.name}: \${o.percentage}%\`).join(', ')
        };
      }`;
    }
  }

  createPresetOutcome(id: string, name: string, description: string): Outcome {
    return {
      id,
      name,
      description,
      translations: {
        English: name,
        French: '',
        Spanish: '',
      },
    };
  }

  // Other methods
  goToTestRunner(): void {
    this.router.navigate(['/test']);
  }

  showAllResults() {
    this.testConfigService.setCurrentTestId(null);
    this.loadAllTestResults();
  }

  refreshResults() {
    this.loadAllTestResults(this.selectedTestId || undefined);
  }
}
