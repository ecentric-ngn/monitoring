import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
declare var bootstrap: any;
import { AuthServiceService } from '../../../../../../auth.service';

@Component({
    selector: 'app-consultancy-firm',
    templateUrl: './consultancy-firm.component.html',
    styleUrls: ['./consultancy-firm.component.scss'],
})
export class ConsultancyFirmComponent {
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
        consultantId: '',
        consultantNo: '',
    };
    downgradeList: any[] = [];
    workClassificationList: any[] = [];
    loading: boolean = false;
    consultancyFirmModal: any = null;
    username: string = '';
    today: string = new Date().toISOString().substring(0, 10);
    dzongkhagList: any;
    total_records: any;
    totalPages: number;
    applicationNo: any;

    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router,
        private authService: AuthServiceService
    ) {}

    searchTerm: string = '';
    statusFilter: string = 'All';
    ngOnInit() {
        this.fetchComplianceDetails();
        // this.autoUpdateLicenseStatus();
        this.getDzongkhagList();

        this.username = this.authService.getUsername() || 'NA';
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
                console.log('responseDzongkag', response);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    sendMassMail() {
        this.loading = true;
        this.formData.deadline = this.calculatedDeadline;
        this.service.sendMassMailToConsultant(this.formData).subscribe({
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
        if (this.consultancyFirmModal) {
            this.consultancyFirmModal.hide();
        } else {
            const modalEl = document.getElementById('consultancyFirmModal');
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
        console.log('Email sent successfully:', response);
    }

    private handleError(error: any) {
        console.error('Error sending email:', error);
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
            case 'certifiedBuilders':
                this.router.navigate(['/monitoring/certified']);
                break;
            default:
                break;
        }
    }
    totalCount: number = 0;
    pageNo: number = 1;
    pageSize: number = 10;
  fetchComplianceDetails(searchQuery?: string) {
    this.loading = true;
    const payload: any[] = [];
    // Add search filters if a search query is provided
    if (searchQuery) {
        payload.push(
            {
                field: 'consultantNo',
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
    this.service.fetchDetails(payload,this.pageNo,this.pageSize,'consultant_email_view').subscribe(
            (response: any) => {
                this.tableData = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
                this.totalCount = response.totalCount;
                this.loading = false;
            },
            (error) => {
                console.error('Error fetching consultant details:', error);
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
    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (
            data.applicationStatus === 'Submitted' ||
            data.applicationStatus === 'Resubmitted OS and PFS' ||
            data.applicationStatus === 'Resubmitted HR and EQ' ||
            data.applicationStatus === 'Rejected' ||
            data.applicationStatus === 'Suspension Resubmission'
        ) {
            const workId = data.consultantNo;
            this.prepareAndNavigate(data, workId);
        }
    }

    private prepareAndNavigate(data: any, workId: string) {
        const workDetail = {
            data: data,
            firmType: this.firmType,
        };
        this.service.setData(workDetail,'BctaNo','monitoring/consultancy-information');
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
    }

  forwardToRC() {
  if (this.selectedIds.length === 0) {
    Swal.fire('Warning', 'No items selected', 'warning');
    return;
  }
  const payload = this.selectedIds;
  this.service.forwardToReviewCommiteeConsultancy(payload).subscribe(
    (res) => {
      Swal.fire(
        'Success',
        'Selected firms submitted successfully',
        'success'
      );
      this.fetchComplianceDetails();
    },
    (error) => {
      Swal.fire(
        'Error',
        'Something went wrong while forwarding.',
        'error'  // ✅ Corrected this line
      );
    }
  );
}

    openActionModal(row: any) {
        this.applicationNo = row.appNo;
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

    private getPrefix(workCategory: string): string {
        if (workCategory.startsWith('S-')) return 'S';
        if (workCategory.startsWith('A-')) return 'A';
        if (workCategory.startsWith('C-')) return 'C';
        if (workCategory.startsWith('E-')) return 'E';
        return '';
    }

   onActionTypeChange() {
    if (this.selectedAction.actionType === 'cancel') {
        const firmId = this.selectedAction.target?.consultantId;
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

                // Create a set of existing classification IDs for quick lookup
                const existingClassificationIds = new Set<string>();
                for (const item of existingClassData) {
                    if (item.consultantWorkClassificationId) {
                        existingClassificationIds.add(
                            String(item.consultantWorkClassificationId).trim()
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

                        // Filter classifications that belong to this category
                        const possibleClassifications = workClassifications
                            .filter(
                                (cls: any) =>
                                    cls.type === 'consultant' &&
                                    cls.workClassification.startsWith(
                                        prefix
                                    )
                            )
                            .map((cls: any) => ({
                                id: cls.id,
                                name: cls.workClassification,
                                checked: existingClassificationIds.has(String(cls.id).trim()),
                                preChecked: existingClassificationIds.has(String(cls.id).trim())
                            }));

                        // Only include categories that have at least one checked classification
                        if (possibleClassifications.some(cls => cls.checked)) {
                            return {
                                workCategory: category.workCategory,
                                workCategoryId: category.id,
                                classifications: possibleClassifications,
                            };
                        }
                        return null;
                    })
                    .filter((item: any) => item !== null);
            },
            error: (err) => {
                console.error('Error fetching downgrade data:', err);
            },
        });
    } else {
        this.downgradeList = [];
    }
}

    getClassOptions(existingClass: string, workCategory: string) {
        const allOptions = this.getOptionsByCategory(workCategory);
        if (!existingClass) return allOptions;

        const existingMatch = existingClass.match(/^([A-Z])(\d+)-/);
        if (!existingMatch) return allOptions;
        const [_, prefix, numberStr] = existingMatch;
        const existingNumber = parseInt(numberStr, 10);

        // Filter to only show classes with same prefix and number > existing
        return allOptions.filter((option) => {
            const match = option.value.match(/^([A-Z])(\d+)-/);
            if (!match) return false;

            const [__, optPrefix, optNumberStr] = match;
            const optNumber = parseInt(optNumberStr, 10);

            return optPrefix === prefix && optNumber > existingNumber;
        });
    }

    getOptionsByCategory(workCategory: string) {
        if (workCategory === 'S-Surveying Services') {
            return [
                {
                    label: 'S1-Cadastral Surveying',
                    value: 'S1-Cadastral Surveying',
                },
                {
                    label: 'S2-Topographic Surveying',
                    value: 'S2-Topographic Surveying',
                },
                {
                    label: 'S3-Bathymetric Surveying',
                    value: 'S3-Bathymetric Surveying',
                },
                {
                    label: 'S4-Geodetic & Precision Surveying',
                    value: 'S4-Geodetic & Precision Surveying',
                },
                {
                    label: 'S5-Photogrammetric Surveying',
                    value: 'S5-Photogrammetric Surveying',
                },
                {
                    label: 'S6-GIS & Remote Sensing',
                    value: 'S6-GIS & Remote Sensing',
                },
                {
                    label: 'S7-Survey Instrument Calibration, Maintenance and Certification Services',
                    value: 'S7-Survey Instrument Calibration, Maintenance and Certification Services',
                },
            ];
        }

        if (workCategory === 'A-Architectural Services') {
            return [
                {
                    label: 'A1-Architectural and Interior Design',
                    value: 'A1-Architectural and Interior Design',
                },
                { label: 'A2-Urban Planning', value: 'A2-Urban Planning' },
                {
                    label: 'A3-Landscaping and Site Development',
                    value: 'A3-Landscaping and Site Development',
                },
            ];
        }

        if (workCategory === 'C-Civil Engineering Services') {
            return [
                {
                    label: 'C1-Structural Design',
                    value: 'C1-Structural Design',
                },
                { label: 'C2-Geo-Tech Studies', value: 'C2-Geo-Tech Studies' },
                {
                    label: 'C3-Social & ENviroment Studies',
                    value: 'C3-Social & ENviroment Studies',
                },
                {
                    label: 'C4-Roads, Bridges, Buildings & Air Ports',
                    value: 'C4-Roads, Bridges, Buildings & Air Ports',
                },
                {
                    label: 'C5-Irrigation, Hydraulics, WaterSupply, Sanitation, Sewerage & Solid Waste',
                    value: 'C5-Irrigation, Hydraulics, WaterSupply, Sanitation, Sewerage & Solid Waste',
                },
                {
                    label: 'C6-Construction Management & Site Supervision',
                    value: 'C6-Construction Management & Site Supervision',
                },
                {
                    label: 'C7-Water Resources & Hydro Power Projects',
                    value: 'C7-Water Resources & Hydro Power Projects',
                },
            ];
        }

        if (workCategory === 'E-Electrical Engineering Services') {
            return [
                {
                    label: 'E1-Investigation & Design of Hydro Power Projects',
                    value: 'E1-Investigation & Design of Hydro Power Projects',
                },
                {
                    label: 'E2-Operation & Maintenance of Hydro Power Projects',
                    value: 'E2-Operation & Maintenance of Hydro Power Projects',
                },
                {
                    label: 'E3-Urban & Rural Electrification, Transmission Line, Communication & Scada',
                    value: 'E3-Urban & Rural Electrification, Transmission Line, Communication & Scada',
                },
                {
                    label: 'E4-Construction Management & Site Supervision',
                    value: 'E4-Construction Management & Site Supervision',
                },
                { label: 'E5-Sub-station', value: 'E5-Sub-station' },
                {
                    label: 'E6-Energy Efficiency Services',
                    value: 'E6-Energy Efficiency Services',
                },
                { label: 'E7-House Wiring', value: 'E7-House Wiring' },
            ];
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
        if (
            !this.selectedAction.actionType ||
            !this.selectedAction.actionDate ||
            !this.selectedAction.remarks
        ) {
            alert('All required fields must be filled.');
            return;
        }

        if (this.selectedAction.actionType === 'cancel') {
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

            if (downgradeEntries.length === 0) {
                Swal.fire(
                    'Error',
                    'Please uncheck at least one existing class to downgrade.',
                    'error'
                );
                return;
            }

            const payload = {
                consultantId: this.selectedAction.target?.consultantId,
                bctaNo: this.selectedAction.target?.consultantNo,
                 applicationNumber: this.selectedAction.target?.appNo,
                requestedBy: this.authService.getUsername(),
                downgradeEntries,
            };
            this.service.downgradeConsultancy(payload).subscribe({
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
                    this.fetchComplianceDetails();
                },
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            const payload = {
                firmNo: this.selectedAction.target?.consultantNo,
                // contractorId: this.selectedAction.target?.contractorId,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Consultant',
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
                    this.fetchComplianceDetails();
                },
                error: (err) => {
                    Swal.fire('Error', 'Failed to suspend contractor', 'error');
                },
            });
        }else if (this.selectedAction.actionType === 'cancelq') {
            const payload = {
                firmNo: this.selectedAction.target?.consultantNo,
                // contractorId: this.selectedAction.target?.contractorId,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Consultant',
                suspendDetails: this.selectedAction.remarks,
            };
            // Call suspend API
            this.service.cancelFirm(payload).subscribe({
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
                    this.fetchComplianceDetails();
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
                this.router.navigate(['/monitoring/consultancy']);
                this.closeModal();
                this.fetchComplianceDetails();
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

    goToPreviousPage(): void {
        if (this.pageNo > 1) {
            this.pageNo--;
            this.fetchComplianceDetails();
        }
    }
    setLimitValue(value: any) {
        this.pageSize = parseInt(value);
        this.pageNo = 1;
        this.fetchComplianceDetails();
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
