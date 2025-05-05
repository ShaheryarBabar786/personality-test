import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultsService } from '../services/result-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: false,
})
export class AdminComponent {
  adminForm: FormGroup;
  selectedLanguage: string = 'english';
  textUpdates: { id: string; value: string }[] = [
    { id: 'testupdate1', value: '' },
    { id: 'testupdate1', value: '' },
    { id: 'testupdate1', value: '' },
    { id: 'testupdate1', value: '' },
  ];

  testData;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private resultsService: ResultsService,
  ) {
    this.adminForm = this.fb.group({
      language: ['english'],
      testResultJson: [''],
    });
  }

  ngOnInit() {
    this.loadTestResults();
  }

  onLanguageChange(lang: string): void {
    this.selectedLanguage = lang;
  }

  addNewTextUpdate(): void {
    this.textUpdates.push({ id: 'testupdate' + (this.textUpdates.length + 1), value: '' });
  }

  goToTestRunner(): void {
    this.router.navigate(['/test']);
  }
  loadTestResults() {
    const results = this.resultsService.getLatestResults();
    this.testData = results ? JSON.stringify(results, null, 2) : 'No test results available yet';
  }

  refreshResults() {
    this.loadTestResults();
  }

  saveTextUpdates(): void {
    alert('Text updates saved!');
  }
}
