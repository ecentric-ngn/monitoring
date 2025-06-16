import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api_url, fileUpload_api, web_service_url } from '../app.const/const';

@Injectable({
  providedIn: 'root'
})
export class SpecializedFirmService {

  constructor(private http: HttpClient) { }

  getListOfSpecializedFirm(specializedfirm:any){
    return this.http.post<any>(`${api_url}/view`,specializedfirm);
}
  getCitizenDetails(cid:any){
    return this.http.get(`${web_service_url}/getCitizenDetails/${cid}`);
  }
  updateGeneralInformation(contractor: any) {
    
    return this.http.put(`${api_url}/specializedFirmUpdateGeneralInformation`, contractor, { 
      responseType: 'text' 
    });
  }
  
  saveOwnerInformation(payload: any) {
    return this.http.post(`${api_url}/specializedFirmAddOwner`, payload, { responseType: 'text' });
  }
  updateOwnerInformation(payload: any) {
    return this.http.put(`${api_url}/specializedFirmUpdateOwner`, payload, { responseType: 'text' });
  }
  
//remove equipment data
removeEqData(removeEq:any){
  return this.http.delete(`${api_url}/specializedFirmEquipmentDelete`, {body:removeEq, responseType:'text'} );
}
//remove Human Resource
removeHrData(removeHR:any){
  return this.http.delete(`${api_url}/specializedFirmHrDelete`, {body:removeHR,responseType:'text'} ) ;
}
//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);
  return this.http.post(`${fileUpload_api}/file/upload`, formData, { responseType: 'text' });
}
//save deregisater
saveDowngradedetails(architectDetail:any){
  return this.http.post<any>(`${api_url}/specializedFirmAdverseCommentRecord`,architectDetail);
}
//save suspend
saveSuspendDetails(suspendDetail:any){
  return this.http.post<any>(`${api_url}/specializedFirmSuspend`,suspendDetail);
}
//save cancelled
saveCancelledDetails(cancelledDetail:any){
  return this.http.post<any>(`${api_url}/specializedFirmCancel`,cancelledDetail);
}
//reregister deregister contractor
saveDeReregister(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/specializedFirmDeregisteredReregister`,reRegisterDetail);
}
// reregister cancelled engineer
saveCancelledReregister(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/specializedFirmCancelledReregister`,reRegisterDetail);
}
 // revokesuspend enginner
 saveSuspendReregister(suspendRevoke:any){
  return this.http.post<any>(`${api_url}/specializedFirmSuspendedReregister`,suspendRevoke);
}

 //getting the adverse record list
 saveRecord(records:any){
  return this.http.post<any>(`${api_url}/specializedFirmAdverseCommentRecord`,records)
}
  //check and uncheck the category
uncheckCalssification(workCategoryId,specializedFirmId, checkedUnchecked){
const httpOption = {
      'Content-Type': 'application/json',  
    }
    return this.http.post(`${api_url}/specializedFirmToggle?specializedFirmId=${specializedFirmId}&workCategoryId=${workCategoryId}&checked=${checkedUnchecked}`, httpOption,{ responseType: 'text' })
    
  }
  //Getting list of workclassfication base on contractorID
getWorkClassification(workClassificationDetails:any){
  return this.http.post<any>(`${api_url}/specializedFirmExistingClassification`,workClassificationDetails);
}
//
getClassificationOfspecializedFirm(types: any) {
  return this.http.get<any>(`${api_url}/workCategoryClassification?type=${types}` );
}
  // method to download the file
  downloadFile(filePath:any) {
    return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
      observe: 'response', 
      responseType: 'blob' 
    });
  }
}


 

