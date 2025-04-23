import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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
  ) {
    this.adminForm = this.fb.group({
      language: ['english'],
      testResultJson: [''],
    });
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

  saveTextUpdates(): void {
    console.log('Text updates:', this.textUpdates);
    alert('Text updates saved!');
  }
}
