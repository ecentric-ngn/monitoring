import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';
declare var bootstrap: any;
@Component({
    selector: 'app-cb-permanent-employees',
    templateUrl: './cb-permanent-employees.component.html',
    styleUrls: ['./cb-permanent-employees.component.scss'],
})
export class CbPermanentEmployeesComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string;data:string, tab: string }>();
    bctaNo: any;
    tableData: any;
    @Input() id: string = '';
    applicationStatus: string = '';
    tData: any;
    isSaving = false;
    reinstateData: any = null;
    reinstateModal: any = null;
    workClassificationList: any[] = [];
    downgradeList: any[] = [];
    licenseStatus: string = '';
    today: string = new Date().toISOString().substring(0, 10);
    showErrorMessage: any;
    @Input() data: any
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
          private notification: NzNotificationService,
    ) {}

    ngOnInit() {
        this.id = this.id;
         const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
        const WorkDetail = this.service.getData('BctaNo');
        this.formData.firmType = WorkDetail.data;
        this.bctaNo = WorkDetail.data.certifiedBuilderNo;
        this.licenseStatus = WorkDetail.data.licenseStatus;
         this.data = this.data;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.tData = {
            hrFulfilled: '',
            hrResubmitDeadline: '',
            hrRemarks: '',
        };
        if (this.bctaNo && this.applicationStatus === 'Suspension Resubmission') {
            this.fetchSuspendDataBasedOnBctaNo();
        }else{
            this.fetchDataBasedOnBctaNo();
        }
    }
    /**
     * Fetch suspended data based on BCTA number.
     * Merges the first compliance entity from the API response into formData.
     */
    fetchSuspendDataBasedOnBctaNo() {
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
            (res: any) => {
                this.tableData = res.hrCompliance;
            },
            (error) => {
                // Log error if fetching data fails
                console.error('Error fetching data:', error);
            }
        );
    }
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        certifiedBuilderId: '',
        certifiedBuilderNo: '',
    };
    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
            this.tableData = res.hrCompliance;
        });
    }

    openActionModal(row: any) {
        this.selectedAction = {
            actionType: '',
            actionDate: this.today,
            remarks: '',
            newClassification: '',
            target: row, // attach row data if needed
        };
        const modalEl = document.getElementById('actionModal');
        this.bsModal = new bootstrap.Modal(modalEl, {
            backdrop: 'static', // Optional: prevents closing on outside click
            keyboard: false, // Optional: disables ESC key closing
        });
        this.bsModal.show();
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
   rejectApplication() {
        this.service
            .rejectApplication('certified-Builder', this.bctaNo)
            .subscribe(
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
            );
    }
    createNotification(
        type: 'success' | 'error' | 'info' | 'warning',
        title: string,
        message: string
    ): void {
        this.notification[type](title, message).onClick.subscribe(() => {});
    }
    update() {
        this.isSaving = true;
        const payload = {
            cbReviewDto: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarks,
            },
        };

        this.service.saveOfficeSignageAndDocCB(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Updated successfully!',
                    showConfirmButton: false,
                    timer: 2000,
                }).then(() => {
                    this.router.navigate(['monitoring/certified']);
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
            cbReviewDto: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarks,
            },
            cbEmployeeReviewDto: hr,
        };
        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                this.activateTab.emit({ id: this.tableId,data: this.data, tab: 'cbEquipment' });
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
            const payload = {
                firmNo: this.formData.firmType.certifiedBuilderNo,
                cancelledBy: this.authService.getUsername(),
                cancelledOn: new Date(
                    this.selectedAction.actionDate
                ).toISOString(),
                firmType: 'certified-builder',
                reason: this.selectedAction.remarks,
            };
            ;
            console.log('payload..........', payload);
            // Call cancel API
            this.service.cancelFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeModal();
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'Failed to cancel certified-builder',
                        'error'
                    );
                },
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.formData.firmType.certifiedBuilderNo,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'certified-builder',
                suspendDetails: this.selectedAction.remarks,
            };
            // Call suspend API
            this.service.suspendFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeModal();
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to suspend firm', 'error');
                },
            });
        }
    }

    bsModal: any;
    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.selectedAction.target?.certifiedBuilderId;
            const firmType = 'certified-builder';

            console.log('firmId:', firmId);
            if (!firmId) {
                console.error(
                    'firmId is undefined. Check if the selected row has contractorId or consultantNo.'
                );
                return;
            }

            forkJoin({
                categoryData: this.service.getWorkCategory('certified builder'),
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

                    this.downgradeList = workCategories.map(
                        (category: any) => ({
                            workCategory: category.workCategory,
                            workCategoryId: category.id,
                            existingClass:
                                classificationMap[category.workCategory] ||
                                'Unknown',
                            newClass: '',
                        })
                    );
                },
                error: (err) => {
                    console.error('Error fetching downgrade data:', err);
                },
            });
        } else {
            this.downgradeList = [];
        }
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
