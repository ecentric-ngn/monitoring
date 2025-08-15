import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api, g2c_url } from '../app.const/const';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyorService {
  constructor(private http: HttpClient) { }
  //get list of getListOfSurveyor builder
  getListOfSurveyor(Surveyor:any): Observable<any> {
    return this.http.post<any>(`${api_url}/view`,Surveyor);
  }
  //uploading file
  uploadFile(file:File){
    const formData: FormData = new FormData();
    formData.append("file", file);
    return this.http.post(`${fileUpload_api}/file/upload`, formData, { responseType: 'text' });
  }
  updateGeneralInformation(specializedTrade: any) {
    return this.http.put(`${api_url}/surveyorUpdateGeneralInformation`, specializedTrade, { 
      responseType: 'text' 
    });
  }
  //save deregisater
  saveDeregisterdetails(surveyorDetail:any){
    return this.http.post<any>(`${api_url}/surveyorDeregister`,surveyorDetail);
  }
     /**
      * Suspends a surveyor from the G2C system.
      *
      * @param suspendDetail The details of the surveyor to be suspended.
      * @returns A promise that resolves to a string if the suspension is successful.
      */
     suspendedIng2cSystem(suspendDetail: any) {
        // Send a POST request to the G2C compliance suspend endpoint with the suspend detail
        return this.http.post(`${g2c_url}/compliance/suspend`, suspendDetail, {
          responseType: 'text' as const  // Required to avoid TypeScript error
        });
      }
  //save suspend
  saveSuspendDetails(suspendDetail:any){
    return this.http.post<any>(`${api_url}/surveyorSuspend`,suspendDetail);
  }
  //save cancelled
  saveCancelledDetails(cancelledDetail:any){
    return this.http.post<any>(`${api_url}/surveyorCancel`,cancelledDetail);
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
  //reregister deregister certified builder
  saveReregisterdetails(reRegisterDetail:any){
    return this.http.post<any>(`${api_url}/surveyorDeregisteredReregister`,reRegisterDetail);
  }
  // reregister cancelled certified builder
  saveCancelledReregister(reRegisterDetail:any){
    return this.http.post<any>(`${api_url}/surveyorCancelledReregister`,reRegisterDetail);
  }
  // revokesuspend certified builder
  saveSuspendReregister(suspendRevoke:any){
    return this.http.post<any>(`${api_url}/surveyorSuspendedReregister`,suspendRevoke);
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
