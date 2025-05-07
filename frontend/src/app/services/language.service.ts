import { EventEmitter, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguage = 'english';
  languageChanged = new EventEmitter<void>(); // Add this event emitter

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      this.setLanguage(savedLanguage);
    } else {
      this.setLanguage('english');
    }
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
    let langCode = 'en';

    switch (language) {
      case 'french':
        langCode = 'fr';
        break;
      case 'spanish':
        langCode = 'es';
        break;
      default:
        langCode = 'en';
    }

    this.translate.use(langCode);
    localStorage.setItem('selectedLanguage', language);
    this.languageChanged.emit(); // Emit event when language changes
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
}
