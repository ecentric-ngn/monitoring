import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
declare var bootstrap: any;
import { AuthServiceService } from '../../../../../../auth.service';

@Component({
    selector: 'app-certified-builders',
    templateUrl: './certified-builders.component.html',
    styleUrls: ['./certified-builders.component.scss']
})
export class CertifiedBuildersComponent {

    filteredData: any[] = [];
    displayedData: any[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;

    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: any = [];
    bsModal: any;

    selectedIds: number[] = [];

    firmType: string = '';

    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        certifiedBuilderId: '',
        certifiedBuilderNo: ''
    };

    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    loading: boolean = false;
    certifiedBuildersModal: any = null;
    reinstateData: any = null;
    reinstateModal: any = null;
    username: string = '';

    Dzongkhags = ['Shrek', 'Thimphu', 'Paro', 'Wangdue', 'Punakha', 'Trashigang',
        'Trashiyangtse', 'Bumthang', 'Gasa', 'Haa', 'Lhuentse',
        'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Samtse', 'Sarpang',
        'Zhemgang', 'Chhukha', 'Dagana', 'Tsirang', 'Trongsa'];
    
    today: string = new Date().toISOString().substring(0, 10);
    totalPages: number;
    total_records: number;
    totalCount: any;

    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router,
        private authService: AuthServiceService
    ) { }

    searchTerm: string = '';
    statusFilter: string = 'All';

    ngOnInit() {
        this.fetchComplianceDetails();
        this.username = this.authService.getUsername() || 'NA';
    }

    sendMassMail() {
        this.loading = true;
        this.formData.deadline = this.calculatedDeadline;
        this.service.sendMassEmail(this.formData).subscribe({
            next: (response) => {
                this.loading = false;
                this.handleSuccess(response);
                this.resetForm();
                this.closeFirmModal();
                this.showSuccessNotification();
            },
            error: (error) => this.handleError(error)
        });
    }

    closeFirmModal() {
        if (this.certifiedBuildersModal) {
            this.certifiedBuildersModal.hide();
        } else {
            const modalEl = document.getElementById('certifiedBuildersModal');
            if (modalEl) {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(el => el.remove());
            }
        }
    }

    private resetForm() {
            this.dateData = {};
            this.formData = {};
        }
    
        private showSuccessNotification() {
            Swal.fire({
                title: 'Success!',
                text: 'The mass email has been sent successfully to the designated recipients.',
                icon: 'success',
                confirmButtonText: 'OK',
                willClose: () => {
                    // Cleanup before closing
                    document.body.classList.remove('swal2-shown');
                    document.body.style.overflow = '';
                }
            }).then(() => {
                // Force cleanup
                const backdrops = document.querySelectorAll('.swal2-backdrop, .modal-backdrop');
                backdrops.forEach(el => el.remove());
                document.body.classList.remove('modal-open', 'swal2-no-backdrop');
                document.body.style.paddingRight = '';
            });
        }
        private handleSuccess(response: any) {
            console.log('Email sent successfully:', response);
        }
    
        private handleError(error: any) {
            console.error('Error sending email:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to send mass email. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    
        dateData: any = {};
    
        get calculatedDeadline() {
            if (this.dateData.date) {
                const d = new Date(this.dateData.date);
                d.setDate(d.getDate() + 7); // Example: 7 days deadline
                return d.toISOString().substring(0, 10);
            }
            return '';
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
            case 'specializedFirm':
                this.router.navigate(['/monitoring/specialized']);
                break;
            //   case 'certifiedBuilders':
            //       this.router.navigate(['/monitoring/certified']);
            //       break;
            default:
                break;
        }
    }

pageNo: number = 1;
    pageSize: number = 10;
     fetchComplianceDetails(searchQuery?: string) {
    const payload: any[] = [];

    // Add search condition if searchQuery is provided
    if (searchQuery) {
        payload.push(
            {
            field: 'specializedFirmNo',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND'
        },
         {
            field: 'applicationStatus',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND'
        },
         {
            field: 'applicationStatus',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND'
        }
    );
    }

    this.service
        .fetchDetails(
            payload,
            this.pageNo,
            this.pageSize,
            'emailed_certified_builder_view'
        )
        .subscribe(
            (response: any) => {
                this.tableData = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
                this.totalCount = response.totalCount;
            },
            (error) => {
                console.error('Error fetching contractor details:', error);
            }
        );
}

    setLimitValue(value: any) {
        this.pageSize = parseInt(value);
        this.pageNo = 1;
        this.fetchComplianceDetails();
    }

    goToPreviousPage(): void {
        if (this.pageNo > 1) {
            this.pageNo--;
            this.fetchComplianceDetails();
        }
    }
    goToNextPage() {
        const totalPages = Math.ceil(this.totalCount / this.pageSize);
        if (this.pageNo < totalPages) {
            this.pageNo++;
            this.fetchComplianceDetails();
        }
    }
    goToPage(pageSize: number) {
        if (pageSize >= 1 && pageSize <= this.totalPages) {
            this.pageNo = pageSize;
            this.fetchComplianceDetails();
        }
    }
    // Method to calculate starting and ending entry numbers
    calculateOffset(): string {
        const currentPage = (this.pageNo - 1) * this.pageSize + 1;
        const limit_value = Math.min(
            this.pageNo * this.pageSize,
            this.total_records
        );
        return `Showing ${currentPage} to ${limit_value} of ${this.total_records} entries`;
    }
    generatePageArray(): number[] {
        const pageArray: number[] = [];

        // If total_pages is less than or equal to 4, display all pages
        if (this.totalPages <= 4) {
            for (let i = 1; i <= this.totalPages; i++) {
                pageArray.push(i);
            }
        } else {
            // Display the first two and last two pages
            if (this.pageNo <= 2) {
                for (let i = 1; i <= 2; i++) {
                    pageArray.push(i);
                }
                pageArray.push(-1); // Placeholder for ellipsis
                for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
                    pageArray.push(i);
                }
            } else if (this.pageNo >= this.totalPages - 1) {
                for (let i = 1; i <= 2; i++) {
                    pageArray.push(i);
                }
                pageArray.push(-1); // Placeholder for ellipsis
                for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
                    pageArray.push(i);
                }
            } else {
                // Display the current page, previous and next page, and the first and last pages
                if (this.pageNo === 3) {
                    for (let i = 1; i <= this.pageNo + 1; i++) {
                        pageArray.push(i);
                    }
                    pageArray.push(-1); // Placeholder for ellipsis
                    for (
                        let i = this.totalPages - 1;
                        i <= this.totalPages;
                        i++
                    ) {
                        pageArray.push(i);
                    }
                } else {
                    for (let i = 1; i <= 2; i++) {
                        pageArray.push(i);
                    }
                    pageArray.push(-1); // Placeholder for ellipsis
                    for (let i = this.pageNo - 1; i <= this.pageNo + 1; i++) {
                        pageArray.push(i);
                    }
                    pageArray.push(-1); // Placeholder for ellipsis
                    for (
                        let i = this.totalPages - 1;
                        i <= this.totalPages;
                        i++
                    ) {
                        pageArray.push(i);
                    }
                }
            }
        }
        return pageArray;
    }

     Searchfilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.fetchComplianceDetails(this.searchQuery);
        } else {
            this.fetchComplianceDetails(this.searchQuery);
        }
    }

    navigate(data: any) {
        if (data.applicationStatus === 'Submitted'
            || data.applicationStatus === 'Resubmitted OS and PFS'
            || data.applicationStatus === 'Resubmitted HR and EQ' || data.applicationStatus === 'Suspension Resubmission') {
            const workId = data.certifiedBuilderNo;
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
            'monitoring/cb-info'
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
        this.service.forwardToReviewCommiteeCB(payload).subscribe(
            (res) => {
                console.log('Successfully sent selected IDs:', res);
                Swal.fire('Success', 'Selected firms submitted successfully', 'success');
            },
            (error) => {
                console.error('Error sending selected IDs:', error);
                Swal.fire('Error', 'Failed to submit selected firms', 'error');
            }
        );
    }

    openActionModal(row: any) {
        this.selectedAction = {
            actionType: '',
            actionDate: this.today,
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
            const firmId = this.selectedAction.target?.certifiedBuilderId;
            const firmType = 'certified-builder';

            console.log("firmId:", firmId);
            if (!firmId) {
                console.error('firmId is undefined. Check if the selected row has contractorId or consultantNo.');
                return;
            }

            forkJoin({
                categoryData: this.service.getWorkCategory('certified builder'),
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

        if (this.selectedAction.actionType === 'cancel') {
            const payload = {
                firmNo: this.selectedAction.target?.certifiedBuilderNo,
                cancelledBy: this.authService.getUsername(),
                cancelledOn: new Date(this.selectedAction.actionDate).toISOString(),
                firmType: "certified-builder",
                reason: this.selectedAction.remarks,
            };
            // Call cancel API
            this.service.cancelFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                    this.closeModal();
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to cancel certified-builder', 'error');
                }
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.selectedAction.target?.certifiedBuilderNo,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: "certified-builder",
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

    getReinstateApplication(firmId: string) {
        if (!firmId) {
            console.error('Firm ID is missing.');
            return;
        }

        this.service.getReinstateApplication(firmId).subscribe({
            next: (data) => {
                this.reinstateData = data[0];

                setTimeout(() => {
                    const modalEl = document.getElementById('reinstateModal');
                    this.reinstateModal = new bootstrap.Modal(modalEl, {
                        backdrop: 'static',
                        keyboard: false
                    });
                    this.reinstateModal.show();
                }, 0);
            },
            error: (err) => {
                console.error('Error fetching reinstate data:', err);
                this.reinstateData = null;
            }
        });
    }

    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }

    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: "certified-builder",
            licenseStatus: "Active"
        };

        const approvePayload = {
            firmType: "CertifiedBuilder",
            cdbNos: row
        };

        forkJoin({
            reinstate: this.service.reinstateLicense(payload),
            approve: this.service.approveReinstatement(approvePayload)
        }).subscribe({
            next: ({ reinstate, approve }) => {
                if (reinstate && reinstate.toLowerCase().includes('license status updated to active')) {
                    Swal.fire('Success', 'License Reinstated and Approved Successfully', 'success');
                    this.closeModal();
                } else {
                    Swal.fire('Warning', 'Unexpected response from server.', 'warning');
                }
                this.router.navigate(['/monitoring/certified']);
                this.closeModal();
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                this.closeModal();
                Swal.fire('Success', 'License Reinstated and Approved Successfully', 'success');
            }
        });
    }

}
