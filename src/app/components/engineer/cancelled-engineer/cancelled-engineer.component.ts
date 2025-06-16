
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EngineerService } from '../../../service/engineer.service';


@Component({
  selector: 'app-cancelled-engineer',
  templateUrl: './cancelled-engineer.component.html',
  styleUrls: ['./cancelled-engineer.component.scss']
})
export class CancelledEngineerComponent {
  searchQuery: any;
    errorMessage: any;
    loading: boolean = true;
    Tabledata: any[] = [];
    fileSizeExceeded: boolean = false;
    maxFileSizeMB: number = 2; // Maximum file size in MB
    maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
    pageSize: number = 10;
    pageNo: number = 1;
    limit_value: number = 10;
    set_limit: number[] = [ 10,  15, 25, 100];
    selectedLimit: number = this.set_limit[0];
    selectedengineerNo: string = '';
    total_records: number = 0;
    totalPages: number = 0;
    formData: any = {
        Type: '',
        Date: '',
        deregisterby: '',
        Details: ''
        // Add other form fields as needed
    };
    shouldShowActionButtons: boolean;
    @ViewChild('closeButton') closeButton: ElementRef;
    @ViewChild('fileInput') fileInput;
    Privileges: any;
    uuid: any;
    selectedFile:File;
    fileId: any;
    today: string;
    allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
    fileTypeInvalid: boolean;
    constructor(private router: Router, private service: EngineerService,private messageService:MessageService, ) {}
      ngOnInit() {
        this.getEngineerCancelledList();
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
          //validation
        CanceledReregister(actionForm) {
        if (actionForm.invalid) {
          Object.keys(actionForm.controls).forEach(field => {
            const control = actionForm.controls[field];
            control.markAsTouched({ onlySelf: true });
          });
          return;
        }

        this.ReregisterCancelledEngineer();
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
            this.uploadFileForEngineer();
          }
        }
      }
      uploadFileForEngineer() {
        this.service.uploadFile(this.selectedFile,).subscribe(response => {
          this.fileId = response;
        }, error => {
            console.error("Error uploading!", error);
        });
      }
      //save deregister
      ReregisterCancelledEngineer() {
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
      const cancelledDetail = {
        reregisterDate: this.formData.Date,
        reregisteredDetails: this.formData.Details,
        reregisterBy:this.uuid,
        engineerNo: this.selectedengineerNo,
        fileId:this.fileId
        };
      
    this.service.saveCancelledReregister(cancelledDetail).subscribe((response: any) => {
      setTimeout(() => {
       this.closeButton.nativeElement.click();
        this.showSuspendMessage();
       // Show the success message after the modal is closed
       setTimeout(() => {
         this.getEngineerCancelledList()
       }, 1000);
     },);
   },
   (error: any) => {
     console.error("Error:", error);
     this.errorMessage = error.error.error;
   }
 );
}
showSuspendMessage() {
 this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Engineer reregistered successfully' });
}
  //function to navigate to the another page.
  navigate(data:any){
    const title = 'List Of Cancelled Engineer'
    const navigationExtras: NavigationExtras = {
      state: {
        data: data,
        title :title
      }
    };
    this.router.navigate(['/engineer', 'engineer-details'], navigationExtras);
    
  }
  SearchFilter() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.getEngineerCancelledList(this.searchQuery); // Pass search query to backend
    } else {
      this.getEngineerCancelledList(); // Fetch all data
    }
  }
  showErrorMessage:boolean=false
//Getting the consultant list for displaying in the table
getEngineerCancelledList(searchQuery?: string){
  const engineer = {
      "viewName": "engineerCancelled",
      "pageSize": this.pageSize,
      "pageNo": this.pageNo,
      "condition": searchQuery ? [
        {
          field: "engineerNo",
          value: `%${searchQuery}%`,
          condition: "like",
          operator: " AND "
      },
      {
          field: "name",
          value: `%${searchQuery}%`,
          condition: " like ",
          operator: " OR "
      },
      {
        field: "cidNo",
        value: `%${searchQuery}%`,
        condition: " like ",
        operator: " OR "
    }
      ] : []
    };
this.service.getListOfEngineer(engineer).subscribe((response:any)=>{
  this.showErrorMessage=false
  this.loading=false
  this.Tabledata = response.data;
  this.total_records = response.totalCount;
  this.totalPages = Math.ceil(this.total_records / this.pageSize); 
}, (error) => {
  this.showErrorMessage=true
  this.loading=false
})
}

//get base on id
getid(engineerNo: any) {
  this.selectedengineerNo = engineerNo;
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

openModal(event: Event) {
  event.stopPropagation(); 
}
 // Method to set limit value
 setLimitValue(value: any) {
  this.pageSize = parseInt(value); 
  this.pageNo = 1; 
  //this.loading=true
  this.getEngineerCancelledList();
 // console.log('loading')
} 
    previousPage() {
      if (this.pageNo > 1) {
        this.pageNo--;
        this.getEngineerCancelledList();
      }
     }
     nextPage() {
      if (this.pageNo < this.totalPages) {
        this.pageNo++;
        this.getEngineerCancelledList();
      }
    }
    goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getEngineerCancelledList();
     }
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
