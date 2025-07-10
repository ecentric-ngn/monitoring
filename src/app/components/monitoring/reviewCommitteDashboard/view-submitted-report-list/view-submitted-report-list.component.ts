import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { id_ID } from 'ng-zorro-antd/i18n';

@Component({
    selector: 'app-view-submitted-report-list',
    templateUrl: './view-submitted-report-list.component.html',
    styleUrls: ['./view-submitted-report-list.component.scss'],
})
export class ViewSubmittedReportListComponent {
    loading: boolean = true;
    @ViewChild('closebutton') closebutton: any;
    @ViewChild('closeRejectButton') closeRejectButton: any;
    @ViewChild('closeReviewButton') closeReviewButton: any;
    pageSize: number = 10;
    set_limit: number[] = [10, 15, 25, 100];
    pageNo: number = 1;
    dzongkhagList: any = [];
    PocuringAgencyList: any = [];
    total_records: number;
    totalCount: number = 0;
    totalPages: number;
    checklist_id: number;
    userId: any;
    searchQuery: any;
    checklistIds: string[];

    constructor(
        private router: Router,
        private service: CommonService,
        private notification: NzNotificationService
    ) {}


    ngOnInit() {
        this.getDzongkhagList();
        this.getPocuringAgency();
         const data = this.service.getData('appData');
         this.preDzoId = data?.data?.dzongkhagId ?? null;
         if(this.preDzoId) {
            this.onDzongkhagChange(this.preDzoId);
         }
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userId = userDetails.userId;
        }
    }
    
    Searchfilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.FetchWorkBaseOnDzoId(this.searchQuery);
        } else {
            this.FetchWorkBaseOnDzoId(this.searchQuery);
        }

    }
     selectedChecklistIds: string[] = [];
onCheckboxChange(tender: any): void {
    if (tender.selected) {
        if (!this.selectedChecklistIds.includes(tender.checklist_id)) {
            this.selectedChecklistIds.push(tender.checklist_id);
            console.log('selectedChecklistIds', this.selectedChecklistIds);
            this.checklistIds = Array.from(this.selectedChecklistIds);
        }
    } else {
        this.selectedChecklistIds = this.selectedChecklistIds.filter(
            id => id !== tender.checklist_id
        );
    }
}

hasForwardedSelected(): boolean {
    return this.tenderList.some(tender => 
        tender.selected && tender.applicationStatus === 'FORWARDED'
    );
}

hasReviewSelected(): boolean {
    return this.tenderList.some(tender => 
        tender.selected && tender.applicationStatus === 'REVIEWED'
    );
}
EndorseApplicationNo(type: string): void {
    const payload={
        checklistIds: Array.from(this.selectedChecklistIds),
        decision:type,
        reviewerId: this.userId,
    }
    this.service.saveEndorseRejectApplication(payload).subscribe(
        (response: any) => {
            this.createNotification(type);
            this.selectedChecklistIds = [];
            this.FetchWorkBaseOnDzoId();
            this.searchBasedOnBCTANo(this.formData.BCTANo);
            this.FetchWorkBaseOnAgencyId(this.formData.agencyId);
            this.closebutton.nativeElement.click();
        }
    );
}

    rejectApplication(type: string, checklist_id: any) {
         const payload={
        checklistIds: Array.from(this.selectedChecklistIds),
        decision:type,
        reviewerId: this.userId,
        remarks: this.formData.rejectedReason
    }
        this.service.saveEndorseRejectApplication(payload).subscribe((response: any) => {
                console.log('response', response);
                this.createNotification(type);
                this.FetchWorkBaseOnDzoId(this.formData.dzongkhagId);
                this.searchBasedOnBCTANo(this.formData.BCTANo);
                this.FetchWorkBaseOnAgencyId(this.formData.agencyId);
                this.closeRejectButton.nativeElement.click();
            });
    }
   saveReviewedData(): void {
        const payload = {
            checklistIds: Array.from(this.selectedChecklistIds),
            dto: {
                reviewDate: this.formData.reviewDate,
                remarks: this.formData.remarks,
            },
            reviewerId: this.userId,
        };
        this.service.saveReviewedData(payload).subscribe(
            (response: any) => {
                console.log('Data saved successfully:', response);
                this.closeReviewButton.nativeElement.click();
                  this.createNotificationS('success');
                     this.FetchWorkBaseOnDzoId();
                    this.searchBasedOnBCTANo(this.formData.BCTANo);
                // Delay navigation by 2 seconds (2000 milliseconds)
                // setTimeout(() => {
                //     this.router.navigate(['SubmittedReport']);
                // }, 2000);
            },
            (error) => {
                console.error('Error saving data:', error);
            }
        );
    }
    
   createNotificationS(type: string): void {
    if (type.toLowerCase() === 'success') {
        const message = 'The application has been reviewed successfully';
        this.notification.success('Success', message).onClick.subscribe(() => {
            console.log('notification clicked!');
        });
    }
}

    createNotification(type: string): void {
        const message =
            type.toLowerCase() === 'reject'
                ? 'The application has been rejected successfully'
                : 'The application has been endorsed successfully';

        this.notification.success('Success', message).onClick.subscribe(() => {
            console.log('notification clicked!');
        });
    }

    rejectReport(tender) {
        console.log('tender', tender);
    }
    /**
     * Fetches the list of Dzongkhags and updates the dzongkhagList property.
     * Handles loading state and logs any errors.
     */
    showTable: boolean = false;
    getDzongkhagList() {
        const dzongkhag = {
            viewName: 'dzongkhagList',
            pageSize: 20,
            pageNo: this.pageNo,
            condition: [],
        };
        this.service.fetchAuditData(dzongkhag).subscribe(
            (response: any) => {
                this.loading = false;
                this.dzongkhagList = response.data;
                this.totalCount = response.totalCount;
                console.log('responseDzongkag', response);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    getPocuringAgencyList() {
        this.service.getAllAgency().subscribe(
            (response: any) => {
                this.loading = false;
                this.PocuringAgencyList = response;
                console.log('responseDzongkag', response);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    tenderList: any = [];
    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Fetches the list of Tenders or Works based on the given Dzongkhag id.
     * If no data is found in the TenderList, it automatically fetches from the WorkList.
     * Handles loading state and logs any errors.
     * @param id The id of the Dzongkhag to fetch the work for.
     * @param viewName The view to fetch from. Defaults to 'checklist_deduplicated_view'.
     */
    /*******  b5f2eb2c-37fb-4d90-bd8f-475c4fabf176  *******/ dzongkhagId: number;

onDzongkhagChange(id: number) {
        this.dzongkhagId = id;
        this.FetchWorkBaseOnDzoId();
    }
 viewName = 'submittedApp_view';
 preDzoId: any={} ;
FetchWorkBaseOnDzoId(searchQuery?: string) {
    
//  const data = this.service.getData('appData');
// this.preDzoId = data?.dzongkhagId ?? null;
  const payload: any = [];
  if (searchQuery) {
    payload.push({
      field: 'application_number',
      value: `%${searchQuery}%`, 
      condition: 'like',
      operator: 'AND'
    });
  } else {
    payload.push(
  {
    field: "dzongkhagId",
    value: this.dzongkhagId || this.preDzoId,
    condition: "=",
    operator: "AND"
  },
)
  }
  
  this.service.fetchDetails(payload, this.pageNo, this.pageSize, this.viewName).subscribe(
    (response: any) => {
      this.tenderList = response.data;
      this.showTable = true;
      this.total_records = response.totalCount;
      this.totalPages = Math.ceil(this.total_records / this.pageSize);
      console.log('res.................', response);
    },
    (error) => {
      console.error('Error fetching contractor details:', error);
    }
  );
}


  FetchWorkBaseOnAgencyId(id: any) {
    const payload = [
        {
            field: 'agencyId',
            value: id,
        },
    ];
    this.service.fetchDetails(payload, this.pageNo, this.pageSize, this.viewName).subscribe(
        (response: any) => {
               this.tenderList = response.data;
            this.showTable = true;
            this.total_records = response.totalCount;
            this.totalPages = Math.ceil(this.total_records / this.pageSize);
        },
        (error) => {
            console.error('Error fetching contractor details:', error);
        }
    );
}

    formData: any = {};
    /**
     * Fetches the list of Procuring Agencies and updates the PocuringAgencyList property.
     * Handles loading state and logs any errors.
     */
    getPocuringAgency() {
        const queryPayload = {
            viewName: 'procuringAgencyList',
            pageSize: 1000,
            pageNo: this.pageNo,
            condition: [],
        };
        this.service.fetchAuditData(queryPayload).subscribe(
            (response: any) => {
                this.loading = false;
                this.PocuringAgencyList = response.data;
                console.log('PocuringAgencyList', response);
            },
            (error) => {
                this.loading = false;
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    /**
     * Searches for tenders or works based on the BCTA No.
     * Handles loading state and logs any errors.
     * @param viewName The name of the view to query. Defaults to 'tenderList'.
     */

    searchBasedOnBCTANo(
        viewName: string = 'submittedApp_view'
    ) {
        const payload: any = [
            {
                field: 'awardedBctaNo',
                value: this.formData.BCTANo,
                operator: 'AND',
                condition: '=',
            },
        ];

        this.service.fetchDetails(payload, this.pageNo, this.pageSize, viewName).subscribe(
                (response: any) => {
                    this.tenderList = response.data;
                    this.showTable = true;
                    this.total_records = response.totalCount;
                    this.totalPages = Math.ceil(
                        this.total_records / this.pageSize
                    );
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
    // Navigation
    navigate(applicationNumberDetails: any) {
        this.service.setData(applicationNumberDetails,'applicationNumber','details'
        );
    }

    /**
     * Fetches the list of contractors based on the BCTA No.
     * Handles loading state and logs any errors.
     */
    goToPreviousPage(): void {
        if (this.pageNo > 1) {
            this.pageNo--;
            this.FetchWorkBaseOnDzoId();
        }
    }
    goToNextPage(): void {
        const totalPages = Math.ceil(this.totalCount / this.pageSize);
        if (this.pageNo < totalPages) {
            this.pageNo++;
            this.FetchWorkBaseOnDzoId();
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
