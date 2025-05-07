import { CommonModule } from '@angular/common'; // <-- Add this
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ButtonsModule,
  CircleProgressModule,
  FormFieldModule,
  LibAutoDelegationModalComponent,
  LibModalModule,
  ProgressBarModule,
  SectionSeparatorComponent,
  ToggleModule,
} from 'nextsapien-component-lib';
import { SharedModule } from '../shared/shared.module';
import { ResultComponent } from './result/result.component';
import { TestRunnerComponent } from './test-runner/test-runner.component';
import { TestComponent } from './test.component';

@NgModule({
  declarations: [ResultComponent, TestRunnerComponent, TestComponent],
  imports: [
    CommonModule,
    ButtonsModule,
    LibModalModule,
    CircleProgressModule,
    ReactiveFormsModule,
    LibAutoDelegationModalComponent,
    FormFieldModule,
    ToggleModule,
    ProgressBarModule,
    SectionSeparatorComponent,
    SharedModule,
  ],
  providers: [],
  bootstrap: [],
})
export class TestModule {}
