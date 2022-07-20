import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { PartitionProgressComponent } from './partition-progress/partition-progress.component';



@NgModule({
  declarations: [
    PartitionProgressComponent
  ],
  imports: [
    CommonModule,
    NgModule,
    BrowserModule
  ]
})
export class AutoMigrationModule { }
