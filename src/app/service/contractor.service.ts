import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, g2c_url, web_service_url } from '../app.const/const';
import { fileUpload_api } from '../app.const/const';

@Injectable({
  providedIn: 'root'
})
export class ContractorService {

  constructor(private http:HttpClient) { }
  //getting the list of contractor

  getContractorDetails(contractor:any){
    return this.http.post<any>(`${api_url}/view`,contractor);
  }
  getCitizenDetails(cid:any){
    return this.http.get(`${web_service_url}/getCitizenDetails/${cid}`);
  }

  updateGeneralInformation(contractor: any) {
    
    return this.http.put(`${api_url}/contractorUpdateGeneralInformation`, contractor, { 
      responseType: 'text' 
    });
  }
  
  saveOwnerInformation(payload: any) {
    return this.http.post(`${api_url}/contractorAddOwner`, payload, { responseType: 'text' });
  }
  updateOwnerInformation(payload: any) {
    return this.http.put(`${api_url}/contractorUpdateOwner`, payload, { responseType: 'text' });
  }
  
//remove equipment data
removeEqData(saveEqDetails:any){
  return this.http.delete(`${api_url}/contractorEquipmentDelete`,{body:saveEqDetails,responseType:'text'} );
}
//remove Human Resource
removeHrData(saveHrDetails: any) {
  return this.http.delete(`${api_url}/contractorHrDelete`, { body: saveHrDetails, responseType: 'text'});
}

  //Getting list of workclassfication base on contractorID
  getWorkClassification(workClassificationDetails:any){
    return this.http.post<any>(`${api_url}/contractorExistingClassification`,workClassificationDetails);
  }
  //
  getClassificationOfContractor(types: any) {
    return this.http.get<any>(`${api_url}/workCategoryClassification?type=${types}` );
}
 
//save deregisater
  saveDownGradedetails(downGradeDetail:any){
    return this.http.post<any>(`${api_url}/contractorDowngrade`,downGradeDetail);
  }

  // reregister cancelled contractor
  saveCancelledReregister(reRegisterDetail:any){
    return this.http.post<any>(`${api_url}/contractorCancelledReregister`,reRegisterDetail);
  }
  //save  deregister details
  savedeRegister(reRegisterDetail:any){
    return this.http.post<any>(`${api_url}/contractorDeregisteredReregister`,reRegisterDetail);
  }
//uploading filecon
uploadFile(file: File) {
  const formData: FormData = new FormData();
  formData.append("file", file);
  // formData.append("entityId", entityId);
  // formData.append("entityType", entityType);
  return this.http.post(`${fileUpload_api}/file/upload`, formData ,{ responseType: 'text' });
}
   saveSuspendReregister(suspendRegisterDetail:any){
    return this.http.post<any>(`${api_url}/contractorSuspendedReregister`,suspendRegisterDetail);
  }

  approveReinstatementIng2cSystem(payload: any) {
  return this.http.post(`${g2c_url}/compliance/approved`, payload, {
    responseType: 'text' as 'text'
  });
}
  //save suspend
  saveSuspendDetails(suspendDetail:any){
    return this.http.post<any>(`${api_url}/contractorSuspend`,suspendDetail);
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
    return this.http.post<any>(`${api_url}/contractorCancel`,cancelledDetail);
  }
  cancelledIng2cSystem(suspendDetail: any) {
    return this.http.post(`${g2c_url}/compliance/cancel`, suspendDetail, {
      responseType: 'text' as const  // ✅ required to avoid TS error
    });
  }



 //getting the adverse record list
 saveRecord(records:any){
    return this.http.post<any>(`${api_url}/contractorAdverseCommentRecord`,records)
  }
  //delete equipment data
  deleteEqData(id:any){
    return this.http.delete<any>(`${api_url}/equipment/deleteEquipment/${id}`)
  }

  // service.ts
downloadFile(filePath:any) {
  return this.http.get(`${fileUpload_api}/file/download?filePath=${filePath}`, { 
    observe: 'response', 
    responseType: 'blob' 
  });
}

}
