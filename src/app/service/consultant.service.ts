import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api, fileUploadfromg2c, g2c_url, web_service_url } from '../app.const/const';

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

  /**
   * Suspends a consultant from the G2C system.
   *
   * @param suspendDetail The details of the consultant to be suspended.
   * @returns A promise that resolves to a string if the suspension is successful.
   */
  suspendedIng2cSystem(suspendDetail: any) {
    // The 'as const' assertion is necessary to avoid a TS error.
    return this.http.post(`${g2c_url}/compliance/suspend`, suspendDetail, {
      responseType: 'text' as const
    });
  }
//save cancelled
saveCancelledDetails(cancelledDetail:any){
return this.http.post<any>(`${api_url}/consultantCancel`,cancelledDetail);
}
// reregister cancelled consultant
saveCancelledReregister(reRegisterDetail:any){
return this.http.post<any>(`${api_url}/consultantCancelledReregister`,reRegisterDetail);
}
  cancelledIng2cSystem(suspendDetail: any) {
    return this.http.post(`${g2c_url}/classification/downgrade/endorse`, suspendDetail, {
      responseType: 'text' as const  // ✅ required to avoid TS error
    });
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
    downloadhrandeqFile(filePath:any) {
      return this.http.get(`${fileUploadfromg2c}/public_access/compliance/download?path=${filePath}`, { 
        observe: 'response', 
        responseType: 'blob' 
      });
    }
  }


