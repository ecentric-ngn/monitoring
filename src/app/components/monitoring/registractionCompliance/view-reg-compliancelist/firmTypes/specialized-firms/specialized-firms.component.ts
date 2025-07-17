import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
declare var bootstrap: any;
import { AuthServiceService } from '../../../../../../auth.service';

@Component({
    selector: 'app-specialized-firms',
    templateUrl: './specialized-firms.component.html',
    styleUrls: ['./specialized-firms.component.scss']
})
export class SpecializedFirmsComponent {

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
        specializedFirmId: '',
        specializedFirmNo: ''
    };

    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    loading: boolean = false;
    specializedFirmsModal: any = null;
    reinstateData: any = null;
    reinstateModal: any = null;
    username: string = '';

    Dzongkhags = ['Shrek', 'Thimphu', 'Paro', 'Wangdue', 'Punakha', 'Trashigang',
        'Trashiyangtse', 'Bumthang', 'Gasa', 'Haa', 'Lhuentse',
        'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Samtse', 'Sarpang',
        'Zhemgang', 'Chhukha', 'Dagana', 'Tsirang', 'Trongsa'];

    today: string = new Date().toISOString().substring(0, 10);
    total_records: any;
    totalPages: number;
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
        if (this.specializedFirmsModal) {
            this.specializedFirmsModal.hide();
        } else {
            const modalEl = document.getElementById('specializedFirmsModal');
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
            'emailed_specialized_firm_view'
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

    updateDisplayedData() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.displayedData = this.filteredData.slice(start, end);
    }

    // In your component class
    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (data.applicationStatus === 'Submitted' || data.applicationStatus === 'Resubmitted PFS' 
            || data.applicationStatus === 'Resubmitted OS and PFS' || data.applicationStatus === 'Resubmitted OS'
            || data.applicationStatus === 'Resubmitted HR' || data.applicationStatus === 'Resubmitted EQ' || data.applicationStatus === 'Suspension Resubmission') {
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
        if (this.selectedAction.actionType === 'cancel') {
            const firmId = this.selectedAction.target?.specializedFirmId; // Use the correct property for firmId
            const firmType = 'specializedfirm';

            if (!firmId) {
                console.error('firmId is undefined.');
                return;
            }

            forkJoin({
                categoryData: this.service.getWorkCategory('specializedfirm'),
                existingClassData: this.service.getClassification(firmType, firmId)
            }).subscribe({
                next: ({ categoryData, existingClassData }) => {
                    const workCategories = categoryData.workCategory;

                    // Only pre-check categories with a non-null specializedFirmWorkCategoryId
                    const preCheckedSet = new Set(
                        (existingClassData || [])
                            .filter((item: any) => item.specializedFirmWorkCategoryId)
                            .map((item: any) => item.workCategory)
                    );

                    this.downgradeList = workCategories.map((category: any) => ({
                        workCategory: category.workCategory,
                        workCategoryId: category.id,
                        checked: preCheckedSet.has(category.workCategory),
                        preChecked: preCheckedSet.has(category.workCategory)
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
            // Collect all unchecked, previously pre-checked categories
            const downgradeEntries = this.downgradeList
                .filter(entry => entry.preChecked && !entry.checked)
                .map(entry => ({
                    workCategoryId: entry.workCategoryId
                }));

            if (downgradeEntries.length === 0) {
                Swal.fire('Error', 'Please uncheck at least one existing category to downgrade.', 'error');
                return;
            }

            const payload = {
                specializedFirmId: this.selectedAction.target?.specializedFirmId,
                requestedBy: this.authService.getUsername(), // Replace with actual user/requestor if needed
                downgradeEntries
            };

            this.service.downgradeSF(payload).subscribe({
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
                cancelledBy: this.authService.getUsername(),
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
                suspendedBy: this.authService.getUsername(),
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

    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }

    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: "specialized-firm",
            licenseStatus: "Active"
        };

        const approvePayload = {
            firmType: "SpecializedFirm",
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
                this.router.navigate(['/monitoring/special']);
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
