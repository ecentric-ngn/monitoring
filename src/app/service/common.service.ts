import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Agency_api_url, api_url, api_url_Monitoring, api_url_Monitoring_siteEngineer, fileUpload_api, fileUpload_api_url_Monitoring, g2c_url, g2c_url_Suspended, otp_api_url, userManagmentAPI, web_service_url } from "../app.const/const";
import { NavigationExtras, Router } from "@angular/router";
import { BehaviorSubject, catchError, map, Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  storage: any;

  private bctaNoSource = new BehaviorSubject<string | null>(null);
  bctaNo$ = this.bctaNoSource.asObservable();

  private firmInfoSource = new BehaviorSubject<any>(null);
  firmInfo$ = this.firmInfoSource.asObservable();

  setFirmInfo(info: { firmName: string, mobileNo: string, email: string }) {
    this.firmInfoSource.next(info);
  }

  setBctaNo(bctaNo: string) {
    this.bctaNoSource.next(bctaNo);
  }

  // Shared service method to get the data using the provided property name
  getData(propertyName: string): any {
    return history.state[propertyName];

  }
  // Shared service method to set the tender ID and navigate to the specified route
  // Shared service method to set the tender ID and navigate to the specified route
  setData(data: any, propertyName: string, route: string) {

    // Create an object with the dynamic property name and ID
    const stateObj = { [propertyName]: data };
    // Create NavigationExtras with the state object
    const navigationExtras: NavigationExtras = {
      state: stateObj
    }
    // Navigate to the specified route, passing the NavigationExtras
    this.router.navigate([route], navigationExtras);
  }

  setTableData(value: any, key: string, route: string): void {
    this.storage.set(key, value);
    // Optionally store `route` too if needed
  }

  getTableData(key: string): any {
    return this.storage.get(key);
  }
  //This is tenderID to fetch the tender details based on the tender id
  egpTenderId: any

  setTenderId(id: any) {
    this.egpTenderId = id;
  }
  getTenderId() {
    return this.egpTenderId;
  }

  constructor(private http: HttpClient, private router: Router) { }

  //crps endpoint
  getModelsByUserId(payload: any, token: any, module: any) {

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(
      `${userManagmentAPI}/usermgt/menu/getMenuSubmenuByUserId/${payload}/${module}`,
      { headers }

    );
  }
  //save audit memo
  createAuditMemo(payload) {
    return this.http.post<any>(`${api_url}/createAuditMemo`, payload)
  }
  
  

  // fetch audit data from view
  fetchAuditData(payload) {
    return this.http.post<any>(`${api_url}/view`, payload);
  }
  viewData(payload) {
    return this.http.post<any>(`${api_url}/view`, payload);
  }



  //update audit meno
  updateAuditMemo(payload: any) {
    return this.http.put<string>(`${api_url}/updateAuditMemo`, payload, { responseType: 'text' as 'json' });
  }
  //delete audit record
  deleteAuditData(id: any) {
    return this.http.delete<string>(`${api_url}/deleteAuditMemo/${id}`, { responseType: 'text' as 'json' });
  }

  saveAsDraft(payload: any) {
    return this.http.post<string>(`${api_url_Monitoring}/draft`, payload, { responseType: 'text' as 'json' });
  }

saveOnQualityData(payload: any, tableId: any, workId: any) {
  return this.http.post<string>(
    `${api_url_Monitoring}/${tableId}/oq-tests?workID=${workId}`,
    payload,
    { responseType: 'text' as 'json' }
  );
}


saveReinforcementData(payload: any, tableId: any, workId: any) {
  return this.http.post<string>(
    `${api_url_Monitoring}/${tableId}/reinforcement?workID=${workId}`,
    payload,
    { responseType: 'text' as 'json' }
  );
}


saveCertifiedSkillWorkerData(payload: any, tableId: any, workId: any) {
  return this.http.post<string>(
    `${api_url_Monitoring}/${tableId}/csw?workID=${workId}`,
    payload,
    { responseType: 'text' as 'json' }
  );
}

  saveWorkInformation(payload: any): Observable<string> {
    return this.http.post(`${otp_api_url}/work-information`, payload, {
      responseType: 'text' as 'text'
    });
  }

  saveNewContractorInformationData(payload: any): Observable<string> {
    return this.http.post(`${api_url_Monitoring}/new-contractor`, payload, {
      responseType: 'text' as 'text'
    });
  }

  updateWorkInformationData(payload: any, id: any): Observable<string> {
    return this.http.put(`${otp_api_url}/work-information/${id}`, payload, {
      responseType: 'text' as 'text'
    });
  }




  saveWorkDetails(payload: any) {
    return this.http.post<string>(`${otp_api_url}/inspection-details`, payload, { responseType: 'text' as 'json' });
  }
  generateApplicationNo(id: any) {
    return this.http.post<string>(`${api_url_Monitoring}/${id}/submit`, null);
  }
  getReportList() {
    return this.http.get<any>(`${api_url_Monitoring}/application-numbers-status`);
  }
  getApplicationDetails(id: any) {
    return this.http.get<any>(`${api_url_Monitoring}/${id}`);
  }
  uploadFile(file: File) {
    const formData: FormData = new FormData();
    formData.append("file", file);
    return this.http.post(`${fileUpload_api_url_Monitoring}/file/upload`, formData, { responseType: 'text' });
  }
  // uploadFiles(file: File, remarks: string, formType: string, userName: string) {
  //   const formData: FormData = new FormData();
  //   formData.append("file", file);
  //   formData.append("remarks", remarks);
  //   formData.append("formType", formType);
  //   formData.append("createdBy", userName);
  //   formData.append('documentType', 'pdf'); // s✅ Add this
  //   return this.http.post(`${fileUpload_api_url_Monitoring}/file/upload`, formData, { responseType: 'text' });
  // }

    uploadFiles(file: File, remarks: string, formType: string, userName: string,workId:any) {
    const formData: FormData = new FormData();
    formData.append("file", file);
    formData.append("remarks", remarks);
    formData.append("formType", formType);
    formData.append("createdBy", userName);
    formData.append('documentType', 'pdf'); // ✅ Add this
    formData.append('workId', workId); // ✅ Add this
    return this.http.post(`${fileUpload_api_url_Monitoring}/file/upload`, formData, { responseType: 'text' });
  }
  // saveCheckListId(checklistId: any, payload: any) {
  //   return this.http.post<any>(`${api_url_Monitoring}/${checklistId}/assign-files`, payload, { responseType: 'text' as 'json' });
  // }

saveCheckListId(checklistId: any, workId: any, payload: any) {
  return this.http.post<any>(
    `${api_url_Monitoring}/${checklistId}/assign-files?workID=${workId}`,
    payload,
    { responseType: 'text' as 'json' }
  );
}



  saveActionTakenByData(payload: any, checklistId: any) {
    return this.http.post<any>(`${api_url_Monitoring}/monitoring-actions/${checklistId}`, payload, { responseType: 'text' as 'json' });
  }

  forwardApplicationToReviewer(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring}/forward`, payload, { responseType: 'text' as 'json' });
  }

  sendMassEmail(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/contractor/compliance/notification`, payload, { responseType: 'text' as 'json' });
  }

  sendMassMailToCertifiedBuilders(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/certified-builder/compliance/notification`, payload, { responseType: 'text' as 'json' });
  }

  sendMassMailToConsultant(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/consultant/compliance/notification`, payload, { responseType: 'text' as 'json' });
  }

  sendMassMailToSpecializedFirm(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/specialized-firm/compliance/notification`, payload, { responseType: 'text' as 'json' });
  }

  saveOfficeSignageAndDoc(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/contractor/compliance/save`, payload, { responseType: 'text' as 'json' });
  }

  saveOfficeSignageAndDocConsultancy(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/consultant/compliance/save`, payload, { responseType: 'text' as 'json' });
  }

  saveOfficeSignageAndDocCB(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/certified-builder/compliance/save`, payload, { responseType: 'text' as 'json' });
  }

  saveOfficeSignageAndDocSF(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/specialized-firm/compliance/save`, payload, { responseType: 'text' as 'json' });
  }

  forwardToReviewCommitee(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/contractor/compliance/forward-to-committee`, payload, {
      responseType: 'text'
    });
  }

  forwardToReviewCommiteeConsultancy(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/consultant/compliance/forward-to-committee`,payload);
  }
  forwardToReviewCommiteeCB(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/certified-builder/compliance/forward-to-committee`,payload, { responseType: 'text' as 'json' });
  }

  forwardToReviewCommiteeSF(payload: any) {
    return this.http.post<any>(`${api_url_Monitoring_siteEngineer}/specialized-firm/compliance/forward-to-committee`,payload, { responseType: 'text' as 'json' });
  }
  generateOtp(mobileNo: any) {
    console.log('mobileNo', mobileNo);
    const params = new HttpParams().set('mobileNumber', mobileNo);
    return this.http.post(`${otp_api_url}/otp/generate`, null, {
      params,
      responseType: 'text' as 'json'  // casting to satisfy TypeScript
    });
  }
saveSiteEngineerData(payload: any, tableId: any, workId: any) {
  return this.http.post<any>(
    `${api_url_Monitoring_siteEngineer}/client-site-engineers/${tableId}?workID=${workId}`,
    payload,
    { responseType: 'text' as 'json' }
  );
}


 saveMonitoringTeamData(payload: any, tableId: any, workId: any) {
  return this.http.post<any>(
    `${api_url_Monitoring_siteEngineer}/monitoring-team-member/${tableId}?workID=${workId}`,
    payload,
    { responseType: 'text' as 'json' }
  );
}

  getUserDetails(payload: any) {
    return this.http.post<any>(`${userManagmentAPI}/usermgt/view`, payload);
  }
  validateOtp(mobileNo: any, otp: any) {
    const params = new HttpParams()
      .set('mobileNumber', mobileNo)
      .set('otp', otp);
    return this.http.post(`${otp_api_url}/otp/validate`, null, {
      params,
      responseType: 'text' as 'json' // tells Angular to expect plain text, casted to satisfy typing
    });
  }


  saveEndorseRejectApplication(payload: any) {
    return this.http.post<any>(
      `${otp_api_url}/review/checklists/decision`, payload, { responseType: 'text' as 'json' }

    );
  }
  // saveRejectApplicationData(payload:any) {
  //   return this.http.post<any>(
  //     `${otp_api_url}/review/checklists/decision`,payload,{responseType: 'text' as 'json'}

  //   );
  // }

  // saveRejectApplicationData(payload: any, id: any, reviewerId: any, rejectReason: any) {
  //   const params = {
  //     decision: payload,
  //     reviewerId: reviewerId
  //   };
  //   const body = {
  //     remarks: rejectReason.remarks
  //   };return this.http.post<any>(
  //     `${otp_api_url}/review/checklists/${id}/decision`,body,{params: params,responseType: 'text' as 'json'
  //     }
  //   );
  // }

  getEmailedContractors() {
    return this.http.get<any[]>(`${api_url_Monitoring_siteEngineer}/contractor/compliance/emailed-contractors

`);
  }
  getConsultancyFirm() {
    return this.http.get<any[]>(`${api_url_Monitoring_siteEngineer}/consultant/compliance/emailed-consultants
`);
  }
  getSpecilizedFirm() {
    return this.http.get<any[]>(`${api_url_Monitoring_siteEngineer}/specialized-firm/compliance/emailed-specialized-firms

`  );
  }
  getCertifiedFirm() {
    return this.http.get<any[]>(`${api_url_Monitoring_siteEngineer}/certified-builder/compliance/emailed-certified-builders

`  );
  }
  notifyMonitoringCommittee(ids: number[]) {
    return this.http.post<any>(
      `${api_url_Monitoring_siteEngineer}/contractor/compliance/notify-monitoring-committee`,
      ids, // Send the array directly
      { responseType: 'text' as 'json' }
    );
  }

  consultantFirmNotifyingMonitoringCommittee(ids: number[]) {
    return this.http.post<any>(
      `${api_url_Monitoring_siteEngineer}/consultant/compliance/notify-monitoring-committee
`,
      ids,
      { responseType: 'text' as 'json' }
    );
  }

  specilizedFirmNotifyingMonitoringCommittee(ids: number[]) {
    return this.http.post<any>(
      `${api_url_Monitoring_siteEngineer}/specialized-firm/compliance/notify-monitoring-committee`,
      ids,
      { responseType: 'text' as 'json' }
    );
  }

  certifiedBuilderFirmNotifyingMonitoringCommittee(ids: number[]) {
    return this.http.post<any>(
      `${api_url_Monitoring_siteEngineer}/certified-builder/compliance/notify-monitoring-committee`,
      ids,
      { responseType: 'text' as 'json' }
    );
  }

  fetchCertifiedBuilderDetails(payload: any, pageNo: any, pageSize: any, viewName: any) {
    return this.http.post<any>(`${api_url_Monitoring}/view?pageNo=${pageNo}&pageSize=${pageSize}&viewName=${viewName}`, payload);
  }

  fetchconsultantDetails(payload: any, pageNo: any, pageSize: any, viewName: any) {
    return this.http.post<any>(`${api_url_Monitoring}/view?pageNo=${pageNo}&pageSize=${pageSize}&viewName=${viewName}`, payload);
  }

  fetchSpecializedDetails(payload: any, pageNo: any, pageSize: any, viewName: any) {
    return this.http.post<any>(`${api_url_Monitoring}/view?pageNo=${pageNo}&pageSize=${pageSize}&viewName=${viewName}`, payload);
  }

  fetchDetails(payload: any, pageNo: any, pageSize: any, viewName: any) {
    return this.http.post<any>(`${api_url_Monitoring}/view?pageNo=${pageNo}&pageSize=${pageSize}&viewName=${viewName}`, payload);
  }
  deleteFile(fileId: string) {
    return this.http.delete(`${fileUpload_api_url_Monitoring}/file/files/${fileId}`, { responseType: 'text' });
  }
  /**
   * Saves compliance and non-compliance data for a specific contractor.
   * Makes an HTTP POST request to process the data based on the provided table ID.
   * @param payload The data to be processed for compliance and non-compliance.
   * @param tableId The identifier of the table associated with the contractor.
   * @returns An observable that emits the server response.
   */
  savecomplianceAndNonCompliance(payload: any, tableId: any): Observable<any> {
    return this.http.post<any>(`${otp_api_url}/contractor/process/${tableId}`, payload, { responseType: 'text' as 'json' });
  }
  downloadFile(filePath: any) {
    return this.http.get(`${api_url_Monitoring_siteEngineer}/file/download?filePath=${filePath}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  saveReviewedData(payload: any): Observable<any> {
    return this.http.post<any>(`${otp_api_url}/review/review-status`, payload, { responseType: 'text' as 'json' });
  }
  /**
   * This function makes an HTTP GET request to the DCRC API to fetch citizen details
   * based on the provided CID.
   * @param cid The CID of the citizen whose details are to be fetched.
   * @returns An observable that emits the response from the API.
   */
  getCitizenDetails(cid: any): Observable<any> {
    return this.http.get(`${web_service_url}/getCitizenDetails/${cid}`);
  }

  // getBaseOnEid(eidnumber: number): Observable<any> {
  //   return this.http.get(`${web_service_url}/getEmployeeDetails/${eidnumber}`)
  // }


  fetchComplianceData() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/contractor/compliance/emailed-contractors`);
  }

  fetchComplianceDataConsultants() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/consultant/compliance/emailed-consultants`);
  }

  fetchComplianceDataCertifiedBuilders() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/certified-builder/compliance/emailed-certified-builders`);
  }

  fetchComplianceDataSpecializedFirms() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/specialized-firm/compliance/emailed-specialized-firms`);
  }

  getDatabasedOnBctaNo(bctaNo: any) {
    return this.http.get(`${g2c_url}/compliance/full/${bctaNo}`);
  }
   getDatabasedOnBctaNos(bctaNo: any,appNo: any) {
    return this.http.get(`${g2c_url}/compliance/full/${bctaNo}/${appNo}`);
  }

   getSuspendedDatabasedOnBctaNo(bctaNo: any) {
    return this.http.get(`${g2c_url_Suspended}/compliance/fullSuspension/${bctaNo}`);
  }

  // download file
  downloadFileFirm(filePath: string): Observable<any> {
    const params = new HttpParams().set('path', filePath);

    return this.http.get(`${g2c_url_Suspended}/compliance/download`, {
      params: params,
      responseType: 'blob',
      observe: 'response'
    });
  }




  //cinet endpoint

  getCinetModelsByUserId(payload: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(
      `${userManagmentAPI}/usermgt/model/getModelsByUserId/${payload}`,
      { headers }
    );
  }
  getPrivileges(submenuId: any, uuid: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(
      `${userManagmentAPI}/usermgt/privilege/getPrivilegesByUserId/${uuid}/${submenuId}`,
      { headers }
    );
  }
  //getting the list of consultant function
  getList(consultant: any) {
    return this.http.post<any>(`${api_url}/view`, consultant)
  }
  getAllAgency() {
    return this.http.get<any>(`${Agency_api_url}/agency/getAllAgency`);
  }

  getVehicleDetails(vehicleNo: any, vehicleType: string) {
    return this.http.get(`${web_service_url}/getVehicleDetails/${vehicleNo}/${vehicleType}`);
  }

  getWorkCategory(type: string) {
    const params = new HttpParams().set('type', type);
    return this.http.get<any>(
      `${api_url_Monitoring_siteEngineer}/classification/workCategoryClassification`,
      { params }
    );
  }

  FetchPolicyDetails(policyNo: any) {
   return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/searchThirdParty?registrationNo=${policyNo}` )
  }

    verifyPayslipDetails(policyNo: any) {
   return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/searchTDS?registrationNo=${policyNo}` )
  }
  getClassification(firmType: string, firmId: string) {
    const params = new HttpParams()
      .set('firmType', firmType)
      .set('firmId', firmId);

    return this.http.get<any>(
      `${api_url_Monitoring_siteEngineer}/classification/all-existing-classifications`,
      { params }
    );
  }

  reinstateLicense(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/status/license-status/update`, payload, { responseType: 'text' });
  }

  getReinstateApplication(firmId: string) {
    return this.http.get<any>(`${g2c_url}/compliance/suspensionFirm/${firmId}`);
  }

approveReinstatement(payload: any) {
  return this.http.post(`${g2c_url}/compliance/approved`, payload, {
    responseType: 'text' as 'text'
  });
}


  downgradeFirm(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/classification/downgrade/request`, payload, { responseType: 'text' });
  }

rejectApplication(category: string, bctaNo: string) {
  const params = new HttpParams()
    .set('category', category)
    .set('bctaNO', bctaNo);

  return this.http.post(
    `${api_url_Monitoring_siteEngineer}/contractor/compliance/reject`,
    {}, // No body
    { params, responseType: 'text' }
  );
}

  downgradeConsultancy(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/classification/consultant/request-downgrade`, payload, { responseType: 'text' });
  }

  downgradeSF(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/classification/specialized-firm/downgrade/request`, payload, { responseType: 'text' });
  }

  cancelFirm(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/classification/firm/cancel`, payload, { responseType: 'text' });
  }

  suspendFirm(payload: any) {
    return this.http.post(`${api_url_Monitoring_siteEngineer}/classification/firm/suspend`, payload);
  }

  getDatabasedOnReviewAction() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/classification/review-actions/suspensions`);

  }

   fetchActiveLicenseList() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/classification/review-actions/active`);

  }
  endorseApplications(payload: { suspensionIds: number[], reviewedBy: string }): Observable<string> {
    return this.http.post(
      `${api_url_Monitoring_siteEngineer}/classification/endorse-suspensions`,
      payload,
      {
        responseType: 'text' as const,  // Crucial for text responses
        observe: 'response'  // Get full response object
      }
    ).pipe(
      map(response => {
        // Return the response body text
        return response.body || 'Suspensions endorsed successfully';
      }),
      catchError(error => {
        // Convert HttpErrorResponse to error message string
        let errorMessage = 'Failed to forward applications';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          errorMessage = error.error || error.message;
        }
        return throwError(errorMessage);
      })
    );
  }

   approveActiveApplications(payload: { suspensionIds: number[], reviewedBy: string }): Observable<string> {
    return this.http.post(
      `${api_url_Monitoring_siteEngineer}/status/license-status/update`,
      payload,
      {
        responseType: 'text' as const,  // Crucial for text responses
        observe: 'response'  // Get full response object
      }
    ).pipe(
      map(response => {
        // Return the response body text
        return response.body || 'Suspensions endorsed successfully';
      }),
      catchError(error => {
        // Convert HttpErrorResponse to error message string
        let errorMessage = 'Failed to forward applications';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          errorMessage = error.error || error.message;
        }
        return throwError(errorMessage);
      })
    );
  }

// approveActiveApplications(payload: { suspensionIds: number[], reviewedBy: string }): Observable<string> {
//   return this.http.post<string>(
//     `${api_url_Monitoring_siteEngineer}/status/license-status/update`,
//     payload,
//     {
//       responseType: 'text' as const
//     }
//   );
// }


  getDownGradeDetails() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/classification/review-actions/downgrades`);

  }
  DownGradeApplications(payload: { downgradeIds: number[], reviewedBy: string }): Observable<string> {
    return this.http.post(
      `${api_url_Monitoring_siteEngineer}/classification/downgrade/endorse`,
      payload,
      {
        responseType: 'text' as const,  // Expect text response
        observe: 'response'  // Get full response object
      }
    ).pipe(
      map(response => {
        // Return the response body text or default success message
        return response.body || 'Applications downgraded successfully';
      }),
      catchError(error => {
        // Convert HttpErrorResponse to error message string
        let errorMessage = 'Failed to downgrade applications';
        if (error.error instanceof ErrorEvent) {
          // Client-side error (network issues, etc.)
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          // Server-side error (4xx, 5xx responses)
          errorMessage = error.error || error.message || `Server error: ${error.status} ${error.statusText}`;
        }
        return throwError(errorMessage);
      })
    );
  }

  getCancelApplication() {
    return this.http.get<any>(`${api_url_Monitoring_siteEngineer}/classification/cancellations`);
  }
  CancelApplications(payload: { cancellationIds: number[], reviewedBy: string }): Observable<string> {
    return this.http.post(
      `${api_url_Monitoring_siteEngineer}/classification/endorse-cancellations`,
      payload,
      {
        responseType: 'text' as const,  // Expect text response
        observe: 'response'  // Get full response object
      }
    ).pipe(
      map(response => {
        // Return the response body text or default success message
        return response.body || 'Applications downgraded successfully';
      }),
      catchError(error => {
        // Convert HttpErrorResponse to error message string
        let errorMessage = 'Failed to downgrade applications';
        if (error.error instanceof ErrorEvent) {
          // Client-side error (network issues, etc.)
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          // Server-side error (4xx, 5xx responses)
          errorMessage = error.error || error.message || `Server error: ${error.status} ${error.statusText}`;
        }
        return throwError(errorMessage);
      })
    );
  }
  suspendApplications(payload: { cdbNos: string[]; firmType: string }): Observable<string> {
    return this.http.post(
      `${g2c_url}/compliance/suspend`,
      payload,
      {
        responseType: 'text' as const,  // Expect text response
        observe: 'response'  // Get full response object
      }
    ).pipe(
      map(response => {
        // Return the response body text or default success message
        return response.body || 'Applications suspended successfully';
      }),
      catchError(error => {
        // Convert HttpErrorResponse to error message string
        let errorMessage = 'Failed to suspend applications';
        if (error.error instanceof ErrorEvent) {
          // Client-side error (network issues, etc.)
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          // Server-side error (4xx, 5xx responses)
          errorMessage = error.error || error.message || `Server error: ${error.status} ${error.statusText}`;
        }
        return throwError(errorMessage);
      })
    );
  }
  cancelApplications(payload: { cdbNos: string[]; firmType: string }): Observable<string> {
    return this.http.post(
      `${g2c_url}/compliance/cancel`,
      payload,
      {
        responseType: 'text' as const,  // Expect text response
        observe: 'response'  // Get full response object
      }
    ).pipe(
      map(response => {
        // Return the response body text or default success message
        return response.body || 'Applications suspended successfully';
      }),
      catchError(error => {
        // Convert HttpErrorResponse to error message string
        let errorMessage = 'Failed to suspend applications';
        if (error.error instanceof ErrorEvent) {
          // Client-side error (network issues, etc.)
          errorMessage = `Client error: ${error.error.message}`;
        } else {
          // Server-side error (4xx, 5xx responses)
          errorMessage = error.error || error.message || `Server error: ${error.status} ${error.statusText}`;
        }
        return throwError(errorMessage);
      })
    );
  }

}


