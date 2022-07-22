import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIurls } from 'src/app/Common/APIurls';
import { Applications } from 'src/app/models/Application';
import { Instance } from 'src/app/models/Instance';
import { Partition } from 'src/app/models/Partition';
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
    //this.checked_Services = this.selectedServices.selectedServices;
    // console.log(this.selectedServices.selectedServicesId);
    // console.warn(this.checked_Services);
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



  getAllApplications(){
    this.getmigrationListener.getAllApplications().subscribe(
      resp=> {
        this.applications = resp;
        for(var item in this.applications.Items){
          this.listApplications.push(this.applications.Items[item].Id);
          this.getAllServices(this.applications.Items[item].Id);
        }      
      }
    )
    
  }

  getAllServices(ApplicationId: string){
    this.getmigrationListener.getAllServices(ApplicationId).subscribe(
      resp => {

        this.services = resp;
        for(var item in this.services.Items){
          this.listServices[this.services.Items[item].Id]= ApplicationId;
          this.allServices.push(this.services.Items[item]);
          
          if(this.checked_Services.hasOwnProperty(this.services.Items[item].Id)==false){
            if(this.selectedServices.selectedServicesId.includes(this.services.Items[item].Id)){
              this.checked_Services.push({serviceid: this.services.Items[item].Id, checked: true});
            }else{
              this.checked_Services.push({serviceid: this.services.Items[item].Id, checked: false});
            }
            
          }
          
          this.getAllPartitions(this.services.Items[item].Id);
          
        }
        this.selectedServices.AllServices = this.allServices;
        this.selectedServices.listServices = this.listServices;
       
      }
      
    );
  }

  getAllPartitions(ServiceId: string) {
    this.getmigrationListener.getAllPartitions(ServiceId).subscribe(
      resp=> {
  
        this.partition = resp;
        for(var item in this.partition.Items){
          this.listPartitions[this.partition.Items[item].PartitionInformation.Id] = ServiceId;
        }
        
      }
    )
  }



 

}
