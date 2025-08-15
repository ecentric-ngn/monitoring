import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api, g2c_url } from '../app.const/const';

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


  //save suspend
    saveSuspendDetails(suspendDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeSuspend`,suspendDetail);
  }
    suspendedIng2cSystem(suspendDetail: any) {
      return this.http.post(`${g2c_url}/compliance/suspend`, suspendDetail, {
        responseType: 'text' as const  // ✅ required to avoid TS error
      });
    }
  //save cancelled
    saveCancelledDetails(cancelledDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeCancel`,cancelledDetail);
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
    //rer
    // egister deregister certified builder
    saveReregisterdetails(reRegisterDetail:any){
      return this.http.post<any>(`${api_url}/specializedTradeDeregisteredReregister`,reRegisterDetail);
    }

    approveReinstatementIng2cSystem(payload: any) {
    return this.http.post(`${g2c_url}/compliance/approved`, payload, {
      responseType: 'text' as 'text'
    });
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
