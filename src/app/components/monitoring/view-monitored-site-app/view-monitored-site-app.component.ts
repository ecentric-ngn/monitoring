import { Component, ViewChild } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

@Component({
    selector: 'app-view-monitored-site-app',
    templateUrl: './view-monitored-site-app.component.html',
    styleUrls: ['./view-monitored-site-app.component.scss'],
})
export class ViewMonitoredSiteAppComponent {
    tableData: any = [];
    formData: any = {};
    checkListId: any;
    @ViewChild('closeModal') closeModalButton: any;
    @ViewChild('closeactionTakenModal') closeactionTakenModal: any;
    @ViewChild('modalContent') modalContent: any; // Add this reference
    @ViewChild('successNotification', { static: false }) successNotification: any;
    @ViewChild('closeupdateOwner') closeupdateOwner: any;
    @ViewChild('closeModalForm') closeModalForm: any
    PocuringAgencyList: any;
    dzongkhagList: any;
    ownerId: number;
    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    dataList: any;
    loading: boolean = true;

    constructor(
        private service: CommonService,
        private notification: NzNotificationService
    ) { }

    ngOnInit() {
        this.getReportList();
        this.getDzongkhagList();
        this.getPocuringAgency();
    }

    private resetForm() {
        this.dateData = {};
        this.formData = {};
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

    Searchfilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.getReportList(this.searchQuery);
        } else {
            this.getReportList(this.searchQuery);
        }
    }

    setLimitValue(value: any) {
        this.pageSize = parseInt(value);
        this.pageNo = 1;
        this.getReportList();
    }


    getDzongkhagList() {
        const dzongkhag = {
            viewName: 'dzongkhagList',
            pageSize: 20,
            pageNo: 1,
            condition: [],
        };

        this.service.fetchAuditData(dzongkhag).subscribe(
            (response: any) => {
                this.dzongkhagList = response.data;
                // this.formData.dzongkhagId = this.dzongkhagList[0].id;
                console.log('dzongkhagId', this.formData.dzongkhagId);
            },
            // Error handler
            (error) => {
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    getPocuringAgency() {
        const queryPayload = {
            viewName: 'procuringAgencyList',
            pageSize: 1000,
            pageNo: 1,
            condition: [],
        };
        this.service.fetchAuditData(queryPayload).subscribe(
            (response: any) => {
                this.PocuringAgencyList = response.data;
            },
            (error) => {
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }
    viewName = 'checklist_deduplicated_view';
    pageNo: number = 1;
    pageSize: number = 10;
    getReportList(searchQuery?: string) {
        const payload: any = [];
        if (searchQuery) {
            // Only search by awardedBctaNo if searchQuery is provided
            payload.push(
                {
                    field: 'awardedBctaNo',
                    value: `%${searchQuery}%`,
                    condition: 'like',
                    operator: 'OR',
                },
                {
                    field: 'application_number',
                    value: `%${searchQuery}%`,
                    condition: 'like',
                    operator: 'OR',
                },
                {
                    field: 'applicationStatus',
                    value: `%${searchQuery}%`,
                    condition: 'like',
                    operator: 'OR',
                }
            );
        } else {
            // Apply status filters only when not searching
            payload.push(
                {
                    field: 'applicationStatus',
                    value: 'REJECTED',
                    condition: 'like',
                    operator: 'AND',
                },
                {
                    field: 'applicationStatus',
                    value: 'APPROVED',
                    condition: 'like',
                    operator: 'OR',
                },
                {
                    field: 'applicationStatus',
                    value: 'ACTION TAKEN',
                    condition: 'like',
                    operator: 'OR',
                },
                {
                    field: 'applicationStatus',
                    value: 'SUBMITTED',
                    condition: 'like',
                    operator: 'OR',
                }
            );
        }

        this.service.fetchDetails(payload, this.pageNo, this.pageSize, this.viewName).subscribe(
            (response: any) => {
                this.loading = false;
                this.tableData = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(
                    this.total_records / this.pageSize
                );
            },
            (error) => {
                this.loading = false;
                console.error('Error fetching contractor details:', error);
            }
        );
    }

    toggleAllRows(event: any) {
        const isChecked = event.target.checked;
        this.tableData.forEach((row) => {
            row.selected = isChecked;
            row.rightSelected = isChecked;
        });
    }

    reviewAgain(data: any) {
        const WorkDetail = {
            data: data,
            workId: data.workid,
            workType: data.inspection_type,
        };
        console.log('WorkDetail', WorkDetail);
        this.service.setData(WorkDetail, 'BctaNo', 'monitoring/WorkDetail');
    }

    getCheckListId(id: any) {
        this.checkListId = id;
        console.log('checkListId', this.checkListId);
        this.getDatabasedOnChecklistId();
    }
    saveObservationReport(form: any) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
        }
        const payload = {
            bctaNumber: this.formData.contractorNo,
            actionTaken: this.formData.actionTaken,
            referenceNumber: this.formData.referenceNo,
            actionDate: this.formData.date,
        };
        this.service.saveActionTakenByData(payload, this.checkListId).subscribe(
            (response: any) => {
                this.closeactionTakenModal.nativeElement.click();
                this.formData.contractorNo = '';
                this.createNotification();
                this.getReportList();
            },
            (error) => {
                console.error('Error saving data:', error);
            }
        );
    }
    selectedChecklistIds: string[] = [];
    formDisabled: boolean = false;
    onCheckboxChange(data: any): void {
         this.formDisabled = true
        if (data.rightSelected) {
            // Add to list if not already there
            if (!this.selectedChecklistIds.includes(data.checklist_id)) {
                this.selectedChecklistIds.push(data.checklist_id);
                this.formDisabled = true
            }
        } else {
             this.formDisabled = true
            // Remove from list if unchecked
            this.selectedChecklistIds = this.selectedChecklistIds.filter(
                (id) => id !== data.checklist_id
            );
        }
    }

    forwardApplication(): void {
        const payload = this.selectedChecklistIds;
        this.service.forwardApplicationToReviewer(payload).subscribe(
            (response: any) => {
                this.createNotification();
                this.getReportList();
                console.log('Data saved successfully:', response);
            },
            (error) => {
                console.error('Error saving data:', error);
            }
        );
    }

    generateChecklistDetails(form) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
        }
        const payload = {
            viewNames: this.formData.listOfItemsType,
            filters: [
                {
                    field: 'checklist_id',
                    value: this.checkListId,
                    operator: 'AND',
                    condition: '=',
                },
            ],
            contractor: {
                contractorFirmName: this.formData.nameOfFirm,
                email: this.formData.email,
                checklists: this.formData.checklists || [],
                remarks: this.formData.remarks,
                bctaregistrationNumber: this.formData.contractorNo,
            },
        };
        this.service.savecomplianceAndNonCompliance(payload, this.checkListId).subscribe(
            (response: any) => {
                console.log('Data saved successfully:', response);
                this.resetForm();
                this.createNotificationss();
                this.getReportList();
                this.closeModalButton.nativeElement.click();
            },
            (error: any) => { }
        );
    }


    // resetForm() {
    //     this.formData.contractorNo = '';
    //     this.formData.nameOfFirm = '';
    //     this.formData.email = '';
    // }
    createNotificationss(): void {
        this.notification
            .success(
                'Success',
                'The list of compliance and non-compliance items has been sent to the registered contractor email'
            )
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    /**
     * Creates a success notification to inform the user that data has been saved successfully.
     * A click event is also subscribed to log a message when the notification is clicked.
     */
    createNotification(): void {
        this.notification
            .success('Success', 'The application has been forwarded to the reviewer successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    /**
     * Search for contractor data in the database based on the BCTA Registration Number entered by the user.
     * If found, populate the form fields with the contractor data.
     */
    isFormDataLoaded: boolean = false;
    errorMessage: string = '';
    searchBasedOnBCTANo() {
        const contractor = {
            viewName: 'contractor',
            pageSize: this.pageSize,
            pageNo: this.pageNo,
            condition: [
                {
                    field: 'contractorNo',
                    value: this.formData.contractorNo,
                },
            ],
        };
        this.service.viewData(contractor).subscribe(
            (response: any) => {
                if (response.data.length) {
                    this.formData = response.data[0];
                    this.isFormDataLoaded = true;
                    this.errorMessage = '';
                } else {
                    this.isFormDataLoaded = false
                    this.errorMessage = 'No data found for this BCTA. Please add it manually.';
                }
            },
            (error) => {
                console.error('Error fetching contractor data:', error);
                this.errorMessage = 'Something went wrong while fetching data.';
            }
        );
    }
    clearErrorMessage() {
        this.errorMessage = '';
    }
    getworkId(data: any) {
        this.ownerId = data.work_information_id;
        const payload: any = [
            {
                field: 'work_information_id',
                value: data.work_information_id,
                operator: 'AND',
                condition: '=',
            },
            {
                field: 'checklist_id',
                value: data.checklist_id,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, this.pageNo, this.pageSize, this.viewName).subscribe(
            (response: any) => {
                const data = response.data[0];
                this.formData.projectName = data.workName;
                this.formData.dzongkhagId = data.dzongkhag;
                this.formData.placeName = data.place;
                this.formData.contractAmount = data.awardedAmount;
                this.formData.startDate = data.officialStartDate?.substring(0, 10); // "YYYY-MM-DD"
                this.formData.proposedCompletionDate =
                    data.officialEndDate?.substring(0, 10); // "YYYY-MM-DD"
                this.formData.client = data.agencyId;
                console.log('formData.................', this.formData);
                this.getDzongkhagList();
                this.getPocuringAgency();
            },
            // Error handler
            (error) => {
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    updateOwnerInformation(form: any) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
        }
        const payload = {
            projectName: this.formData.projectName,
            dzongkhag: this.formData.dzongkhagId,
            place: this.formData.placeName,
            contractAmount: parseInt(this.formData.contractAmount, 10),
            startDate: this.formData.startDate,
            proposedCompletionDate: this.formData.proposedCompletionDate,
            client: this.formData.client,
        };
        this.service
            .updateWorkInformationData(payload, this.ownerId)
            .subscribe((response: any) => {
                this.closeupdateOwner.nativeElement.click();
                this.createNotifications();
                this.getReportList();
                console.log('ownerId', response);
            });
    }

    activeTab: string = 'Contractor';
    setActiveTab(tab: string) {
        if (tab !== 'Contractor') {
            this.activeTab = 'Client'; // Force stay on debtor tab
            return;
        }
        this.activeTab = tab;
    }
    showContractorInf: boolean = true;
    goToClientTab() {
        this.showContractorInf = false;
        this.setActiveTab('Client');
    }
    goToPreviousTab() {
        this.showContractorInf = true;
        this.setActiveTab('Contractor');
    }
    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: this.checkListId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                1,
                this.pageSize,
                'client_site_engineers_view'
            )
            .subscribe(
                (response: any) => {
                    this.dataList = response.data;
                    console.log('this.dataList', this.dataList);
                },
                // Error handler
                (error) => {
                    console.error('Error fetching contractor details:', error); // Log the error
                }
            );
    }

    createNotifications(): void {
        this.notification
            .success(
                'Success',
                'The Owner Information has been updated successfully'
            )
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    goToPreviousPage(): void {
        if (this.pageNo > 1) {
            this.pageNo--;
            this.getReportList();
        }
    }
    goToNextPage(): void {
        const totalPages = Math.ceil(this.totalCount / this.pageSize);
        if (this.pageNo < totalPages) {
            this.pageNo++;
            this.getReportList();
        }
    }
    goToPage(pageSize: number) {
        if (pageSize >= 1 && pageSize <= this.totalPages) {
            this.pageNo = pageSize;
            this.getReportList();
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
    total_records: number;
    totalCount: number = 0;
    totalPages: number;
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
