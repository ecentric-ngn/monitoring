import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
declare var bootstrap: any;
@Component({
    selector: 'app-consultancy-mandatory-equipment',
    templateUrl: './consultancy-mandatory-equipment.component.html',
    styleUrls: ['./consultancy-mandatory-equipment.component.scss'],
})
export class ConsultancyMandatoryEquipmentComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string; tab: string }>();

    firmType: any;
    bctaNo: any;
    tableData: any[] = [];
    @Input() id: string = '';
    data: any;
    tData: any;
    applicationStatus: string = '';
    isSaving = false;
    reinstateModal: any = null;
    reinstateData: any = null;
    bsModal: any;
    downgradeList: any[] = [];
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: '',
    };

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
        private authService: AuthServiceService
    ) {}
    WorkDetail: any;
    ngOnInit() {
        console.log('id', this.id);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
        // Initialize formData with default values
        this.formData = {
            equipmentType: '',
            requiredEquipment: '',
            categoryOfService: '',
            equipmentDeployed: '',
            remarks: '',
            fulfillsRequirement: '',
            lastDateToResubmit: '',
            remarksIfNo: '',
        };
        // Set the id from input
        this.id = this.id;
        const WorkDetail = this.service.getData('BctaNo');
        this.WorkDetail = WorkDetail.data;

        if (!WorkDetail || !WorkDetail.data) {
            console.error('WorkDetail or WorkDetail.data is undefined');
            return;
        }
        this.formData.firmType = WorkDetail.data;
        this.bctaNo = WorkDetail.data.consultantNo;
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.data = WorkDetail.data;
        console.log('WorkDetail', WorkDetail);
        console.log('bctaNo', this.bctaNo);

        this.tData = {
            eqFulfilled: '',
            eqResubmitDeadline: '',
            eqRemarks: '',
        };

        if (this.bctaNo && this.applicationStatus === 'Suspension Resubmission') {
         this.fetchSuspendDataBasedOnBctaNo();
        } else {
        this.fetchDataBasedOnBctaNo();
        }
        this.service.setBctaNo(this.bctaNo);
    }
    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
            this.tableData = res.vehicles;
            console.log('consultant equipments', this.formData);
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
            equipmentType: item.equipmentName,
            requiredEquipment: item.vehicleType,
            categoryOfService: null,
            equipmentDeployed: null,
        }));

        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            consultantEquipmentDto: eq,
        };
        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                console.log('res', res);
                // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
                console.log('Emitting consultancyMonitoring', this.tableId);

                this.activateTab.emit({
                    id: this.tableId,
                    tab: 'consultancyMonitoring',
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
            equipmentType: item.equipmentName,
            requiredEquipment: item.vehicleType,
            categoryOfService: null,
            equipmentDeployed: null,
        }));

        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            consultantEquipmentDto: eq,
        };

        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Requirements Not Met',
                    text: 'The firm has been notified to resubmit the form',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
                // this.router.navigate(['monitoring/consultancy']);
                this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
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
            consultantRegistrationDto: {
                bctaNo: this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
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

    onClick() {}
    getReinstateApplication(bctaNo: string) {
        if (!bctaNo) {
            console.error('Firm ID is missing.');
            return;
        }

        this.service.getReinstateApplication(bctaNo).subscribe({
            next: (data) => {
                this.reinstateData = data[0];
                setTimeout(() => {
                    const modalEl = document.getElementById('reinstateModal');
                    this.reinstateModal = new bootstrap.Modal(modalEl, {
                        backdrop: 'static',
                        keyboard: false,
                    });
                    this.reinstateModal.show();
                }, 0);
            },
            error: (err) => {
                console.error('Error fetching reinstate data:', err);
                this.reinstateData = null;
            },
        });
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

    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }
}
