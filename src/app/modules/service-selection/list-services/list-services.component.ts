import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIurls } from 'src/app/Common/APIurls';
import { allMigrationEndpoints } from 'src/app/models/allMigrationEndpoints';
import { ApplicationItem, Applications } from 'src/app/models/Application';
import { Instance } from 'src/app/models/Instance';
import { Partition, PartitionItem } from 'src/app/models/Partition';
import { service, ServiceItem } from 'src/app/models/Service';
import { GetMigrationListenerService } from 'src/app/services/get-migration-listener.service';
import { SelectedServicesService } from 'src/app/services/selected-services.service';
import { selectedServices } from './selectedService';

@Component({
  selector: 'app-list-services',
  templateUrl: './list-services.component.html',
  styleUrls: ['./list-services.component.scss']
})
export class ListServicesComponent implements OnInit {

  
  public listApplications: string[] = [];
  public listServices = {};  // serviceid , appid
  public listPartitions = {};
  public listInstances = {};
  public allServices : ServiceItem[] = [];
  public MigrationListener :string ='';
  public checked_Services : selectedServices[] = []; 

  public allMigrationListener: allMigrationEndpoints[];

  applications : Applications;
  services: service;
  partition: Partition;
  instance: Instance;

  constructor(private getmigrationListener: GetMigrationListenerService, 
              private route: ActivatedRoute,
              private Apiurl: APIurls,
              private selectedServices: SelectedServicesService){}

  ngOnInit(): void {
    this.getAllApplications();
  }

  updateSelectedServices(serviceid, event){
    if(event.target.checked){
      
      var f: boolean = true;
      for(var i=0 ; i < this.selectedServices.selectedServicesId.length; i++) {
        if(this.selectedServices.selectedServicesId[i] == serviceid) {
          f = false;
       }
     }
     var objIndex = this.checked_Services.findIndex((obj => obj.serviceid == serviceid));
     this.checked_Services[objIndex].checked = true;

     if(f)this.selectedServices.selectedServicesId.push(serviceid);
    }
    
    else{
       for(var i=0 ; i < this.selectedServices.selectedServicesId.length; i++) {
         if(this.selectedServices.selectedServicesId[i] == serviceid) {
           this.selectedServices.selectedServicesId.splice(i,1);
        }
      }

      var objIndex = this.checked_Services.findIndex((obj => obj.serviceid == serviceid));
     this.checked_Services[objIndex].checked = false;
    }

    


  }
  isChecked(serviceid){
    this.checked_Services.find(x => x.serviceid === serviceid).checked;
  }



  getAllApplications(){
    this.getmigrationListener.getAllApplications().subscribe(
      resp=> {
        this.applications = resp;
        for(var item in this.applications.Items){
          var appid: string = this.applications.Items[item].Id;
          this.listApplications.push(appid);

          // update the global variable to store the application if not present
          this.updateGlobalApplications(this.applications.Items[item]);
          this.getAllServices(appid);
        } 
        console.warn("jgbsdcfhgcjushk");
        console.warn(this.selectedServices.AllMigEndpoints);    
      }
    )
    
  }
  updateGlobalApplications(app: ApplicationItem){
    if(!(this.selectedServices.AllMigEndpoints.some(o => o.app_id === app.Id))){
      this.selectedServices.AllMigEndpoints.push(
        {app_id: app.Id, 
          app_name: app.Name, 
          app_type: app.TypeName, 
          service_details:[]
        });
    }
  }

  getAllServices(ApplicationId: string){
    this.getmigrationListener.getAllServices(ApplicationId).subscribe(
      resp => {

        this.services = resp;
        for(var item in this.services.Items){
          var serviceid: string = this.services.Items[item].Id;
          this.listServices[serviceid]= ApplicationId;
          this.allServices.push(this.services.Items[item]);
          
          this.checkSelectedServices(serviceid);

          // update the global variable to store the services of the given application
          this.updateGlobalServices(this.services.Items[item], ApplicationId);
          
        
          //this.getAllPartitions(this.services.Items[item].Id);
          
        }
        this.selectedServices.AllServices = this.allServices;
        this.selectedServices.listServices = this.listServices;
       
      }
      
    );
  }

  updateGlobalServices(service: ServiceItem, ApplicationId: string){
    let obj = this.selectedServices.AllMigEndpoints.find((o, i) => {
      if (o.app_id === ApplicationId ) {
        if(!(this.selectedServices.AllMigEndpoints[i].service_details.some(o1 => o1.service_id === service.Id))){
          this.selectedServices.AllMigEndpoints[i].service_details.push({
              service_id: service.Id,
              service_name: service.Name,
              partition_details: []
            })
          }
          return true;
      }
  });

  }


  
  checkSelectedServices(serviceid: string){
    if(this.checked_Services.hasOwnProperty(serviceid)==false){
      if(this.selectedServices.selectedServicesId.includes(serviceid)){
        this.checked_Services.push({serviceid:serviceid, checked: true});
      }else{
        this.checked_Services.push({serviceid: serviceid, checked: false});
      }
    }
  }



 

}
