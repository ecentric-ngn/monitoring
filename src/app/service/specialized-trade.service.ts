import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api } from '../app.const/const';

@Injectable({
  providedIn: 'root'
})
export class SpecializedTradeService {
  constructor(private http: HttpClient) { }

  //get list of getListOfSurveyor builder
  ListOfSpecializedTrade(specializedtrade:any) {
    return this.http.post<any>(`${api_url}/view`,specializedtrade);
  }
//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);
  return this.http.post(`${fileUpload_api}/file/upload`, formData, { responseType: 'text' });
}
updateGeneralInformation(specializedTrade: any) {
  return this.http.put(`${api_url}/specializedTradeUpdateGeneralInformation`, specializedTrade, { 
    responseType: 'text' 
  });
}

  //save deregisater
  saveDowngradedetails(specializedtrade:any){
    return this.http.post<any>(`${api_url}/specializedTradeAdverseCommentRecord`,specializedtrade);
  }
  //save suspend
    saveSuspendDetails(suspendDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeSuspend`,suspendDetail);
  }
  //save cancelled
    saveCancelledDetails(cancelledDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeCancel`,cancelledDetail);
    }
    //reregister deregister certified builder
    saveReregisterdetails(reRegisterDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeDeregisteredReregister`,reRegisterDetail);
    }
    // reregister cancelled certified builder
    saveCancelledReregister(reRegisterDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeCancelledReregister`,reRegisterDetail);
    }
    // revokesuspend certified builder
    saveSuspendReregister(suspendRevoke:any){
      return this.http.post<any>(`${api_url}/specializedTradeSuspendedReregister`,suspendRevoke);
    }
      //check and uncheck the category
   uncheckCalssification(workCategoryId,specializedTradeId, checkedUnchecked){
    const httpOption = {
          'Content-Type': 'application/json',  
        }
        return this.http.post(`${api_url}/specializedTradeToggle?specializedTradeId=${specializedTradeId}&workCategoryId=${workCategoryId}&checked=${checkedUnchecked}`, httpOption,{ responseType: 'text' })
        
      }
    //Getting list of workclassfication base on contractorID
    getWorkClassification(specializedTradeId:any){
      return this.http.post<any>(`${api_url}/specializedTradeExistingClassification`,specializedTradeId);
    }
    //
    getClassificationOfspecializedTrade(types: any) {
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
