import { Component, Input } from '@angular/core';
import { PartitionsService } from 'src/app/services/partitions.service';
import { ActivatedRoute } from '@angular/router';
import { GetMigrationListenerService } from 'src/app/services/get-migration-listener.service';
import { Partition } from 'src/app/models/Partition';
import { Instance } from 'src/app/models/Instance';
import { MigrationProgressModel } from 'src/app/models/MigrationProgress';
import { Constants } from 'src/app/Common/Constants';
import { SelectedServicesService } from 'src/app/services/selected-services.service';
import { allMigrationEndpoints } from 'src/app/models/allMigrationEndpoints';

@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss', './vertical-progress.scss']
})
export class ProgressCardComponent {
  // show/ hide progress details
  showOverallProgress: boolean =  true;
  showCopyProgress: boolean = false;
  showCatchupProgress: boolean = false;
  showDowntimeProgress: boolean = false;
  showStart: boolean = false;
  showPartitions: boolean = false;

  //refresh rate for fetching the migration progress for the partitions in ms
  refreshRate: number = 20000;

  // store the various parameters for fetching the progress
  //service id of current service
  serviceID: string;
  // application id of the service
  applicationID: string;

  // partition id
  partitionID: string;
  


  // show abort only when migration is not complete
  showAbort: boolean; // if any partition completes then make this false

  // store the migration endpoint for current partition's instance
  migrationEndpoint: string;

  // capture value from api response of get migration progress into this 
  migrationProgressDetails: MigrationProgressModel;
  partition_curr_progress : string[]=[];
  AllMigEndpoints: allMigrationEndpoints[];
  hasPartitionID: boolean = false;
  f: boolean = false;


  constructor(private partitionService: PartitionsService,
              private activatedRoute: ActivatedRoute,
              private migrationListenerService: GetMigrationListenerService,
              private selectedServices: SelectedServicesService
              ) { }

  // fetch the service and application id from the routing url on landing into the page
  ngOnInit(): void {
    
    this.AllMigEndpoints = this.selectedServices.AllMigEndpoints;
    this.activatedRoute.params.subscribe(params =>{
      this.serviceID = params['serviceid'];
      this.applicationID = params['appid'];
    });

    
   
    
    // fetch the partitions progress after each given interval 
    setInterval(() => {
      this.getAllPartitions(this.serviceID);
    }, 3000);
  }

  

  isCheckedPartition(app_id: string, service_id: string, partition_id: string){
    var checked: boolean = false;
    let app1 = this.selectedServices.AllMigEndpoints.find((app, index1) => {
      if (app.app_id === app_id) {
          let service1 = this.selectedServices.AllMigEndpoints[index1].service_details.find((service, index2) => {
            if(service.service_id === service_id){
              let partition1 = this.selectedServices.AllMigEndpoints[index1].service_details[index2].partition_details.find((partition, index3)=>{
                if(partition.partition_id === partition_id){
                  checked= this.selectedServices.AllMigEndpoints[index1].service_details[index2].partition_details[index3].selected;
                  return checked;
                }
              })
            }
          }) 
          return true; // stop searching
      }
  });
  return checked;

  }

  checkSelectedPartitions(app_id:string, service_id: string, partition_id: string){

    let app1 = this.selectedServices.AllMigEndpoints.find((app, index1) => {
      if (app.app_id === app_id) {
          let service1 = this.selectedServices.AllMigEndpoints[index1].service_details.find((service, index2) => {
            if(service.service_id === service_id){
              let partition1 = this.selectedServices.AllMigEndpoints[index1].service_details[index2].partition_details.find((partition, index3)=>{
                if(partition.partition_id === partition_id){
                  this.selectedServices.AllMigEndpoints[index1].service_details[index2].partition_details[index3].selected = !this.selectedServices.AllMigEndpoints[index1].service_details[index2].partition_details[index3].selected;
                  
                }
              })
            }
          }) 
          return true; // stop searching
      }
    });
  }



  getAllPartitions(ServiceId: string) {
    this.migrationListenerService.getAllPartitions(ServiceId).subscribe(
      resp=> {
        var partition: Partition = resp;
        
        for(var item in partition.Items){
          var partitionid: string = partition.Items[item].PartitionInformation.Id;
          this.getAllInstances(partitionid);
        }
        
      }
    )
  }

  updateGlobalPartitions(ServiceId: string, partitionId: string, MigrationListener: string, curr_progress: string[], migration_details: MigrationProgressModel){
    this.selectedServices.AllMigEndpoints.find((obj, i) => {
      if(obj.app_id === this.selectedServices.listServices[ServiceId]){
        this.selectedServices.AllMigEndpoints[i].service_details.find((obj1, i1) => {
          if(obj1.service_id === ServiceId){
            if(!(this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details.some(obj2 => obj2.partition_id === partitionId))){
              this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details.push({
                partition_id: partitionId,
                migEndpoint: MigrationListener,
                selected: false,
                progress: curr_progress,
                migration_details: migration_details
              });
            }else{
              this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details.find((obj2, i2)=> {
                if(obj2.partition_id === partitionId){
                  this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details[i2].progress = curr_progress;
                  if(MigrationListener!=='' && MigrationListener!=='undefined') {
                    this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details[i2].migEndpoint = MigrationListener;}
                  this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details[i2].migration_details = migration_details;

                }
              })
            } 
          }
        })
      }
    })
    //console.warn(this.selectedServices.AllMigEndpoints);
  }

  // collect the migration listener endpoint from the getInstance response
  getAllInstances(PartitionId: string){
    this.migrationListenerService.getAllInstances(PartitionId).subscribe(
      resp=> {
        var instance: Instance;
        instance = resp;
        var curr_progress = [];
        var progress : any = [];
        for(var item in instance.Items){
          //this.listInstances[this.instance.Items[item].ReplicaId] = PartitionId;
          this.migrationEndpoint = '';
          if(instance.Items[item].Address.length > 0){

            this.migrationEndpoint = this.getMigrationListener(instance.Items[item].Address);  

          }
          
          if ( typeof(this.migrationEndpoint) !== 'undefined'){
            this.migrationEndpoint = this.migrationEndpoint;
            progress = this.fetchMigrationProgress(this.migrationEndpoint);
          }else{
            this.migrationEndpoint='';
          }
          // update the global variable to store the partitions of the given service
          this.updateGlobalPartitions(this.serviceID, PartitionId, this.migrationEndpoint, this.partition_curr_progress, this.migrationProgressDetails);

        }

      }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    )              
  }

  getMigrationListener(Endpoints: string){
    var endpoints = JSON.parse(Endpoints);
    return (endpoints["Endpoints"]["Migration Listener"]);
  }


  fetchMigrationProgress(migrationEndpoint: string): any{
    var migrationProgress: MigrationProgressModel;
    var curr_progress:string[] = [];
    if(migrationEndpoint !== '') {
      
    this.migrationListenerService.FetchMigrationProgress(migrationEndpoint).subscribe(
      resp => {

        
        this.migrationEndpoint = migrationEndpoint;
        migrationProgress = resp;
        this.migrationProgressDetails = migrationProgress;
        this.partition_curr_progress = [];
        var progress = ['idle', 'idle', 'idle', 'idle'];

        
          for(var item in migrationProgress.phaseResults){
              var phase = migrationProgress.phaseResults[item].phase;
              var status = migrationProgress.phaseResults[item].status;
              if (phase !== 4)progress[phase-1] = Constants.STATUS[status];
          }
          progress[migrationProgress.currentPhase==5? 3:migrationProgress.currentPhase  - 1] = Constants.STATUS[migrationProgress.status];


          if(progress[3] == Constants.STATUS[2]){
            this.showAbort = false;
          }
          
          this.partition_curr_progress = progress;

      }
    )
    }
  }

  AbortMigration(migrationEndpoint: string){
    this.migrationListenerService.abortMigration(migrationEndpoint).subscribe();
    this.fetchMigrationProgress(migrationEndpoint);
  }

  StartMigration(migrationEndpoint:string){
    this.migrationListenerService.startMigration(migrationEndpoint).subscribe();
    this.fetchMigrationProgress(migrationEndpoint);
  }

  InvokeDowntime(migrationEndpoint: string){
    this.migrationListenerService.invokeDowntime(migrationEndpoint).subscribe();
    this.fetchMigrationProgress(migrationEndpoint);
  }

  ShowStart(app_id: string, service_id: string, partition_id: string){
    var f: boolean = false;
    this.selectedServices.AllMigEndpoints.find((app, app_ind) => {
      
      if(app_id === app.app_id){ 
          this.selectedServices.AllMigEndpoints[app_ind].service_details.find((service, service_ind) =>{
          if(service_id === service.service_id){
            this.selectedServices.AllMigEndpoints[app_ind].service_details[service_ind].partition_details.find((partition, partition_ind) => {
              if(partition_id === partition.partition_id){
                if(partition.progress[0] === 'idle'){
                  f = true;
                }
              }
            })
          }
        })
      }
    })
    return f;
  }
  ShowAbort(app_id: string, service_id: string, partition_id: string){
    var f: boolean = true;
    this.selectedServices.AllMigEndpoints.find((app, app_ind) => {
      
      if(app_id === app.app_id){ 
          this.selectedServices.AllMigEndpoints[app_ind].service_details.find((service, service_ind) =>{
          if(service_id === service.service_id){
            this.selectedServices.AllMigEndpoints[app_ind].service_details[service_ind].partition_details.find((partition, partition_ind) => {
              if(partition_id === partition.partition_id){
                if(partition.progress[3] === 'completed'){
                  f = false;
                }
              }
            })
          }
        })
      }
    })
    return f;
  }
  ShowInvokeDowntime(migrationList: string){
    this.f = false;
    if(typeof(migrationList) !== 'undefined'){
    return this.migrationListenerService.FetchMigrationProgress(migrationList).subscribe(
      resp => {
        var migration_details: MigrationProgressModel = resp;
        if(migration_details.phaseResults.length > 5 && migration_details.currentPhase < 3){
          return true;
        }else{
          return false;
        }
      }
    );}
  }

  hasStartedMigration(app_id, service_id, partition_id){
    this.f = false;
    this.selectedServices.AllMigEndpoints.find((app, app_ind) => {
          if(app_id === app.app_id){ 
          this.selectedServices.AllMigEndpoints[app_ind].service_details.find((service, service_ind) =>{
          if(service_id === service.service_id){
            this.selectedServices.AllMigEndpoints[app_ind].service_details[service_ind].partition_details.find((partition, partition_ind) => {
              if(partition_id === partition.partition_id){
                if(partition.migration_details.currentPhase === 0){
                  this.f = true;
                }
              }
            })
          }
        })
      }
    })
    return this.f;

  }
  modeOfMigration(app_id: string, service_id: string, partition_id: string){
    var f: boolean = true;
    this.selectedServices.AllMigEndpoints.find((app, app_ind) => {
      
      if(app_id === app.app_id){ 
          this.selectedServices.AllMigEndpoints[app_ind].service_details.find((service, service_ind) =>{
          if(service_id === service.service_id){
            this.selectedServices.AllMigEndpoints[app_ind].service_details[service_ind].partition_details.find((partition, partition_ind) => {
              if(partition_id === partition.partition_id){
                if(typeof(partition.migration_details.migrationMode) === 'undefined' || partition.migration_details.migrationMode === 0){
                  f = false;
                }
              }
            })
          }
        })
      }
    })
    return f;
  }
  modeOfMigrationManual(app_id: string, service_id: string){
    var f: boolean = true;
    this.selectedServices.AllMigEndpoints.find((app, app_ind) => {
      
      if(app_id === app.app_id){ 
          this.selectedServices.AllMigEndpoints[app_ind].service_details.find((service, service_ind) =>{
          if(service_id === service.service_id){
            this.selectedServices.AllMigEndpoints[app_ind].service_details[service_ind].partition_details.find((partition, partition_ind) => {
              
                if(typeof(partition.migration_details.migrationMode ) === 'undefined' || partition.migration_details.migrationMode === 0){
                  f = false;
        
              }
            })
          }
        })
      }
    })
    return f;
  }



  toggleList(){
    this.showPartitions = !this.showPartitions;
  }

}


