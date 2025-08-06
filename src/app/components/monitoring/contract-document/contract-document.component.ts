import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-contract-document',
    templateUrl: './contract-document.component.html',
    styleUrls: ['./contract-document.component.scss'],
})
export class ContractDocumentComponent {
    @Output() onContractorDocSaved = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    formData: any = {};
    fileError: string | null = null;
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Input() prevTableId: any;
    @Input() workId: any;
    userId: any;
    userName: any;
    fileAndRemark: any;
    viewName = 'checklist_deduplicated_view';
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
    appNoStatus: any = {};
    policyDetails: any = {};
    constructor(
        private notification: NzNotificationService,
        private service: CommonService,
        private router: Router
    ) {}

    ngOnInit() {
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userId = userDetails.userId;
            this.userName = userDetails.username;
        }
        this.tableId = this.tableId;
        this.data = this.data;
        this.appNoStatus = this.data?.applicationStatus ?? null;
        this.workId = this.workId;
        this.prevTableId = this.prevTableId;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId;
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
    }

    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: this.prevTableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(payload, 1, 2, 'contract_document_at_site')
            .subscribe(
                (response: any) => {
                    const data = response.data[0];
                    this.formData.ConstructionPermit =
                        data.construction_permit_available;
                    this.formData.contractConditions =
                        data.construction_conditions_complied;
                    this.formData.approvedDrawings =
                        data.approved_drawings_available;
                    this.formData.workInsurance =
                        data.workers_insurance_provided;
                    this.formData.workInsuranceStatus =
                        data.work_insurance_status;
                    this.formData.thirdPartyInsurance =
                        data.third_party_insurance_status;
                    this.formData.billofQuantities =
                        data.bill_of_quantities_available;
                    this.formData.materialsQualityCertification =
                        data.materials_quality_certified;
                    (this.formData.qualityAssurancePlan =
                        data.quality_assurance_plan_available),
                        (this.formData.qualityControlPlan =
                            data.quality_control_plan_available),
                        (this.formData.TestconductedasperQAP =
                            data.tests_conducted_as_per_standards),
                        (this.formData.journalMaintained =
                            data.day_work_journal_maintained),
                        (this.formData.envManagementPlan =
                            data.day_work_journal_maintained),
                        (this.formData.testReportsDocumented =
                            data.day_work_journal_maintained),
                        (this.formData.remarks = data.remarks),
                        (this.formData.HindranceRegisterSelectmaintained =
                            data.hindrance_register_maintained);
                    this.formData.workplan = data.work_plan;
                    if (data.file_path) {
                        this.formData.filePathList = data.file_path
                            .split(',')
                            .map((path) => path.trim());

                        this.formData.fileIdList = data.file_id
                            .split(',')
                            .map((id) => id.trim());

                        // 🔽 Add this line: Check if all paths are 'NO_PATH'
                        this.formData.allPathsNoFile =
                            this.formData.filePathList.every(
                                (path) => path === 'NO_PATH'
                            );
                    }
                },
                // Error handler
                (error) => {
                    console.error('Error fetching contractor details:', error); // Log the error
                }
            );
    }
    addFileInput() {
        this.fileInputs.push(this.fileInputs.length);
        this.fileErrors.push('');
    }

    /**
     * Handles the file selection event and validates the selected file.
     * If a file is selected, it checks if the file size exceeds 2MB. If the file size
     * is valid, it sets the file for upload; otherwise, it sets an error message.
     * If no file is selected, it sets an error message indicating that a file must be uploaded.
     *
     * @param event - The file input change event containing the selected file.
     * @param index - The index of the file input field.
     */
    onFileSelected(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Check file size (2MB = 2 * 1024 * 1024 bytes)
            if (file.size > 2 * 1024 * 1024) {
                this.fileErrors[index] =
                    'File size must be less than or equal to 2MB.';
                this.selectedFiles[index] = null;
                input.value = ''; // Clear the input
                return;
            }

            this.selectedFiles[index] = file;
            this.fileErrors[index] = ''; // Clear error on valid file
            console.log('selectedFiles', this.selectedFiles);
        } else {
            this.fileErrors[index] = 'Please select a valid file.';
        }
    }
    removeFileInput(index: number) {
        this.fileInputs.splice(index, 1);
        this.fileErrors.splice(index, 1);
        this.selectedFiles.splice(index, 1);
    }
    /**
     * Uploads the selected file to the server.
     */
    /**
     * Saves the contract document details as a draft and navigates to the next step.
     * @param form The form containing the contract document details.
     */
    formType = '5';
    fileId: any = [];
    saveAndNext(form: NgForm) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return; // Stop execution if form is invalid
        }
        // Always call uploadFiles, even if no files are selected
        const uploadObservables = [];
        if (this.selectedFiles && this.selectedFiles.length > 0) {
            for (const file of this.selectedFiles) {
                const upload$ = this.service.uploadFiles(
                    file,
                    this.formData.remarks,
                    this.formType,
                    this.userName,
                    this.workId
                );
                uploadObservables.push(upload$);
            }
        } else {
            // Send dummy file instead of null
            const dummyFile = new File([new Blob()], 'empty.txt', {
                type: 'text/plain',
            });
            const upload$ = this.service.uploadFiles(
                dummyFile,
                this.formData.remarks,
                this.formType,
                this.userName,
                this.workId
            );
            uploadObservables.push(upload$);
        }
        forkJoin(uploadObservables).subscribe({
            next: (fileIds: any[]) => {
                for (const id of fileIds) {
                    const match = id?.match?.(/[0-9a-fA-F\-]{36}/);
                    if (match) {
                        this.fileId.push(match[0]);
                    }
                }
                this.saveDraftPayload();
            },
            error: (err) => {
                console.error('Error uploading files:', err);
                this.fileError = 'File upload failed.';
            },
        });
    }

    private saveDraftPayload() {
        const payload = {
            id: parseInt(this.tableId, 10),
            workID: this.workId,
            constructionPermitAvailable: this.formData.ConstructionPermit,
            constructionConditionsComplied: this.formData.contractConditions,
            workersInsurance: this.formData.workInsurance,
            workInsuranceStatus: this.formData.workInsuranceStatus,
            thirdPartyInsuranceStatus: this.formData.thirdPartyInsurance,
            approvedDrawingsAvailable: this.formData.approvedDrawings,
            billOfQuantitiesAvailable: this.formData.billofQuantities,
            materialsQualityCertified:this.formData.materialsQualityCertification,
            qualityAssurancePlanAvailable: this.formData.qualityAssurancePlan,
            qualityControlPlanAvailable: this.formData.qualityControlPlan,
            testsConductedAsPerStandards: this.formData.TestconductedasperQAP,
            testReportsDocumented: this.formData.testReportsDocumented,
            hindranceRegisterMaintained:this.formData.HindranceRegisterSelectmaintained,
            dayWorkJournalMaintained: this.formData.journalMaintained,
            environmentManagementPlan: this.formData.envManagementPlan,
            workPlan: this.formData.workplan,
            meetingsConductedAndDocumented: this.formData.meetingsConducted,
            insuranceType: this.formData.InsuranceType,
            policyNoThirdParty: this.formData.thirdPartyInsurancePolicyNo,
            policyNoWorkers: this.formData.WorkersInsurancePolicyNo,
            thirdPartyInsurance: this.formData.thirdPartyInsurance,
            policyNoWorkInsurance: this.formData.workInsurance,
            workInsurance: this.formData.workInsurance,
            policyNoWorkerInsurance: this.formData.WorkersInsurancePolicyNo,
            workerInsurance: this.formData.workersInsurance,

        };
        
        this.service.saveAsDraft(payload).subscribe({
            next: (response: any) => {
                const parsedResponse =
                    typeof response === 'string'
                        ? JSON.parse(response)
                        : response;
                this.tableId = parsedResponse.checklistsInfo.id;
                if (this.tableId) {
                    this.assignCheckListId();
                    this.onContractorDocSaved.emit({
                        tableId: this.tableId,
                        data: this.data,
                        inspectionType: this.inspectionType,
                    });

                    this.router.navigate(['monitoring/work-progress']);
                }
            },
            error: (error) => {
                console.error('Error saving draft:', error);
            },
        });
    }

    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId,this.workId, payload).subscribe(
            (response) => {
                console.log('File ID assigned successfully:', response);
                this.createNotification(
                    'success',
                    'Success',
                    'The data has been saved successfully'
                );
            },
            (error) => {
                console.error('Error assigning File ID:', error);
            }
        );
    }

    createNotification(
        type: 'success' | 'error' | 'info' | 'warning',
        title: string,
        message: string
    ): void {
        this.notification[type](title, message).onClick.subscribe(() => {
            console.log(`${type} notification clicked!`);
        });
    }

    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/onsite-facilitiesand-management']);
    }

    /**
     * Downloads a file from the server based on the provided filePath.
     * @param filePath The file path on the server to download the file from.
     */

    viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                // Create a Blob from the response
                const blob = new Blob(binaryData, { type: response.body.type });
                // Generate a URL for the Blob
                const blobUrl = window.URL.createObjectURL(blob);
                // Open a new window
                const newWindow = window.open(
                    '',
                    '_blank',
                    'width=800,height=600'
                );
                if (newWindow) {
                    // Write HTML content to the new window
                    newWindow.document.write(`
          <html>
            <head>
            </head>
            <body>
              <h1>File</h1>
              <iframe src="${blobUrl}" width="100%" height="100%" style="border: none;"></iframe>
            </body>
          </html>
        `);

                    // Optionally revoke the object URL after a timeout to free up resources
                    setTimeout(() => {
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);
                } else {
                    console.error('Failed to open the new window');
                }
            },
            (error: HttpErrorResponse) => {
                // Check for specific error status
                if (error.status === 404) {
                    console.error('File not found', error);
                }
            }
        );
    }
    extractFileName(filePath: string): string {
        return (
            filePath.split('/').pop() ||
            filePath.split('\\').pop() ||
            'downloaded-file'
        );
    }
    isFetching: boolean = false;
    showTable: boolean = false;
    onfetchDetails(type:string) {
        if(type === 'workInsurance') {
            this.FetchPolicyDetails();
        }else if(type === 'thirdPartyInsurance') {
            this.FetchThirdPartyPolicyNoDetails();
        }else if(type === 'WorkersInsurance') {
           this.FetchWorkerInsuranceDetails();  
        }
        
    }
    onInsuranceTypeChange(event: any) {
         this.showThirdPartyTable = false;
        this.formData.thirdPartyInsurance = '';
          this.showTable = false;
        this.formData.workInsurance = '';
        this.formData.workInsurance = '';
       this.formData.WorkersInsurancePolicyNo = '';
       this.formData.thirdPartyInsurancePolicyNo = '';
       this.formData.policyNo = '';
       this.WorkersInsurance = false;
    }
  FetchPolicyDetails() {
  this.isFetching = true;
  this.service.FetchPolicyDetails(this.formData.policyNo).subscribe({
    next: (response: any) => {
      this.isFetching = false;
      this.showTable = true;
      this.policyDetails = response;
     // const thirdPartyLiability = response.insurance_policy_data?.[0]?.third_party_liability?.[0];
      //this.formData.thirdPartyInsurance = thirdPartyLiability?.particular || '';
      const workInsurance = response.insurance_policy_data?.[0]?.policy_holder_detail;
      this.formData.workInsurance = workInsurance?.insured_name || '';
    //   this.getPolicyHolderDetails();
    },
    error: (error) => {
      this.isFetching = false;

      if (error.status === 404) {
        this.createNotification('error', 'Not Found', 'Policy details not found. Please check the policy number.');
      } else if (error.status === 500) {
        this.createNotification('error', 'Server Error', 'Internal server error. Please try again later.');
      } else {
        this.createNotification('error', 'Error', 'Something went wrong. Please try again.');
      }

      console.error('Error fetching policy details:', error);
    }
  });
}
isFetchingWorkersInsurancePolicyNo: boolean = false;
WorkersInsurancePolicyDetails: any;
WorkersInsurance:boolean = false;
  FetchWorkerInsuranceDetails() {
  this.isFetchingWorkersInsurancePolicyNo = true;
  this.service.FetchPolicyDetails(this.formData.WorkersInsurancePolicyNo).subscribe({
    next: (response: any) => {
      this.isFetchingWorkersInsurancePolicyNo = false;
      this.WorkersInsurance = true;
      this.WorkersInsurancePolicyDetails = response;
     const workersInsuranceData = response?.insurance_policy_data[0].policy_holder_detail.insured_name ;
      this.formData.workersInsurance = workersInsuranceData || '';
    //   const workInsurance = response.insurance_policy_data?.[0]?.policy_holder_detail;
    //   this.formData.workInsurance = workInsurance?.insured_name || '';
     // this.getPolicyHolderDetails();
    },
    error: (error) => {
      this.isFetchingWorkersInsurancePolicyNo = false;

      if (error.status === 404) {
        this.createNotification('error', 'Not Found', 'Policy details not found. Please check the policy number.');
      } else if (error.status === 500) {
        this.createNotification('error', 'Server Error', 'Internal server error. Please try again later.');
      } else {
        this.createNotification('error', 'Error', 'Something went wrong. Please try again.');
      }

      console.error('Error fetching policy details:', error);
    }
  });
}
isFetchingThirdPartyPolicyNo: boolean = false;
thirdPartyPolicyDetails: any={}
showThirdPartyTable: boolean = false
  FetchThirdPartyPolicyNoDetails() {
  this.isFetchingThirdPartyPolicyNo = true;
  this.service.FetchPolicyDetails(this.formData.thirdPartyInsurancePolicyNo).subscribe({
    next: (response: any) => {
      this.isFetchingThirdPartyPolicyNo = false;
      this.showThirdPartyTable = true;
      this.thirdPartyPolicyDetails = response;
      const thirdPartyLiability = response.insurance_policy_data?.[0]?.third_party_liability?.[0];
      this.formData.thirdPartyInsurance = thirdPartyLiability?.particular || '';
    //   const workInsurance = response.insurance_policy_data?.[0]?.policy_holder_detail;
    //   this.formData.workInsurance = workInsurance?.insured_name || '';
    //   this.getPolicyHolderDetails();
    },
    error: (error) => {
      this.isFetching = false;

      if (error.status === 404) {
        this.createNotification('error', 'Not Found', 'Policy details not found. Please check the policy number.');
      } else if (error.status === 500) {
        this.createNotification('error', 'Server Error', 'Internal server error. Please try again later.');
      } else {
        this.createNotification('error', 'Error', 'Something went wrong. Please try again.');
      }

      console.error('Error fetching policy details:', error);
    }
  });
}

// getAddOnCoverageDetails() {
//   if (!this.policyDetails?.insurance_policy_data?.[0]?.add_on_coverage) return [];
  
//   const coverage = this.policyDetails.insurance_policy_data[0].add_on_coverage[0];
//   return [
//     { label: 'Add On Coverage', value: `${coverage.particular}: ${coverage.description}` }
//   ];
// }



    onPolicyNoChange(type: string) {
      if (type === 'thirdPartyInsurance') {
        this.showThirdPartyTable = false;
        this.formData.thirdPartyInsurance = '';
      }else if (type === 'workInsurance') {
        this.showTable = false;
        this.formData.workInsurance = '';
      }else if (type === 'WorkersInsurance') {
        this.WorkersInsurance = false;
    //    this.formData.workInsurance = '';
    //    this.formData.thirdPartyInsurance = '';
      }
    
      }
}
