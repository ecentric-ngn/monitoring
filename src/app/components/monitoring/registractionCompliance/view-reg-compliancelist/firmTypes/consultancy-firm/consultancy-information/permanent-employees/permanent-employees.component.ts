import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
declare var bootstrap: any;

@Component({
    selector: 'app-permanent-employees',
    templateUrl: './permanent-employees.component.html',
    styleUrls: ['./permanent-employees.component.scss'],
})
export class PermanentEmployeesComponent {
    tableData: any[] = [];
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string; tab: string }>();
    bctaNo: any;
    @Input() id: string = '';
    applicationStatus: string = '';
    tData: any;
    isSaving = false;
    showErrorMessage: any;
    licenseStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService
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

    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
            this.tableData = res.hrCompliance;
            console.log('employee', this.formData);
        });
    }

    fetchSuspendDataBasedOnBctaNo() {
    //this.bctaNo = this.WorkDetail.data.contractorNo;
    this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
      (res: any) => {
         this.tableData = res.hrCompliance;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
    fetchTdsHcPension() {}
    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }
    reinstateModal: any = null;
    reinstateData: any = null;
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
        if (this.bsModal) {
            this.bsModal.hide();
        }
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

                // Build a map: workCategory -> Set of existing classification IDs
                const existingMap: { [cat: string]: Set<string> } = {};
                for (const item of existingClassData) {
                    if (item.workCategory && item.consultantWorkClassificationId) {
                        const key = String(item.workCategory).trim();
                        if (!existingMap[key]) {
                            existingMap[key] = new Set();
                        }
                        existingMap[key].add(
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

                            const possibleClassifications = workClassifications
                                .filter(
                                    (cls: any) =>
                                        cls.type === 'consultant' &&
                                        cls.workClassification.startsWith(
                                            prefix
                                        ) &&
                                        existingMap[categoryKey] &&
                                        existingMap[categoryKey].has(
                                            String(cls.id).trim()
                                        )
                                )
                                .map((cls: any) => ({
                                    id: cls.id,
                                    name: cls.workClassification,
                                    checked: true,
                                    preChecked: true,
                                }));

                            // Return null if no classification matches
                            if (possibleClassifications.length === 0) {
                                return null;
                            }

                            return {
                                workCategory: category.workCategory,
                                workCategoryId: category.id,
                                classifications: possibleClassifications,
                            };
                        })
                        .filter((item: any) => item !== null); // Remove nulls
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
    console.log('Submit Action triggered with:', this.selectedAction);
    if (
        !this.selectedAction.actionType ||
        !this.selectedAction.actionDate ||
        !this.selectedAction.remarks
    ) {
        alert('All required fields must be filled.');
        return;
    }

    if (this.selectedAction.actionType === 'cancel') {
        console.log('Cancel action initiated.');

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

        console.log('Downgrade entries:', downgradeEntries);

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
        };

        console.log('Downgrade payload:', payload);

        this.service.downgradeConsultancy(payload).subscribe({
            next: (res: string) => {
                console.log('Downgrade response:', res);
                if (res && res.toLowerCase().includes('downgrade request submitted')) {
                    Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                    this.closeModal();
                } else {
                    Swal.fire('Error', res || 'Something went wrong while forwarding.', 'error');
                    this.closeModal();
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
            firmNo: this.selectedAction.target?.consultantNo,
            suspendedBy: this.authService.getUsername(),
            suspensionDate: this.selectedAction.actionDate
                ? new Date(this.selectedAction.actionDate).toISOString()
                : null,
            firmType: 'Consultant',
            suspendDetails: this.selectedAction.remarks,
        };

        console.log('Suspend payload:', payload);

        this.service.suspendFirm(payload).subscribe({
            next: (res) => {
                console.log('Suspend response:', res);
                Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                this.closeModal();
            },
            error: (err) => {
                console.error('Error during suspension:', err);
                Swal.fire('Error', 'Failed to suspend contractor', 'error');
            },
        });
    }
}


 
    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: 'consultant',
            licenseStatus: 'Active',
        };

        const approvePayload = {
            firmType: 'Consultant',
            cdbNos: row,
        };

        forkJoin({
            reinstate: this.service.reinstateLicense(payload),
            approve: this.service.approveReinstatement(approvePayload),
        }).subscribe({
            next: ({ reinstate, approve }) => {
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
                    this.closeModal();
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
                this.router.navigate(['/monitoring/consultancy']);
                this.closeModal();
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                this.closeModal();
                Swal.fire(
                    'Success',
                    'License Reinstated and Approved Successfully',
                    'success'
                );
            },
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
                console.log('res', res);
                //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
                this.activateTab.emit({
                    id: this.tableId,
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
