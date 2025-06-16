import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LayoutService } from '../../../service/app.layout.service';
import { ContractorService } from '../../../service/contractor.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-de-register-contractor',
  templateUrl: './de-register-contractor.component.html',
  styleUrls: ['./de-register-contractor.component.scss']
})
export class DeRegisterContractorComponent {
  loading: boolean = true;
  searchQuery: string;
  typeOptions: any;
  receivedPrivileges: any[]=[];
  errorMessage: any;
  totalPages: number = 0;
  TableData: any[] = [];
  viewName: any;
  receivedData: any;
  pageSize: number = 10;
  pageNo: number = 1;
  data: any;
  status: string;
   set_limit: number[] = [ 10,  15, 25, 100];
  selectedLimit: number = this.set_limit[0];
  selectedContractorNo: string = '';
  total_records: number = 0;
  selectedImages!: FileList;
  shouldShowActionButtons: boolean;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('fileInput') fileInput;
  formData: any = {};
  showSuccessModal: boolean = true; 
  uuid: any;
  fileId: any;
  Privileges: any;
  today: string;
  constructor(private router: Router, private service: ContractorService,  private messageService:MessageService) {
  }
    ngOnInit() {
      this.getDeregisteredContractorList();
      this.dateValidation()
      const storedPrivileges = sessionStorage.getItem('setPrivileges');
      if (storedPrivileges) {
        this.Privileges = JSON.parse(storedPrivileges);
      }
      const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
      if (sessionLocalData) {
      this.uuid = sessionLocalData.userId
   }
  }
    dateValidation(){
      const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
        const dd = String(today.getDate()).padStart(2, '0');
        this.today = `${yyyy}-${mm}-${dd}`;
      }
  //hide and show the button base on receivedPrivileges
  shouldShowActionButton(): boolean {
      const hasRead = this.Privileges && 
          this.Privileges.some(privilege => privilege.privilege_name === 'Read');
      const hasderegister = this.Privileges && 
          this.Privileges.some(privilege => privilege.privilege_name === 'Reregister');
      // Hide the button if only "Read" privilege is present
      if (hasRead && !hasderegister) {
          return false;
      }
      // Show the button if "Reregister" privilege is present
      if (hasderegister) {
          return true;
      }
      // Otherwise, show the button
      return false;
    }
    navigate( data: any) {
      const title = 'List Of Deregistered Contractor'
      const navigationExtras: NavigationExtras = {
          state: {
              data: data,
              title:title
          },
      };
      this.router.navigate(
          ['/contractor', 'contractor-details'],
          navigationExtras
      );
  }

  Searchfilter() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
        this.getDeregisteredContractorList(this.searchQuery); // Pass search query to backend
    } else {
        this.getDeregisteredContractorList(); // Fetch all data
    }
}
  //get deregister
  showErrorMessage:boolean=false
  getDeregisteredContractorList(searchQuery?: string) {
    const contractor = {
      "viewName": "contractorDeregistered",
      "pageSize": this.pageSize,
      "pageNo": this.pageNo,
      "condition": searchQuery ? [
          { 
              field: "contractorNo",
              value: `%${searchQuery}%`,
              condition: "like",
              operator: " AND "
          },
          {
              field: "nameOfFirm",
              value: `%${searchQuery}%`,
              condition: " like ",
              operator: " OR "
          },
          {
              field: "ownerDetails",
              value: `%${searchQuery}%`,
              condition: " like ",
              operator: " OR "
          }
        ]
      : [],
};
this.service.getContractorDetails(contractor).subscribe(
  (response: any) => {
    this.showErrorMessage=false
    this.loading=false
      this.TableData = response.data.map((contractor: any) => ({
          ...contractor,
          OwnerDetails: contractor.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
      }));
      this.total_records = response.totalCount;
      this.totalPages = Math.ceil(this.total_records / this.pageSize);
  
  },
  (error) => {
    this.loading=false
    this.showErrorMessage=true
  }
);
}
  getid(contractorNo: any) {
    this.selectedContractorNo = contractorNo;
  }
    //checking validation
    deregisterContractor(actionForm) {
      if (actionForm.invalid) {
        Object.keys(actionForm.controls).forEach(field => {
          const control = actionForm.controls[field];
          control.markAsTouched({ onlySelf: true });
        });
        return;
      }
      this.deRegisterContractor();
    }
  deRegisterContractor(){
    if (this.formData.Date) {
     // Parse the selected date
     const selectedDate = new Date(this.formData.Date);
     // Get the current time in UTC
     const nowUTC = new Date();
     // Calculate Bhutan Time (UTC+6)
     const bhutanOffset = 6; // Bhutan is UTC+6
     const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
     // Attach the Bhutan time to the selected date
     selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
     // Format the selected date to ISO string with timezone offset
     this.formData.Date = selectedDate.toISOString(); // Note: This will still be in UTC format
   
   }
   const deRegisterDetail = {
       contractorReregisterDate: this.formData.Date,
       reregisteredDetails: this.formData.Details,
       contractorReregisterBy: this.uuid,
       contractorNo: this.selectedContractorNo,
       fileId:this.fileId 
   };
       this.service.savedeRegister(deRegisterDetail).subscribe(
           (response: any) => {
                   setTimeout(() => {
                   this.closeButton.nativeElement.click();
                  this.showReinstatmessage();
                   // Show the success message after the modal is closed
                   setTimeout(() => {
                       this.getDeregisteredContractorList()
                   }, 1000);
                   },);
               },
               (error: any) => {
                   this.errorMessage = error.error.error;
               }
               );
           }

       showReinstatmessage() {
           this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor Reregister Successfully' });
       }
    setLimitValue(value: any) {
      this.pageSize = parseInt(value); // Parse value as integer
      this.pageNo = 1; 
      this.loading=true
      // Call the method to fetch data
      this.getDeregisteredContractorList();
      
    } 
      previousPage() {
        if (this.pageNo > 1) {
          this.pageNo--;
          this.getDeregisteredContractorList();
        }
       }
       nextPage() {
        if (this.pageNo < this.totalPages) {
          // Increment pageNo to go to the next page
          this.pageNo++;
      
          // Fetch data for the next page
          this.getDeregisteredContractorList();
        }
      }
      //going to specific page
      goToPage(pageSize: number) {
      if (pageSize >= 1 && pageSize <= this.totalPages) {
        this.pageNo = pageSize;
        this.getDeregisteredContractorList();
       }
      }
   
      openModal(event: Event) {
        event.stopPropagation(); // prevent event from propagating to the parent elements
    }
  // Method to calculate starting and ending entry numbers
  calculateOffset(): string {
    const currentPage = (this.pageNo - 1) * this.pageSize + 1;
    const limit_value = Math.min(this.pageNo * this.pageSize, this.total_records);
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
          for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
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
          for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
            pageArray.push(i);
          }
        }
      }
    }
    return pageArray;
  }
    }
    
    
    
  
    
    
    
    
  
    
  
