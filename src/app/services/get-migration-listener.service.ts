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
    return this.http.get<any>(this.ApiUrls.applicationsUrl);
   }

   getAllServices(ApplicationId: string){
    return this.http.get<any>(this.ApiUrls.getServicesUrl(ApplicationId));
   }

   getAllPartitions(ServiceId: string){
    return this.http.get<any>(this.ApiUrls.getPartitionUrl(ServiceId));
   }

   getAllInstances(PartitionId: string){
    return this.http.get<any>(this.ApiUrls.getInstanceUrl(PartitionId));
   }   
   FetchMigrationProgress(migrationEndpoint: string){
    var URL = "http://localhost:4200/fmp/aced0c08-673b-4276-bf69-95334029dbdf/133027837048242957/40dd3712-3163-4302-9451-604a61212d32/RcMigration/GetMigrationStatus";
    return this.http.get<any>(this.ApiUrls.getMigrationUrl(migrationEndpoint));
   }
}
