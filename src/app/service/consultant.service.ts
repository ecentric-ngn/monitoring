import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api, web_service_url } from '../app.const/const';

export interface ConsultantData {
  workCategory: string;
  workClassification: string;
  // Add other properties as needed
}
@Injectable({
  providedIn: 'root'
})
export class ConsultantService {
constructor(private http:HttpClient) { }

//getting the list of consultant function
getListOfConsultant(consultant:any){
return this.http.post<any>(`${api_url}/view`,consultant)
}

updateGeneralInformation(consultant: any) {
  return this.http.put(`${api_url}/consultantUpdateGeneralInformation`, consultant, { 
    responseType: 'text' 
  });
}

saveOwnerInformation(payload: any) {
  return this.http.post(`${api_url}/consultantAddOwner`, payload, { responseType: 'text' });
}
updateOwnerInformation(payload: any) {
  return this.http.put(`${api_url}/consultantUpdateOwner`, payload, { responseType: 'text' });
}
//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);

  return this.http.post(`${fileUpload_api}/file/upload`, formData ,{ responseType: 'text' });
}
  getCitizenDetails(cid:any){
    return this.http.get(`${web_service_url}/getCitizenDetails/${cid}`);
  }
//Getting list of workclassfication base on contractorID
getWorkClassification(workClassificationDetails:any){
  return this.http.post<any>(`${api_url}/consultantExistingClassification`,workClassificationDetails);
}
//
getClassificationOfConsultant(types: any) {
  return this.http.get<any>(`${api_url}/workCategoryClassification?type=${types}` );
}
//remove equipment data
saveEqData(eqDetails:any) {
  return this.http.delete(`${api_url}/consultantEquipmentDelete`,{body:eqDetails,responseType:'text'});
}
//remove Human Resource
removeHrData(removeHRDetails: any){
  return this.http.delete(`${api_url}/consultantHrDelete`, {body:removeHRDetails, responseType: 'text' });
}

//save deregisater
saveDeregisterdetails(deregisterDetail:any){
return this.http.post<any>(`${api_url}/consultantAdverseCommentRecord`,deregisterDetail);
}

//save suspend
saveSuspendDetails(suspendDetail:any){
return this.http.post<any>(`${api_url}/consultantSuspend`,suspendDetail);
}
//save cancelled
saveCancelledDetails(cancelledDetail:any){
return this.http.post<any>(`${api_url}/consultantCancel`,cancelledDetail);
}
// reregister cancelled consultant
saveCancelledReregister(reRegisterDetail:any){
return this.http.post<any>(`${api_url}/consultantCancelledReregister`,reRegisterDetail);
}
//save deregisteredReregister consultant
saveDeregisteredReregister(reRegisterDetail:any){
  return this.http.post<any>(`${api_url}/consultantDeregisteredReregister`,reRegisterDetail);
  }
// revokesuspend consultant
saveSuspendReregister(suspendRevoke:any){
return this.http.post<any>(`${api_url}/consultantSuspendedReregister`,suspendRevoke);
}
//getting the adverse record list
saveRecord(records:any){
  return this.http.post<any>(`${api_url}/consultantAdverseCommentRecord`,records)
}
  //check and uncheck the category
  toggle(workCategoryId, workCategoryClassificationId, consultantID, checkedUnchecked){
    const httpOption = {
      'Content-Type': 'application/json',
    }
    return this.http.post(`${api_url}/toggle?consultantId=${consultantID}&workCategoryId=${workCategoryId}&workClassificationId=${workCategoryClassificationId}&checked=${checkedUnchecked}`, httpOption,{ responseType: 'text' })
  }
    // service.ts
  downloadFile(filePath:any) {
    return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
      observe: 'response', 
      responseType: 'blob' 
    });
  }
  }


