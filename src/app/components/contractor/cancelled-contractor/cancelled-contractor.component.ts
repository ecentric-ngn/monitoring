import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ContractorService } from '../../../service/contractor.service';

@Component({
  selector: 'app-cancelled-contractor',
  templateUrl: './cancelled-contractor.component.html',
  styleUrls: ['./cancelled-contractor.component.scss']
})
export class CancelledContractorComponent {
loading: boolean = true;
searchQuery: any;
typeOptions: any;
errorMessage: any;
totalPages: number = 0;
TableData: any[] = [];
fileSizeExceeded: boolean = false;
maxFileSizeMB: number = 2; // Maximum file size in MB
maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
viewName: any;
receivedData: any;
pageSize: number = 10;
pageNo: number = 1;
data:any;
limit_value: number = 10;
status: string;
 set_limit: number[] = [ 10,  15, 25, 100];
selectedLimit: number = this.set_limit[0];
selectedContractorNo: string = '';
total_records: number = 0;
formData: any = {
      Type: '',
      Date: '',
      deregisterby: '',
      Details: ''
    };
@ViewChild('closeButton') closeButton: ElementRef;
@ViewChild('fileInput') fileInput;
allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
fileTypeInvalid: boolean;
  sessionDataForCrps: any;
  Privileges: any;
  uuid: any;
  today: string;
  selectedFile:File;
  fileId: any;
  entityId: any;
  entityType: any;
constructor(private router: Router, private service: ContractorService, 
  private messageService:MessageService,
) {
}   
    ngOnInit() {
      this.getCancelledContractorList();
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
      const hasReregister = this.Privileges && 
          this.Privileges.some(privilege => privilege.privilege_name === 'Reregister');
      // Hide the button if only "Read" privilege is present
      if (hasRead && !hasReregister) {
          return false;
      }
      // Show the button if "Reregister" privilege is present
      if (hasReregister) {
          return true;
      }
      // Otherwise, show the button
      return false;
    }
    navigate( data: any) {
      const title = 'List Of Cancelled Contractor'
      const navigationExtras: NavigationExtras = {
        state: {
          data: data,
          title:title
        }
      };
      this.router.navigate(['/contractor', 'contractor-details'], navigationExtras);
    }
    getid(contractorNo: any){
      this.selectedContractorNo = contractorNo;

    }
    Searchfilter() {
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        this.getCancelledContractorList(this.searchQuery); // Pass search query to backend
      } else {
        this.getCancelledContractorList(); // Fetch all data
      }
    }
  //checking validation
  Reregister(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.cancelledReregister();
  }
  onFileChanged(event: any) {
    const files = event.target.files;
    this.fileSizeExceeded = false; // Reset error state
    this.fileTypeInvalid = false; // Reset error state

    if (files.length > 0) {
      for (const file of files) {
        // Check file size
        if (file.size > this.maxSizeInBytes) {
          this.fileSizeExceeded = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }

        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
          this.fileTypeInvalid = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }

        // Proceed with your file upload logic
        this.selectedFile = file;
        this.uploadFileForContractor();
      }
    }
  }
  uploadFileForContractor() {
    this.service.uploadFile(this.selectedFile).subscribe(response => {
      this.fileId = response;
    }, error => {
    });
  }
//save cancelled
cancelledReregister() {
  if (this.formData.Date) {
    const selectedDate = new Date(this.formData.Date);
    // Attach the current time to the selected date
    selectedDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
    this.formData.Date = selectedDate.toISOString(); // Format as 'YYYY-MM-DDTHH:MM:SS.000Z'
  }
  const reRegisterDetail = {
    contractorReregisterDate: this.formData.Date,
    reregisteredDetails: this.formData.Details,
    contractorReregisterBy: this.uuid,
    contractorNo: this.selectedContractorNo,
    fileId:this.fileId 

  };

  this.service.saveCancelledReregister(reRegisterDetail).subscribe(
    (response: any) => {
      setTimeout(() => {
      this.closeButton.nativeElement.click();
      this.showReregistermessage();
      // Show the success message after the modal is closed
      setTimeout(() => {
          this.getCancelledContractorList()
      }, 1000);
      },);
  },
  (error: any) => {
      this.errorMessage = error.error.error;
  }
  );
}
showReregistermessage() {
this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor reregistered successfully' });
}
// get cancelled list
showErrorMessage:boolean=false
    getCancelledContractorList(searchQuery?: string) {
      const contractor = {
          "viewName": "contractorCancelled",
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
          ] : []
        };
      this.service.getContractorDetails(contractor).subscribe((response: any) => {
        this.showErrorMessage=false
        this.loading=false
        this.TableData = response.data.map((contractor: any) => ({
          ...contractor,
        OwnerDetails: contractor.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
      }));
       this.total_records = response.totalCount;
        this.totalPages = Math.ceil(this.total_records / this.pageSize); // Calculate total pages
      }, (error) => {
        this.loading=false
        this.showErrorMessage=false
      })
    }

    openModal(event: Event) {
      event.stopPropagation(); 
    }
     // Method to set limit value
     setLimitValue(value: any) {
      this.pageSize = parseInt(value); // Parse value as integer
      this.pageNo = 1; 
      this.getCancelledContractorList(); 
    }
    previousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getCancelledContractorList();
    }
   }
    nextPage() {
    if (this.pageNo < this.totalPages) { 
      this.pageNo++;
      this.getCancelledContractorList();
    }
   }
  //going to specific page
  goToPage(pageSize: number) {
  if (pageSize >= 1 && pageSize <= this.totalPages) {
    this.pageNo = pageSize;
    this.getCancelledContractorList();
   }
  }
  cancel(actionForm: NgForm) {
    actionForm.resetForm(); // Reset the form using Angular's form reset method
    this.resetModalData(); // Reset additional modal data
    this.fileInput.nativeElement.value = '';
    this.fileSizeExceeded = false;
    this.fileTypeInvalid= false
  }
  resetModalData() {
    this.formData = {
      Type: '',
      Date: '',
      Details: ''
    };
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
  
  



  
  

  
  
  
  
  
  

  
