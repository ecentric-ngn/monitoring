import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
declare var bootstrap: any;

@Component({
    selector: 'app-specialized-firms',
    templateUrl: './specialized-firms.component.html',
    styleUrls: ['./specialized-firms.component.scss']
})
export class SpecializedFirmsComponent {
    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: any = [];

    bsModal: any;

    selectedIds: number[] = [];
    private isFetching = false;
    private autoRefreshInterval: any;

    firmType: string = '';

    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        specialFirmId: '',
        specializedFirmNo: ''
    };

    downgradeList: any[] = [];
    workClassificationList: any[] = [];

    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router
    ) { }

    searchTerm: string = '';
    statusFilter: string = 'All';
    ngOnInit() {
        this.fetchComplianceDetails();
    }

    onChangeFirmType(firmType: string) {
        this.firmType = firmType;

        switch (firmType) {
            case 'constructionFirm':
                this.router.navigate(['/monitoring/construction']);
                break;
            case 'consultancyFirm':
                this.router.navigate(['/monitoring/consultancy']);
                break;
            // case 'specializedFirm':
            //     this.router.navigate(['/monitoring/specialized']);
            //     break;
            case 'certifiedBuilders':
                this.router.navigate(['/monitoring/certified']);
                break;
            default:
                break;
        }
    }

    fetchComplianceDetails() {
        this.service.fetchComplianceDataSpecializedFirms().subscribe(
            (response: any) => {
                this.tableData = response;
                console.log('Fetched Data', this.tableData);
            },
            (error) => {
                console.error('Error fetching compliance data:', error);
            }
        )
    }

    Searchfilter() { }

    setLimitValue(value: any) { }


    // In your component class
    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (data.applicationStatus === 'Submitted' || data.applicationStatus === 'Resubmitted PFS'
            || data.applicationStatus === 'Resubmitted OS and PFS' || data.applicationStatus === 'Resubmitted OS'
            || data.applicationStatus === 'Resubmitted HR' || data.applicationStatus === 'Resubmitted EQ') {
            const workId = data.specializedFirmNo;
            this.prepareAndNavigate(data, workId);
        }
    }

    private prepareAndNavigate(data: any, workId: string) {
        const workDetail = {
            data: data,
            firmType: this.firmType
        };

        console.log('Navigation payload:', workDetail);

        this.service.setData(
            workDetail,
            'BctaNo',
            'monitoring/sf-info'
        );
    }

    onCheckboxChange(event: Event, id: string) {
        const isChecked = (event.target as HTMLInputElement).checked;
        const numericId = Number(id); // convert to number

        if (isChecked) {
            if (!this.selectedIds.includes(numericId)) {
                this.selectedIds.push(numericId);
            }
        } else {
            this.selectedIds = this.selectedIds.filter(item => item !== numericId);
        }

        console.log('Selected IDs (as numbers):', this.selectedIds);
    }

    forwardToRC() {
        if (this.selectedIds.length === 0) {
            Swal.fire('Warning', 'No items selected', 'warning');
            return;
        }

        const payload = this.selectedIds

        this.service.forwardToReviewCommitee(payload).subscribe(
            (res) => {
                console.log('Successfully sent selected IDs:', res);
                Swal.fire('Success', 'Selected contractors submitted successfully', 'success');
            },
            (error) => {
                console.error('Error sending selected IDs:', error);
                Swal.fire('Error', 'Failed to submit selected contractors', 'error');
            }
        );
    }

    openActionModal(row: any) {
        this.selectedAction = {
            actionType: '',
            actionDate: '',
            remarks: '',
            newClassification: '',
            target: row // attach row data if needed
        };
        console.log('Row passed to modal:', row);

        const modalEl = document.getElementById('actionModal');
        this.bsModal = new bootstrap.Modal(modalEl, {
            backdrop: 'static', // Optional: prevents closing on outside click
            keyboard: false     // Optional: disables ESC key closing
        });
        this.bsModal.show();
    }

    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.selectedAction.target?.specializedFirmNo;
            const firmType = 'specializedfirm';

            console.log("firmId:", firmId);
            if (!firmId) {
                console.error('firmId is undefined. Check if the selected row has contractorId or consultantNo.');
                return;
            }

            forkJoin({
                categoryData: this.service.getWorkCategory('specializedfirm'),
                existingClassData: this.service.getClassification(firmType, firmId)
            }).subscribe({
                next: ({ categoryData, existingClassData }) => {
                    const workCategories = categoryData.workCategory;
                    this.workClassificationList = categoryData.workClassification;

                    const classificationMap = existingClassData.reduce((acc: any, item: any) => {
                        acc[item.workCategory] = item.existingWorkClassification;
                        return acc;
                    }, {});

                    this.downgradeList = workCategories.map((category: any) => ({
                        workCategory: category.workCategory,
                        workCategoryId: category.id,
                        existingClass: classificationMap[category.workCategory] || 'Unknown',
                        newClass: ''
                    }));
                },
                error: (err) => {
                    console.error('Error fetching downgrade data:', err);
                }
            });
        } else {
            this.downgradeList = [];
        }
    }


    getClassOptions(existingClass: string) {
        const all = [
            { label: 'L - Large', value: 'L-Large' },
            { label: 'M - Medium', value: 'M-Medium' },
            { label: 'S - Small', value: 'S-Small' }
        ];

        if (existingClass === 'L-Large') {
            return all.filter(opt => opt.value !== 'L-Large');
        } else if (existingClass === 'M-Medium') {
            return all.filter(opt => opt.value === 'S-Small');
        } else if (existingClass === 'S-Small') {
            return []; // No downgrade options
        }
        return [];
    }

    trackByWorkCategory(index: number, item: any) {
        return item.workCategory;
    }

    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

    submitAction() {
        if (!this.selectedAction.actionType || !this.selectedAction.actionDate || !this.selectedAction.remarks) {
            alert("All required fields must be filled.");
            return;
        }

        if (this.selectedAction.actionType === 'downgrade') {
            const downgradeEntries = this.downgradeList
                .filter(entry => entry.newClass && entry.newClass !== '')
                .map(entry => {
                    // Find the id for the selected newClass label
                    const classification = this.workClassificationList.find(
                        (c: any) => c.workClassification === entry.newClass
                    );
                    return {
                        workCategoryId: entry.workCategoryId,
                        newWorkClassificationId: classification ? classification.id : null
                    };
                });

            if (downgradeEntries.length === 0) {
                Swal.fire('Error', 'Please select at least one new class to downgrade.', 'error');
                return;
            }

            const payload = {
                firmId: this.selectedAction.target?.specialFirmId,
                firmType: "specialized-firm",
                downgradeEntries,
                requestedBy: "Bilana Ghalley"
            };

            this.service.downgradeFirm(payload).subscribe({
                next: (res: string) => {
                    if (res && res.toLowerCase().includes('downgrade request submitted')) {
                        Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                        this.closeModal();
                    } else {
                        Swal.fire('Error', res || 'Something went wrong while forwarding.', 'error');
                        this.closeModal();
                    }
                },
                error: (err) => {
                    Swal.fire('Error', 'Something went wrong while forwarding.', 'error');
                    console.error(err);
                    this.closeModal();
                }
            });

        } else if (this.selectedAction.actionType === 'cancel') {
            const payload = {
                firmNo: this.selectedAction.target?.specializedFirmNo,
                cancelledBy: "Bilana Ghalley",
                cancelledOn: new Date(this.selectedAction.actionDate).toISOString(),
                firmType: "specialized-firm",
                reason: this.selectedAction.remarks,
            };
            // Call cancel API
            this.service.cancelFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                    this.closeModal();
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to cancel firm', 'error');
                }
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.selectedAction.target?.specializedFirmNo,
                suspendedBy: "Bilana Ghalley",
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: "specialized-firm",
                suspendDetails: this.selectedAction.remarks,
            };
            // Call suspend API
            this.service.suspendFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                    this.closeModal();
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to suspend firm', 'error');
                }
            });
        }
    }

    reinstate(row: any) {
        const payload = {
            firmNo: row.specializedFirmNo,
            firmType: "specializedfirm",
            licenseStatus: "Active"
        };
        this.service.reinstateLicense(payload).subscribe({
            next: (res: string) => {
                if (res && res.toLowerCase().includes('license status updated to active')) {
                    Swal.fire('Success', 'License Reinstated Successfully', 'success');
                    this.closeModal(); // Optional: close modal if needed
                } else {
                    Swal.fire('Warning', 'Unexpected response from server.', 'warning');
                }
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                Swal.fire('Error', 'Something went wrong while reinstating the license.', 'error');
                this.closeModal(); // Optional: close modal even on error
            }
        });
    }

    toggleEditNotification(id: number) {
        this.tableData = this.tableData.map(row =>
            row.id === id ? { ...row, isEditing: true } : row
        );
    }

    cancelEdit(id: number) {
        this.tableData = this.tableData.map(row =>
            row.id === id ? { ...row, isEditing: false } : row
        );
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Verified':
                return 'status-verified';
            case 'In Process':
                return 'status-in-process';
            case 'Not Submitted':
                return 'status-not-submitted';
            default:
                return 'status-default';
        }
    }

    getLicenseStatusClass(status: string): string {
        switch (status) {
            case 'Active':
                return 'license-active';
            case 'Suspended':
                return 'license-suspended';
            default:
                return 'license-default';
        }
    }
}
