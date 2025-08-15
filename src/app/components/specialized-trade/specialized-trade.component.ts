import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgForm, NgModel } from "@angular/forms";
import { NavigationExtras, Router } from "@angular/router";
import { SpecializedTradeService } from '../../service/specialized-trade.service';
import { MessageService } from "primeng/api";
@Component({
  selector: "app-specialized-trade",
  templateUrl: "./specialized-trade.component.html",
  styleUrls: ["./specialized-trade.component.scss"],
})
export class SpecializedTradeComponent {
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
  set_limit: number[] = [ 10,  15, 25, 100];
  selectedLimit: number = this.set_limit[0];
  selectedspecializedTradeNo: string = "";
  isDowngradeSelected = false;
  hideDeregisterOption: boolean;
  hideSuspendOption: boolean;
  hideCancelOption: boolean;
  hideReadOption:boolean;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  @ViewChild('fileInput') fileInput;
  @ViewChild("closeButton") closeButton: ElementRef;
  formData: any = {
    Type: "",
    Date: "",
    deregisterby: "",
    Details: "",
    // Add other form fields as needed
  };
  Privileges: any;
  uuid: any;
  today: string;
  selectedFile:File;
  fileId: any;
  listOFWorkCategory: any;
  uniqueCategory: any;
  workClassificationData: any;
  newWorkClassification: any;
  selectedspecializedTradeId: any;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  constructor(
    private router: Router,
    private service: SpecializedTradeService,
    private messageService:MessageService,
  ) {}

  ngOnInit() {
    this.getspecializedtrade();
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
      }else if (hasCancel) {
        this.hideSuspendOption = true;
        this.hideCancelOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasSuspend) {
        this.hideSuspendOption = false;
        this.hideCancelOption = true;
        this.hideReadOption = !hasRead;
      } else if (hasRead) {
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
  navigate(data: any) {
    const title = 'List Of Active Specialized Trade'
    const navigationExtras: NavigationExtras = {
      state: {
        data: data,
        title: title

      },
    };
    this.router.navigate(
      ["/specialized-trade", "specialized-trade-details"],
      navigationExtras
    );
  }
  // search filter
  searchFilter() {
    if (this.searchQuery && this.searchQuery.trim() !== "") {
      this.getspecializedtrade(this.searchQuery); // Pass search query to backend
    } else {
      this.getspecializedtrade(); // Fetch all data
    }
  }
  saveSpecializedTrade(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.Savedata();
  }
  
// Method to handle the "Save" button click event
Savedata() {
  if (this.formData.Type === 'Suspend') {
      this.savedSuspend();
  } else if (this.formData.Type === 'Cancel') {
      this.savedCancelled();
  }
}
showErrorMessage:boolean=false
  //Getting the specialized list for displaying in the table
  getspecializedtrade(searchQuery?: string) {
    const specializedtrade = {
      viewName: "specializedTrade",
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      condition: searchQuery
        ? [
            {
              field: "specializedTradeNo",
              value: `%${searchQuery}%`,
              condition: "like",
              operator: " AND "
          },
          {
              field: "name",
              value: `%${searchQuery}%`,
              condition: " like ",
              operator: " OR "
          }
          ]
        : [],
    };
    this.service.ListOfSpecializedTrade(specializedtrade).subscribe(
      (response: any) => {
        this.showErrorMessage=false
        this.loading=false
        this.Tabledata = response.data;
        this.total_records = response.totalCount;
        this.totalPages = Math.ceil(this.total_records / this.pageSize);
      },
      (error) => {
        this.showErrorMessage=true
        this.loading=false
      }
    );
  }

  getid(specializedTradeNo: any,specializedTradeId) {
    this.selectedspecializedTradeNo = specializedTradeNo;
    this.selectedspecializedTradeId = specializedTradeId
  }
  //method to upload the file
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
        this.uploadFileForSpecializedTrade();
      }
    }
  }
  uploadFileForSpecializedTrade() {
    this.service.uploadFile(this.selectedFile,).subscribe(response => {
      this.fileId = response;
    }, error => {
    });
  }

  checkedItems: Map<string, Set<string>> = new Map<string, Set<string>>();
  unCheckItem: any[] = [];
  unCheckedItems: any[] = [];
  disabledItems: Set<number> = new Set<number>();
  
  onChangeCheckBox(data: any, event: Event) {
    const inputElement = event.target as HTMLInputElement; // Cast the target to HTMLInputElement
    if (!inputElement.checked) {
      this.unCheckItem.push(data);
    } else {
      this.unCheckItem = this.unCheckItem.filter(item => item.specializedTradeWorkCategoryId !== data.specializedTradeWorkCategoryId);
    }
  }
  uncheck(data){
  const unCheck = false;
      this.service.uncheckCalssification(data.specializedTradeWorkCategoryId, this.selectedspecializedTradeId, unCheck).subscribe((response) => {
        console.log('uncheckservice',response)
      
      }, (Error) => {
      })
    }
  
  // //save savedSuspend
savedSuspend() {
  if (this.formData.Date) {
    const selectedDate = new Date(this.formData.Date);

    // Get current time in UTC
    const nowUTC = new Date();
    const bhutanOffset = 6; // Bhutan is UTC+6
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);

    // Attach Bhutan time to the selected date
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());

    // Format to ISO string
    this.formData.Date = selectedDate.toISOString();
  }

  const suspendDetail = {
    type: this.formData.Type,
    suspendDate: this.formData.Date,
    suspendDetails: this.formData.Details,
    suspendBy: this.uuid,
    specializedTradeNo: this.selectedspecializedTradeNo,
    fileId: this.fileId
  };

  // Step 1: Save suspension locally
  this.service.saveSuspendDetails(suspendDetail).subscribe({
    next: (response: any) => {
      // Step 2: Call second endpoint in G2C system
      const suspendPayload = {
        cdbNos: [this.selectedspecializedTradeNo], // Array format
        firmType: 'Specialized-Trade'
      };

      this.service.suspendedIng2cSystem(suspendPayload).subscribe({
        next: (g2cResponse: any) => {
          this.closeButton.nativeElement.click();
          this.showSuspendedMessage();
          setTimeout(() => {
            this.getspecializedtrade(); // Refresh list
          }, 500);
        },
        error: (err: any) => {
          this.errorMessage = 'Suspension in G2C system failed: ' + (err.error?.error || 'Unknown error');
        }
      });
    },
    error: (error: any) => {
      this.show500Message();
      this.errorMessage = 'Local save failed: ' + (error.error?.error || 'Unknown error');
    }
  });
}

    showSuspendedMessage() {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Specialized Trade Suspended successfully' });
    }
    show500Message() {
      this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
    }
  //method to save cancelled
 savedCancelled() {
  if (this.formData.Date) {
    // Convert the selected date to Bhutan time
    const selectedDate = new Date(this.formData.Date);
    const nowUTC = new Date();
    const bhutanOffset = 6; // Bhutan is UTC+6
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
    this.formData.Date = selectedDate.toISOString(); // Still in UTC format
  }

  const cancelledDetail = {
    type: this.formData.Type,
    cancelledDate: this.formData.Date,
    cancelledDetails: this.formData.Details,
    cancelledBy: this.uuid,
    specializedTradeNo: this.selectedspecializedTradeNo,
    fileId: this.fileId
  };

  // Step 1: Save cancellation locally
  this.service.saveCancelledDetails(cancelledDetail).subscribe({
    next: () => {
      // Step 2: Call G2C cancel API
      const g2cPayload = {
        cdbNos: [this.selectedspecializedTradeNo],
        firmType: 'Specialized-Trade'
      };

      this.service.cancelledIng2cSystem(g2cPayload).subscribe({
        next: () => {
          this.closeButton.nativeElement.click();
          this.showCancelledMessage();
          setTimeout(() => {
            this.getspecializedtrade(); // Refresh the list
          }, 500);
        },
        error: (g2cError: any) => {
          this.errorMessage = 'G2C cancellation failed: ' + (g2cError.error?.error || 'Unknown error');
        }
      });
    },
    error: (error: any) => {
      this.show500Message();
      this.errorMessage = 'Local cancellation failed: ' + (error.error?.error || 'Unknown error');
    }
  });
}

    showCancelledMessage() {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Specialized Trade  Cancelled successfully' });
    }
    
    cancel(actionForm: NgForm) {
      this.isDowngradeSelected = false;
      actionForm.resetForm(); // Reset the form using Angular's form reset method
      this.resetModalData(); // Reset additional modal data
      this.fileInput.nativeElement.value = '';
      this.fileSizeExceeded = false;
      this.fileTypeInvalid= false
      this.disabledItems.clear();
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
    this.getspecializedtrade();
    // console.log('loading')
  }
  previousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getspecializedtrade();
    }
  }
  nextPage() {
    if (this.pageNo < this.totalPages) {
      this.pageNo++;
      this.getspecializedtrade();
    }
  }
  goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getspecializedtrade();
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
