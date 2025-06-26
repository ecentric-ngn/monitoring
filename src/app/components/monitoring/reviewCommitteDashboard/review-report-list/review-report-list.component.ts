import { Component } from '@angular/core';
import { CommonService } from '../../../../service/common.service';

@Component({
    selector: 'app-review-report-list',
    templateUrl: './review-report-list.component.html',
    styleUrls: ['./review-report-list.component.scss'],
})
export class ReviewReportListComponent {
    tableData: any;
    searchQuery: string = '';
    set_limit: number[] = [10, 15, 25, 100];
    loading: boolean = true;
    constructor(private service: CommonService) {}
    ngOnInit() {
        this.getReportList();
    }
    viewName = 'checklist_deduplicated_view';
    pageNo: number = 1;
    pageSize: number = 10;

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
    getReportList(searchQuery?: string) {
        const payload: any = [];

        if (searchQuery) {
            // When searching by application number, ignore applicationStatus
            payload.push({
                field: 'awardedBctaNo',
                value: `%${searchQuery}%`,
                condition: 'like',
                operator: 'AND',
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
            // Default filter when no search query is provided
            // payload.push({
            //     field: 'applicationStatus',
            //     value: 'REVIEWED',
            //     operator: 'AND',
            //     condition: '=',
            // });
        }

        this.service
            .fetchDetails(payload, this.pageNo, this.pageSize, this.viewName)
            .subscribe(
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

    navigate(applicationNumberDetails: any) {
        this.service.setData(
            applicationNumberDetails,
            'applicationNumber',
            'details'
        );
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
