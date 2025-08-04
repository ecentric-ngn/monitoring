import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ContractorService } from '../../../service/contractor.service';

@Component({
    selector: 'app-suspend-contractor',
    templateUrl: './suspend-contractor.component.html',
    styleUrls: ['./suspend-contractor.component.scss'],
})
export class SuspendContractorComponent {
    loading: boolean = true;
    searchQuery: any;
    typeOptions: any;
    errorMessage: any;
    fileSizeExceeded: boolean = false;
    maxFileSizeMB: number = 2; // Maximum file size in MB
    maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
    totalPages: number = 0;
    TableData: any[] = [];
    viewName: any;
    receivedData: any;
    pageSize: number = 10;
    pageNo: number = 1;
    data: any;
     set_limit: number[] = [ 10,  15, 25, 100];
    selectedLimit: number = this.set_limit[0];
    selectedContractorNo: string = '';
    total_records: number = 0;
    formData: any = {
        Type: '',
        Date: '',
        deregisterby: '',
        Details: '',
        // Add other form fields as needed
    };
    selectedImages!: FileList;
    shouldShowActionButtons: boolean;
    allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
    fileTypeInvalid: boolean;
    @ViewChild('closeButton') closeButton: ElementRef;
    @ViewChild('fileInput') fileInput;
    receivedPrivileges: any;
    sessionDataForCrps: any;
    Privileges: any;
    uuid: any;
    today: string;
    file: any;
    selectedFile:File;
    fileId: any;
    entityId: any;
    entityType: any;
    constructor(
        private router: Router,
        private service: ContractorService,
        private messageService:MessageService,
    ) {
    
    }
    ngOnInit() {
        this.getSuspendContractorList();
        this.dateValidation();
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
        const hasreInstate = this.Privileges && 
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
        const title = 'List Of Suspended Contractor'
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
            this.getSuspendContractorList(this.searchQuery); // Pass search query to backend
        } else {
            this.getSuspendContractorList(); // Fetch all data
        }
    }
    getid(contractorNo: any) {
        this.selectedContractorNo = contractorNo;
    }
    // Method to reload the page
    reloadPage() {
        window.location.reload();
    }
     //checking validation
     ReinstateContractor(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.reinstateSuspendedContractor();
  }
  resetForm() {
    this.formData = {
      Type: '',
      Date: '',
      deregisterby: '',
      Details: ''
    };
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
        this.selectedFile = file;
        this.uploadFileForContractor();
      }
    }
  }
  uploadFileForContractor() {
    this.service.uploadFile(this.selectedFile).subscribe(response => {
      this.fileId = response;
      // this.loading = false;
    }, error => {
        // this.loading = false;
    });
  }
//   reinstateSuspendedContractor(){
//      if (this.formData.Date) {
//       // Parse the selected date
//       const selectedDate = new Date(this.formData.Date);
//       // Get the current time in UTC
//       const nowUTC = new Date();
//       // Calculate Bhutan Time (UTC+6)
//       const bhutanOffset = 6; // Bhutan is UTC+6
//       const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
//       // Attach the Bhutan time to the selected date
//       selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
//       // Format the selected date to ISO string with timezone offset
//       this.formData.Date = selectedDate.toISOString(); // Note: This will still be in UTC format
    
//     }
//     const suspendRegisterDetail = {
//         revokedDate: this.formData.Date,
//         revokedDetails: this.formData.Details,
//         revokedBy: this.uuid,
//         contractorNo: this.selectedContractorNo,
//         fileId:this.fileId 
//     };
//         this.service.saveSuspendReregister(suspendRegisterDetail).subscribe(
//             (response: any) => {
//                     setTimeout(() => {
//                     this.closeButton.nativeElement.click();
//                      this.showReinstatmessage();
//                     // Show the success message after the modal is closed
//                     setTimeout(() => {
//                         this.getSuspendContractorList()
//                     }, 1000);
//                     },);
//                 },
//                 (error: any) => {
//                     this.errorMessage = error.error.error;
//                 }
//                 );
//             }
reinstateSuspendedContractor() {
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
    
    const suspendRegisterDetail = {
        revokedDate: this.formData.Date,
        revokedDetails: this.formData.Details,
        revokedBy: this.uuid,
        contractorNo: this.selectedContractorNo,
        fileId: this.fileId 
    };

      const reinstatedDetail = {
        firmType: 'Contractor',
        cdbNos: this.selectedContractorNo,
    };
    this.service.saveSuspendReregister(suspendRegisterDetail).subscribe(
        (response: any) => {
            // After successful save, call the G2C approval endpoint
            this.service.approveReinstatementIng2cSystem(reinstatedDetail).subscribe(
                (g2cResponse: any) => {
                    setTimeout(() => {
                        this.closeButton.nativeElement.click();
                        this.showReinstatmessage();
                        // Show the success message after the modal is closed
                        setTimeout(() => {
                            this.getSuspendContractorList();
                        }, 1000);
                    });
                },
                (g2cError: any) => {
                    // Handle G2C system error but still proceed with the UI updates
                    console.error('G2C approval failed:', g2cError);
                    setTimeout(() => {
                        this.closeButton.nativeElement.click();
                        this.showReinstatmessage();
                        setTimeout(() => {
                            this.getSuspendContractorList();
                        }, 1000);
                    });
                }
            );
        },
        (error: any) => {
            this.errorMessage = error.error.error;
        }
    );
}
        showErrorMessage:boolean=false
        showReinstatmessage() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contractor reinstated successfully' });
        }
        
        getSuspendContractorList(searchQuery?: string) {
        const contractor = {
            viewName: 'contractorSuspended',
            pageSize: this.pageSize,
            pageNo: this.pageNo,
            condition: searchQuery
                ? [
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
                this.loading=false
                this.showErrorMessage=false
                this.TableData = response.data.map((contractor: any) => ({
                    ...contractor,
                    OwnerDetails: contractor.ownerDetails?.split(',').map(detail => detail.trim()).join(',\n') || ''
                }));
                this.TableData = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize); // Calculate total pages
            },
            (error: any) => {
                this.loading=false
                this.showErrorMessage=true
                this.closeButton.nativeElement.click();
              }
        );
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
        event.stopPropagation(); // prevent event from propagating to the parent elements
    }
    setLimitValue(value: any) {
        this.pageSize = parseInt(value); // Parse value as integer
        this.pageNo = 1;
        // Call the method to fetch data
        this.getSuspendContractorList();
    }
    previousPage() {
        if (this.pageNo > 1) {
            this.pageNo--;
            this.getSuspendContractorList();
        }
    }
    nextPage() {
        if (this.pageNo < this.totalPages) {
            // Increment pageNo to go to the next page
            this.pageNo++;

            // Fetch data for the next page
            this.getSuspendContractorList();
        }
    }
    //going to specific page
    goToPage(pageSize: number) {
        if (pageSize >= 1 && pageSize <= this.totalPages) {
            this.pageNo = pageSize;
            this.getSuspendContractorList();
        }
    }
    range(totalPages: number): number[] {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
 
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
