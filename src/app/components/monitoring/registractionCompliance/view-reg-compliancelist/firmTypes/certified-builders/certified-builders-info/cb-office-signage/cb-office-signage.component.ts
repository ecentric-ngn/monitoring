import { Component, ElementRef, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../../../../../auth.service';
declare var bootstrap: any;
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
    selector: 'app-cb-office-signage',
    templateUrl: './cb-office-signage.component.html',
    styleUrls: ['./cb-office-signage.component.scss'],
})
export class CbOfficeSignageComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{
        id: string;
        data: string;
        tab: string;
    }>();
    bctaNo: any;
    data: any;
    applicationStatus: string = '';
    isSaving = false;
    showErrorMessage: any;
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
@ViewChild('closeModal') closeModalButton: ElementRef<HTMLButtonElement> | undefined;
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        const WorkDetail = this.service.getData('BctaNo');
        if (!WorkDetail || !WorkDetail.data) {
            return;
        }
        this.date();
        this.formData.firmType = WorkDetail.data;
        this.data = WorkDetail.data;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.licenseStatus = WorkDetail.data.licenseStatus;
        this.bctaNo = WorkDetail.data.certifiedBuilderNo;
        if (
            this.bctaNo &&
            this.applicationStatus === 'Suspension Resubmission'
        ) {
            this.fetchSuspendDataBasedOnBctaNo();
        } else {
            this.fetchDataBasedOnBctaNo();
        }
    }

    date() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction = this.selectedAction || {};
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
    }

fetchDataBasedOnBctaNo() {
  this.service.getDatabasedOnBctaNos(this.bctaNo, this.data.appNo).subscribe(
    (res1: any) => {
      if (res1?.complianceEntities?.length) {
        Object.assign(this.formData, res1.complianceEntities[0]);
      }
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
            this.formData = {
              ...this.formData,
              ...res2.data[0]
            };
            // Map specific fields to user-friendly form keys
            this.formData.reviewLocation = this.formData.locationreview || '';
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

    rejectApplication() {
        this.service
            .rejectApplication(
                'certified-Builder',
                this.data.certifiedBuilderNo
            )
            .subscribe(
                (response: any) => {
                    console.log('Application rejected successfully:', response);
                    this.createNotification(
                        'success',
                        'Success',
                        'Application rejected successfully'
                    );
                    this.closeModal();
                    this.router.navigate(['/monitoring/certified']);
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

    fetchSuspendDataBasedOnBctaNo() {
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo,).subscribe(
            (res: any) => {
                Object.assign(this.formData, res.complianceEntities[0]);
            const payload = [
        {
          field: 'bctano',
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
            this.formData = {
              ...this.formData,
              ...res2.data[0]
            };

            // Map specific fields to user-friendly form keys
            this.formData.signboardReview = this.formData.os_review || '';
            this.formData.filingReview = this.formData.fsreview || '';
            this.formData.ohsReview = this.formData.ohsreview || '';
            this.formData.generalRemarks = this.formData.ohsRemarks || '';
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
                applicationID: this.formData.firmType.appNo,
            };
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
                applicationNO: this.formData.firmType.appNo,
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

  if (this.closeModalButton) {
    this.closeModalButton.nativeElement.click(); // trigger the close button
  }

  this.router.navigate(['/monitoring/certified']);
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

    isFieldEditable;
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
                applicationNumber: this.data.appNo,
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
                    this.router.navigate(['/monitoring/certified']);
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
                applicationNumber: this.data.appNo
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
                this.activateTab.emit({
                    id: this.id,
                    data: this.data,
                    tab: 'cbEmployee',
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

        // this.router.navigate(['permanent-employee']);
    }
}
