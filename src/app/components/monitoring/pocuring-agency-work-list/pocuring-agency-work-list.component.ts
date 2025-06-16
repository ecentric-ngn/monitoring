import { Component } from '@angular/core';
import { CommonService } from '../../../service/common.service';

@Component({
  selector: 'app-pocuring-agency-work-list',
  templateUrl: './pocuring-agency-work-list.component.html',
  styleUrls: ['./pocuring-agency-work-list.component.scss']
})
export class PocuringAgencyWorkListComponent {
  loading:boolean=true
  pageSize:number=20
  pageNo:number=1
  dzongkhagList:any=[]
  PocuringAgencyList:any=[]
  total_records: number;
  totalCount: number = 0;
  totalPages: number;
  
  constructor( private service:CommonService){
  }

  ngOnInit(){
    this.getDzongkhagList()
    this.getPocuringAgency()

  }

  /**
   * Fetches the list of Dzongkhags and updates the dzongkhagList property.
   * Handles loading state and logs any errors.
   */
  showTable:boolean=false
  getDzongkhagList() {
    const dzongkhag = {
      viewName: 'dzongkhagList',
      pageSize: this.pageSize,
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

  tenderList:any=[]
  /**
   * Fetches the list of Works based on the Dzongkhag id provided in the argument.
   * @param id The id of the Dzongkhag to fetch the work for
   */
  FetchWorkBaseOnDzoId(id: number, viewName: string = 'tenderList') {
    const statusField = viewName === 'tenderList' ? 'tenderStatus' : 'workStatus';
    const workList = {
      viewName: viewName,
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      condition: [
        {
          field: "dzongkhagId",
          value: id
        },
        {
          field: statusField,
          value: 'In Progress'
        }
      ],
    };
  
    console.log(`Fetching from ${viewName}...`, workList);
  
    this.service.fetchAuditData(workList).subscribe(
      (response: any) => {
        this.loading = false;
        this.showTable = true;
        this.tenderList = response.data;
        this.totalCount = response.totalCount;
        console.log(`this.totalCount (${viewName})`, this.totalCount);
  
        if (this.totalCount === 0 && viewName === 'tenderList') {
          this.FetchWorkBaseOnDzoId(id, 'workList');
        }
      },
      (error) => {
        this.loading = false;
        console.error(`Error fetching data from ${viewName}:`, error);
      }
    );
  }
  
  

  /**
   * Fetches the list of Tenders or Works based on the given Procuring Agency Id.
   * If no data is found in the TenderList, it automatically fetches from the WorkList.
   * @param id The id of the Procuring Agency.
   * @param viewName The view to fetch from. Defaults to 'tenderList'. 
   */
  FetchWorkBaseOnAgencyId(id: number, viewName: string = 'tenderList') {
    const statusField = viewName === 'tenderList' ? 'tenderStatus' : 'workStatus';
    const workList = {
      viewName: viewName,
      pageSize: 1000,
      pageNo: this.pageNo,
      condition: [
        {
          field: "agencyId",
          value: id
        },
        {
          field: statusField,
          value: 'In Progress'
        }
      ],
    };
  
    console.log(`Fetching from ${viewName}...`, workList);
  
    // Fetch the data from the view
    this.service.fetchAuditData(workList).subscribe(
      (response: any) => {
        this.loading = false;
        this.showTable = true;
        this.tenderList = response.data;
        this.totalCount = response.totalCount;
        console.log(`this.totalCount (${viewName})`, this.totalCount);
  
        // If no data and currently from tenderList, then try from workList
        if (this.totalCount === 0 && viewName === 'tenderList') {
          this.FetchWorkBaseOnAgencyId(id, 'workList');
        }
      },
      (error) => {
        this.loading = false;
        console.error(`Error fetching data from ${viewName}:`, error);
      }
    );
  }
  
  
  formData:any={}
  /**
   * Fetches the list of Procuring Agencies and updates the PocuringAgencyList property.
   * Handles loading state and logs any errors.
   */
  getPocuringAgency() {
    const queryPayload = {
      viewName: 'pocuringAgencyList', 
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
  searchBasedOnBCTANo(viewName: string = 'tenderList'): void {
    const fieldName = viewName === 'tenderList' ? 'awardedBctaNo' : 'BCTANo';
    const queryPayload = {
      viewName: viewName,
      pageSize: 1000,
      pageNo: this.pageNo,
      condition: [
        {
          field: fieldName,
          value: this.formData.BCTANo
        },
        // {
        //   field: "tenderStatus",
        //   value: 'In Progress'
        // }
      ],
    };
    console.log(`Fetching based on BCTA No from ${viewName}...`, queryPayload);
    this.service.fetchAuditData(queryPayload).subscribe(
      (response: any) => {
        this.loading = false;
        this.showTable = true;
        this.tenderList = response.data;
        this.totalCount = response.totalCount;
        console.log(`tenderListbasedOnBctaNo (${viewName})`, response);
        // If no data and currently from tenderList, then try from workList
        if (this.totalCount === 0 && viewName === 'tenderList') {
          this.searchBasedOnBCTANo('workList');
        }
      },
      (error) => {
        this.loading = false;
        console.error(`Error fetching contractor details from ${viewName}:`, error);
      }
    );
  }
  

  /**
   * Fetches the list of contractors based on the BCTA No.
   * Handles loading state and logs any errors.
   */
 
  goToPreviousPage(): void {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.FetchWorkBaseOnDzoId(this.formData.dzongkhagId);
    }
  }
  
  goToNextPage(): void {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (this.pageNo < totalPages) {
      this.pageNo++;
      this.FetchWorkBaseOnDzoId(this.formData.dzongkhagId);
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

