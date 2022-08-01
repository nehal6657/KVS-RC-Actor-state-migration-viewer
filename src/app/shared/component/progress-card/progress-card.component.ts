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

  //refresh rate for fetching the migration progress for the partitions in ms
  refreshRate: number = 20000;

  // store the various parameters for fetching the progress
  //service id of current service
  serviceID: string;
  // application id of the service
  applicationID: string;

  // partition id
  partitionID: string;
  
  //number of partitions in current service
  numberOfPartitions: number;

  // store the partition id of all partitions in the service
  allPartitions: string[] = []; 

  // store the progress of each partition; each element in this array has string array of the following form
  // ['status of copy phase', 'status of catchup phase', 'status of downtime phase' , 'status if completed or not']

  //partitions: string[][] = []; 

  // mode of migration of app
  modeOfMigration: string;

  // show abort only when migration is not complete
  showAbort: boolean; // if any partition completes then make this false

  // store the migration endpoint for current partition's instance
  migrationEndpoint: string;

  // capture value from api response of get migration progress into this 
  migrationProgressDetails: MigrationProgressModel;
  partition_curr_progress : string[]=[];
  AllMigEndpoints: allMigrationEndpoints[];
  hasPartitionID: boolean = false;



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
      this.partitionID = params['partitionid'] || '';
      // console.log(this.serviceID);
      // console.log(this.applicationID);
      // console.log(this.partitionID + "n" + this.partitionID.length);
    });

    if(this.partitionID.length < 1)  {
      this.hasPartitionID = false;
      this.getAllPartitions(this.serviceID);
    }
    else {
      this.hasPartitionID = true;
      this.getAllInstances(this.partitionID);
    }
    // fetch the partitions progress after each given interval 
    setInterval(() => {
      if(this.partitionID.length < 1)  {this.getAllPartitions(this.serviceID);}
      else {this.getAllInstances(this.partitionID);}
    }, 300);
  }

  
  // set the global variables of partition service after fetching from the api responses
  setPartitions(){  
    this.numberOfPartitions = this.allPartitions.length;
    this.modeOfMigration = this.migrationProgressDetails.migrationMode==0? 'auto': 'manual';
    this.showAbort = true;
    this.showStart = this.modeOfMigration === 'manual' ? true: false;

    this.partitionService.numberOfPartitions = this.numberOfPartitions;
    this.partitionService.modeOfMigration = this.modeOfMigration;
    this.partitionService.showAbort = this.showAbort;
  }    


  getAllPartitions(ServiceId: string) {
    this.migrationListenerService.getAllPartitions(ServiceId).subscribe(
      resp=> {
        var partition: Partition = resp;
        
        for(var item in partition.Items){
          var partitionid: string = partition.Items[item].PartitionInformation.Id;
          this.getAllInstances(partitionid);
        }
        this.setPartitions();
        
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
                  this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details[i2].migEndpoint = MigrationListener;
                  this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details[i2].migration_details = migration_details;

                }
              })
            } 
          }
        })
      }
    })
    console.log(this.selectedServices.AllMigEndpoints);
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
          var migrationList = 'undefined';
          if(instance.Items[item].Address.length > 0){
            migrationList = this.getMigrationListener(instance.Items[item].Address);  
          }
          
          if ( typeof migrationList !== 'undefined'){
            this.migrationEndpoint = migrationList;
            progress = this.fetchMigrationProgress(this.migrationEndpoint)[0];
          }else{
            this.migrationEndpoint='';
          }
          // update the global variable to store the partitions of the given service
          this.updateGlobalPartitions(this.serviceID, PartitionId, migrationList, this.partition_curr_progress, this.migrationProgressDetails);

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
    if(migrationEndpoint === '' || migrationEndpoint === 'undefined') {
      return [];
    }
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
    return [this.partition_curr_progress, this.migrationProgressDetails];

  }

  AbortMigration(){
    this.migrationListenerService.abortMigration().subscribe(
      resp => {console.log("abort ",resp);}
    )
  }






}


