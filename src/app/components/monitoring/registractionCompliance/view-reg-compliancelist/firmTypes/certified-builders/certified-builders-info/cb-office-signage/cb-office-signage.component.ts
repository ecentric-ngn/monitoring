import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../../../../../auth.service';
declare var bootstrap: any;
@Component({
    selector: 'app-cb-office-signage',
    templateUrl: './cb-office-signage.component.html',
    styleUrls: ['./cb-office-signage.component.scss'],
})
export class CbOfficeSignageComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string; tab: string }>();
    bctaNo: any;
    data: any;
    applicationStatus: string = '';
    isSaving = false;
    showErrorMessage: any;
    reinstateData: any = null;
    reinstateModal: any = null;
    workClassificationList: any[] = [];
    downgradeList: any[] = [];
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        certifiedBuilderId: '',
        certifiedBuilderNo: '',
    };
    licenseStatus: any;
    today: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService
    ) {}

    ngOnInit() {
        const WorkDetail = this.service.getData('BctaNo');
        console.log('Retrieved WorkDetail:', WorkDetail);

        if (!WorkDetail || !WorkDetail.data) {
            console.error('WorkDetail or WorkDetail.data is undefined');
            return;
        }
        this.formData.firmType = WorkDetail.data;
        this.data = WorkDetail.data;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.licenseStatus = WorkDetail.data.licenseStatus;
        this.bctaNo = WorkDetail.data.certifiedBuilderNo;
        if (this.bctaNo && this.applicationStatus === 'Suspension Resubmission') {
            this.fetchSuspendDataBasedOnBctaNo();
        } else {
            this.fetchDataBasedOnBctaNo();
        }
    }

    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
            Object.assign(this.formData, res.complianceEntities[0]);
        });
    }

    fetchSuspendDataBasedOnBctaNo() {
    this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
      (res: any) => {
        Object.assign(this.formData, res.complianceEntities[0]);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
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
    onReviewChange() {
        if (this.formData.signboardReview === 'No') {
            this.formData.resubmitDate = '';
            this.formData.signboardRemarks = '';
        }
    }

    // Handle review change
    onFilingReviewChange() {
        if (this.formData.filingReview === 'No') {
            // Reset fields when switching to "No"
            this.formData.filingResubmitDate = null;
            this.formData.filingRemarks = '';
        }
    }

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

    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: 'certified-builder',
            licenseStatus: 'Active',
        };

        const approvePayload = {
            firmType: 'CertifiedBuilder',
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
                this.router.navigate(['/monitoring/certified']);
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

    isOfficeSignboardEnabled(): boolean {
        return [
            'Resubmitted OS',
            'Resubmitted OS and PFS',
            'Submitted',
        ].includes(this.applicationStatus);
    }

    isFilingSystemEnabled(): boolean {
        return [
            'Resubmitted PFS',
            'Resubmitted OS and PFS',
            'Submitted',
        ].includes(this.applicationStatus);
    }

    isOhsEnabled(): boolean {
        return this.applicationStatus === 'Submitted';
    }

    isFieldEditable(field: string): boolean {
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
            cbReviewDto: {
                bctaNo: this.data.certifiedBuilderNo || null,
                location: this.formData.officeLocation || null,
                locationReview: this.formData.reviewLocation || null,
                locationResubmitDeadline: this.formData.resubmitDate || null,
                locationRemarks: this.formData.resubmitRemarks || null,
                filingSystem: this.formData.properFillingPath || null,
                fsreview: this.formData.filingReview || null,
                fsremarks: this.formData.filingRemarks || null,
                fsresubmitDeadline: this.formData.filingResubmitDate || null,
            },
        };

        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (response: any) => {
                this.isSaving = false;
                try {
                    const parsedResponse =
                        typeof response === 'string'
                            ? JSON.parse(response)
                            : response;
                    this.id = parsedResponse.cbReviewDto?.id;

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
            cbReviewDto: {
                bctaNo: this.data.certifiedBuilderNo,
                firmName: this.data.nameOfFirm,
                contactNo: this.formData.mobileNo,
                email: this.formData.emailAddress,
                location: this.formData.officeLocation,
                locationReview: this.formData.reviewLocation,
                locationResubmitDeadline: this.formData.resubmitDate,
                locationRemarks: this.formData.resubmitRemarks,
                filingSystem: this.formData.properFillingPath,
                ohsHandbook: this.formData.ohsHandBook,
                ohsReview: this.formData.ohsReview,
                ohsRemarks: this.formData.generalRemarks,
                fsresubmitDeadline: this.formData.fsresubmitDeadline,
                fsreview: this.formData.filingReview,
                fsremarks: this.formData.fsRemarks,
                reviewDate: this.formData.reviewDate,
                hrFulfilled: '',
                hrResubmitDeadline: '',
                hrRemarks: '',
                eqFulfilled: '',
                eqResubmitDeadline: '',
                eqRemarks: '',
            },
        };
        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (response: any) => {
                this.isSaving = false;
                const parsedResponse =
                    typeof response === 'string'
                        ? JSON.parse(response)
                        : response;
                this.id = parsedResponse.cbReviewDto.id;
                // this.service.setData(this.id, 'tableId', 'yourRouteValueHere');
                console.log('this.id', this.id);
                //  this.id = res.registrationReview.id
                this.activateTab.emit({ id: this.id, tab: 'cbEmployee' });
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

        // this.router.navigate(['permanent-employee']);
    }
}
