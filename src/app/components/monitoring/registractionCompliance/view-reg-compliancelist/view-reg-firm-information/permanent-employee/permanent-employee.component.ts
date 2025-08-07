// Importing core and utility modules
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../auth.service';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';

declare var bootstrap: any; // Bootstrap modal library

@Component({
    selector: 'app-permanent-employee',
    templateUrl: './permanent-employee.component.html',
    styleUrls: ['./permanent-employee.component.scss'],
})
export class PermanentEmployeeComponent {
    formData: any = {}; // Holds form input data
    @Output() activateTab = new EventEmitter<{
        id: string;
        data: string;
        tab: string;
    }>(); // Emits event to switch tab
    bctaNo: any; // Contractor registration number
    tableData: any = []; // Table data for employees
    @Input() id: string = ''; // Receives input ID from parent
    data: any; // Holds work detail data
    tData: any; // Holds HR status details
    applicationStatus: string = ''; // Tracks application status
    isSaving = false; // Button loading state
    WorkDetail: any = {}; // Work details object
    reinstateModal: any = null; // Bootstrap modal instance
    today: string = new Date().toISOString().substring(0, 10); // Today's date in YYYY-MM-DD
    showErrorMessage: any; // For handling file download error messages
    licenseStatus: any;
    @ViewChild('closeActionModal', { static: false })
    closeActionModal!: ElementRef;
    appNo: any;

    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        // Set default action date to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;

        // Fetch Work Detail from service
        const WorkDetail = this.service.getData('BctaNo');
        this.WorkDetail = WorkDetail;

        if (!WorkDetail || !WorkDetail.data) {
            console.error('WorkDetail or WorkDetail.data is undefined');
            return;
        }

        // Populate key data from fetched WorkDetail
        this.formData.firmType = WorkDetail.data;
        this.bctaNo = WorkDetail.data.contractorNo;
        this.appNo = WorkDetail.data.appNo;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.licenseStatus = WorkDetail.data.licenseStatus;
        this.data = WorkDetail.data;
        this.tData = {
            hrFulfilled: '',
            hrResubmitDeadline: '',
            hrRemarks: '',
        };
        // If contractor number exists, fetch HR compliance data
        if (
            this.bctaNo && this.appNo &&
            this.applicationStatus !== 'Suspension Resubmission'
        ) {
            this.fetchDataBasedOnBctaNo();
        } else {
            this.fetchSuspendDataBasedOnBctaNo();
        }
    }

    // Placeholder for click events
    onClick() {}

    // Fetch employee HR compliance data by BCTA number
  fetchDataBasedOnBctaNo() {
  this.service.getDatabasedOnBctaNos(this.WorkDetail.data.contractorNo, this.WorkDetail.data.appNo).subscribe(
    (res1: any) => {
      // Update formData from complianceEntities
      if (res1?.complianceEntities?.length) {
        this.formData = { ...this.formData, ...res1.complianceEntities[0] };
      }
      // Update tableData from hrCompliance
      this.tableData = res1?.hrCompliance || [];

      // Prepare payload for second API call
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

      // Second API call: fetchDetails
      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };
            this.tData.hrFulfilled =  this.formData.hrfulfilled;
            this.tData.resubmitDate =  this.formData.resubmitDate;
            this.formData.remarksYes = this.formData.hrremarks;
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
      this.tableData = res1.hrCompliance;

      // Prepare payload for second call
      const payload = [
        {
          field: 'bctaNo',
          value: this.bctaNo,
          condition: 'LIKE',
          operator: 'AND'
        }
      ];
      // Fetch additional details
      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };
            // Optional: Map specific fields
            this.tData.hrFulfilled =  this.formData.hrfulfilled;
            this.tData.resubmitDate =  this.formData.resubmitDate;
            this.formData.remarksYes = this.formData.hrremarks;
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

    // Close reinstatement modal
    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }

    reinstateData: any = null;
    // Perform reinstatement + approval
    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: 'contractor',
            licenseStatus: 'Active',
            applicationStatus: 'Reinstated',
        };

        const approvePayload = {
            firmType: 'Contractor',
            cdbNos: row,
        };
        forkJoin({
            reinstate: this.service.reinstateLicense(payload),
            // approve: this.service.approveReinstatement(approvePayload),
        }).subscribe({
            next: ({ reinstate }) => {
                if (
                    reinstate &&
                    reinstate
                        .toLowerCase()
                        .includes('license status updated to active')
                ) {
                    Swal.fire(
                        'Success',
                        'License Reinstated and Approved Successfully',
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
                this.closeModal();
                this.router.navigate(['/monitoring/construction']);
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                Swal.fire(
                    'Success',
                    'License Reinstated and Approved Successfully',
                    'success'
                );
                this.closeModal();
            },
        });
    }

    // Placeholder for pension-related logic
    fetchTdsHcPension() {}

    // Action form values
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: '',
    };
    bsModal: any;

    // Close modal if open
    // closeModal() {
    //     if (this.bsModal) {
    //         this.bsModal.hide();
    //     }
    // }

    downgradeList: any[] = [];
    workClassificationList: any[] = [];

    // When action type is changed, load downgrade options
    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.WorkDetail.data.contractorId;
            const firmType = 'contractor';

            if (!firmId) return;

            forkJoin({
                categoryData: this.service.getWorkCategory('contractor'),
                existingClassData: this.service.getClassification(
                    firmType,
                    firmId
                ),
            }).subscribe({
                next: ({ categoryData, existingClassData }) => {
                    const workCategories = categoryData.workCategory;
                    this.workClassificationList =
                        categoryData.workClassification;

                    const classificationMap = existingClassData.reduce(
                        (acc: any, item: any) => {
                            acc[item.workCategory] =
                                item.existingWorkClassification;
                            return acc;
                        },
                        {}
                    );
                    this.downgradeList = workCategories.map((category: any) => {
                        const downgradeItem = {
                            workCategory: category.workCategory,
                            workCategoryId: category.id,
                            existingClass:
                                classificationMap[category.workCategory] ||
                                'Not available',
                            newClass: '',
                        };

                        return downgradeItem;
                    });
                },
                error: (err) => {
                    console.error('Error fetching downgrade data:', err);
                },
            });
        } else {
            this.downgradeList = [];
        }
    }
    get filteredDowngradeList() {
        return this.downgradeList.filter(
            (item) => item.existingClass !== 'Not available'
        );
    }

    trackByWorkCategory(index: number, item: any): string {
        return item.workCategoryId;
    }
    // Submit action for downgrade, suspend or cancel
    submitAction() {
        if (
            !this.selectedAction.actionType ||
            !this.selectedAction.actionDate ||
            !this.selectedAction.remarks
        ) {
            alert('All required fields must be filled.');
            return;
        }

        // Handle downgrade logic
        if (this.selectedAction.actionType === 'downgrade') {
            const downgradeEntries = this.downgradeList
                .filter((entry) => entry.newClass && entry.newClass !== '')
                .map((entry) => {
                    const classification = this.workClassificationList.find(
                        (c: any) => c.workClassification === entry.newClass
                    );
                    return {
                        workCategoryId: entry.workCategoryId,
                        newWorkClassificationId: classification
                            ? classification.id
                            : null,
                    };
                });

            if (downgradeEntries.length === 0) {
                Swal.fire(
                    'Error',
                    'Please select at least one new class to downgrade.',
                    'error'
                );
                return;
            }
            const payload = {
                firmId: this.WorkDetail.data.contractorId,
                firmType: 'Contractor',
                downgradeEntries,
                 applicationNumber: this.WorkDetail.data.appNo,
                requestedBy: this.authService.getUsername(),
            };
            this.service.downgradeFirm(payload).subscribe({
                next: (res: string) => {
                    if (
                        res
                            .toLowerCase()
                            .includes('downgrade request submitted')
                    ) {
                        Swal.fire(
                            'Success',
                            'Forwarded to Review Committee',
                            'success'
                        );
                        this.closeActionModal.nativeElement.click();
                        //this.router.navigate(['/monitoring/construction']);
                    } else {
                        Swal.fire(
                            'Error',
                            res || 'Something went wrong while forwarding.',
                            'error'
                        );
                        this.closeActionModal.nativeElement.click();
                    }
                },
                error: () => {
                    Swal.fire(
                        'Error',
                        'Something went wrong while forwarding.',
                        'error'
                    );
                    this.closeActionModal.nativeElement.click();
                },
            });
        }

        // Suspend contractor
        else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.WorkDetail.data.contractorNo,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Contractor',
                suspendDetails: this.selectedAction.remarks,
                  applicationID: this.WorkDetail.data.appNo,
            };
            this.service.suspendFirm(payload).subscribe({
                next: () => {
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeActionModal.nativeElement.click();
                    this.router.navigate(['/monitoring/construction']);
                },
                error: () => {
                    Swal.fire('Error', 'Failed to suspend contractor', 'error');
                },
            });
        }
    }
    closeModal() {
        const modalElement = this.closeActionModal?.nativeElement;

        if (modalElement) {
            const modal =
                bootstrap.Modal.getInstance(modalElement) ||
                new bootstrap.Modal(modalElement);
            modal.hide();
        } else {
            console.warn('Modal element is not available.');
        }
    }

    // Handle file download and preview logic
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

    tableId: any;

    // Save and move to equipment tab
    saveAndNext() {
        this.isSaving = true;
        this.tableId = this.id;
        this.service.setData(this.id, 'tableId', 'office-signage');

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
            tradeField: item.tradeName,
            paySlip: item.paySlipFileName,
            remarks: this.formData.remarksYes,
            tdsFetched: true,
        }));

        const payload = {
            registrationReview: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarksNo,
            },
            employeeReviews: hr,
        };

        this.service.saveOfficeSignageAndDoc(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                this.activateTab.emit(
                    {
                    id: this.tableId,
                    data: this.WorkDetail,
                    tab: 'equipment',
                }
            );
            
            },
            (error) => {
                this.isSaving = false;

                if (error.status === 500) {
                    this.isSaving = false;
                    this.createNotification(
                        'error',
                        'Server Error',
                        'A server error occurred. Please try again later.'
                    );
                } else {
                    this.createNotification(
                        'error',
                        'Error',
                        'Something went wrong while saving the data.'
                    );
                }

                console.error('Error saving data:', error);
            }
        );
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
    createNotification(
        type: 'success' | 'error' | 'info' | 'warning',
        title: string,
        message: string
    ): void {
        this.notification[type](title, message).onClick.subscribe(() => {});
    }

    // Save and forward data
    saveAndForward() {
        this.isSaving = true;
        this.tableId = this.id;
        this.service.setData(this.id, 'tableId', 'office-signage');

        const hr = this.tableData.map((item: any) => ({
            cidNo: item.cId,
            fullName: item.name,
            gender: item.sex,
            nationality: item.countryName,
            qualification: item.qualification,
            joiningDate: '2024-01-01', // Static fallback date
            tradeField: item.tradeName,
            paySlip: item.paySlipFileName,
            remarks: this.formData.remarksYes,
            tdsFetched: true,
        }));

        const payload = {
            registrationReview: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarksNo,
            },
            employeeReviews: hr,
        };

        this.service.saveOfficeSignageAndDoc(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                this.activateTab.emit({
                    id: this.tableId,
                    data: this.WorkDetail,
                    tab: 'equipment',
                });
            },
            (error) => {
                this.isSaving = false;

                if (error.status === 500) {
                    this.isSaving = false;
                    this.createNotification(
                        'error',
                        'Server Error',
                        'A server error occurred (500). Please try again later.'
                    );
                } else {
                    this.isSaving = false;
                    this.createNotification(
                        'error',
                        'Error',
                        'Something went wrong while saving the data.'
                    );
                }

                console.error('Error saving data:', error);
            }
        );
    }

    // Update only the registration review data
    update() {
        this.isSaving = true;
        const payload = {
            registrationReview: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarksNo,
            },
        };

        this.service.saveOfficeSignageAndDoc(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Updated successfully!',
                    showConfirmButton: false,
                    timer: 2000,
                }).then(() => {
                    this.router.navigate(['monitoring/construction']);
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
    isFetching: boolean = false;
    payslipDetails: any[] = [];
    showTable: boolean = false;
    verifyPaySlip() {
        this.isFetching = true;
        this.service.verifyPayslipDetails(this.formData.tpnNo).subscribe(
            (res: any) => {
                this.payslipDetails = res.PayerDetails;
                this.showTable = true;
                this.isFetching = false;
            },
            (error: HttpErrorResponse) => {
                if (error.status === 404) {
                    this.showErrorMessage =
                        'No product found with Registration No';
                } else if (error.status === 500) {
                    this.showErrorMessage =
                        'Something went wrong. Please try again.';
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
