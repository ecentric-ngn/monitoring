import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // Import Observable
import { api_url, fileUpload_api, g2c_url, web_service_url } from '../app.const/const';

@Injectable({
  providedIn: 'root'
})
export class CertifiedBuilderService {
  
  constructor(private http: HttpClient) { }

  //get list of certified builder
  getListOfCertifiedBuilder(CertifiedBuilder:any): Observable<any> {
    return this.http.post<any>(`${api_url}/view`,CertifiedBuilder);
  }
  updateGeneralInformation(certifiedBuilder: any) {
    return this.http.put(`${api_url}/certifiedBuilderUpdateGeneralInformation`, certifiedBuilder, { 
      responseType: 'text' 
    });
  }
  
  saveOwnerInformation(payload: any) {
    return this.http.post(`${api_url}/certifiedBuilderAddOwner`, payload, { responseType: 'text' });
  }
  updateOwnerInformation(payload: any) {
    return this.http.put(`${api_url}/certifiedBuilderUpdateOwner`, payload, { responseType: 'text' });
  }
  
//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);
  return this.http.post(`${fileUpload_api}/file/upload`, formData,{responseType:'text'});
}
  getCitizenDetails(cid:any){
    return this.http.get(`${web_service_url}/getCitizenDetails/${cid}`);
  }
//remove equipment data
removeEqData(removeEq:any) {
  return this.http.delete(`${api_url}/certifiedBuilderEquipmentDelete`,{body:removeEq,responseType:'text'} )
}
//remove Human Resource
removeHrData(removeHr:any) {
  return this.http.delete(`${api_url}/certifiedBuilderHrDelete`,{body:removeHr, responseType:'text'});
}
 //save deregisater
saveDeregisterdetails( certifiedBuilder:any){
  return this.http.post<any>(`${api_url}/certifiedBuilderDeregister`, certifiedBuilder);
}
//save suspend
saveSuspendDetails(suspendDetail:any){
  return this.http.post<any>(`${api_url}/certifiedBuilderSuspend`,suspendDetail);
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
  return this.http.post<any>(`${api_url}/certifiedBuilderCancel`,cancelledDetail);
}
  cancelledIng2cSystem(suspendDetail: any) {
    return this.http.post(`${g2c_url}/compliance/cancel`, suspendDetail, {
      responseType: 'text' as const  // ✅ required to avoid TS error
    });
  }
  
  approveReinstatementIng2cSystem(payload: any) {
  return this.http.post(`${g2c_url}/compliance/approved`, payload, {
    responseType: 'text' as 'text'
  });
}
//reregister deregister certified builder
saveReregisterdetails(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/certifiedBuilderDeregisteredReregister`,reRegisterDetail);
}
// reregister cancelled certified builder
saveCancelledReregister(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/certifiedBuilderCancelledReregister`,reRegisterDetail);
}
 // revokesuspend certified builder
 saveSuspendReregister(suspendRevoke:any){
  return this.http.post<any>(`${api_url}/certifiedBuilderSuspendedReregister`,suspendRevoke);
}
 //getting the adverse record list
 saveRecord(records:any){
  return this.http.post<any>(`${api_url}/certifiedBuilderAdverseCommentRecord`,records)
}
  // method to download the file
  downloadFile(filePath:any) {
    return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
      observe: 'response', 
      responseType: 'blob' 
    });
  }
}
