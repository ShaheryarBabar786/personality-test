import { CommonModule } from '@angular/common'; // <-- Add this
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule, CircleProgressModule, LibModalModule } from 'nextsapien-component-lib';
import { ResultComponent } from './result/result.component';
import { TestRunnerComponent } from './test-runner/test-runner.component';
import { TestComponent } from './test.component';

@NgModule({
  declarations: [ResultComponent, TestRunnerComponent, TestComponent],
  imports: [
    CommonModule, // <-- Add this line
    ButtonsModule,
    LibModalModule,
    CircleProgressModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [],
})
export class TestModule {}
