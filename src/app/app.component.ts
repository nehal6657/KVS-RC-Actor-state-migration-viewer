import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RefreshService } from './services/refresh.service';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { environment } from 'src/environments/environment';
import { GetMigrationListenerService } from './services/get-migration-listener.service';
import { SelectedServicesService } from './services/selected-services.service';
import { ServiceItem } from './models/Service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('main') main: ElementRef;

  
  title = 'KVS-RC-Actor-state-migration-viewer';

  selectedServices: string[] = [];
  selectedServiceObjects = new Set<string>([]);
  selectedServiceName: ServiceItem[] = [];
  listServices: {} = {};

  smallScreenSize = false;
  smallScreenLeftPanelWidth = '0px';

  //public assetBase = environment.assetBase;
  treeWidth = '275px';
  // preserve the existing size for using
  previousTreeWidth = this.treeWidth;

  rightOffset: string = this.treeWidth;
  tabIndex = -1;
  hideAzure = false;
  hideSFXTest = false;
  hideSFXLogo = false;
  showServices: boolean = false;
  showService = [false, false];

  ngOnInit(): void {
    this.refreshService.init();
    this.updateSelectedServices();
    
  }
  @HostListener('window:resize', ['$event.target'])
  onResize(event: Window) {
    this.checkWidth(event.innerWidth);
  }

  updateSelectedServices(){
    this.selectedServices = this.SelectedServices.selectedServicesId;
    this.listServices = this.SelectedServices.listServices;
    for(var items of this.SelectedServices.AllServices){
      if(this.selectedServices.includes(items.Id)){
        this.selectedServiceObjects.add( JSON.stringify({Id: items.Id, Name: items.Name}));
      }
    }
    this.selectedServiceName = Array.from(this.selectedServiceObjects).map(el => JSON.parse(el))
  }

  checkWidth(width: number) {
    //const widthReduction = this.dataService.clusterUpgradeProgress.isInitialized && this.dataService.clusterUpgradeProgress.isUpgrading ? 300 : 0;
    const widthReduction = 0;
    this.smallScreenSize = width < 720;

    this.hideAzure = width < (980 + widthReduction);
    this.hideSFXTest = width < (787 + widthReduction);
    this.hideSFXLogo = width < (600 + widthReduction);
  }

  constructor(public refreshService: RefreshService,
              public liveAnnouncer: LiveAnnouncer,
              public getmigrationListener: GetMigrationListenerService,
              public SelectedServices: SelectedServicesService
  ){}
  

  attemptForceRefresh() {
    this.refreshService.refreshAll();
    this.liveAnnouncer.announce('Started refreshing data');
    setTimeout( () => {
      this.liveAnnouncer.announce('Data has been refreshed.');
    }, 2000);
  }
  collapseSide()  {
    if (this.treeWidth === '8px') {
      this.resize(+this.previousTreeWidth.split('px')[0]);
    }else{
      this.resize(0);
    }
  }
  changeSmallScreenSizePanelState() {
    this.smallScreenLeftPanelWidth = this.smallScreenLeftPanelWidth === '0px' ? '60%' : '0px';
  }
  resize($event: any): void {
     if (this.smallScreenSize) {
       this.smallScreenLeftPanelWidth = `${$event}px`;
       return;
     }
    this.previousTreeWidth = this.treeWidth;
     // have to subtract the offset
     const offsetWidth = $event + 8;
     this.treeWidth = offsetWidth.toString() + 'px';
     this.rightOffset = this.treeWidth;
    // this.storageService.setValue('treeWidth', this.treeWidth);
  }
  showAllServices(){
    this.showServices = !this.showServices;
    this.updateSelectedServices();
    console.log(this.selectedServiceName);
    console.log(this.selectedServices);
    console.log(this.SelectedServices.AllServices);
  }
}