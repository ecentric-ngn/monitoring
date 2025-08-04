import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {SpecializedFirmService} from '../../service/specialized-firm.service'
import { NavigationExtras } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-specialized-firm',
  templateUrl: './specialized-firm.component.html',
  styleUrls: ['./specialized-firm.component.scss']
})
export class SpecializedFirmComponent {
searchQuery: any;
loading: boolean = true;
specializedFirmWorkCategoryId:any
selectedTab: string = 'registration-information';
Tabledata: any[] = [];
pageSize: number = 10;
set_limit: number[] = [ 10,  15, 25, 100];
pageNo: number = 1;
total_records: number = 0;
totalPages: number = 0;
selectedspecializedFirmNo:any;
errorMessage: any;
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
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('fileInput') fileInput;
  workClassificationData: any[] = [];
  isDowngradeSelected = false;
  newWorkClassification: any;
  listOFWorkCategory: any;
  hideDowngradeOption: boolean;
  hideSuspendOption: boolean;
  hideCancelOption: boolean;
  shouldShowActionButtons: boolean;
  hideReadOption: boolean;
  Privileges: any;
  uuid: any;
  today: string;
  selectedFile:File;
  fileId: any;
  selectedspecializedFirmId: any;
  uniqueCategory: any;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  constructor(private router: Router, 
  private service: SpecializedFirmService,
  private messageService:MessageService,
  ) {}

    ngOnInit() {
    this.getSpecializedFirm();
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

    //fetching list of work classification base on contractorNo
    onActionTypeChange(event: any): void {
      this.isDowngradeSelected = event.target.value === 'Downgrade';

      if (this.isDowngradeSelected) {
        this.getWorkClassification(this.selectedspecializedFirmId);
      }
    }
  getWorkClassification(selectedspecializedFirmId: any): void {
    const contractor = {
      specializedFirmId: this.selectedspecializedFirmId
    };
    this.service.getWorkClassification(contractor).subscribe(
      (response: any) => {
        this.workClassificationData = response;
        this.getContractorType()
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getContractorType() {
    const type = 'specializedFirm';
    this.service.getClassificationOfspecializedFirm(type).subscribe(
      (response: any) => {
        this.newWorkClassification = response.workClassification;
        this.listOFWorkCategory = response.workCategory;
        this.newCategory();
      },
      (error) => {
        console.log('Error fetching contractor type:', error);
      }
    );
  }
  newCategory() {
  this.uniqueCategory = this.listOFWorkCategory.map(category => {
    // Find if there is an existing classification for the category
    const existingClassification = this.workClassificationData.find(item => item.workCategory === category.workCategory);
    // Return the existing classification if found, otherwise return null
    return existingClassification || null;
  }).filter(category => category !== null); // Remove null values from the final list

}

  getspecializedFirmType() {
    const type = 'specializedFirm';
    this.service.getClassificationOfspecializedFirm(type).subscribe(
      (response: any) => {
        this.listOFWorkCategory = response.workCategory;
      },
      (error) => {
        // Handle error scenario
      }
    );
  }

  //}
  showReinstatmessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor Reinstate successfully' });
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
    const hasDowngrade = this.Privileges && this.Privileges.some(privilege => privilege.privilege_name === 'Downgrade');
    const hasSuspend = this.Privileges && this.Privileges.some(privilege => privilege.privilege_name === 'Suspend');
    const hasCancel = this.Privileges && this.Privileges.some(privilege => privilege.privilege_name === 'Cancel');
  
    // If the only privilege is 'Read', hide the button
    if (hasRead && !hasDowngrade && !hasSuspend && !hasCancel) {
      this.hideDowngradeOption = true;
      this.hideSuspendOption = true;
      this.hideCancelOption = true;
      return false;
    }
  
    // Set flags to hide dropdown options based on other privileges
    if (hasCancel && hasSuspend && hasDowngrade) {
      this.hideDowngradeOption = false;
      this.hideSuspendOption = false;
      this.hideCancelOption = false;
      this.hideReadOption = !hasRead;
    } else if (hasCancel && hasSuspend) {
      this.hideDowngradeOption = true;
      this.hideSuspendOption = false;
      this.hideCancelOption = false;
      this.hideReadOption = !hasRead;
    } else if (hasDowngrade && hasSuspend) {
      this.hideCancelOption = true;
      this.hideDowngradeOption = false;
      this.hideSuspendOption = false;
      this.hideReadOption = !hasRead;
    } else if (hasDowngrade && hasCancel) {
      this.hideSuspendOption = true;
      this.hideDowngradeOption = false;
      this.hideCancelOption = false;
      this.hideReadOption = !hasRead;
    } else if (hasCancel) {
      this.hideDowngradeOption = true;
      this.hideSuspendOption = true;
      this.hideCancelOption = false;
      this.hideReadOption = !hasRead;
    } else if (hasSuspend) {
      this.hideDowngradeOption = true;
      this.hideSuspendOption = false;
      this.hideCancelOption = true;
      this.hideReadOption = !hasRead;
    } else if (hasRead) {
      this.hideDowngradeOption = true;
      this.hideSuspendOption = true;
      this.hideCancelOption = true;
      this.hideReadOption = false;
    } else if (hasDowngrade) {
      this.hideDowngradeOption = false;
      this.hideSuspendOption = true;
      this.hideCancelOption = true;
      this.hideReadOption = !hasRead;
    } else {
      this.hideDowngradeOption = hasSuspend || hasCancel;
      this.hideSuspendOption = hasDowngrade || hasCancel;
      this.hideCancelOption = hasDowngrade || hasSuspend;
      this.hideReadOption = !hasRead;
    }
  
    return (hasRead || hasSuspend || hasCancel || hasDowngrade);
  }
//function to navigate to the another page.
navigate(data:any){
  const title = 'List Of Active Specialized Firm'
  const navigationExtras: NavigationExtras = {
    state: {
      data: data,
      title: title
    }
  };
  this.router.navigate(['/specialized-firm', 'specialized-firm-details'], navigationExtras);
}
  SaveSpecializedFirm(actionForm) {
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
if (this.formData.Type === 'Downgrade') {
this.saveDowngrade();
} else if (this.formData.Type === 'Suspend') {
  this.savedSuspend();
 } else if (this.formData.Type === 'Cancel') {
  this.savedCancelled();
    }
  }
  
  SearchFilter() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.getSpecializedFirm(this.searchQuery); // Pass search query to backend
    } else {
      this.getSpecializedFirm(); // Fetch all data
    }
  }
  showErrorMessage:boolean=false
 //Getting the specialized list for displaying in the table
  getSpecializedFirm(searchQuery?: string){
    const specializedfirm = {
      "viewName": "specializedFirm",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      condition: searchQuery
      ? [
          {
            field: "specializedFirmNo",
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
    this.service.getListOfSpecializedFirm(specializedfirm).subscribe((response:any)=>{
     this.showErrorMessage=false
     this.loading=false
      this.Tabledata = response.data.map((specializedFirm: any) => ({
        ...specializedFirm,
        OwnerDetails: specializedFirm.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
    }));
      this.total_records = response.totalCount;
      this.totalPages = Math.ceil(this.total_records / this.pageSize); 
    }, (error) => {
      this.showErrorMessage=true
      this.loading=false
    })
  }

  getid(specializedFirmNo: any,specializedFirmId:any){
  this.selectedspecializedFirmNo = specializedFirmNo;
  this.selectedspecializedFirmId = specializedFirmId
  
  }
  checkedItems: Map<string, Set<string>> = new Map<string, Set<string>>();
  unCheckedItems: any[] = [];
  disabledItems: Set<number> = new Set<number>();
  onChangeCheckBox(data: any, event: any): void {
    if (!event.target.checked) {
      // Add the item to unCheckedItems if unchecked
      this.unCheckedItems.push(data);
    } else {
      // Remove the item from unCheckedItems if re-checked
      this.unCheckedItems = this.unCheckedItems.filter(item => item.specializedFirmWorkCategoryId !== data.specializedFirmWorkCategoryId);
    }
  }

  unChecked(workCategory: any): void {
    const unCheck = false;
    this.service.uncheckCalssification(workCategory.specializedFirmWorkCategoryId, this.selectedspecializedFirmId, unCheck).subscribe(
      (response) => {
      },
      (error) => {
      }
    );
  }
    //save deregister
    saveDowngrade()  {
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
      const specializedfirm = {
        type: this.formData.Type,
        date: this.formData.Date,
        remarks: this.formData.Details,
        createdBy: this.uuid,
        specializedFirmNo: this.selectedspecializedFirmNo,
        fileId: this.fileId
      };
      this.service.saveDowngradedetails(specializedfirm).subscribe(
        (response: any) => {
          // Trigger unChecked method for each unchecked item
          this.unCheckedItems.forEach((item) => {
            this.unChecked(item);
          });
          // Clear the unCheckedItems array
          this.unCheckedItems = [];
          //this.unCheckedItems = [];
          this.disabledItems.clear();
          setTimeout(() => {
            this.closeButton.nativeElement.click();
            this.showDowngradeMessage();
            // Show the success message after the modal is closed
            setTimeout(() => {
              this.getSpecializedFirm();
            }, 1000);
          });
        },
        (error: any) => {
          this.errorMessage = error.error.error;
        }
      );
    }
    
    showDowngradeMessage() {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Specialized Firm downgraded successfully' });
    }
    
 // Method to reload the page
 reloadPage() {
  window.location.reload();
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
      this.UploadFileForspecializedFirmN();
    }
  }
}
UploadFileForspecializedFirmN() {
  this.service.uploadFile(this.selectedFile,).subscribe(response => {
    this.fileId = response;
    // this.loading = false;
  }, error => {
      // this.loading = false;
  });
}
    // //save savedSuspend  
 savedSuspend() {
  if (this.formData.Date) {
    const selectedDate = new Date(this.formData.Date);
    const nowUTC = new Date();
    const bhutanOffset = 6;
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
    this.formData.Date = selectedDate.toISOString();
  }

  const suspendDetail = {
    type: this.formData.Type,
    suspendDate: this.formData.Date,
    suspendDetails: this.formData.Details,
    suspendBy: this.uuid,
    specializedFirmNo: this.selectedspecializedFirmNo,
    fileId: this.fileId
  };

  this.service.saveSuspendDetails(suspendDetail).subscribe({
    next: () => {
      const suspendPayload = {
        cdbNos: [this.selectedspecializedFirmNo],
        firmType: 'Specialized-firm' // You can change this if dynamic
      };
      this.service.suspendedIng2cSystem(suspendPayload).subscribe({
        next: () => {
          this.closeButton.nativeElement.click();
          this.showSuspendMessage();

          setTimeout(() => {
            this.getSpecializedFirm();
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
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Specialized Firm  Suspended successfully' });
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
    specializedFirmNo: this.selectedspecializedFirmNo,
    fileId: this.fileId
  };

  this.service.saveCancelledDetails(cancelledDetail).subscribe({
    next: () => {
      const cancelPayload = {
        cdbNos: [this.selectedspecializedFirmNo],
        firmType: 'specialized-firm' // Can use this.formData.Type if dynamic
      };

      this.service.cancelledIng2cSystem(cancelPayload).subscribe({
        next: () => {
          this.closeButton.nativeElement.click();
          this.showCancelledMessage();

          setTimeout(() => {
            this.getSpecializedFirm();
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

     showCancelledMessage() {
       this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Specialized Firm  Cancelled successfully' });
     }
     openModal(event: Event) {
      event.stopPropagation(); 
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
    // Method to set limit value
 setLimitValue(value: any) {
  this.pageSize = parseInt(value); 
  this.pageNo = 1; 
  //this.loading=true
  this.getSpecializedFirm();
 // console.log('loading')
  
} 
    previousPage() {
      if (this.pageNo > 1) {
        this.pageNo--;
        this.getSpecializedFirm();
      }
     }
     nextPage() {
      if (this.pageNo < this.totalPages) {
        this.pageNo++;
        this.getSpecializedFirm();
      }
    }
    goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getSpecializedFirm();
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
