import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
declare var bootstrap: any;
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
    selector: 'app-sf-permanent-employees',
    templateUrl: './sf-permanent-employees.component.html',
    styleUrls: ['./sf-permanent-employees.component.scss'],
})
export class SfPermanentEmployeesComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string; tab: string }>();
    bctaNo: any;
    tableData: any;
    applicationStatus: string = '';
    tData: any = {};
    isSaving = false;
    specializedFirmsModal: any = null;
    @Input() id: string = '';
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        specializedFirmId: '',
        specializedFirmNo: '',
    };
    bsModal: any;
    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    licenseStatus: string = '';
    today: any;
    showErrorMessage: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.id = this.id;
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
        const WorkDetail = this.service.getData('BctaNo');
        this.formData.firmType = WorkDetail.data || '';
        this.bctaNo = WorkDetail.data.specializedFirmNo;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.licenseStatus = WorkDetail.data.licenseStatus;
        this.service.setBctaNo(this.bctaNo);
        this.service.firmInfo$.subscribe((info) => {
            if (info) {
                this.formData.firmName = info.firmName;
                this.formData.mobileNo = info.mobileNo;
                this.formData.email = info.email;
            }
        });
        if (
            this.bctaNo &&
            this.applicationStatus === 'Suspension Resubmission'
        ) {
            this.fetchSuspendDataBasedOnBctaNo();
        } else {
            this.fetchDataBasedOnBctaNo();
        }
    }

    /**
     * Sets the current date in YYYY-MM-DD format to selectedAction.actionDate.
     */
    date() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
    }
    /**
     * Fetches suspended data based on BCTA number.
     * Subscribes to the suspended data service and assigns the response to tableData.
     * Logs any errors that occur to the console.
     */
    fetchSuspendDataBasedOnBctaNo() {
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
            (res: any) => {
                this.tableData = res.hrCompliance;
            },
            (error) => {
                console.error('Error fetching data:', error);
            }
        );
    }
    /**
     * Opens the action modal with the given row data.
     * @param row The row data to be processed.
     */
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

    /**
     * Fetches data based on BCTA number.
     * Subscribes to the data service and assigns the response to tableData.
     * Logs any errors that occur to the console.
     */
    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNos(this.bctaNo,this.formData.firmType.appNo).subscribe((res: any) => {
            this.tableData = res.hrCompliance;
            console.log('sf employee', this.formData);
        });
    }
    rejectApplication() {
        this.service
            .rejectApplication('specialized-Firm', this.bctaNo)
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
    /**
     * Handles the action type change event.
     * If the action type is 'downgrade', fetches the work categories and existing classifications
     * for the selected specialized firm and populates the downgrade list.
     */

    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.formData.firmType.specializedFirmId; // Use the correct property for firmId
            const firmType = 'specializedfirm';
            if (!firmId) {
                console.error('firmId is undefined.');
                return;
            }
            forkJoin({
                categoryData: this.service.getWorkCategory('specializedfirm'),
                existingClassData: this.service.getClassification(
                    firmType,
                    firmId
                ),
            }).subscribe({
                next: ({ categoryData, existingClassData }) => {
                    const workCategories = categoryData.workCategory;

                    // Only pre-check categories with a non-null specializedFirmWorkCategoryId
                    const preCheckedSet = new Set(
                        (existingClassData || [])
                            .filter(
                                (item: any) =>
                                    item.specializedFirmWorkCategoryId
                            )
                            .map((item: any) => item.workCategory)
                    );
                    // Populate the downgrade list with the work categories and existing/new classifications

                    this.downgradeList = workCategories.map(
                        (category: any) => ({
                            workCategory: category.workCategory,
                            workCategoryId: category.id,
                            checked: preCheckedSet.has(category.workCategory),
                            preChecked: preCheckedSet.has(
                                category.workCategory
                            ),
                        })
                    );
                },
                error: (err) => {
                    console.error('Error fetching downgrade data:', err);
                },
            });
            // Reset the downgrade list if the action type is not 'downgrade'
        } else {
            this.downgradeList = [];
        }
    }
    downloadFile(filePath: string): void {
        const sanitizedPath = filePath.replace(/\s+/g, ' ');
        this.service.downloadFileFirm(sanitizedPath).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                const mimeType =
                    response.body?.type || 'application/octet-stream';
                const blob = new Blob(binaryData, { type: mimeType });
                const blobUrl = window.URL.createObjectURL(blob);

                // Ensure filename is properly extracted and decoded
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
                        <head>
                            <title>File Preview</title>
                        </head>
                        <body style="margin:0; text-align: center;">
                            <div style="padding:10px;">
                                <a href="${blobUrl}" download="${fileName}" 
                                   style="font-size:16px; color:blue;" 
                                   target="_blank">⬇ Download ${fileName}</a>
                            </div>
                            ${
                                isImage
                                    ? `<img src="${blobUrl}" style="max-width:100%; height:auto;" alt="Image Preview"/>`
                                    : `<iframe src="${blobUrl}" width="100%" height="90%" style="border:none;"></iframe>`
                            }
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

    update() {
        this.isSaving = true;
        const payload = {
            sfReviewDto: {
                bctaNo: this.bctaNo,
                hrFulfilled: this.tData.hrFulfilled,
                hrResubmitDeadline: this.tData.resubmitDate,
                hrRemarks: this.tData.remarks,
            },
        };

        this.service.saveOfficeSignageAndDocSF(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Updated successfully!',
                    showConfirmButton: false,
                    timer: 2000,
                }).then(() => {
                    this.router.navigate(['monitoring/specialized']);
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
                this.router.navigate(['monitoring/specialized']);
            },
        });
    }

    tableId: any;

    /**
     * Saves the current record and navigates to the next tab.
     */
    saveAndNext() {
        this.isSaving = true;
        const sfReviewEmployeeDto = (this.tableData || []).map((item: any) => ({
            nationality: item?.countryName || 'string',
            qualification: item?.qualification || 'string',
            joiningDate: item?.joiningDate
                ? this.formatDate(item.joiningDate)
                : '2025-06-26',
        }));
        const sfReviewDto = {
            bctaNo: this.bctaNo || 'string',
            firmName: this.formData?.firmName || 'string',
            contactNo: this.formData?.mobileNo || 'string',
            email: this.formData?.email || 'string',
            hrFulfilled: this.tData?.hrFulfilled || 'string',
            hrResubmitDeadline: this.tData?.resubmitDate,
            hrRemarks: this.tData?.remarks || 'string',
        };

        // Create the request payload
        const payload = {
            sfReviewDto,
            sfReviewEmployeeDto,
        };

        // Save the record
        this.service.saveOfficeSignageAndDocSF(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;

                // Extract the emitted ID from the response
                let emittedId = '';
                if (typeof res === 'string') {
                    try {
                        const parsed = JSON.parse(res);
                        emittedId = parsed && parsed.id ? parsed.id : '';
                    } catch (e) {
                        emittedId = '';
                    }
                } else if (res && res.id) {
                    emittedId = res.id;
                }

                // Navigate to the next tab
                this.activateTab.emit({
                    id: emittedId,
                    tab: 'sfmonitoring',
                });
            },
            error: (err) => {
                this.isSaving = false;
                console.error('Error Saving!', err);
            },
        });
    }

    private formatDate(date: any): string {
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch (e) {
            return '2025-06-14'; // Fallback date
        }
    }

    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

    submitAction() {
        if (
            !this.selectedAction.actionType ||
            !this.selectedAction.remarks
        ) {
            alert('All required fields must be filled.');
            return;
        }

        if (this.selectedAction.actionType === 'downgrade') {
            // Collect all unchecked, previously pre-checked categories
            const downgradeEntries = this.downgradeList
                .filter((entry) => entry.preChecked && !entry.checked)
                .map((entry) => ({
                    workCategoryId: entry.workCategoryId,
                }));

            if (downgradeEntries.length === 0) {
                Swal.fire(
                    'Error',
                    'Please uncheck at least one existing category to downgrade.',
                    'error'
                );
                return;
            }
            const payload = {
                specializedFirmId: this.bctaNo,
                requestedBy: this.authService.getUsername(), // Replace with actual user/requestor if needed
                downgradeEntries,
                applicationID:this.selectedAction.target?.appNo,
            };

            this.service.downgradeSF(payload).subscribe({
                next: (res: string) => {
                    if (
                        res &&
                        res
                            .toLowerCase()
                            .includes('downgrade request submitted')
                    ) {
                        Swal.fire(
                            'Success',
                            'Forwarded to Review Committee',
                            'success'
                        );
                        this.closeModal();
                    } else {
                        Swal.fire(
                            'Error',
                            res || 'Something went wrong while forwarding.',
                            'error'
                        );
                        this.closeModal();
                    }
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'Something went wrong while forwarding.',
                        'error'
                    );
                    console.error(err);
                    this.closeModal();
                },
            });
        } else if (this.selectedAction.actionType === 'cancel') {
            const payload = {
                firmNo: this.bctaNo,
                cancelledBy: this.authService.getUsername(),
                cancelledOn: new Date(
                    this.selectedAction.actionDate
                ).toISOString(),
                firmType: 'specialized-firm',
                reason: this.selectedAction.remarks,
                applicationID:this.selectedAction.target?.appNo,
            };
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
                    Swal.fire('Error', 'Failed to cancel firm', 'error');
                },
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.bctaNo,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'specialized-firm',
                suspendDetails: this.selectedAction.remarks,
                applicationID:this.selectedAction.target?.appNo,
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
