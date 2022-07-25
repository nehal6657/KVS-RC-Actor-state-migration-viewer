import { Component, Input } from '@angular/core';
import { PartitionsService } from 'src/app/services/partitions.service';
import { ActivatedRoute } from '@angular/router';
import { GetMigrationListenerService } from 'src/app/services/get-migration-listener.service';
import { Partition } from 'src/app/models/Partition';
import { Instance } from 'src/app/models/Instance';
import { MigrationProgressModel } from 'src/app/models/MigrationProgress';
import { Constants } from 'src/app/Common/Constants';

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

  refreshRate: number = 20000;

  serviceID: string;
  applicationID: string;
  partitionNumber: number;
  numberOfPartitions: number;
  allPartitions: string[] = []; 
  partitions: string[][] = []; 
  modeOfMigration: string;
  showAbort: boolean; // if any partition completes then make this false
  partitionMigrationProgress: string[] = [];

  migrationEndpoint: string;
  migrationProgressDetails: MigrationProgressModel;



  constructor(private partitionService: PartitionsService,
              private activatedRoute: ActivatedRoute,
              private migrationListenerService: GetMigrationListenerService
              ) { }

  ngOnInit(): void {
    
    
    this.activatedRoute.params.subscribe(params =>{
      this.serviceID = params['serviceid'];
      this.applicationID = params['appid'];
      console.log(this.serviceID);
      console.log(this.applicationID);


    });

    setInterval(() => {
      this.migrationListenerService.getAllPartitions(this.serviceID).subscribe(resp => {
        var partition: Partition = resp;
          for(var item in partition.Items){
            this.allPartitions.push(partition.Items[item].PartitionInformation.Id);
            this.getAllInstances(partition.Items[item].PartitionInformation.Id);
          }
          this.setPartitions();
          console.log("updated progress");
      })
    }, 4000);


    
  }

  setPartitions(){  
    this.partitionNumber = 1;
    this.numberOfPartitions = this.allPartitions.length;
    this.partitions = [];
    this.modeOfMigration = 'auto';
    this.showAbort = true;

    this.partitionService.partitionNumber = this.partitionNumber;
    this.partitionService.numberOfPartitions = this.numberOfPartitions;
    this.partitionService.partitions = this.partitions;
    this.partitionService.modeOfMigration = this.modeOfMigration;
    this.partitionService.showAbort = this.showAbort;

    console.log(this.migrationEndpoint);


  }    
  getAllInstances(PartitionId: string){
    this.migrationListenerService.getAllInstances(PartitionId).subscribe(
      resp=> {
        var instance: Instance;
        instance = resp;
        console.log(resp);
        for(var item in instance.Items){
          //this.listInstances[this.instance.Items[item].ReplicaId] = PartitionId;
          var migrationList = 'undefined';
          if(instance.Items[item].Address.length > 0){
            migrationList = this.getMigrationListener(instance.Items[item].Address);  
            console.warn(migrationList);          
          }
          if ( typeof migrationList !== 'undefined'){
            this.migrationEndpoint = migrationList;
            this.fetchMigrationProgress(this.migrationEndpoint);
          }
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


