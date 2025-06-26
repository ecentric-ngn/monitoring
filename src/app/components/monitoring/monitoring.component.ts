import { Component } from '@angular/core';
import { CommonService } from '../../service/common.service';
import { Router } from '@angular/router';
interface Condition {
    field: string;
    value: string | number;
    condition?: string;
    operator?: string;
}

@Component({
    selector: 'app-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent {
    loading: boolean = false;
    pageSize: number = 10;
    set_limit: number[] = [10, 15, 25, 100];
    pageNo: number = 1;
    dzongkhagList: any = [];
    PocuringAgencyList: any = [];
    total_records: number;
    totalCount: number = 0;
    totalPages: number;
    tableId: any;
    searchQuery: any;
    dzongkhagId: number;
    privateTenderList: any;
    agencyId: number;
    showPrivateWork: boolean = false;
    showPublicWork: boolean = false;
    showOtherWork: boolean = false;
    workType: any;
    constructor(private service: CommonService, private router: Router) {}

    ngOnInit() {
        this.getDzongkhagList();
        this.getPocuringAgency();
    }

    /**
     * Handles the click event for selecting private work type.
     * Sets the workType and updates the visibility of related sections.
     * 
     * @param Type - The type of work selected (e.g., 'PRIVATE').
     */

    onClick(Type: any) {
        if (Type === 'PUBLIC') {
         this.workType = Type;
        this.showPublicWork = true;
        this.showPrivateWork = false;
        this.showOtherWork = false;
        }else if(Type === 'OTHERS') {
         this.showOtherWork = true;
        this.showPrivateWork = false;
        this.showPublicWork = false;
        this.workType = Type;
        }
        else {
        this.workType = Type; 
        this.showPrivateWork = true; 
        this.showPublicWork = false; 
        this.showOtherWork = false;
    }   
}


    Searchfilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.FetchWorkBaseOnDzoId(this.searchQuery);
        } else {
            this.FetchWorkBaseOnDzoId(this.searchQuery);
        }
    }
        SearchPrivatefilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.FetchPrivateWorkBaseOnDzoId(this.searchQuery);
        } else {
            this.FetchPrivateWorkBaseOnDzoId(this.searchQuery);
        }
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
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    tenderList: any = [];
    OnChangenDzoId(id: number, type: string) {
        if (type == 'Private') {
            this.dzongkhagId = id;
            this.FetchPrivateWorkBaseOnDzoId();
        } else {
            this.dzongkhagId = id;
            this.FetchWorkBaseOnDzoId();
        }
    }

    onChangeProcuringAgency(id: number, type: string) {
        if (type == 'Private') {
            this.agencyId = id;
            this.FetchWorkBaseOnAgencyIdForPrivate();
        } else {
            this.agencyId = id;
            this.FetchWorkBaseOnAgencyId();
        }
    }

    onChangeBctaNo(type: string) {
        if (type == 'Private') {
            this.searchBasedOnPrivateBCTANo();
        } else {
            this.searchBasedOnBCTANo();
        }
    }

  FetchWorkBaseOnDzoId(searchQuery?: string): void {
    // Base filter conditions that are always included
  const baseConditions: Condition[] = [
    {
        field: 'dzongkhagId',
        value: this.dzongkhagId,
    },
    {
        field: 'workStatus',
        value: 'Awarded',
    },
    // {
    //     field: 'agency_name',
    //     operator: '!=',  // or 'NOT LIKE' if you need pattern matching
    //     value: 'Private Construction'
    // }
];
    // If there's a search query, add a LIKE condition for BCTANo
    if (searchQuery) {
        baseConditions.push({
            field: 'awardedBctaNo',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND',
        });

        // Optional additional search field
        // baseConditions.push({
        //     field: 'workType',
        //     value: `%${searchQuery}%`,
        //     condition: 'LIKE',
        //     operator: 'OR',
        // });
    }

    // Prepare the request object
    const dzongkhagRequest = {
        viewName: 'monitorWorkDetails',
        pageSize: this.pageSize,
        pageNo: this.pageNo,
        condition: baseConditions,
    };

    // Fetch data from the service
    this.service.fetchAuditData(dzongkhagRequest).subscribe(
        (response: any) => {
            this.loading = false;
            this.showTable = true;
            const data = response.data.filter((item: any) => item.agency !== 'Private Construction');
            this.tenderList = data;
            console.log('response', this.tenderList );
            this.total_records = response.totalCount;
            this.totalPages = Math.ceil(this.total_records / this.pageSize);
        },
        (error) => {
            this.loading = false;
            console.error('Error fetching data:', error);
        }
    );
}

    FetchPrivateWorkBaseOnDzoId(searchQuery?: string) {
           const baseConditions: Condition[] = [
              {
                    field: 'dzongkhagId',
                    value: this.dzongkhagId,
                },
                {
                    field: 'workStatus',
                    value: 'Awarded',
                },
                {
                    field: 'agency_name',
                    value: 'Private Constuction',
                },
        ];

        // If there's a search query, add a LIKE condition for BCTANo
        if (searchQuery) {
            baseConditions.push(
                {
                    field: 'BCTANo',
                    value: `%${searchQuery}%`,
                    condition: ' like ',
                    operator: ' AND ',
                },
                // {
                //     field: 'workType',
                //     value: `%${searchQuery}%`,
                //     condition: ' like ',
                //     operator: ' OR ',
                // }
            );
        }

        // Prepare the request object
        const dzongkhagRequest = {
            viewName: 'workList',
            pageSize: this.pageSize,
            pageNo: this.pageNo,
            condition: baseConditions,
        };
        // const dzongkhag = {
        //     viewName: 'workList',
        //     pageSize: 20,
        //     pageNo: this.pageNo,
        //     condition: [
        //         {
        //             field: 'dzongkhagId',
        //             value: this.dzongkhagId,
        //         },
        //         {
        //             field: 'workStatus',
        //             value: 'Awarded',
        //         },
        //         {
        //             field: 'agency_name',
        //             value: 'Private Constuction',
        //         },
        //     ],
        // };

        this.service.fetchAuditData(dzongkhagRequest).subscribe(
            (response: any) => {
                this.loading = false;
                this.showTable = true;
                this.privateTenderList = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);

                console.log('responseDzongkag', response);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    FetchWorkBaseOnAgencyId() {
        const workList = {
            viewName: 'monitorWorkDetails',
            pageSize: 1000,
            pageNo: this.pageNo,
            condition: [
                {
                    field: 'agencyId',
                    value: this.agencyId,
                },
                {
                    field: 'workStatus',
                    value: 'Awarded',
                },
            ],
        };
        this.service.fetchAuditData(workList).subscribe(
            (response: any) => {
                this.loading = false;
                this.showTable = true;
                this.tenderList = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
            },
            (error) => {
                this.loading = false;
            }
        );
    }
    FetchWorkBaseOnAgencyIdForPrivate() {
        const privateAgency = {
            viewName: 'workList',
            pageSize: 2000,
            pageNo: this.pageNo,
            condition: [
                {
                    field: 'agencyId',
                    value: this.agencyId,
                },
                {
                    field: 'workStatus',
                    value: 'Awarded',
                },
                {
                    field: 'agency_name',
                    value: 'Private Constuction',
                },
            ],
        };

        this.service.fetchAuditData(privateAgency).subscribe(
            (response: any) => {
                this.loading = false;
                this.showTable = true;
                this.privateTenderList = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    searchBasedOnBCTANo(): void {
        const workList = {
            viewName: 'monitorWorkDetails',
            pageSize: 1000,
            pageNo: this.pageNo,
            condition: [
                {
                    field: 'awardedBctaNo',
                    value: this.formData.BCTANo,
                },
                {
                    field: 'workStatus',
                    value: 'Awarded',
                },
            ],
        };
        this.service.fetchAuditData(workList).subscribe(
            (response: any) => {
                this.loading = false;
                this.showTable = true;
                this.tenderList = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
            },
            (error) => {
                this.loading = false;
                console.error(error);
            }
        );
    }

    searchBasedOnPrivateBCTANo() {
        const dzongkhag = {
            viewName: 'workList',
            pageSize: 3000,
            pageNo: this.pageNo,
            condition: [
                {
                    field: 'BCTANo',
                    value: this.formData.BCTANo,
                },
                {
                    field: 'workStatus',
                    value: 'Awarded',
                },
                {
                    field: 'agency_name',
                    value: 'Private Constuction',
                },
            ],
        };
        this.service.fetchAuditData(dzongkhag).subscribe(
            (response: any) => {
                this.loading = false;
                this.showTable = true;
                this.privateTenderList = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    setLimitValue(value: any) {
        this.pageSize = parseInt(value);
        this.pageNo = 1;
        this.FetchWorkBaseOnDzoId();
    }
    /**
     * Fetches the list of Tenders or Works based on the given Procuring Agency Id.
     * If no data is found in the TenderList, it automatically fetches from the WorkList.
     * @param id The id of the Procuring Agency.
     * @param viewName The view to fetch from. Defaults to 'tenderList'.
     */

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

    workId: string;
    saveAndNavigate(data: any) {
         this.navigate(data, this.workId);
    }
    // Navigation
    navigate(data: any, workId: string) {
        const WorkDetail = {
            data: data,
            workId: workId,
            workType: this.workType,
        };
        this.service.setData(WorkDetail, 'BctaNo', 'monitoring/WorkDetail');
    }
    // navigate(data: any) {
    //     this.service.setData(data, 'BctaNo', 'monitoring/WorkDetail');
    // }

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
    goToPage(pageSize: number) {
        if (pageSize >= 1 && pageSize <= this.totalPages) {
            this.pageNo = pageSize;
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
