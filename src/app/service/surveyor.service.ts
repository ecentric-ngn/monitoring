import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api } from '../app.const/const';
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
  //save suspend
  saveSuspendDetails(suspendDetail:any){
    return this.http.post<any>(`${api_url}/surveyorSuspend`,suspendDetail);
  }
  //save cancelled
  saveCancelledDetails(cancelledDetail:any){
    return this.http.post<any>(`${api_url}/surveyorCancel`,cancelledDetail);
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
  // method to download the file
  downloadFile(filePath:any) {
    return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
      observe: 'response', 
      responseType: 'blob' 
    });
  }

}
