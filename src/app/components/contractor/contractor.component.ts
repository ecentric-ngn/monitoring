import {  Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {  NavigationExtras, Router } from "@angular/router";
import { ContractorService } from "../../service/contractor.service";
import { MessageService } from 'primeng/api';
@Component({
  selector: "app-contractor",
  templateUrl: "./contractor.component.html",
  styleUrls: ["./contractor.component.scss"],
})
export class ContractorComponent {
  searchQuery: any;
  errorMessage: any;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  loading: boolean = true;
  TableData: any[] = [];
  pageSize: number = 10;
  pageNo: number = 1;
  total_records: number = 0;
  totalPages: number = 0;
  pagesArray: number[] = [];
  set_limit: number[] = [ 10,  15, 25, 100];
  selectedLimit: number = this.set_limit[0];
  selectedContractorNo: string = "";
  formData: any = {
    Type: "",
    Date: "",
    deregisterby: "",
    Details: "",
  };
  @ViewChild('fileInput') fileInput;
  @ViewChild('closeButton') closeButton: any;
  allItems: any[];
  hideDowngradeOption: boolean;
  hideSuspendOption: boolean;
  hideCancelOption: boolean;
  hideReadOption:boolean
  shouldShowActionButtons: boolean;
  submenuData: any;
  Privileges: any;
  uuid: string;
  today = new Date().toISOString().split('T')[0];  
  workClassificationData: any[] = [];
  isDowngradeSelected = false;
  selectedContractorId: any;
  newWorkClassification: any;
  listOFWorkCategory:any;
  workCategoryId: any;
  selectedFile:File;
  fileId: any;
  cancelledFormData: { contractorType: any; contractorCancelledDate: any; cancelledDetails: any; contractorCancelledBy: string; contractorNo: string; };
  entityType: any;
  entityId: any;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  formattedOwnerDetails: string[] = [];
  showErrorMessage:boolean=false
  constructor(
    private router: Router,
    private service: ContractorService,
    private messageService:MessageService,
  ) {}

  ngOnInit() {
   this.getActiveContractorList() 
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
  onActionTypeChange(selectedType: string) {
    this.isDowngradeSelected = selectedType === 'Downgrade';
    if (this.isDowngradeSelected) {
      this.getWorkClassification(this.selectedContractorId);
    }
  }
  getWorkClassification(selectedContractorId: any): void {
    const contractor = { contractorId: this.selectedContractorId };
    this.service.getWorkClassification(contractor).subscribe(
      (response: any) => {
        this.workClassificationData = response;
        this.getContractorType();
      },
      (error) => {
      }
    );
  }

  getContractorType() {
    const type = 'contractor';
    this.service.getClassificationOfContractor(type).subscribe(
      (response: any) => {
        this.newWorkClassification = response.workClassification;
        
        this.listOFWorkCategory = response.workCategory;
      },
      (error) => {
      }
    );
  }
  filteredClassifications(existingClass: string): any[] {
    // Get all classifications from the service or default to an empty array
    const allClassifications = this.newWorkClassification || [];
  
    // Check if the existing classification is 'R-Registered'
    if (existingClass === 'R-Registered') {
      // If existing classification is 'R-Registered', return only 'R-Registered' classifications
      return allClassifications.filter(c => c.workClassification === 'R-Registered');
    }
  
    // Define the hierarchy for classification levels
    const hierarchy = ['S-Small', 'M-Medium', 'L-Large'];
    // Find the index of the existing classification in the hierarchy
    const index = hierarchy.indexOf(existingClass);
    // and exclude 'R-Registered' from the list
    return allClassifications.filter(c => {
      // Find the index of the classification in the hierarchy
      const classificationIndex = hierarchy.indexOf(c.workClassification);
      // Include classification if its index is less than or equal to the existing classification index
      // and if it's not 'R-Registered'
      return classificationIndex <= index && c.workClassification !== 'R-Registered';
    });
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
  //Method to navigate to anothewr pages
navigate(data: any) {
  const title = 'List of Active Contractor'
  const navigationExtras: NavigationExtras = {
    state: {
      data: data,
      title:title
    },  
  };
  this.router.navigate(
    ["/contractor", "contractor-details"],
    navigationExtras
  );
}
Searchfilter() {
    if (this.searchQuery && this.searchQuery.trim() !== "") {
      this.getActiveContractorList(this.searchQuery);
    } else {
      this.getActiveContractorList(); // Fetch all data
    }
  }
  getActiveContractorList(searchQuery?: string) {
    const contractor = {
        viewName: "contractor",
        pageSize: this.pageSize,
        pageNo: this.pageNo,
        condition: searchQuery
            ? [
                {
                    field: "contractorNo",
                    value: `%${searchQuery}%`,
                    condition: "like",
                    operator: "AND"
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
        this.loading = false;
        this.showErrorMessage=false
          this.TableData = response.data.map((contractor: any) => ({
              ...contractor,
              OwnerDetails: contractor.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
          }));
          this.total_records = response.totalCount;
          this.totalPages = Math.ceil(this.total_records / this.pageSize);
      
      },
      (error) => {
        this.loading = false;
        this.showErrorMessage=true
      }
  );
}
  getid(contractorNo: any,contractorId:any) {
    this.selectedContractorNo = contractorNo;
    this.selectedContractorId = contractorId;
  }
  //validation 
  SaveData(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
   this.SaveContractor();
  }
 
  //  Method to handle the "Save" button click event
  SaveContractor() {
    if (this.formData.Type === "Downgrade") {
      this.saveDownGrade();
    } else if (this.formData.Type === "Suspend") {
      this.savedSuspend();
    } else if (this.formData.Type === "Cancel") {
      this.savedCancelled();
    }
  }
  onClassificationChange(index: number, event: any, id: any, name: any): void {
    const selectedCategoryElement = event.target.selectedOptions[0];
    let contractorWorkCategoryId = parseInt(selectedCategoryElement.getAttribute('data-category-id'), 10); // Initialize with current value
    // Handle dynamic assignment of contractorWorkCategoryId based on name if id is falsy
    if (!id) {
      const listOfWorkClassification: any[] = JSON.parse(JSON.stringify(this.listOFWorkCategory));
      // Find the data object where workCategory matches name
      const workCategoryData = listOfWorkClassification.find(data => data.workCategory === name);
      if (workCategoryData) {
        contractorWorkCategoryId = workCategoryData.id; // Assign found ID to contractorWorkCategoryId
      }
    } else {
      // Handle else case if needed
    }
  }
  isLoading = false;
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
    this.service.uploadFile(this.selectedFile).subscribe(
      response => {
        this.fileId = response;
      },
      error => {
      }
    );
  }
  //method to save the downgrade contractor
   saveDownGrade() {
    let formattedDate;
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
      // Format the date to ISO string for suspension details
      formattedDate = selectedDate.toISOString(); 
    }
    const downGradeDetail= this.workClassificationData.map(data => {
      return {
        contractorId: this.selectedContractorId,
        workClassificationId: data.contractorWorkClassificationId,
        workCategoryId: data.contractorWorkCategoryId,
        id: data.tableId
        
      }; 
    });
    const payload = {
      contractorWorkClassifications: downGradeDetail,
      date:formattedDate,// Assuming formData.Date holds the date value
      remarks: this.formData.Details, // Assuming formData.Details holds the remarks
      createdBy: this.uuid,
      fileId:this.fileId,
      type:this.formData.Type,
    };
   
    this.service.saveDownGradedetails(payload).subscribe(
      (response: any) => {
        this.entityType=response.entityType
        this.entityId=response.contractorCancelAdverseCommentRecordId
        setTimeout(() => {
          this.closeButton.nativeElement.click();
          // Show the success message after the modal is closed
          setTimeout(() => {
            this.showDowngradeMessage();
            this.getActiveContractorList()
          }, 500);
        },);
      },
      (error: any) => {
        this.errorMessage = error.error.error;
      }
    );
  }
  //to show sucessful downgrade message
showDowngradeMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor downgraded successfully' });
  }

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
    contractorType: this.formData.Type,
    contractorSuspendDate: this.formData.Date,
    suspendDetails: this.formData.Details,
    contractorSuspendBy: this.uuid,
    contractorNo: this.selectedContractorNo,
    fileId: this.fileId
  };

  this.service.saveSuspendDetails(suspendDetail).subscribe({
    next: (response: any) => {
      // Step 2: Call suspendApplications after saving details
      const suspendPayload = {
        cdbNos: [this.selectedContractorNo], // Assuming selected contractor IDs are stored here
        firmType: 'Contractor'
      };

      this.service.suspendedIng2cSystem(suspendPayload).subscribe({
        next: (suspendResponse: any) => {
           this.closeButton.nativeElement.click();
          this.showSuspendMessage();
          setTimeout(() => {
            this.getActiveContractorList();
          }, 1000);
        },
        error: (err) => {
          this.errorMessage = 'Suspension failed: ' + (err.error?.error || 'Unknown error');
        }
      });
    },
    error: (error: any) => {
      this.errorMessage = 'Save failed: ' + (error.error?.error || 'Unknown error');
    }
  });
}

    
  
  showSuspendMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor suspended successfully' });
  }
  //method to cancel the contractor
  // savedCancelled() {
  //   if (this.formData.Date) {
  //     // Parse the selected date
  //     const selectedDate = new Date(this.formData.Date);
  //     // Get the current time in UTC
  //     const nowUTC = new Date();
  //     // Calculate Bhutan Time (UTC+6)
  //     const bhutanOffset = 6; // Bhutan is UTC+6
  //     const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
  //     // Attach the Bhutan time to the selected date
  //     selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
  //     // Format the selected date to ISO string with timezone offset
  //     this.formData.Date = selectedDate.toISOString(); // Note: This will still be in UTC format
  //   }
  //   const cancelledDetail = {
  //     contractorType: this.formData.Type,
  //     contractorCancelledDate: this.formData.Date,
  //     cancelledDetails: this.formData.Details,
  //     contractorCancelledBy: this.uuid,
  //     contractorNo: this.selectedContractorNo,
  //     fileId:this.fileId
  //   };
  //   this.cancelledFormData= cancelledDetail
  //   this.service.saveCancelledDetails(cancelledDetail).subscribe(
  //     (response: any) => {
  //       setTimeout(() => {
  //         this.closeButton.nativeElement.click();
  //         this.showCancelledMessage();
  //         // Show the success message after the modal is closed
  //         setTimeout(() => {
  //           this.getActiveContractorList()
  //         }, 1000);
  //       },);
  //     },
  //     (error: any) => {
  //       this.errorMessage = error.error.error;
  //     }
  //   );
  // }
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
    contractorType: this.formData.Type,
    contractorCancelledDate: this.formData.Date,
    cancelledDetails: this.formData.Details,
    contractorCancelledBy: this.uuid,
    contractorNo: this.selectedContractorNo,
    fileId: this.fileId
  };
  this.cancelledFormData = cancelledDetail;
  // Step 1: Save cancellation details locally
  this.service.saveCancelledDetails(cancelledDetail).subscribe({
    next: (response: any) => {
      // Step 2: Also cancel in G2C system
      this.service.cancelledIng2cSystem({
        cdbNos: [this.selectedContractorNo],  // ensure it's an array
        firmType: 'Contractor'               // or use this.formData.Type if dynamic
      }).subscribe({
        next: () => {
          // Both calls successful
          this.closeButton.nativeElement.click();
          this.showCancelledMessage();
          setTimeout(() => {
            this.getActiveContractorList();
          }, 1000);
        },
        error: (g2cError: any) => {
          this.errorMessage = 'G2C cancellation failed: ' + (g2cError.error?.error || 'Unknown error');
        }
      });
    },
    error: (localError: any) => {
      this.errorMessage = 'Local cancellation failed: ' + (localError.error?.error || 'Unknown error');
    }
  });
}

  openModal(event: Event) {
    event.stopPropagation();
  }

  showCancelledMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor cancelled successfully' });
  }
  // Method to set limit value
  setLimitValue(value: any) {
    this.pageSize = parseInt(value);
    this.pageNo = 1;
    this.getActiveContractorList();
  }
  previousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getActiveContractorList();
    }
  }
  nextPage() {
    if (this.pageNo < this.totalPages) {
      this.pageNo++;
      this.getActiveContractorList();
    }
  }
  goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getActiveContractorList();
    }
  } 
  // }
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
    this.isDowngradeSelected = false;
    
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
