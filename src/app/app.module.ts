import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './modules/login/login.module';
import { RefreshRateComponent } from './shared/component/refresh-rate/refresh-rate.component';
import { FormsModule } from '@angular/forms';
import { NgMetro4Module } from 'ng-metro4';

@NgModule({
  declarations: [
    AppComponent,
    RefreshRateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    NgbModule,
    FormsModule,
    NgMetro4Module

  ],
  providers: [
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
