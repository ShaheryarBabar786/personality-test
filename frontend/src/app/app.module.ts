import { CommonModule } from '@angular/common';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ButtonsModule, LibModalModule } from 'nextsapien-component-lib';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestModule } from './test/test.module';

export const httpLoaderFactory = (http: HttpBackend): TranslateHttpLoader => new TranslateHttpLoader(new HttpClient(http), './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ButtonsModule,
    LibModalModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpBackend],
      },
    }),
    AppRoutingModule,
    TestModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
