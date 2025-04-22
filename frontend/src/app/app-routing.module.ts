import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ResultComponent } from './test/result/result.component';
import { TestRunnerComponent } from './test/test-runner/test-runner.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'test', component: TestComponent },
  { path: 'result', component: ResultComponent },
  { path: 'test-runner', component: TestRunnerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
