import { ApplicationRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { AuthServiceService } from '../../../../../../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';
declare var bootstrap: any;
@Component({
  selector: 'app-office-signage-and-doc',
  templateUrl: './office-signage-and-doc.component.html',
  styleUrls: ['./office-signage-and-doc.component.scss']
})
export class OfficeSignageAndDocComponent implements OnInit {
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  formData: any;
  bctaNo: any;
  data: any;
  id: any;
  applicationStatus: string = '';
  isSaving = false;
  showErrorMessage: any;
  errormessage: string;

  constructor(private service: CommonService,private notification: NzNotificationService, private router: Router, private authService: AuthServiceService) { }

  ngOnInit() {
    this.initializeFormData();
    this.loadWorkDetail();
     const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');

    this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
  }
  initializeFormData() {
    this.formData = {
      officeSignboardPath: '',
      officeLocation: '',
      signboardReview: '',
      signboardResubmitDate: null,
      signboardRemarks: '',
      properFillingPath: '',
      filingReview: '',
      filingResubmitDate: null,
      filingRemarks: '',
      ohsHandBook: '',
      ohsReview: '',
      ohsResubmitDate: null,
      ohsRemarks: '',
      generalRemarks: ''
    };
  }

    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: ''
    };
        bsModal: any;
     today: string = new Date().toISOString().substring(0, 10);
    /**
     * Opens the action modal to select an action type and set the action date
     * @param row The row data of the item to be processed
     */
    openActionModal(row: any) {
        // Reset the selected action fields
        this.selectedAction = {
            actionType: '',
            actionDate: this.today,
            remarks: '',
            newClassification: '',
            target: row
        };
        // Get the modal element and show it
        const modalEl = document.getElementById('actionModal');
        this.bsModal = new bootstrap.Modal(modalEl, {
            backdrop: 'static', 
            keyboard: false 
        });
        this.bsModal.show();
    }
  closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }
   downgradeList: any[] = [];
    workClassificationList: any[] = [];
      /**
       * Called when the action type changes
       * If the action type is 'downgrade', fetches the work categories and existing classifications
       * for the selected contractor/consultant and populates the downgrade list
       */
      onActionTypeChange() {
          if (this.selectedAction.actionType === 'downgrade') {
              const firmId = this.WorkDetail.data.contractorId;
              const firmType = 'contractor';
              console.log("firmId:", firmId);
              if (!firmId) {
                  console.error('firmId is undefined. Check if the selected row has contractorId or consultantNo.');
                  return;
              }
              forkJoin({
                  // Get the work categories for the selected contractor/consultant type
                  categoryData: this.service.getWorkCategory(firmType),
                  // Get the existing classifications for the selected contractor/consultant
                  existingClassData: this.service.getClassification(firmType, firmId)
              }).subscribe({
                  next: ({ categoryData, existingClassData }) => {
                      const workCategories = categoryData.workCategory;
                      this.workClassificationList = categoryData.workClassification;
                      // Build a map: workCategory -> existing classification
                      const classificationMap = existingClassData.reduce((acc: any, item: any) => {
                          acc[item.workCategory] = item.existingWorkClassification;
                          return acc;
                      }, {});
                      // Populate the downgrade list with the work categories and existing/new classifications
                    this.downgradeList = workCategories.map((category: any) => ({
                      workCategory: category.workCategory,
                      workCategoryId: category.id,
                      existingClass: classificationMap[category.workCategory] || 'No data available',
                      newClass: ''
                    }));
                  },
                  
                  error: (err) => {
                      console.error('Error fetching downgrade data:', err);
                  }
              });
              
          } else {
              // Reset the downgrade list if the action type is not 'downgrade'
              this.downgradeList = [];
          }
      }

   rejectApplication() {
          this.service.rejectApplication('Contractor',this.data.contractorNo).subscribe(
            (response: any) => {
              console.log('Application rejected successfully:', response);
              this.createNotification(
                'success',
                'Success',
                'Application rejected successfully'
              );
              this.closeModal();
              this.router.navigate(['monitoring/construction']);
            },
            (error) => {
              console.error('Error rejecting application:', error);
              this.createNotification(
                'error',
                'Error',
                'Failed to reject application'
              );
            }
          )
        }
            /**
             * Submit action for downgrade, suspend or cancel
             * Validates the input, constructs the payload and calls the respective API
             */
  submitAction() {
    if (!this.selectedAction.actionType || !this.selectedAction.actionDate || !this.selectedAction.remarks) {
        console.error('Validation failed - missing required fields', {
            actionType: this.selectedAction.actionType,
            actionDate: this.selectedAction.actionDate,
            remarks: this.selectedAction.remarks
        });
        alert("All required fields must be filled.");
        return;
    }

    if (this.selectedAction.actionType === 'downgrade') {
        const downgradeEntries = this.downgradeList
            .filter(entry => entry.newClass && entry.newClass !== '')
            .map(entry => {
                console.log('Processing entry:', entry);
                const classification = this.workClassificationList.find(
                    (c: any) => c.workClassification === entry.newClass
                );
                
                const result = {
                    workCategoryId: entry.workCategoryId,
                    newWorkClassificationId: classification ? classification.id : null
                };
                
                console.log('Mapped entry result:', result);
                return result;
            });

        console.log('Final downgradeEntries:', downgradeEntries);

        if (downgradeEntries.length === 0) {
            console.error('No valid downgrade entries found');
            Swal.fire('Error', 'Please select at least one new class to downgrade.', 'error');
            return;
        }

        const payload = {
            bctaNo: this.data.contractorNo,
            firmId: this.data.contractorId,
            firmType: "Contractor",
            downgradeEntries,
            requestedBy: this.authService.getUsername(),
            applicationNumber: this.data.appNo,
        };
        this.service.downgradeFirm(payload).subscribe({
            next: (res: string) => {
                console.log('Downgrade API response:', res);
                if (res && res.toLowerCase().includes('downgrade request submitted')) {
                    console.log('Downgrade successful');
                    Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                    this.router.navigate(['/monitoring/construction']);
                    this.closeModal();
                } else {
                    console.error('Downgrade API returned unexpected response');
                    Swal.fire('Error', res || 'Something went wrong while forwarding.', 'error');
                    this.closeModal();
                }
            },
            error: (err) => {
                console.error('Downgrade API error:', err);
                Swal.fire('Error', 'Something went wrong while forwarding.', 'error');
                this.closeModal();
            }
        });
     
    } else if (this.selectedAction.actionType === 'suspend') {
        const payload = {
            firmNo: this.WorkDetail.data.contractorNo,
            suspendedBy: this.authService.getUsername(),
            suspensionDate: this.selectedAction.actionDate
                ? new Date(this.selectedAction.actionDate).toISOString()
                : null,
            firmType: "Contractor",
            suspendDetails: this.selectedAction.remarks,
              applicationID: this.data.appNo,
        };
        this.service.suspendFirm(payload).subscribe({
            next: (res) => {
                Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                this.router.navigate(['/monitoring/construction']);
                this.closeModal();
            },
            error: (err) => {
                console.error('Suspend API error:', err);
                Swal.fire('Error', 'Failed to suspend contractor', 'error');
            }
        });
    }
}
 get filteredDowngradeList() {
    return this.downgradeList.filter(item => item.existingClass !== 'Not available');
  }

  trackByWorkCategory(index: number, item: any): string {
    return item.workCategoryId;
  }
  WorkDetail: any = {};
  licenseStatus: string = '';          
  loadWorkDetail() {
    const WorkDetail = this.service.getData('BctaNo');
    this.WorkDetail = WorkDetail;
    this.licenseStatus = WorkDetail.data.licenseStatus;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.bctaNo = WorkDetail.data.contractorNo;
     if(this.applicationStatus === 'Suspension Resubmission' && this.WorkDetail.data.contractorNo){
      this.fetchSuspendDataBasedOnBctaNo();
       
     }else if(this.WorkDetail.data.contractorNo && this.WorkDetail.data.appNo && this.applicationStatus !== 'Suspension Resubmission'){
        this.fetchDataBasedOnBctaNo();
     }else{
     }
    this.data = WorkDetail.data;
    //
    this.applicationStatus = WorkDetail.data.applicationStatus;
  }
fetchDataBasedOnBctaNo() {
  this.service.getDatabasedOnBctaNos(this.WorkDetail.data.contractorNo, this.WorkDetail.data.appNo).subscribe(
    (res1: any) => {
      if (res1?.complianceEntities?.length) {
        this.formData = { ...this.formData, ...res1.complianceEntities[0] };
      }
      const payload = [
        {
          field: 'bctaNo',
          value: this.WorkDetail.data.contractorNo,
          condition: 'LIKE',
          operator: 'AND'
        },
        {
          field: 'application_number',
          value: this.WorkDetail.data.appNo,
          condition: 'LIKE',
          operator: 'AND'
        }
      ];
      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };
             this.formData.signboardReview =  this.formData.os_review;
             this.formData.filingReview =  this.formData.fsreview;
             this.formData.ohsReview =  this.formData.ohsreview;
             this.formData.ohsReview =  this.formData.ohsreview;
             this.formData.generalRemarks =  this.formData.ohsremarks;
          }
        },
        (error) => {
          console.error('Error fetching contractor details:', error);
        }
      );
    },
    (error) => {
      console.error('Error fetching data:', error);
    }
  );
}


fetchSuspendDataBasedOnBctaNo() {
  this.bctaNo = this.WorkDetail.data.contractorNo;

  this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
    (res1: any) => {
      if (res1?.complianceEntities?.length) {
        this.formData = { ...this.formData, ...res1.complianceEntities[0] };
      }

      // Build payload for second service call
      const payload = [
        {
          field: 'bctaNo',
          value: this.bctaNo,
          condition: 'LIKE',
          operator: 'AND'
        }
      ];

      // Second service call - like fetchDetails
      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };

            // Map specific fields
            this.formData.signboardReview = this.formData.os_review;
            this.formData.filingReview = this.formData.fsreview;
            this.formData.ohsReview = this.formData.ohsreview;
            this.formData.generalRemarks = this.formData.ohsremarks;
          }
        },
        (error) => {
          console.error('Error fetching firm details:', error);
        }
      );
    },
    (error) => {
      console.error('Error fetching suspended data:', error);
    }
  );
}

  onReviewChange() {
    if (!this.formData) return;
    this.formData = {
      ...this.formData,
      signboardResubmitDate: this.formData.signboardReview === 'No' ? null : this.formData.signboardResubmitDate,
      signboardRemarks: this.formData.signboardReview === 'No' ? '' : this.formData.signboardRemarks
    };
  }

  onFilingReviewChange() {
    if (!this.formData) return;

    // Create a new object reference to maintain change detection
    this.formData = {
      ...this.formData,
      filingResubmitDate: this.formData.filingReview === 'No' ? null : this.formData.filingResubmitDate,
      filingRemarks: this.formData.filingReview === 'No' ? '' : this.formData.filingRemarks
    };
  }

downloadFile(filePath: string): void {
  const sanitizedPath = filePath.replace(/\s+/g, ' ');
  this.service.downloadFileFirm(sanitizedPath).subscribe(
        (response: HttpResponse<Blob>) => {
            const binaryData = [response.body];
            const mimeType = response.body?.type || 'application/octet-stream';
            const blob = new Blob(binaryData, { type: mimeType });
            const blobUrl = window.URL.createObjectURL(blob);

            // Ensure filename is properly extracted and decoded
            const fileName = this.extractFileName(filePath);
            const isImage = mimeType.startsWith('image/');

            const newWindow = window.open('', '_blank', 'width=800,height=600');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>File Preview</title>
                        </head>
                        <body style="margin:0; text-align: center;">
                            <div style="padding:10px;">
                                <a href="${blobUrl}" download="${fileName}" 
                                   style="font-size:16px; color:blue;" 
                                   target="_blank">⬇ Download ${fileName}</a>
                            </div>
                            ${isImage
                                ? `<img src="${blobUrl}" style="max-width:100%; height:auto;" alt="Image Preview"/>`
                                : `<iframe src="${blobUrl}" width="100%" height="90%" style="border:none;"></iframe>`}
                        </body>
                    </html>
                `);

                // Clean up after window is closed
                newWindow.onbeforeunload = () => {
                    window.URL.revokeObjectURL(blobUrl);
                };
            } else {
                console.error('Failed to open the new window');
                // Fallback to direct download if window fails to open
                this.forceDownload(blob, fileName);
            }
        },
        (error: HttpErrorResponse) => {
            if (error.status === 404) {
                console.error('File not found', error);
                this.showErrorMessage();
            }
        }
    );
}

// Improved filename extraction
private extractFileName(filePath: string): string {
    try {
        // Handle URL encoded paths
        const decodedPath = decodeURIComponent(filePath);
        // Extract filename and remove any query parameters
        return decodedPath.split('/').pop()?.split('?')[0] || 'download';
    } catch {
        return filePath.split('/').pop() || 'download';
    }
}

// Fallback direct download method
private forceDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}
  isOfficeSignboardEnabled(): boolean {
    return ['Resubmitted OS', 'Resubmitted OS and PFS', 'Submitted'].includes(this.applicationStatus);
  }

  isFilingSystemEnabled(): boolean {
    return ['Resubmitted PFS', 'Resubmitted OS and PFS', 'Submitted'].includes(this.applicationStatus);
  }

  isOhsEnabled(): boolean {
    return this.applicationStatus === 'Submitted';
  }

isFieldEditable(field: string): boolean {
  if (this.applicationStatus === 'Suspension Resubmission') {
    return true;
  }

  switch (field) {
    case 'officeSignboard':
    case 'signboardReview':
      return this.isOfficeSignboardEnabled();
    case 'filingSystem':
    case 'filingReview':
      return this.isFilingSystemEnabled();
    case 'ohs':
    case 'ohsReview':
      return this.isOhsEnabled();
    default:
      return false;
  }
}


  update() {
    this.isSaving = true;
    const payload = {
      registrationReview: {
        bctaNo: this.data.contractorNo || null,
        officeSignboard: this.formData.officeSignboardPath || null,
        signageResubmitDeadline: this.formData.signboardResubmitDate || null,
        osreview: this.formData.signboardReview || null,
        osremarks: this.formData.signboardRemarks || null,
        filingSystem: this.formData.properFillingPath || null,
        fsreview: this.formData.filingReview || null,
        fsremarks: this.formData.filingRemarks || null,
        fsresubmitDeadline: this.formData.filingResubmitDate || null,
      }
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe(
      (response: any) => {
        this.isSaving = false;
        try {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.id = parsedResponse.registrationReview?.id;

          Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: 'Office signage and documents review saved successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['monitoring/construction']);
        } catch (e) {
          console.error('Error parsing response:', e);
          Swal.fire('Error', 'An unexpected error occurred while parsing the response.', 'error');
        }
      },
      (error) => {
        this.isSaving = false;
        console.error('Error saving data:', error);
        Swal.fire('Error', 'Failed to save office signage and documents review.', 'error');
      }
    );
  }
clearErrorMessage() {
  this.errormessage = '';
}
  saveAndNext() {
    this.isSaving = true;
    if(!this.formData.filingReview && !this.formData.signboardReview){
      this.errormessage = 'All fields are required';
      this.isSaving = false;
      return;
    }
    const payload = {
      registrationReview: {
        bctaNo: this.data.contractorNo,
        firmName: this.formData.firmName,
        contactNo: this.formData.mobileNo,
        email: this.formData.emailAddress,
        classification: this.formData.classification,
        applicationStatus: this.data.status,
        officeSignboard: this.formData.officeSignboardPath,
        osresubmitDeadline: this.formData.signboardResubmitDate,
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.generalRemarks,
        reviewDate: this.formData.reviewDate,
        fsreview: this.formData.filingReview,
        fsremarks: this.formData.filingRemarks,
        fsresubmitDeadline: this.formData.filingResubmitDate,
        oslocation: this.formData.officeLocation,
        osreview: this.formData.signboardReview,
        osremarks: this.formData.signboardRemarks,
        applicationNumber:this.WorkDetail.data.appNo
      }
    };

this.service.saveOfficeSignageAndDoc(payload).subscribe(
  (response: any) => {
    this.isSaving = false;
    try {
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.id = parsedResponse.registrationReview?.id;
      this.activateTab.emit({ id: this.id, tab: 'employee' });
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  },
  (error) => {
    this.isSaving = false;

    if (error.status === 500) {
      this.createNotification(
        'error',
        'Server Error',
        'A server error occurred (500). Please try again later.'
      );
    } else {
      this.createNotification(
        'error',
        'Error',
        'Something went wrong while sending the list.'
      );
    }

    console.error('Error saving data:', error);
  }
);
  }

createNotification(
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  message: string
): void {
  this.notification[type](title, message).onClick.subscribe(() => {
  });
}

  // openActionModal() {
  //   // Set up selectedAction and other data as needed
  //   this.selectedAction = {
  //     actionType: '',
  //     actionDate: this.today,
  //     remarks: '',
  //     // ...other fields...
  //   };
  //   this.showActionModal = true;
  // }

  // onActionModalClose() {
  //   this.showActionModal = false;
  // }

  // onActionModalSubmit(result: any) {
  //   // Handle the result from the modal (e.g., save, update, etc.)
  //   this.showActionModal = false;
  // }

}