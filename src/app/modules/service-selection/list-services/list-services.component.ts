import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIurls } from 'src/app/Common/APIurls';
import { Applications } from 'src/app/models/Application';
import { Instance } from 'src/app/models/Instance';
import { Partition } from 'src/app/models/Partition';
import { service } from 'src/app/models/Service';
import { GetMigrationListenerService } from 'src/app/services/get-migration-listener.service';

@Component({
  selector: 'app-list-services',
  templateUrl: './list-services.component.html',
  styleUrls: ['./list-services.component.scss']
})
export class ListServicesComponent implements OnInit {

  
  public listApplications: string[] = [];
  public listServices = {};
  public listPartitions = {};
  public listInstances = {};
  public allServices : string[] = [];
  public MigrationListener :string ='';


  applications : Applications;
  services: service;
  partition: Partition;
  instance: Instance;

  constructor(private getmigrationListener: GetMigrationListenerService, 
              private route: ActivatedRoute,
              private Apiurl: APIurls){
    this.getAllApplications();
  }
  ngOnInit(): void {
    
  }

  getAllApplications(){
    this.getmigrationListener.getAllApplications().subscribe(
      resp=> {
        this.applications = resp;
        for(var item in this.applications.Items){
          this.listApplications.push(this.applications.Items[item].Id);
          this.getAllServices(this.applications.Items[item].Id);
        }
        //console.log(this.listApplications);

       
      }
    )
    
  }

  getAllServices(ApplicationId: string){
    this.getmigrationListener.getAllServices(ApplicationId).subscribe(
      resp => {

        this.services = resp;
        for(var item in this.services.Items){
          this.listServices[this.services.Items[item].Id]= ApplicationId;
          this.allServices.push(this.services.Items[item].Id);
          this.getAllPartitions(this.services.Items[item].Id);
        }
        //console.log(this.listServices);
        //console.warn(this.allServices);
       
      }
    );
  }

  getAllPartitions(ServiceId: string) {
    this.getmigrationListener.getAllPartitions(ServiceId).subscribe(
      resp=> {
  
        this.partition = resp;
        for(var item in this.partition.Items){
          this.listPartitions[this.partition.Items[item].PartitionInformation.Id] = ServiceId;
          this.getAllInstances(this.partition.Items[item].PartitionInformation.Id);
        }
        
      }
    )
  }

  getAllInstances(PartitionId: string){
    this.getmigrationListener.getAllInstances(PartitionId).subscribe(
      resp=> {

        this.instance = resp;
        for(var item in this.instance.Items){
          this.listInstances[this.instance.Items[item].ReplicaId] = PartitionId;
          var migrationList = this.getMigrationListener(this.instance.Items[item].Address);
          if ( typeof migrationList !== 'undefined'){
            console.log("behjak");
            console.warn(this.Apiurl.getMigrationUrl(migrationList));
            this.MigrationListener = migrationList;
            console.warn(migrationList);
          }
        }

      }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    )              
  }

  getMigrationListener(Endpoints: string){
    var endpoints = JSON.parse(Endpoints);
    return (endpoints["Endpoints"]["Migration Listener"]);
  }




  getKeys(map: Map<any, any>){
    let keys = [];
    for (let key of map)
      keys.push(key);
    //console.warn(keys);
    return keys;
  }

}
