import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss', './vertical-progress.scss']
})
export class ProgressCardComponent {
  partitionNumber: number = 1;
  numberOfPartitions: number = 5;
  partitions = [
    ['ongoing','idle','idle','idle'], 
    ['completed','completed','error','error'],
    ['completed','completed','completed','completed'],
    ['ongoing','idle','idle','idle'],
    ['completed','ongoing','idle','idle'] 
  ]; 




  constructor() { }

  ngOnInit(): void {
  }




}


