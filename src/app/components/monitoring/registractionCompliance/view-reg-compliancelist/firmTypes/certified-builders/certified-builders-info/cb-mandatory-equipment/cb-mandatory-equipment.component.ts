import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
declare var bootstrap: any;

@Component({
    selector: 'app-cb-mandatory-equipment',
    templateUrl: './cb-mandatory-equipment.component.html',
    styleUrls: ['./cb-mandatory-equipment.component.scss'],
})
export class CbMandatoryEquipmentComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string; tab: string }>();
    firmType: any;
    bctaNo: any;
    tableData: any;
    tData: any;
    applicationStatus: string = '';
    isSaving = false;
    workClassificationList: any[] = [];
    @Input() id: string = '';
    licenseStatus: any;
    downgradeList: any[] = [];
    today: any;
    showErrorMessage: any;

    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService
    ) {}

    ngOnInit() {
        console.log('id', this.id);
        this.date();
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
        this.formData.firmType = WorkDetail.data;
        this.bctaNo = WorkDetail.data.certifiedBuilderNo;
        this.licenseStatus = WorkDetail.data.licenseStatus;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.service.setBctaNo(this.bctaNo);

        if (this.bctaNo && this.applicationStatus === 'Suspension Resubmission') {
            this.fetchSuspendDataBasedOnBctaNo();
        } else {
            this.fetchDataBasedOnBctaNo();
        }
    }

    fetchSuspendDataBasedOnBctaNo() {
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
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
        this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
            this.tableData = res.vehicles;
            console.log('CB equipments', this.formData);
        });
    }

    // For date validation (optional)
    minResubmitDate: string = this.getMinDate();
rejectApplication () {}
    getMinDate(): string {
        const today = new Date();
        today.setDate(today.getDate()); // you can adjust if needed
        return today.toISOString().split('T')[0];
    }

    onSubmit() {}

    tableId: any;
    openActionModal(row: any) {
        this.selectedAction = {
            actionType: '',
            actionDate: this.today,
            remarks: '',
            newClassification: '',
            target: row, // attach row data if needed
        };
        console.log('Row passed to modal:', row);

        const modalEl = document.getElementById('actionModal');
        this.bsModal = new bootstrap.Modal(modalEl, {
            backdrop: 'static', // Optional: prevents closing on outside click
            keyboard: false, // Optional: disables ESC key closing
        });
        this.bsModal.show();
    }
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
                bctaNo: this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            cbEquipmentReviewDto: eq,
        };
        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                console.log('res', res);
                // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
                console.log('Emitting cbMonitoring', this.tableId);

                this.activateTab.emit({
                    id: this.tableId,
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
                bctaNo: this.bctaNo,
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

    update() {
        this.isSaving = true;
        const payload = {
            cbReviewDto: {
                bctaNo: this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
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
            };
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

    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
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
}
