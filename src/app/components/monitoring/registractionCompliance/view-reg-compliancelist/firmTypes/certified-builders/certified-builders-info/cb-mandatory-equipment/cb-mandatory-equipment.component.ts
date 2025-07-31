import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';
declare var bootstrap: any;

@Component({
    selector: 'app-cb-mandatory-equipment',
    templateUrl: './cb-mandatory-equipment.component.html',
    styleUrls: ['./cb-mandatory-equipment.component.scss'],
})
export class CbMandatoryEquipmentComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string;data:string, tab: string }>();
    firmType: any;
    bctaNo: any;
    tableData: any = [];
    tData: any;
    applicationStatus: string = '';
    isSaving = false;
    workClassificationList: any[] = [];
    @Input() id: string = '';
    licenseStatus: any;
    downgradeList: any[] = [];
    today: any;
    showErrorMessage: any;
    showSuccessMessage: string;
    VehicleDetails: any;
@Input() data: any
    WorkDetail: any;
    appNo: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.date();
        this.data= this.data;
        this.applicationStatus = this.data.applicationStatus;
        // Initialize formData with default values
        this.formData = {
            vehicleType: '',
            requiredEquipment: '',
            finalRemarks: '',
            fulfillsRequirement: '',
            resubmitRemarks: '',
            resubmitDate: '',
        };

        this.tData = {
            eqFulfilled: '',
            eqResubmitDeadline: '',
            eqRemarks: '',
        };

        this.id = this.id;
        const WorkDetail = this.service.getData('BctaNo');
         const data = WorkDetail?.data ?? this.data ?? {}; // fallback to existing `this.data` or empty object
        this.formData.firmType = data.firmType || '';
        this.bctaNo = data.contractorNo || '';
        this.appNo = data.appNo || '';
        this.applicationStatus = data.applicationStatus || '';
        this.data = data; // update this.data safely
        this.WorkDetail = WorkDetail ?? {}; // ensure it's at least an object
        this.licenseStatus = this.data.licenseStatus || '';
        this.service.setBctaNo(this.bctaNo);

        if (
            this.bctaNo || this.data.certifiedBuilderNo &&
            this.applicationStatus === 'Suspension Resubmission'
        ) {
            this.fetchSuspendDataBasedOnBctaNo();
        } else {
            this.fetchDataBasedOnBctaNo();
        }
    }

    fetchSuspendDataBasedOnBctaNo() {
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo || this.data.certifiedBuilderNo).subscribe(
            (res: any) => {
                this.tableData = res.vehicles;
            },
            (error) => {
                // Log error if fetching data fails
                console.error('Error fetching data:', error);
            }
        );
    }
    date() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
    }
    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNos(this.bctaNo || this.data.certifiedBuilderNo,this.appNo).subscribe((res: any) => {
            this.tableData = res.vehicles;
            console.log('CB equipments', this.formData);
        });
    }

    // For date validation (optional)
    minResubmitDate: string = this.getMinDate();

    getMinDate(): string {
        const today = new Date();
        today.setDate(today.getDate()); // you can adjust if needed
        return today.toISOString().split('T')[0];
    }

    onSubmit() {}

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
            equipmentDescription: null,
            requiredEquipment: null,

            //  "isRegistered": item.equipmentType,
            // "vehicleType": item.vehicleType,
            // "registrationNo": item.registrationNo,
            // "ownerName": item.ownerName,
            // "ownerCid": item.ownerCid,
            // "equipmentType": item.equipmentName,
            // "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement,
        }));

        const payload = {
            cbReviewDto: {
                bctaNo:this.data.certifiedBuilderNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            cbEquipmentReviewDto: eq,
        };
        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                this.activateTab.emit({
                    id: this.tableId,
                    data: this.data,
                    tab: 'cbMonitoring',
                });
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
            equipmentDescription: null,
            requiredEquipment: null,
        }));

        const payload = {
            cbReviewDto: {
                bctaNo: this.data.certifiedBuilderNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            cbEquipmentReviewDto: eq,
        };

        this.service.saveOfficeSignageAndDocCB(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Requirements Not Met',
                    text: 'The firm has been notified to resubmit the form',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
                this.activateTab.emit({
                    id: this.tableId,
                    data:this.data,
                    tab: 'cbMonitoring',
                });
            },
            error: (error) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to notify firm',
                    icon: 'error',
                });
            },
        });
    }

    // update() {
    //     this.isSaving = true;
    //     const payload = {
    //         cbReviewDto: {
    //             bctaNo: this.bctaNo,
    //             eqFulfilled: this.tData.fulfillsRequirement,
    //             eqResubmitDeadline: this.tData.resubmitDate,
    //             eqRemarks: this.tData.remarks,
    //         },
    //     };

    //     this.service.saveOfficeSignageAndDocCB(payload).subscribe({
    //         next: (res: any) => {
    //             this.isSaving = false;
    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Updated successfully!',
    //                 showConfirmButton: false,
    //                 timer: 2000,
    //             }).then(() => {
    //                 this.router.navigate(['monitoring/certified']);
    //             });
    //         },
    //         error: (err) => {
    //             this.isSaving = false;
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Update failed!',
    //                 text:
    //                     err?.error?.message ||
    //                     'Something went wrong. Please try again.',
    //                 confirmButtonText: 'OK',
    //             });
    //         },
    //     });
    // }

      update() {
        this.isSaving = true;
        const table = this.service.setData(
            this.tableId,
            'tableId',
            'office-signage'
        );
        this.tableId = this.id;

        const eq = this.tableData.map((item: any) => ({
            equipmentDescription: null,
            requiredEquipment: null,

            //  "isRegistered": item.equipmentType,
            // "vehicleType": item.vehicleType,
            // "registrationNo": item.registrationNo,
            // "ownerName": item.ownerName,
            // "ownerCid": item.ownerCid,
            // "equipmentType": item.equipmentName,
            // "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement,
        }));

        const payload = {
            cbReviewDto: {
                bctaNo:this.data.certifiedBuilderNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            cbEquipmentReviewDto: eq,
        };
        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                // this.activateTab.emit({
                //     id: this.tableId,
                //     data: this.data,
                //     tab: 'cbMonitoring',
                // });
                 this.router.navigate(['monitoring/certified']);
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
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        certifiedBuilderId: '',
        certifiedBuilderNo: '',
    };
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
            // Call cancel API
            this.service.cancelFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeModal();
                    this.router.navigate(['/monitoring/certified']);
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
                applicationID: this.formData.firmType.appNo,
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
                    this.router.navigate(['/monitoring/certified']);
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

       getVehicleData(data:any) {
      this.service.getVehicleDetails(data.vehicleNumber,'Light_Vehicle')
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
}
