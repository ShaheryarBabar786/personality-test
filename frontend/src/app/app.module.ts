import { CommonModule } from '@angular/common';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ButtonsModule, LibModalModule, ToggleModule } from 'nextsapien-component-lib';
import { AdminComponent } from './admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestModule } from './test/test.module';

import {} from 'nextsapien-component-lib';

export const httpLoaderFactory = (http: HttpBackend): TranslateHttpLoader => new TranslateHttpLoader(new HttpClient(http), './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent, AdminComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ButtonsModule,
    LibModalModule,
    ReactiveFormsModule,
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
    FormsModule,
    ToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
