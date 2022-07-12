import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './modules/login/login-page/login-page.component';
import { ProgressCardComponent } from './shared/component/progress-card/progress-card.component';


const routes: Routes = [
  { path: 'login', component: LoginPageComponent},
  { path: 'automigration', component: ProgressCardComponent},
  // { path: 'manualmigration', component: ManualMigrationComponent},
  // { path: 'service-selection', component: ServiceSelectionComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
