import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListServicesComponent } from './list-services/list-services.component';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    ListServicesComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule
  ]
})
export class ServiceSelectionModule { }
