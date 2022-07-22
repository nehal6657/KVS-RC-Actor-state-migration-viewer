import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIurls } from '../Common/APIurls';

@Injectable({
  providedIn: 'root'
})
export class GetMigrationListenerService {

  constructor(private http: HttpClient,
              private ApiUrls: APIurls) {}
              
   ngOnInit(){}


   getAllApplications(){
    console.warn(this.ApiUrls.applicationsUrl);
    return this.http.get<any>(this.ApiUrls.applicationsUrl);
   }

   getAllServices(ApplicationId: string){
    console.warn(this.ApiUrls.getServicesUrl(ApplicationId));
    return this.http.get<any>(this.ApiUrls.getServicesUrl(ApplicationId));
   }

   getAllPartitions(ServiceId: string){
    console.warn(this.ApiUrls.getPartitionUrl(ServiceId));
    return this.http.get<any>(this.ApiUrls.getPartitionUrl(ServiceId));
   }

   getAllInstances(PartitionId: string){
    console.warn(this.ApiUrls.getInstanceUrl(PartitionId));
    return this.http.get<any>(this.ApiUrls.getInstanceUrl(PartitionId));
   }   
   FetchMigrationProgress(migrationEndpoint: string){
    return this.http.get<any>(this.ApiUrls.getMigrationUrl(migrationEndpoint));
   }
}
