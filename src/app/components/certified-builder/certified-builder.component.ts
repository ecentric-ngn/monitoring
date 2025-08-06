import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { CertifiedBuilderService } from '../../service/certified-builder.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-certified-builder',
  templateUrl: './certified-builder.component.html',
  styleUrls: ['./certified-builder.component.scss']
})
export class CertifiedBuilderComponent {
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
  showSuccessModal: boolean = true; 
  hideDeregisterOption: boolean;
  hideSuspendOption: boolean;
  hideCancelOption: boolean;
  shouldShowActionButtons: boolean;
  hideReadOption: boolean;
  fileSizeExceeded: boolean = false;
  
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  @ViewChild('fileInput') fileInput;
  @ViewChild("closeButton") closeButton: ElementRef;
  formData: any = {
    Type: '',
    Date: '',
    deregisterby: '',
    Details: ''
      // Add other form fields as needed
    };
  Privileges: any;
  uuid: any;
  selectedFile:File;
  fileId: any;
  today: string;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  constructor(private router: Router, private service: CertifiedBuilderService,
    private messageService:MessageService,
  ) {}
  
  ngOnInit() {
  this.getCertifiedBuilder();
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
    shouldShowActionButton(): boolean {
      const hasRead = this.Privileges && this.Privileges.some(privilege => privilege.privilege_name === 'Read');
      const hasSuspend = this.Privileges && this.Privileges.some(privilege => privilege.privilege_name === 'Suspend');
      const hasCancel = this.Privileges && this.Privileges.some(privilege => privilege.privilege_name === 'Cancel');
    
      // If the only privilege is 'Read', hide the button
      if (hasRead && !hasSuspend && !hasCancel) {
        this.hideSuspendOption = true;
        this.hideCancelOption = true;
        return false;
      }
    
      // Set flags to hide dropdown options based on other privileges
      if (hasCancel && hasSuspend) {
        this.hideSuspendOption = false;
        this.hideCancelOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasCancel && hasSuspend) {
        this.hideDeregisterOption = true;
        this.hideSuspendOption = false;
        this.hideCancelOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasCancel) {
        this.hideSuspendOption = true;
        this.hideCancelOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasSuspend) {
        this.hideSuspendOption = false;
        this.hideCancelOption = true;
        this.hideReadOption = !hasRead;
      } else if (hasRead) {
        this.hideDeregisterOption = true;
        this.hideSuspendOption = true;
        this.hideCancelOption = true;
        this.hideReadOption = false;
      }else {
        this.hideSuspendOption =  hasCancel;
        this.hideCancelOption = hasSuspend;
        this.hideReadOption = !hasRead;
      }
    
      return (hasRead || hasSuspend || hasCancel);
    }
  //function to navigate to the another page.
  navigate(data:any){
    const title = 'List Of Active Certified Builder'
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
      this.getCertifiedBuilder(this.searchQuery); // Pass search query to backend
    } else {
      this.getCertifiedBuilder(); // Fetch all data
    }
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
        this.Savedata();
      }
     //  Method to handle the "Save" button click event
  Savedata() {
  if (this.formData.Type === 'Suspend') {
  this.savedSuspend();
  }else if (this.formData.Type === 'Cancel') {
    this.savedCancelled();
      }
    }
    showErrorMessage:boolean=false
   //Getting the certifiedBuilder list for displaying in the table
   getCertifiedBuilder(searchQuery?: string){
      const certifiedBuilder = {
        "viewName": "certifiedBuilder",
        "pageSize":this.pageSize,
        "pageNo":this.pageNo,
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
      this.service.getListOfCertifiedBuilder(certifiedBuilder).subscribe((response:any)=>{
        this.showErrorMessage =false
        this.loading=false
        this.Tabledata = response.data.map((certifiedBuilder: any) => ({
          ...certifiedBuilder,
          OwnerDetails: certifiedBuilder.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
      }));
        this.total_records = response.totalCount;
        this.totalPages = Math.ceil(this.total_records / this.pageSize);
      }, (error) => {
        this.loading=false
        this.showErrorMessage =true
        console.log(Error)
      })
    }
  
    getid(certifiedBuilderNo: any){
    this.selectedcertifiedBuilderNo = certifiedBuilderNo;
    
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
   // Method to reload the page
   reloadPage() {
    window.location.reload();
  }
      // //save savedSuspend  
   savedSuspend() {
  if (this.formData.Date) {
    // Parse the selected date
    const selectedDate = new Date(this.formData.Date);
    // Get the current time in UTC
    const nowUTC = new Date();
    // Calculate Bhutan Time (UTC+6)
    const bhutanOffset = 6;
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
    // Attach the Bhutan time to the selected date
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
    // Format to ISO string
    this.formData.Date = selectedDate.toISOString();
  }

  const suspendDetail = {
    type: this.formData.Type,
    suspendDate: this.formData.Date,
    suspendDetails: this.formData.Details,
    suspendBy: this.uuid,
    certifiedBuilderNo: this.selectedcertifiedBuilderNo,
    fileId: this.fileId
  };

  this.service.saveSuspendDetails(suspendDetail).subscribe({
    next: () => {
      const suspendPayload = {
        cdbNos: [this.selectedcertifiedBuilderNo],
        firmType: 'Certified-builder' // Adjusted firm type
      };
      this.service.suspendedIng2cSystem(suspendPayload).subscribe({
        next: () => {
          this.closeButton.nativeElement.click();
          this.showSuspendMessage();

          setTimeout(() => {
            this.getCertifiedBuilder();
          }, 1000);
        },
        error: (g2cError) => {
          this.errorMessage = 'G2C Suspension failed: ' + (g2cError.error?.error || 'Unknown error');
        }
      });
    },
    error: (localError) => {
      this.errorMessage = 'Local Suspension failed: ' + (localError.error?.error || 'Unknown error');
    }
  });
}

            showSuspendMessage() {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Certified Builder suspended successfully' });
            }
  //save cancelled
savedCancelled() {
  if (this.formData.Date) {
    const selectedDate = new Date(this.formData.Date);
    const nowUTC = new Date();
    const bhutanOffset = 6;
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
    this.formData.Date = selectedDate.toISOString();
  }

  const cancelledDetail = {
    type: this.formData.Type,
    cancelledDate: this.formData.Date,
    cancelledDetails: this.formData.Details,
    cancelledBy: this.uuid,
    certifiedBuilderNo: this.selectedcertifiedBuilderNo,
    fileId: this.fileId
  };

  this.service.saveCancelledDetails(cancelledDetail).subscribe({
    next: () => {
      const cancelPayload = {
        cdbNos: [this.selectedcertifiedBuilderNo],
        firmType: 'certified-builder' // You can make this dynamic if needed
      };

      this.service.cancelledIng2cSystem(cancelPayload).subscribe({
        next: () => {
          this.closeButton.nativeElement.click();
          this.showCancelMessage();
          setTimeout(() => {
            this.getCertifiedBuilder();
          }, 1000);
        },
        error: (g2cError) => {
          this.errorMessage = 'G2C cancellation failed: ' + (g2cError.error?.error || 'Unknown error');
        }
      });
    },
    error: (localError) => {
      this.errorMessage = 'Local cancellation failed: ' + (localError.error?.error || 'Unknown error');
    }
  });
}

         showCancelMessage() {
             this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Certified Builder cancelled successfully' });
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
        this.getCertifiedBuilder();
       // console.log('loading')
        
      } 
          previousPage() {
            if (this.pageNo > 1) {
              this.pageNo--;
              this.getCertifiedBuilder();
            }
           }
           nextPage() {
            if (this.pageNo < this.totalPages) {
              this.pageNo++;
              this.getCertifiedBuilder();
            }
          }
          goToPage(pageSize: number) {
          if (pageSize >= 1 && pageSize <= this.totalPages) {
            this.pageNo = pageSize;
            this.getCertifiedBuilder();
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
