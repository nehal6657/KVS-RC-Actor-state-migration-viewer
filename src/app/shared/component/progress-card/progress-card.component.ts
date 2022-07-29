import { Component, Input } from '@angular/core';
import { PartitionsService } from 'src/app/services/partitions.service';
import { ActivatedRoute } from '@angular/router';
import { GetMigrationListenerService } from 'src/app/services/get-migration-listener.service';
import { Partition } from 'src/app/models/Partition';
import { Instance } from 'src/app/models/Instance';
import { MigrationProgressModel } from 'src/app/models/MigrationProgress';
import { Constants } from 'src/app/Common/Constants';
import { SelectedServicesService } from 'src/app/services/selected-services.service';

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
  
  //number of partitions in current service
  numberOfPartitions: number;

  // store the partition id of all partitions in the service
  allPartitions: string[] = []; 

  // store the progress of each partition; each element in this array has string array of the following form
  // ['status of copy phase', 'status of catchup phase', 'status of downtime phase' , 'status if completed or not']

  partitions: string[][] = []; 

  // mode of migration of app
  modeOfMigration: string;

  // show abort only when migration is not complete
  showAbort: boolean; // if any partition completes then make this false

  // store the migration endpoint for current partition's instance
  migrationEndpoint: string;

  // capture value from api response of get migration progress into this 
  migrationProgressDetails: MigrationProgressModel;



  constructor(private partitionService: PartitionsService,
              private activatedRoute: ActivatedRoute,
              private migrationListenerService: GetMigrationListenerService,
              private selectedServices: SelectedServicesService
              ) { }

  // fetch the service and application id from the routing url on landing into the page
  ngOnInit(): void {
    
    
    this.activatedRoute.params.subscribe(params =>{
      this.serviceID = params['serviceid'];
      this.applicationID = params['appid'];
      console.log(this.serviceID);
      console.log(this.applicationID);
    });
    this.getAllPartitions(this.serviceID);
    // fetch the partitions progress after each given interval 
    setInterval(() => {
      this.getAllPartitions(this.serviceID);
    }, 4000);
  }

  // set the global variables of partition service after fetching from the api responses
  setPartitions(){  
    this.numberOfPartitions = this.allPartitions.length;
    this.partitions = [];
    this.modeOfMigration = this.migrationProgressDetails.migrationMode==0? 'auto': 'manual';
    this.showAbort = true;
    this.showStart = this.modeOfMigration === 'manual' ? true: false;

    this.partitionService.numberOfPartitions = this.numberOfPartitions;
    this.partitionService.partitions = this.partitions;
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
        console.warn(this.selectedServices.AllMigEndpoints);
        
      }
    )
  }

  updateGlobalPartitions(ServiceId: string, partitionId: string, MigrationListener: string){
    this.selectedServices.AllMigEndpoints.find((obj, i) => {
      console.log(this.selectedServices.listServices[ServiceId] + " bhdsf " + ServiceId)
      if(obj.app_id == this.selectedServices.listServices[ServiceId]){
        this.selectedServices.AllMigEndpoints[i].service_details.find((obj1, i1) => {
          if(obj1.service_id === ServiceId){
            console.log("found service of applivation")
            if(!(this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details.some(obj2 => obj2.partition_id === partitionId))){
              console.log("pushing partitions ..... ")
              this.selectedServices.AllMigEndpoints[i].service_details[i1].partition_details.push({
                partition_id: partitionId,
                migEndpoint: MigrationListener
              });
            } 
          }
        })
      }
    })
  }

  // collect the migration listener endpoint from the getInstance response
  getAllInstances(PartitionId: string){
    this.migrationListenerService.getAllInstances(PartitionId).subscribe(
      resp=> {
        var instance: Instance;
        instance = resp;
        for(var item in instance.Items){
          //this.listInstances[this.instance.Items[item].ReplicaId] = PartitionId;
          var migrationList = 'undefined';
          if(instance.Items[item].Address.length > 0){
            migrationList = this.getMigrationListener(instance.Items[item].Address);  
          }
          if ( typeof migrationList !== 'undefined'){
            this.migrationEndpoint = migrationList;
            this.fetchMigrationProgress(this.migrationEndpoint);
          }else{
            this.migrationEndpoint='';
          }
          // update the global variable to store the partitions of the given service
          this.updateGlobalPartitions(this.serviceID, PartitionId, migrationList);

        }

      }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    )              
  }

  getMigrationListener(Endpoints: string){
    var endpoints = JSON.parse(Endpoints);
    return (endpoints["Endpoints"]["Migration Listener"]);
  }


  fetchMigrationProgress(migrationEndpoint: string){
    var migrationProgress: MigrationProgressModel;
    this.migrationListenerService.FetchMigrationProgress(migrationEndpoint).subscribe(
      resp => {
        console.warn(migrationEndpoint);
        this.migrationEndpoint = migrationEndpoint;
        migrationProgress = resp;
        console.warn(resp);
        this.migrationProgressDetails = migrationProgress;

        var progress = ['idle', 'idle', 'idle', 'idle'];

        
          for(var item in migrationProgress.phaseResults){
              var phase = migrationProgress.phaseResults[item].phase;
              var status = migrationProgress.phaseResults[item].status;
              if (phase !== 4)progress[phase-1] = Constants.STATUS[status];
          }
          progress[migrationProgress.currentPhase==5? 3:migrationProgress.currentPhase  - 1] = Constants.STATUS[migrationProgress.status];

          this.partitions.push(progress);

          if(progress[3] == Constants.STATUS[2]){
            this.showAbort = false;
          }
      }
    )

  }

  AbortMigration(){
    this.migrationListenerService.abortMigration().subscribe(
      resp => {console.log("abort ",resp);}
    )
  }






}


