import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // Import Observable
import { api_url, fileUpload_api, g2c_url } from '../app.const/const';

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

  /**
   * Suspends a contractor from the G2C system.
   *
   * @param suspendDetail The details of the contractor to be suspended.
   * @returns A promise that resolves to a string if the suspension is successful.
   */
  suspendedIng2cSystem(suspendDetail: any) {
    return this.http.post(`${g2c_url}/compliance/suspend`, suspendDetail, {
      responseType: 'text' as const  // ✅ required to avoid TS error
    });
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
  /**
   * Cancels a contractor in the G2C system.
   *
   * @param suspendDetail The details of the contractor to be cancelled.
   * @returns A promise that resolves to a string if the cancellation is successful.
   */
  cancelledIng2cSystem(suspendDetail: any) {
    // Post the suspend detail to the G2C compliance cancel endpoint
    return this.http.post(`${g2c_url}/compliance/cancel`, suspendDetail, {
      responseType: 'text' as const  // ✅ required to avoid TS error
    });
  }
 // revokesuspend enginner
 saveSuspendReregister(suspendRevoke:any){
  return this.http.post<any>(`${api_url}/architectSuspendedReregister`,suspendRevoke);
}
  approveReinstatementIng2cSystem(payload: any) {
  return this.http.post(`${g2c_url}/compliance/approved`, payload, {
    responseType: 'text' as 'text'
  });
}
  // method to download the file
  downloadFile(filePath:any) {
    return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
      observe: 'response', 
      responseType: 'blob' 
    });
  }

}
