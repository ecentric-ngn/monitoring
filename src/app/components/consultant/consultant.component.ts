import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ConsultantService } from '../../service/consultant.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-consultant',
  templateUrl: './consultant.component.html',
  styleUrls: ['./consultant.component.scss']
})
export class ConsultantComponent {
  searchQuery: string;
  totalPages: number = 0;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  errorMessage: any;
  loading: boolean = true;
  total_records: number = 0;
  Tabledata: any[] = [];
  pageSize: number = 10;
  pageNo: number = 1;
  set_limit: number[] = [ 10,  15, 25, 100];
  selectedLimit: number = this.set_limit[0];
  selectedconsultantNo: string = '';
  selectedconsultantId: string = '';
  showdeleteMessage: boolean = false;
  hideDowngradeOption: boolean;
  hideSuspendOption: boolean;
  hideReadOption: boolean;
  hideCancelOption: boolean;
  shouldShowActionButtons: boolean;
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('fileInput') fileInput;
  formData: any = {
    Type: '',
    Date: '',
    deregisterby: '',
    Details: ''
  };
  Privileges: any;
  uuid: any;
  today: string;
  workClassificationData: any[] = [];
  isDowngradeSelected = false;
  newWorkClassification: any;
  listOFWorkCategory: any;
  selectedFile:File;
  fileId: any;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  constructor(private router: Router, private service: ConsultantService, 
    private messageService:MessageService,
  ) {
  }
  ngOnInit() {
    this.getActiveConsultant();
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
    this.getWorkClassification(this.selectedconsultantId);
  }
}
  uniqueWorkCategories: any
  getWorkClassification(selectedconsultantId: any): void {
    const contractor = {
      consultantId: this.selectedconsultantId
    };
    this.service.getWorkClassification(contractor).subscribe(
      (response: any) => {
        this.workClassificationData = response;
        this.uniqueWorkCategories = this.getUniqueWorkCategories(this.workClassificationData);
        this.initializeCheckedItems()
        this.getContractorType()
      },
      (error) => {
      }
    );
  }

  getUniqueWorkCategories(data) {
    const uniqueCategories = [];
    const workCategorySet = new Set();
    data.forEach(item => {
      if (!workCategorySet.has(item.workCategory)) {
        workCategorySet.add(item.workCategory);
        uniqueCategories.push(item);
      }
    });
    return uniqueCategories;
  }

  getContractorType() {
    const type = 'consultant';
    this.service.getClassificationOfConsultant(type).subscribe(
      (response: any) => {
        this.newWorkClassification = response.workClassification;
        this.listOFWorkCategory = response.workCategory;
      },
      (error) => {
      }
    );
  }

  //function to navigate to the another page.
  navigate(data: any) {
    const title = 'List of Active Consultant'
    const navigationExtras: NavigationExtras = {
      state: {
        data: data,
        title:title
      }
    };
    this.router.navigate(['/consultant', 'consultant-details'], navigationExtras);
  }
  dateValidation() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');
    this.today = `${yyyy}-${mm}-${dd}`;
  }
  //role
  consultantID:any;
  shouldShowActionButton(id): boolean {
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
  //validation 
  SaveConsultant(actionForm) {
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
      this.getActiveConsultant(this.searchQuery); // Pass search query to backend
    } else {
      this.getActiveConsultant(); // Fetch all data
    }
  }
  showErrorMessage:boolean=false
  //Getting the consultant list for displaying in the table
  getActiveConsultant(searchQuery?: string) {
    const consultant = {
      "viewName": "consultant",
      "pageSize": this.pageSize,
      "pageNo": this.pageNo,
      "condition": searchQuery ? [
        {
          field: "consultantNo",
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
    this.service.getListOfConsultant(consultant).subscribe((response: any) => {
      this.showErrorMessage=false
      this.loading=false
      this.Tabledata = response.data.map((consultant: any) => ({
        ...consultant,
        OwnerDetails: consultant.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
    }));
      this.total_records = response.totalCount;
      this.totalPages = Math.ceil(this.total_records / this.pageSize);
    }, (error) => {
      this.showErrorMessage=true
      this.loading=false
    })
  }
  getid(consultantNo: any, consultantId: any, id:any) {
    this.selectedconsultantNo = consultantNo;
    this.selectedconsultantId = consultantId;
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
        this.UploadFileForConsultant();
      }
    }
  }
  UploadFileForConsultant() {
    this.service.uploadFile(this.selectedFile,).subscribe(response => {
      this.fileId = response;
    }, error => {
    });
  }
  initializeCheckedItems() {
    // Get unique work categories
    this.uniqueWorkCategories = this.workClassificationData
      .map(item => item.workCategory)
      .filter((value, index, self) => self.indexOf(value) === index);
    // Initialize checked items map
    this.uniqueWorkCategories.forEach(category => {
      const checkedSet = new Set<string>();
      this.checkedItems.set(category, checkedSet);

      // Add existing classifications to checked set
      this.workClassificationData.forEach(item => {
        if (item.workCategory === category && item.existingWorkClassification) {
          checkedSet.add(item.existingWorkClassification);
        }
      });
    });
  }
  isCheckboxDisabled(data: any, workClassification: string): boolean {
    return !this.isChecked(data.workCategory, workClassification);
  }
  getFilteredWorkClassification(workCategory: string) {
    const prefix = workCategory.charAt(0);
    return this.newWorkClassification.filter(item => item.workClassification.startsWith(prefix));
  }
  checkedItems: Map<string, Set<string>> = new Map<string, Set<string>>();
  uncheckedItems: Array<{workCategoryId: string, workClassificationId: string}> = [];
  
  isChecked(workCategory: string, workClassification: string): boolean {
    const checkedSet = this.checkedItems.get(workCategory);
    return checkedSet ? checkedSet.has(workClassification) : false;
  }
  
  onChangeCheckBox(workCategory: any, workClassification: any, event: Event) {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
  
    if (isChecked) {
      // Add to checkedItems
      if (!this.checkedItems.has(workCategory.id)) {
        this.checkedItems.set(workCategory.id, new Set<string>());
      }
      this.checkedItems.get(workCategory.id)?.add(workClassification.id);
  
      // Remove from uncheckedItems if present
      this.uncheckedItems = this.uncheckedItems.filter(item => 
        item.workCategoryId !== workCategory.id || item.workClassificationId !== workClassification.id);
    } else {
      // Store unchecked items
      this.uncheckedItems.push({
        workCategoryId: workCategory.id,
        workClassificationId: workClassification.id
      });
  
      // Remove from checkedItems
      if (this.checkedItems.has(workCategory.id)) {
        this.checkedItems.get(workCategory.id)?.delete(workClassification.id);
        if (this.checkedItems.get(workCategory.id)?.size === 0) {
          this.checkedItems.delete(workCategory.id);
        }
      }
    }
  }
  // Method to save the downgrade consultant
  saveDowngrade() {
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
    const downgradeDetail = {
      type: this.formData.Type,
      date: this.formData.Date,
      remarks: this.formData.Details,
      createdBy: this.uuid,
      consultantNo: this.selectedconsultantNo,
      fileId: this.fileId
    };
    // Save deregister details
    this.service.saveDeregisterdetails(downgradeDetail).subscribe((response: any) => {
      // Call the service method for each unchecked item
      this.uncheckedItems.forEach(item => {
        const unCheck = false;
        this.service.toggle(item.workCategoryId, item.workClassificationId, this.selectedconsultantId, unCheck)
        .subscribe((response) => {
          setTimeout(() => {
            this.showdeleteMessage = true;
            setTimeout(() => {
              this.showdeleteMessage = false;
            }, 500);
          });
        }, (error) => {
          console.log(error);
        });
      });
      // Clear unchecked items after processing
      this.uncheckedItems = [];
      // Close button and show message
      setTimeout(() => {
        this.closeButton.nativeElement.click();
        this.showDowngradeMessage();
        setTimeout(() => {
          this.getActiveConsultant();
        }, 1000);
      });
  
    }, (error: any) => {
      console.error("Error:", error);
      this.errorMessage = error.error.error;
    });
  }
  
showDowngradeMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Consultant downgraded successfully' });
  } 
  // //save savedSuspend  
  savedSuspend() {
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
    const suspendDetail = {
      type: this.formData.Type,
      suspendDate: this.formData.Date,
      suspendDetails: this.formData.Details,
      suspendBy: this.uuid,
      consultantNo: this.selectedconsultantNo,
      fileId:this.fileId

    };
    this.service.saveSuspendDetails(suspendDetail).subscribe({
      next: (response: any) => {
        this.closeButton.nativeElement.click();
        this.showSuspendMessage();
        setTimeout(() => {
          this.getActiveConsultant();
        }, 500); // Adjust the delay (in milliseconds) if needed
      },
      error: (error: any) => {
        this.show500Message()
        this.errorMessage = error.error.error;
      }
    });
  }

  showSuspendMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Consultant suspended successfully' });
  }
  show500Message() {
    this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
  }
  //save cancelled
  savedCancelled() {
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
      type:this.formData.Type,
      cancelledDate: this.formData.Date,
      cancelledDetails: this.formData.Details,
      cancelledBy: this.uuid,
      consultantNo: this.selectedconsultantNo,
      fileId:this.fileId
    };
    this.service.saveCancelledDetails(cancelledDetail).subscribe({
      next: (response: any) => {
        this.closeButton.nativeElement.click();
        this.showCanceldMessage();
        setTimeout(() => {
          this.getActiveConsultant();
        }, 500); 
      },
      error: (error: any) => {
        this.show500Message()
        this.errorMessage = error.error.error;
      }
    });
  }

showCanceldMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Consultant cancelled successfully' });
}

  openModal(event: Event) {
    event.stopPropagation();
  }
  // Method to set limit value
  setLimitValue(value: any) {
    this.pageSize = parseInt(value);
    this.pageNo = 1;
    this.getActiveConsultant();

  }
  previousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getActiveConsultant();
    }
  }
  nextPage() {
    if (this.pageNo < this.totalPages) {
      this.pageNo++;
      this.getActiveConsultant();
    }
  }
  goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getActiveConsultant();
    }
  }
  cancel(actionForm: NgForm) {
    actionForm.resetForm(); // Reset the form using Angular's form reset method
    this.resetModalData(); // Reset additional modal datafileInput.value = ''; // Reset the file input
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
    this.isDowngradeSelected = false;
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
      
