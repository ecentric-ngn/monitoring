import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';

declare var bootstrap: any;
@Component({
    selector: 'app-office-signage',
    templateUrl: './office-signage.component.html',
    styleUrls: ['./office-signage.component.scss'],
})
export class OfficeSignageComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string; tab: string }>();
    bctaNo: any;
    data: any;
    bsModal: any;
    applicationStatus: string = '';
    isSaving = false;
    licenseStatus: string = '';
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
    showErrorMessage: any;

    private getPrefix(workCategory: string): string {
        if (workCategory.startsWith('S-')) return 'S';
        if (workCategory.startsWith('A-')) return 'A';
        if (workCategory.startsWith('C-')) return 'C';
        if (workCategory.startsWith('E-')) return 'E';
        return '';
    }
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
        private notification: NzNotificationService,
    ) {}

    ngOnInit() {
        this.initializeFormData();
        this.date();
        const WorkDetail = this.service.getData('BctaNo');
        this.licenseStatus = WorkDetail.data.licenseStatus;

        if (!WorkDetail || !WorkDetail.data) {
            return;
        }
        this.formData.firmType = WorkDetail.data;
        this.data = WorkDetail.data;
        this.bctaNo = WorkDetail.data.consultantNo;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        console.log('applicationStatusin consultancy', this.applicationStatus);
        if (
            this.applicationStatus === 'Suspension Resubmission' &&
            this.bctaNo
        ) {
            this.fetchSuspendDataBasedOnBctaNo();
        } else {
            this.fetchDataBasedOnBctaNo();
        }
    }

    date() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');

        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
    }
    initializeFormData() {
        this.formData = {
            officeSignboardPath: null,
            oslocation: '',
            signboardReview: '',
            resubmitDate: null,
            signboardRemarks: '',
            properFillingPath: null,
            filingReview: '',
            filingRemarks: '',
            filingResubmitDate: null,
        };
    }

    onReviewChange() {
        if (this.formData.signboardReview === 'No') {
            // Initialize resubmit fields when 'No' is selected
            this.formData.resubmitDate = null;
            this.formData.signboardRemarks = '';
        }
    }

    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
            // Merge API response with initialized formData
            this.formData = {
                ...this.formData, // Keep initialized values
                ...res.complianceEntities[0], // Add API data
            };
        });
    }

    fetchSuspendDataBasedOnBctaNo() {
        //this.bctaNo = this.WorkDetail.data.contractorNo;
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
            (res: any) => {
                this.formData = {
                    ...this.formData, // Keep initialized values
                    ...res.complianceEntities[0], // Add API data
                };
            },
            (error) => {
                console.error('Error fetching data:', error);
            }
        );
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

    isOfficeSignboardEnabled(): boolean {
        return ['Resubmitted OS and PFS', 'Submitted'].includes(
            this.applicationStatus
        );
    }

    isFilingSystemEnabled(): boolean {
        return ['Resubmitted OS and PFS', 'Submitted'].includes(
            this.applicationStatus
        );
    }

    isOhsEnabled(): boolean {
        return this.applicationStatus === 'Submitted';
    }

    isFieldEditable(field: string): boolean {
        if (this.licenseStatus === 'Suspended') {
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
        // this.emptyHrFulfilledMsg = '';
        // // Manual validation for hrFulfilled
        // if (!this.formData.hrFulfilled) {
        //     this.emptyHrFulfilledMsg = 'Please select Yes or No';
        //     return;
        // }
        this.isSaving = true;
        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.data.consultantNo || null,
                officeSignboard: this.formData.officeSignboardPath || null,
                signageResubmitDeadline:
                    this.formData.signboardResubmitDate || null,
                osreview: this.formData.signboardReview || null,
                osremarks: this.formData.signboardRemarks || null,
                filingSystem: this.formData.properFillingPath || null,
                fsreview: this.formData.filingReview || null,
                fsremarks: this.formData.filingRemarks || null,
                fsresubmitDeadline: this.formData.filingResubmitDate || null,
            },
        };

        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
            (response: any) => {
                this.isSaving = false;

                try {
                    const parsedResponse =
                        typeof response === 'string'
                            ? JSON.parse(response)
                            : response;
                    this.id = parsedResponse.consultantRegistrationDto?.id;

                    Swal.fire({
                        icon: 'success',
                        title: 'Saved!',
                        text: 'Office signage and documents review saved successfully.',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    this.router.navigate(['monitoring/construction']);
                } catch (e) {
                    console.error('Error parsing response:', e);
                    Swal.fire(
                        'Error',
                        'An unexpected error occurred while parsing the response.',
                        'error'
                    );
                }
            },
            (error) => {
                this.isSaving = false;
                console.error('Error saving data:', error);
                Swal.fire(
                    'Error',
                    'Failed to save office signage and documents review.',
                    'error'
                );
            }
        );
    }

    id: any;
    saveAndNext() {
        this.isSaving = true;
        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.data.consultantNo,
                firmName: this.formData.firmName,
                contactNo: this.formData.mobileNo,
                email: this.formData.emailAddress,
                classification: this.formData.classification,
                officeSignboard: this.formData.officeSignboardPath,
                // osNotificationDate: this.formData.createdAt,  faced an issue with date format
                osResubmitDeadline: this.formData.resubmitDate,
                // osResubmitted: true,
                filingSystem: this.formData.properFillingPath,
                fsreview: this.formData.filingReview,
                oslocation: this.formData.officeLocation,
                osreview: this.formData.signboardReview,
                osremarks: this.formData.signboardRemarks,
                fsremarks: this.formData.filingRemarks,
                fsresubmitDeadline: this.formData.filingResubmitDate,
            },
        };

        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
            (response: any) => {
                this.isSaving = false;

                const parsedResponse =
                    typeof response === 'string'
                        ? JSON.parse(response)
                        : response;
                this.id = parsedResponse.consultantRegistrationDto.id;
                this.activateTab.emit({
                    id: this.id,
                    tab: 'consultancyEmployee',
                });
            },
            (error) => {
                this.isSaving = false;
                console.error('Error saving data:', error);
                Swal.fire(
                    'Error',
                    'Failed to save office signage and documents review.',
                    'error'
                );
            }
        );
    }
    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
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
            };
            this.service.downgradeConsultancy(payload).subscribe({
                next: (res: string) => {
                    console.log('Downgrade response:', res);
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
                    console.error('Error during downgrade:', err);
                    Swal.fire(
                        'Error',
                        'Something went wrong while forwarding.',
                        'error'
                    );
                    this.closeModal();
                },
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.formData.firmType.consultantNo,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Consultant',
                suspendDetails: this.selectedAction.remarks,
            };
            this.service.suspendFirm(payload).subscribe({
                next: (res) => {
                    console.log('Suspend response:', res);
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeModal();
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
                existingClassData: this.service.getClassification(
                    firmType,
                    firmId
                ),
            }).subscribe({
                next: ({ categoryData, existingClassData }) => {
                    const workCategories = categoryData.workCategory;
                    const workClassifications = categoryData.workClassification;

                    // Build a map: workCategory -> Set of existing classification IDs
                    const existingMap: { [cat: string]: Set<string> } = {};
                    for (const item of existingClassData) {
                        if (
                            item.workCategory &&
                            item.consultantWorkClassificationId
                        ) {
                            const key = String(item.workCategory).trim();
                            if (!existingMap[key]) {
                                existingMap[key] = new Set();
                            }
                            existingMap[key].add(
                                String(
                                    item.consultantWorkClassificationId
                                ).trim()
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

                            const matchedClassifications = workClassifications
                                .filter(
                                    (cls: any) =>
                                        cls.type === 'consultant' &&
                                        cls.workClassification.startsWith(
                                            prefix
                                        ) &&
                                        existingMap[categoryKey]?.has(
                                            String(cls.id).trim()
                                        )
                                )
                                .map((cls: any) => ({
                                    id: cls.id,
                                    name: cls.workClassification,
                                    checked: true,
                                    preChecked: true,
                                }));

                            return {
                                workCategory: category.workCategory,
                                workCategoryId: category.id,
                                classifications: matchedClassifications,
                            };
                        })
                        // Only include if there is at least one matched classification
                        .filter((item) => item.classifications.length > 0);
                },
                error: (err) => {
                    console.error('Error fetching downgrade data:', err);
                },
            });
        } else {
            this.downgradeList = [];
        }
    }
}
