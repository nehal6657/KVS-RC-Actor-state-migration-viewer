import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RefreshService } from './services/refresh.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  hideAzure = false;

  ngOnInit(): void {
    this.refreshService.init();
    
  }
  title = 'KVS-RC-Actor-state-migration-viewer';
  constructor(public refreshService: RefreshService,
              public liveAnnouncer: LiveAnnouncer,
  ){}
  

  attemptForceRefresh() {
    this.refreshService.refreshAll();
    this.liveAnnouncer.announce('Started refreshing data');
    setTimeout( () => {
      this.liveAnnouncer.announce('Data has been refreshed.');
    }, 2000);
  }
}