import { Component, ViewChild } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../auth.service';
declare var bootstrap: any;

@Component({
    selector: 'app-view-reg-compliancelist',
    templateUrl: './view-reg-compliancelist.component.html',
    styleUrls: ['./view-reg-compliancelist.component.scss'],
})
export class ViewRegCompliancelistComponent {
    filteredData: any[] = [];
    displayedData: any[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;
    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: any = [];
    bsModal: any;
    loading: boolean = false;
    selectedIds: number[] = [];
    private isFetching = false;
    private autoRefreshInterval: any;
    firmType: string = '';
    selectedFirmType: string = '';
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: '',
    };

    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    reinstateData: any = null;
    reinstateModal: any = null;
    constructionFirmModal: any = null;
    searchTerm: string = '';
    statusFilter: string = 'All';
    username: string = '';
    contractorClasses = ['S-Small', 'M-Medium', 'L-Large', 'All'];
    today: string = new Date().toISOString().substring(0, 10);
    dzongkhagList: any[] = [];
    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router,
        private authService: AuthServiceService
    ) {}

    ngOnInit() {
        this.fetchComplianceDetails();
        this.getDzongkhagList();
        this.username = this.authService.getUsername() || 'NA';
        // Auto-refresh every 60 seconds (60000 ms)
        this.autoRefreshInterval = setInterval(() => {
            this.fetchComplianceDetails();
        }, 60000);
    }

    getDzongkhagList() {
        const dzongkhag = {
            viewName: 'dzongkhagList',
            pageSize: 21,
            pageNo: 1,
            condition: [],
        };

        this.service.fetchAuditData(dzongkhag).subscribe(
            (response: any) => {
                this.loading = false;
                this.dzongkhagList = response.data;
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
            }
        );
    }
    ngOnDestroy() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
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
                this.fetchComplianceDetails();
            },
            error: (error) => this.handleError(error),
        });
    }

    closeFirmModal() {
        if (this.constructionFirmModal) {
            this.constructionFirmModal.hide();
        } else {
            const modalEl = document.getElementById('constructionFirmModal');
            if (modalEl) {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach((el) => el.remove());
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
            },
        }).then(() => {
            // Force cleanup
            const backdrops = document.querySelectorAll(
                '.swal2-backdrop, .modal-backdrop'
            );
            backdrops.forEach((el) => el.remove());
            document.body.classList.remove('modal-open', 'swal2-no-backdrop');
            document.body.style.paddingRight = '';
        });
    }
    private handleSuccess(response: any) {
    }

    private handleError(error: any) {
        Swal.fire({
            title: 'Error!',
            text: 'Failed to send mass email. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }

    dateData: any = {};
    get calculatedDeadline() {
        if (this.dateData.date) {
            const d = new Date(this.dateData.date);
            d.setDate(d.getDate() + 7); //7 days deadline
            return d.toISOString().substring(0, 10);
        }
        return '';
    }

    onChangeFirmType(firmType: string) {
        this.firmType = firmType;
        switch (firmType) {
            case 'constructionFirm':
                this.router.navigate(['/reg-compliance/construction']);
                break;
            case 'consultancyFirm':
                this.router.navigate(['/monitoring/consultancy']);
                break;
            case 'specializedFirm':
                this.router.navigate(['/monitoring/specialized']);
                break;
            case 'certifiedBuilders':
                this.router.navigate(['/monitoring/certified']);
                break;
            default:
                break;
        }
    }
    totalData: number = 0;
fetchComplianceDetails(searchQuery?: string) {
    this.loading = true;
    const payload: any[] = [];
   if (searchQuery) {
    payload.push(
        {
            field: 'contractorNo',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND'
        },
        {
            field: 'applicationStatus',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'OR'
        }
    );
}
    this.service.fetchDetails(payload,this.pageNo,this.pageSize,'contractor_email_view').subscribe(
            (response: any) => {
                this.tableData = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
                this.totalCount = response.totalCount;
                this.loading = false;
            },
            (error) => {
                console.error('Error fetching contractor details:', error);
                this.loading = false;
            }
        );
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

    setLimitValue(value: any) {
        this.pageSize = parseInt(value);
        this.pageNo = 1;
        this.fetchComplianceDetails();
    }

    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (
            data.applicationStatus === 'Submitted' ||
            data.applicationStatus === 'Resubmitted OS and PFS' ||
            data.applicationStatus === 'Resubmitted HR and EQ' ||
            data.applicationStatus === 'Suspension Rejected' ||
            data.applicationStatus === 'Rejected' ||
            data.applicationStatus === 'Suspension Resubmission'
        ) {
            const workId = data.contractorNo;
            this.prepareAndNavigate(data, workId);
        }
    }

    private prepareAndNavigate(data: any, workId: string) {
        const workDetail = {
            data: data,
            firmType: this.firmType,
        };

        console.log('Navigation payload:', workDetail);

        this.service.setData(
            workDetail,
            'BctaNo',
            'monitoring/RegFirmInformation'
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
            this.selectedIds = this.selectedIds.filter(
                (item) => item !== numericId
            );
        }

        console.log('Selected IDs (as numbers):', this.selectedIds);
    }

    forwardToRC() {
        if (this.selectedIds.length === 0) {
            Swal.fire('Warning', 'No items selected', 'warning');
            return;
        }
        const payload = this.selectedIds;
        this.service.forwardToReviewCommitee(payload).subscribe(
            (res) => {
                this.fetchComplianceDetails();
                Swal.fire(
                    'Success',
                    'Selected contractors submitted successfully',
                    'success'
                );
            },
            (error) => {
                console.error('Error sending selected IDs:', error);
                Swal.fire(
                    'Error',
                    'Failed to submit selected contractors',
                    'error'
                );
            }
        );
    }

    openActionModal(row: any) {
        this.selectedAction = {
            actionType: '',
            actionDate: this.today,
            remarks: '',
            newClassification: '',
            target: row,
        };
        console.log('Row passed to modal:', row);

        const modalEl = document.getElementById('actionModal');
        this.bsModal = new bootstrap.Modal(modalEl, {
            backdrop: 'static',
            keyboard: false,
        });
        this.bsModal.show();
    }

    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.selectedAction.target?.contractorId;
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
        this.workClassificationList = categoryData.workClassification;
        const classificationMap = existingClassData.reduce(
            (acc: any, item: any) => {
                acc[item.workCategory] = item.existingWorkClassification;
                return acc;
            },
            {}
        );
        this.downgradeList = workCategories.map((category: any) => {
            const downgradeItem = {
                workCategory: category.workCategory,
                workCategoryId: category.id,
                existingClass: classificationMap[category.workCategory] || 'Not available',
                newClass: '',
            };
            return downgradeItem;
        });

        console.log('Step 7 - Final downgradeList:', this.downgradeList);
    },
    error: (err) => {
        console.error('Error fetching downgrade data:', err);
    },
});

        } else {
            this.downgradeList = [];
        }
    }
 get filteredDowngradeList() {
    return this.downgradeList.filter(item => item.existingClass !== 'Not available');
  }

  trackByWorkCategory(index: number, item: any): string {
    return item.workCategoryId;
  }
    getClassOptions(existingClass: string) {
        const all = [
            { label: 'L - Large', value: 'L-Large' },
            { label: 'M - Medium', value: 'M-Medium' },
            { label: 'S - Small', value: 'S-Small' },
        ];

        if (existingClass === 'L-Large') {
            return all.filter((opt) => opt.value !== 'L-Large');
        } else if (existingClass === 'M-Medium') {
            return all.filter((opt) => opt.value === 'S-Small');
        } else if (existingClass === 'S-Small') {
            return [];
        }
        return [];
    }

    // trackByWorkCategory(index: number, item: any) {
    //     return item.workCategory;
    // }

    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
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
                firmId: this.selectedAction.target?.contractorId,
                bctaNo: this.selectedAction.target?.contractorNo,
                firmType: 'Contractor',
                downgradeEntries,
                requestedBy: this.authService.getUsername(),
                applicationID: this.selectedAction.target?.appNo,
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
                        this.closeModal();
                         this.fetchComplianceDetails();
                    } else {
                        Swal.fire(
                            'Error',
                            res || 'Something went wrong while forwarding.',
                            'error'
                        );
                        this.closeModal();
                        this.fetchComplianceDetails();
                    }
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'Something went wrong while forwarding.',
                        'error'
                    );
                    console.error(err);
                    this.closeModal();
                },
            });
        }
        //  else if (this.selectedAction.actionType === 'cancel') {
        //     const payload = {
        //         contractorNo: this.selectedAction.target?.contractorNo,
        //         // contractorId: this.selectedAction.target?.contractorId,
        //         contractorCancelledBy: this.authService.getUsername(),
        //         contractorCancelledDate: this.selectedAction.actionDate,
        //         contractorType: 'Contractor',
        //         suspendDetails: this.selectedAction.remarks,
        //         applicationID: this.selectedAction.target?.appNo,
        //     };
        //     this.service.cancelFirm(payload).subscribe({
        //         next: (res) => {
        //             Swal.fire(
        //                 'Success',
        //                 'Forwarded to Review Committee',
        //                 'success'
        //             );
        //             this.closeModal();
        //         },
        //         error: (err) => {
        //             Swal.fire('Error', 'Failed to cancel contractor', 'error');
        //         },
        //     });
        // } 
        else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.selectedAction.target?.contractorNo,
                // contractorId: this.selectedAction.target?.contractorId,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Contractor',
                suspendDetails: this.selectedAction.remarks,
                applicationID: this.selectedAction.target?.appNo,
            };
            
            this.service.suspendFirm(payload).subscribe({
                next: (res) => {
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeModal();
                    this.fetchComplianceDetails();
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to suspend contractor', 'error');
                },
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
                    this.fetchComplianceDetails();
                    this.router.navigate(['/monitoring/construction']);
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
            },
            error: (err) => {
                console.error('Reinstatement error:', err);

                this.closeModal();

                if (err.status === 500) {
                    Swal.fire(
                        'Server Error',
                        err?.error?.message ||
                            'An internal server error occurred.',
                        'error'
                    );
                } else {
                    Swal.fire(
                        'Error',
                        'License Reinstatement failed. Please try again later.',
                        'error'
                    );
                }
            },
        });
    }
    pageNo = 1;
    totalPages: number;
    pageSize: number = 10;

    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Generate an array of page numbers to be displayed in the pagination component.
     * The algorithm is as follows:
     * - If total_pages is less than or equal to 4, display all pages
     * - If current page is less than or equal to 2, display the first two pages,
     *   followed by an ellipsis, and then the last two pages
     * - If current page is greater than or equal to total_pages - 1, display the first two pages,
     *   followed by an ellipsis, and then the last two pages
     * - Otherwise, display the current page, previous and next page, and the first and last pages
     * @returns {number[]} The array of page numbers
     */
    /*******  0bbd14d2-b5e3-4d4d-88d5-17968e9bd2b9  *******/ total_records: number;
    totalCount: number = 0;
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
}
