import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './modules/login/login.module';
import { RefreshRateComponent } from './shared/component/refresh-rate/refresh-rate.component';
import { FormsModule } from '@angular/forms';
import { ProgressCardComponent } from './shared/component/progress-card/progress-card.component';
//import { SidebarComponent } from './shared/component/sidebar/sidebar.component';
@NgModule({
  declarations: [
    AppComponent,
    RefreshRateComponent,
    ProgressCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    NgbModule,
    FormsModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
