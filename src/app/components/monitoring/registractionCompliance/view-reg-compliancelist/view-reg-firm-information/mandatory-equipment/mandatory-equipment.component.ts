import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../auth.service';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
    selector: 'app-mandatory-equipment',
    templateUrl: './mandatory-equipment.component.html',
    styleUrls: ['./mandatory-equipment.component.scss'],
})
export class MandatoryEquipmentComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string;data:string, tab: string }>();

    firmType: any;
    bctaNo: any;
    tableData: any = [];
    @Input() id: string = '';
    @Input() data: any = {};
    tData: any = ([] = []);
    applicationStatus: string = '';
    isSaving = false;
    WorkDetail: any;
    showErrorMessage: any;
    licenseStatus: any = {};
    @ViewChild('closeActionModals', { static: false })
    closeActionModals!: ElementRef;
    vehicleData: Object;
    showSuccessMessage: string;
    VehicleDetails: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
        private notification: NzNotificationService,
    ) {}

    ngOnInit() {
        this.data = this.data.data;
        this.WorkDetail = this.data;
        

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
        // Initialize formData with default values
        this.formData = {
            equipmentType: '',
            requiredEquipment: '',
            categoryOfService: '',
            equipmentDeployed: '',
            finalRemarks: '',
        };

        this.tData = {
            eqFulfilled: '',
            eqResubmitDeadline: '',
            eqRemarks: '',
        };

        // Set the id from input
        this.id = this.id;

        const WorkDetail = this.service.getData('BctaNo');

        // Accept null or undefined WorkDetail and handle gracefully
        const data = WorkDetail?.data ?? this.data ?? {}; // fallback to existing `this.data` or empty object
        this.formData.firmType = data.firmType || '';
        this.bctaNo = data.contractorNo || '';
        this.applicationStatus = data.applicationStatus || '';
        this.data = data; // update this.data safely
        this.WorkDetail = WorkDetail ?? {}; // ensure it's at least an object
        this.licenseStatus = this.data.licenseStatus || '';
        if (
            this.data.contractorNo && this.data.appNo &&
            this.data.applicationStatus !== 'Suspension Resubmission'
        ) {
            this.fetchDataBasedOnBctaNo();
        } else {
            this.fetchSuspendDataBasedOnBctaNo();
        }
    }

    // fetchDataBasedOnBctaNo() {
    //     this.service
    //         .getDatabasedOnBctaNos(this.data.contractorNo, this.data.appNo)
    //         .subscribe((res: any) => {
    //             this.tableData = res.vehicles;
    //         });
    // }

    fetchDataBasedOnBctaNo() {
  this.service.getDatabasedOnBctaNos(this.data.contractorNo, this.data.appNo).subscribe(
    (res1: any) => {
    this.tableData = res1.vehicles;
      // Prepare payload for second API call
      const payload = [
        {
          field: 'bctaNo',
          value: this.data.contractorNo,
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

      // Second API: fetchDetails
      this.service.fetchDetails(payload, 1, 10, 'combine_firm_dtls_view').subscribe(
        (res2: any) => {
          if (res2?.data?.length) {
            this.formData = { ...this.formData, ...res2.data[0] };
            // Map review/remark fields
            this.tData.fulfillsRequirement = this.formData.eqfulfilled;
            this.tData.finalRemarks = this.formData.eqremarks;

            
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
        this.bctaNo = this.data.contractorNo;
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
            (res: any) => {
                this.tableData = res.vehicles;
            },
            (error) => {
                console.error('Error fetching data:', error);
            }
        );
    }
    onClick() {}

    // For date validation (optional)
    minResubmitDate: string = this.getMinDate();

    getMinDate(): string {
        const today = new Date();
        today.setDate(today.getDate()); // you can adjust if needed
        return today.toISOString().split('T')[0];
    }

    onSubmit() {}
    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.data.contractorId;
            const firmType = 'contractor';
            console.log('firmId:', firmId);
            if (!firmId) {
                console.error(
                    'firmId is undefined. Check if the selected row has contractorId or consultantNo.'
                );
                return;
            }
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

     getVehicleData(data:any) {
      this.service.getVehicleDetails(this.data.vehicleNumber,'Heavy_Vehicle')
                .subscribe(
                (response: any) => {
                    const data = response.vehicleDetail;
                    this.VehicleDetails = data;
                 if ( response.vehicleDetail.vehicleRegistrationDetailsId ===0) {
                        this.showErrorMessage =
                            'No details found for this RegNo in BCTA';
                        console.warn('No details found for this RegNo in BCTA');
                    } else {
                        this.showErrorMessage = ''; // Clear error if successful
                    }
                },
                (error) => {
                    if (error.status === 404) {
                        this.showErrorMessage =
                            'No details found for this RegNo in BCTA';
                    } else {
                        this.showErrorMessage = 'An unexpected error occurred';
                    }
                    this.showSuccessMessage = ''; // Clear success message on error
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
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: '',
    };
    bsModal: any;
    today: string = new Date().toISOString().substring(0, 10);
    submitAction() {
        if (
            !this.selectedAction.actionType ||
            !this.selectedAction.actionDate ||
            !this.selectedAction.remarks
        ) {
            alert('All required fields must be filled.');
            return;
        }

        if (this.selectedAction.actionType === 'downgrade') {
            const downgradeEntries = this.downgradeList
                .filter((entry) => entry.newClass && entry.newClass !== '')
                .map((entry) => {
                    // Find the id for the selected newClass label
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
                requestedBy: this.authService.getUsername(),
                  applicationID: this.WorkDetail.data.appNo,
            };

            this.service.downgradeFirm(payload).subscribe({
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
                        this.closeActionModals.nativeElement.click();
                        this.router.navigate(['/monitoring/construction']);
                    } else {
                        Swal.fire(
                            'Error',
                            res || 'Something went wrong while forwarding.',
                            'error'
                        );
                        this.closeActionModals.nativeElement.click();
                    }
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'Something went wrong while forwarding.',
                        'error'
                    );
                    console.error(err);
                    this.closeActionModals.nativeElement.click();
                },
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.WorkDetail.data.contractorNo,
                // contractorId: this.selectedAction.target?.contractorId,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Contractor',
                suspendDetails: this.selectedAction.remarks,
                  applicationID: this.WorkDetail.data.appNo,
            };
            this.service.suspendFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeActionModals.nativeElement.click();
                    this.router.navigate(['/monitoring/construction']);
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to suspend contractor', 'error');
                },
            });
        }
    }
    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }
    reinstateModal: any = null;
    reinstateData: any = null;
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
                    this.closeModal();
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
                this.router.navigate(['/monitoring/construction']);
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
    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }
    tableId: any;
    saveAndNext() {
        this.isSaving = true;
        const table = this.service.setData(
            this.tableId,
            'tableId',
            'office-signage'
        );
        this.tableId = this.id;
        const eq = this.tableData.map((item: any) => ({
            isRegistered: item.equipmentType,
            vehicleType: item.vehicleType,
            registrationNo: item.registrationNo,
            ownerName: item.ownerName,
            ownerCid: item.ownerCid,
            equipmentType: item.equipmentName,
            mandatoryEquipmentFulfilled: this.formData.fulfillsRequirement,
            remarks: this.formData.finalRemarks,
        }));
        const payload = {
            registrationReview: {
                bctaNo: this.data.contractorNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.resubmitRemarks,
                // id:this.tableId
            },
            equipmentReviews: eq,
        };
        this.service.saveOfficeSignageAndDoc(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                console.log('res', res);
                // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
                this.activateTab.emit({ id: this.tableId,data:this.data, tab: 'monitoring' });
                
            },
            (error) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to save',
                    icon: 'error',
                });
            }
        );
    }

    notifyContractor() {
        this.isSaving = true;
        const table = this.service.setData(
            this.id,
            'tableId',
            'office-signage'
        );
        this.tableId = this.id;
        const eq = this.tableData.map((item: any) => ({
            isRegistered: item.equipmentType,
            vehicleType: item.vehicleType,
            registrationNo: item.registrationNo,
            ownerName: item.ownerName,
            ownerCid: item.ownerCid,
            equipmentType: item.equipmentName,
            remarks: this.formData.finalRemarks,
        }));

        const payload = {
            registrationReview: {
                bctaNo: this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.resubmitRemarks,
            },

            equipmentReviews: eq,
        };

        this.service.saveOfficeSignageAndDoc(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Requirements Not Met',
                    text: 'The contractor has been notified to resubmit the form',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
                // this.router.navigate(['monitoring/construction']);
                this.activateTab.emit({ id: this.tableId,data:this.data, tab: 'monitoring' });
            },
            error: (error) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to notify contractor',
                    icon: 'error',
                });
            },
        });
    }

    update() {
        this.isSaving = true;
        if (this.tData.fulfillsRequirement) {
            this.showErrorMessage = 'please select a fulfillment option';
        }
        const payload = {
            registrationReview: {
                bctaNo: this.data.contractorNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.resubmitRemarks,
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
}
