import { Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
declare var bootstrap: any;
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
    selector: 'app-permanent-employees',
    templateUrl: './permanent-employees.component.html',
    styleUrls: ['./permanent-employees.component.scss'],
})
export class PermanentEmployeesComponent {
    tableData: any[] = [];
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string;data:string, tab: string }>();
    bctaNo: any;
    @ViewChild('closeActionModal', { static: false }) closeActionModal!: ElementRef;
    @Input() id: string = '';
    applicationStatus: string = '';
    tData: any;
    isSaving = false;
    showErrorMessage: any;
    licenseStatus: any;
    data: any;

    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
          private notification: NzNotificationService,
    ) {}
    private getPrefix(workCategory: string): string {
        if (workCategory.startsWith('S-')) return 'S';
        if (workCategory.startsWith('A-')) return 'A';
        if (workCategory.startsWith('C-')) return 'C';
        if (workCategory.startsWith('E-')) return 'E';
        return '';
    }
    ngOnInit() {
         // Set default action date to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
        this.id = this.id;
        const WorkDetail = this.service.getData('BctaNo');
        this.formData.firmType = WorkDetail.data;
        this.bctaNo = WorkDetail.data.consultantNo;
        this.data = WorkDetail.data;
        this.licenseStatus = WorkDetail.data.licenseStatus;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.tData = {
            hrFulfilled: '',
            resubmitDate: '',
            remarksNo: '',
        };

        if (this.bctaNo &&  this.applicationStatus === 'Suspension Resubmission') {
          this.fetchSuspendDataBasedOnBctaNo()  
        }else{
            this.fetchDataBasedOnBctaNo();

        }
    }

    // fetchDataBasedOnBctaNo() {
    //     this.service.getDatabasedOnBctaNos(this.bctaNo, this.data.appNo).subscribe((res: any) => {
    //         this.tableData = res.hrCompliance;
    //         console.log('employee', this.formData);
    //     });
    // }
  fetchDataBasedOnBctaNo() {
     this.service.getDatabasedOnBctaNos(this.bctaNo, this.data.appNo).subscribe(
    (res1: any) => {
     this.tableData = res1.hrCompliance;
      console.log('employee', this.formData);

      const payload = [
        {
          field: 'bctaNo',
          value: this.bctaNo,
          condition: 'LIKE',
          operator: 'AND'
        },
        {
          field: 'application_number',
          value: this.data.appNo,
          condition: 'LIKE',
          operator: 'AND'
        }
      ];
      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };
            this.tData.hrFulfilled =  this.formData.hrfulfilled;
            this.tData.resubmitDate =  this.formData.resubmitDate;
            this.tData.remarksNo =  this.formData.remarksNo;
          }
        },
        (error) => {
          console.error('Error fetching additional contractor details:', error);
        }
      );
    },
    (error) => {
      console.error('Error fetching HR compliance data:', error);
    }
  );
}


 fetchSuspendDataBasedOnBctaNo() {
  // Ensure bctaNo is set (you can uncomment below if needed)
  // this.bctaNo = this.WorkDetail.data.contractorNo;

  this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
    (res1: any) => {
      this.tableData = res1.hrCompliance;

      // Prepare payload for additional details
      const payload = [
        {
          field: 'bctaNo',
          value: this.bctaNo,
          condition: 'LIKE',
          operator: 'AND'
        }
      ];

      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };
            // Optional: Map specific fields
             this.tData.hrFulfilled =  this.formData.hrfulfilled;
            this.tData.resubmitDate =  this.formData.resubmitDate;
            this.tData.remarksNo =  this.formData.remarksNo;
          }
        },
        (error) => {
          console.error('Error fetching additional firm details:', error);
        }
      );
    },
    (error) => {
      console.error('Error fetching suspended data:', error);
    }
  );
}

    fetchTdsHcPension() {}
 
    bsModal: any;
    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: '',
    };
    onClick() {}
    WorkDetail: any = {};
    // Handle file download and preview logic
    downloadFile(filePath: string): void {
        this.service.downloadFileFirm(filePath).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                const mimeType =
                    response.body?.type || 'application/octet-stream';
                const blob = new Blob(binaryData, { type: mimeType });
                const blobUrl = window.URL.createObjectURL(blob);
                const fileName = this.extractFileName(filePath);
                const isImage = mimeType.startsWith('image/');

                const newWindow = window.open(
                    '',
                    '_blank',
                    'width=800,height=600'
                );
                if (newWindow) {
                    newWindow.document.write(`
                           <html>
                               <head><title>File Preview</title></head>
                               <body style="margin:0; text-align: center;">
                                   <div style="padding:10px;">
                                       <a href="${blobUrl}" download="${fileName}" style="font-size:16px; color:blue;" target="_blank">⬇ Download File</a>
                                   </div>
                                   ${
                                       isImage
                                           ? `<img src="${blobUrl}" style="max-width:100%; height:auto;" alt="Image Preview"/>`
                                           : `<iframe src="${blobUrl}" width="100%" height="90%" style="border:none;"></iframe>`
                                   }
                               </body>
                           </html>
                       `);
                    setTimeout(
                        () => window.URL.revokeObjectURL(blobUrl),
                        10000
                    );
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

    // Extract filename from full path
    extractFileName(filePath: string): string {
        return (
            filePath.split('/').pop() ||
            filePath.split('\\').pop() ||
            'downloaded-file'
        );
    }

    closeModal() {
        this.closeActionModal.nativeElement.click();
    }

  onActionTypeChange() {
    if (this.selectedAction.actionType === 'cancel') {
        const firmId = this.formData.firmType.consultantId;
        const firmType = 'consultant';
        if (!firmId) {
            console.error(
                'firmId is undefined. Check if the selected row has consultantNo.'
            );
            return;
        }

        forkJoin({
            categoryData: this.service.getWorkCategory('consultant'),
            existingClassData: this.service.getClassification(firmType, firmId),
    }).subscribe({
            next: ({ categoryData, existingClassData }) => {
                const workCategories = categoryData.workCategory;
                const workClassifications = categoryData.workClassification;

                // Create a set of existing classification IDs for quick lookup
                const existingClassificationIds = new Set<string>();
                for (const item of existingClassData) {
                    if (item.consultantWorkClassificationId) {
                        existingClassificationIds.add(
                            String(item.consultantWorkClassificationId).trim()
                        );
                    }
                }

                this.downgradeList = workCategories
                    .map((category: any) => {
                        const prefix = this.getPrefix(
                            category.workCategory
                        );
                        const categoryKey = String(
                            category.workCategory
                        ).trim();

                        // Filter classifications that belong to this category
                        const possibleClassifications = workClassifications
                            .filter(
                                (cls: any) =>
                                    cls.type === 'consultant' &&
                                    cls.workClassification.startsWith(
                                        prefix
                                    )
                            )
                            .map((cls: any) => ({
                                id: cls.id,
                                name: cls.workClassification,
                                checked: existingClassificationIds.has(String(cls.id).trim()),
                                preChecked: existingClassificationIds.has(String(cls.id).trim())
                            }));

                        // Only include categories that have at least one checked classification
                        if (possibleClassifications.some(cls => cls.checked)) {
                            return {
                                workCategory: category.workCategory,
                                workCategoryId: category.id,
                                classifications: possibleClassifications,
                            };
                        }
                        return null;
                    })
                    .filter((item: any) => item !== null);
            },
            error: (err) => {
                console.error('Error fetching downgrade data:', err);
            },
        });
    } else {
        this.downgradeList = [];
    }
}


  submitAction() {
    if (
        !this.selectedAction.actionType ||
        !this.selectedAction.actionDate ||
        !this.selectedAction.remarks
    ) {
        alert('All required fields must be filled.');
        return;
    }
    if (this.selectedAction.actionType === 'cancel') {
        // Collect all unchecked, previously pre-checked classifications
        const downgradeEntries: any[] = [];
        this.downgradeList.forEach((entry) => {
            entry.classifications.forEach((cls: any) => {
                if (cls.preChecked && !cls.checked) {
                    downgradeEntries.push({
                        workCategoryId: entry.workCategoryId,
                        existingWorkClassificationId: cls.id,
                    });
                }
            });
        });
        if (downgradeEntries.length === 0) {
            Swal.fire(
                'Error',
                'Please uncheck at least one existing class to downgrade.',
                'error'
            );
            return;
        }

        const payload = {
            consultantId: this.formData.firmType.consultantId,
            requestedBy: this.authService.getUsername(),
            downgradeEntries,
            applicationNumber: this.formData.firmType.appNo,
        };

        console.log('Downgrade payload:', payload);

        this.service.downgradeConsultancy(payload).subscribe({
            next: (res: string) => {
                console.log('Downgrade response:', res);
                if (res && res.toLowerCase().includes('downgrade request submitted')) {
                    Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                     this.router.navigate(['monitoring/consultancy']);
                    this.closeModal();
                } else {
                    Swal.fire('Error', res || 'Something went wrong while forwarding.', 'error');
                    this.closeModal();
                     this.router.navigate(['monitoring/consultancy']);
                }
            },
            error: (err) => {
                console.error('Error during downgrade:', err);
                Swal.fire('Error', 'Something went wrong while forwarding.', 'error');
                this.closeModal();
            },
        });
    }

    else if (this.selectedAction.actionType === 'suspend') {
        console.log('Suspend action initiated.');

        const payload = {
            firmNo:  this.bctaNo,
            suspendedBy: this.authService.getUsername(),
            suspensionDate: this.selectedAction.actionDate
                ? new Date(this.selectedAction.actionDate).toISOString()
                : null,
            firmType: 'Consultant',
            suspendDetails: this.selectedAction.remarks,
            applicationID: this.formData.firmType.appNo,
        };
        this.service.suspendFirm(payload).subscribe({
            next: (res) => {
                console.log('Suspend response:', res);
                Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                this.closeModal();
                 this.router.navigate(['monitoring/consultancy']);
            },
            error: (err) => {
                console.error('Error during suspension:', err);
                Swal.fire('Error', 'Failed to suspend contractor', 'error');
            },
        });
    }
}
   rejectApplication() {
          this.service.rejectApplication('consultant',this.data.consultantNo).subscribe(
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
createNotification(
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  message: string
): void {
  this.notification[type](title, message).onClick.subscribe(() => {
  });
}
 emptyHrFulfilledMsg: string = '';
 update() {
    // Clear previous message
    this.emptyHrFulfilledMsg = '';
    // Manual validation for hrFulfilled
    if (!this.tData.hrFulfilled) {
        this.emptyHrFulfilledMsg = 'Please select Yes or No';
        return;
    }
    this.isSaving = true;
    const payload = {
        consultantRegistrationDto: {
            bctaNo: this.bctaNo,
            hrFulfilled: this.tData.hrFulfilled,
            hrResubmitDeadline: this.tData.resubmitDate,
            hrRemarks: this.tData.remarks,
        },
    };

    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
        next: (res: any) => {
            this.isSaving = false;
            Swal.fire({
                icon: 'success',
                title: 'Updated successfully!',
                showConfirmButton: false,
                timer: 2000,
            }).then(() => {
                this.router.navigate(['monitoring/consultancy']);
            });
        },
        error: (err) => {
            this.isSaving = false;
            Swal.fire({
                icon: 'error',
                title: 'Update failed!',
                text:
                    err?.error?.message ||
                    'Something went wrong. Please try again.',
                confirmButtonText: 'OK',
            });
        },
    });
}


    tableId: any;
    saveAndNext() {
        this.isSaving = true;
        const table = this.service.setData(
            this.id,
            'tableId',
            'office-signage'
        );
        this.tableId = this.id;
        const hr = this.tableData.map((item: any) => ({
            cidNo: item.cId,
            fullName: item.name,
            gender: item.sex,
            nationality: item.countryName,
            qualification: item.qualification,
            joiningDate:
                item.joiningDate && !isNaN(new Date(item.joiningDate).getTime())
                    ? new Date(item.joiningDate).toISOString().split('T')[0]
                    : '',
        }));
        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarks,
            },
            consultantEmployeeDto: hr,
        };
        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                this.activateTab.emit({
                    id: this.tableId,
                    data:this.data,
                    tab: 'consultancyEquipment',
                });
            },
            (err) => {
                this.isSaving = false;

                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text:
                        err?.error?.message ||
                        'Something went wrong. Please try again.',
                    confirmButtonText: 'OK',
                });
            }
        );
    }

   isFetching: boolean = false;
    payslipDetails: any[] = [];
    showTable: boolean = false;
    verifyPaySlip() {
        this.isFetching = true;
        this.service.verifyPayslipDetails(this.formData.tpnNo)
            .subscribe((res: any) => {
                this.payslipDetails = res.PayerDetails;
                this.showTable = true;
                  this.isFetching = false;
            },
            (error: HttpErrorResponse) => {
                if (error.status === 404) {
                    this.showErrorMessage='No product found with Registration No';
                }else if (error.status === 500) {
                    this.showErrorMessage = 'Something went wrong. Please try again.';
                }
            }
        );
    }

    resetModalData() {
        this.showTable = false;
         this.isFetching = false;
        this.formData.tpnNo = '';
        this.payslipDetails = [];
    }
    clearErrorMessage() {
        this.showErrorMessage = '';
        this.isFetching = false;
    }
}
