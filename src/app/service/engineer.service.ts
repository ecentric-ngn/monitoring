import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // Import Observable
import { api_url, fileUpload_api, g2c_url } from '../app.const/const';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EngineerService {
constructor(private http: HttpClient) { }
//get list of all  engineer details
getListOfEngineer(engineer:any): Observable<any> {
return this.http.post<any>(`${api_url}/view`,engineer);
}
//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);
  return this.http.post(`${fileUpload_api}/file/upload`, formData, { responseType: 'text' });
}
updateGeneralInformation(engineer: any) {
  return this.http.put(`${api_url}/engineerUpdateGeneralInformation`, engineer, { 
    responseType: 'text' 
  });
}

//save deregisater
// saveDeregisterdetails(engineerDetail:any){
//   return this.http.post<any>(`${api_url}/engineerDeregister`,engineerDetail);
//   }
//save suspend
saveSuspendDetails(suspendDetail:any){
return this.http.post<any>(`${api_url}/engineerSuspend`,suspendDetail);
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
saveCancelledDetails(cancelledDetail:any){
return this.http.post<any>(`${api_url}/engineerCancel`,cancelledDetail);
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
//reregister deregister contractor
saveReregisterdetails(reRegisterDetail:any){
return this.http.post<any>(`${api_url}/engineerDeregisteredReregister`,reRegisterDetail);
}
  approveReinstatementIng2cSystem(payload: any) {
  return this.http.post(`${g2c_url}/compliance/approved`, payload, {
    responseType: 'text' as 'text'
  });
}
// reregister cancelled engineer
saveCancelledReregister(reRegisterDetail:any){
return this.http.post<any>(`${api_url}/engineerCancelledReregister`,reRegisterDetail);
}
// revokesuspend enginner
saveSuspendReregister(suspendRevoke:any){
return this.http.post<any>(`${api_url}/engineerSuspendedReregister`,suspendRevoke);
}

//get Registration/history for engineers
   getRegistrationinformation(engineer:any): Observable<any> {
    return this.http.post<any>(`${api_url}/view`, engineer);
  }
    // method to download the file
    downloadFile(filePath:any) {
      return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
        observe: 'response', 
        responseType: 'blob' 
      });
    }
}
