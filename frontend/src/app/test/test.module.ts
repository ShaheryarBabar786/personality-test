import { NgModule } from '@angular/core';
import { ButtonsModule, LibModalModule } from 'nextsapien-component-lib';
import { ResultComponent } from './result/result.component';
import { TestRunnerComponent } from './test-runner/test-runner.component';
import { TestComponent } from './test.component';

@NgModule({
  declarations: [ResultComponent, TestRunnerComponent, TestComponent],
  imports: [ButtonsModule, LibModalModule],
  providers: [],
  bootstrap: [],
})
export class TestModule {}
