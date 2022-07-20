import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
export class APIurls{
    static getPartitionUrl(ServiceId: string) {
      throw new Error('Method not implemented.');
    }
    constructor(){
        
    }
    public  baseurl = "http://localhost:4200/";
    public  applicationsUrl = this.baseurl + "api/Applications?api-version=6.1";
    
    private  partitionUrl_base = this.baseurl + "api/Services/";
    private  partitionUrl_rt = "/$/GetPartitions?api-version=6.4";

    private instanceUrl_base = this.baseurl + "api/Partitions/";
    private instanceUrl_rt = "/$/GetReplicas?api-version=6.0";

    private serviceUrl_base = this.baseurl + "api/Applications/";
    private serviceUrl_rt = "/$/GetServices?api-version=6.0";

    private migrationProgressUrl_base = this.baseurl +"fmp";   
    private migrationProgressUrl_rt = "/RcMigration/GetMigrationStatus";

    getPartitionUrl(ServiceId : string){
        return this.partitionUrl_base + ServiceId + this.partitionUrl_rt;
    }

    getInstanceUrl(PartitionId : string){
        return this.instanceUrl_base + PartitionId + this.instanceUrl_rt;
    }

    getServicesUrl(ApplicationId : string){
        return this.serviceUrl_base + ApplicationId + this.serviceUrl_rt;
    }

    getApplicationUrl(){
        return this.applicationsUrl;
    }

    getMigrationUrl(MigrationEndpoint: string){
        var i = 7
        for(var i = 7; i < MigrationEndpoint.length; i++){
            if(MigrationEndpoint[i] == '/')     {break;}
        }
        var mig = MigrationEndpoint.slice(i);
        return this.migrationProgressUrl_base + mig + this.migrationProgressUrl_rt;
    }

}