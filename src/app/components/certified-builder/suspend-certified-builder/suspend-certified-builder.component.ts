import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CertifiedBuilderService } from '../../../service/certified-builder.service';

@Component({
  selector: 'app-suspend-certified-builder',
  templateUrl: './suspend-certified-builder.component.html',
  styleUrls: ['./suspend-certified-builder.component.scss']
})
export class SuspendCertifiedBuilderComponent {
  loading: boolean = true;
  searchQuery: any;
  errorMessage: any;
  Tabledata: any[] = [];
  pageSize: number = 10;
  pageNo: number = 1;
  total_records: number = 0;
  totalPages: number = 0;
  data: any;
  limit_value: number = 10;
  status: string;
   set_limit: number[] = [ 10,  15, 25, 100];
  selectedLimit: number = this.set_limit[0];
  selectedcertifiedBuilderNo: string = '';
  formData: any = {
    Type: '',
    Date: '',
    deregisterby: '',
    Details: ''
    // Add other form fields as needed
  };
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  @ViewChild('fileInput') fileInput;
  @ViewChild("closeButton") closeButton: ElementRef;
  shouldShowActionButtons: boolean;
  Privileges: any;
  uuid: any;
  today: string;
  selectedFile:File;
  fileId: any;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  constructor(private router: Router, private service:CertifiedBuilderService,
    private messageService:MessageService,
  ) {
  }

  ngOnInit() {
    this.getSuspendedList();
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
    const hasreInstate= this.Privileges && 
        this.Privileges.some(privilege => privilege.privilege_name === 'Reinstate');
    // Hide the button if only "Read" privilege is present
    if (hasRead && !hasreInstate) {
        return false;
    }
    // Show the button if "Reregister" privilege is present
    if (hasreInstate) {
        return true;
    }
    // Otherwise, show the button
    return false;
  }
  navigate( data: any) {
    const title = 'List Of Suspended Certified Builder'
    const navigationExtras: NavigationExtras = {
      state: {
        data: data,
        title:title
      }
    };
    this.router.navigate(['/certified-builder', 'certified-builder-details'], navigationExtras);
  }
    // search filter
    searchFilter() {
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        this.getSuspendedList(this.searchQuery); // Pass search query to backend
      } else {
        this.getSuspendedList(); // Fetch all data
      }
    }
//get suspended list
showErrorMessage:boolean=false
  getSuspendedList(searchQuery?: string) {
    const CertifiedBuilder = {
      "viewName": "certifiedBuilderSuspended",
      "pageSize": this.pageSize,
      "pageNo": this.pageNo,
      condition: searchQuery
      ? [
        {
          field: "certifiedBuilderNo",
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
    this.service.getListOfCertifiedBuilder(CertifiedBuilder).subscribe((response: any) => {
      this.showErrorMessage=false
      this.loading=false
      this.Tabledata = response.data.map((certifiedBuilder: any) => ({
        ...certifiedBuilder,
        OwnerDetails: certifiedBuilder.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
    }));
      this.total_records = response.totalCount;
      this.totalPages = Math.ceil(this.total_records / this.pageSize);
    }, (error) => {
      this.loading=false
      this.showErrorMessage=true
    });
  }
  getid(certifiedBuilderNo: any) {
    this.selectedcertifiedBuilderNo = certifiedBuilderNo;
  }
   // Method to reload the page
 reloadPage() {
  window.location.reload();
}
 //validation 
 saveCertifiedBuilder(actionForm) {
  if (actionForm.invalid) {
    Object.keys(actionForm.controls).forEach(field => {
      const control = actionForm.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return;
  }
  this.reInstateSuspendedCertifiedVuilder();
}
//Methd to upload the file
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
      this.UploadFileForCertifiedBuilder();
    }
  }
 }
 UploadFileForCertifiedBuilder() {
  this.service.uploadFile(this.selectedFile,).subscribe(response => {
    this.fileId = response;
    // this.loading = false;
  }, error => {
      // this.loading = false;
  });
}
reInstateSuspendedCertifiedVuilder() {
  if (this.formData.Date) {
    const selectedDate = new Date(this.formData.Date);
    const nowUTC = new Date();
    const bhutanOffset = 6;
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
    this.formData.Date = selectedDate.toISOString();
  }

  const suspendRevoke = {
    type: this.formData.Type,
    revokedDate: this.formData.Date,
    revokedDetails: this.formData.Details,
    revokedBy: this.uuid,
    certifiedBuilderNo: this.selectedcertifiedBuilderNo,
    fileId: this.fileId
  };

  const reinstatedDetail = {
    firmType: 'Certified-builder',
    cdbNos: this.selectedcertifiedBuilderNo
  };

  this.service.saveSuspendReregister(suspendRevoke).subscribe({
    next: () => {
      this.service.approveReinstatementIng2cSystem(reinstatedDetail).subscribe({
        next: () => {
          setTimeout(() => {
            this.closeButton.nativeElement.click();
            this.showCancelMessage();
            setTimeout(() => {
              this.getSuspendedList();
            }, 1000);
          });
        },
        error: (g2cError) => {
          console.error('G2C approval failed:', g2cError);
          setTimeout(() => {
            this.closeButton.nativeElement.click();
            this.showCancelMessage();
            setTimeout(() => {
              this.getSuspendedList();
            }, 1000);
          });
        }
      });
    },
    error: (error) => {
      this.errorMessage = error.error?.error || 'Local reinstatement failed';
    }
  });
}

  showCancelMessage() {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Certified Builder reinstated successfully' });
  }
  openModal(event: Event) {
    event.stopPropagation(); 
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
  // Method to set limit value
  setLimitValue(value: any) {
    this.pageSize = parseInt(value); 
    this.pageNo = 1; 
    //this.loading=true
    this.getSuspendedList();
   // console.log('loading')
    
  } 
      previousPage() {
        if (this.pageNo > 1) {
          this.pageNo--;
          this.getSuspendedList();
        }
       }
       nextPage() {
        if (this.pageNo < this.totalPages) {
          this.pageNo++;
          this.getSuspendedList();
        }
      }
      goToPage(pageSize: number) {
      if (pageSize >= 1 && pageSize <= this.totalPages) {
        this.pageNo = pageSize;
        this.getSuspendedList();
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
