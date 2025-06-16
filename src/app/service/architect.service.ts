import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // Import Observable
import { api_url, fileUpload_api } from '../app.const/const';

@Injectable({
  providedIn: 'root'
})
export class ArchitectService {
constructor(private http: HttpClient) { }

//get list of architect details
getListOfArchitect(architect:any): Observable<any> {
return this.http.post<any>(`${api_url}/view`, architect);
}
updateGeneralInformation(architect: any) {
  return this.http.put(`${api_url}/architectUpdateGeneralInformation`, architect, { 
    responseType: 'text' 
  });
}

//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);
  return this.http.post(`${fileUpload_api}/file/upload`, formData, { responseType: 'text' });
}
//save deregisater
saveDeregisterdetails(architectDetail:any){
  return this.http.post<any>(`${api_url}/architectDeregister`,architectDetail);
}
//save suspend
saveSuspendDetails(suspendDetail:any){
  return this.http.post<any>(`${api_url}/architectSuspend`,suspendDetail);
}
//save cancelled
saveCancelledDetails(cancelledDetails:any){
  return this.http.post<any>(`${api_url}/architectCancel`,cancelledDetails);
}
//reregister deregister contractor
saveReregisterdetails(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/architectDeregisteredReregister`,reRegisterDetail);
}
// reregister cancelled engineer
saveCancelledReregister(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/architectCancelledReregister`,reRegisterDetail);
}
 // revokesuspend enginner
 saveSuspendReregister(suspendRevoke:any){
  return this.http.post<any>(`${api_url}/architectSuspendedReregister`,suspendRevoke);
}
  // method to download the file
  downloadFile(filePath:any) {
    return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
      observe: 'response', 
      responseType: 'blob' 
    });
  }

}
