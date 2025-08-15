import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ArchitectService } from '../../service/architect.service';
import { NavigationExtras, Router } from '@angular/router';
import { NgForm, NgModel } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-architect',
    templateUrl: './architect.component.html',
    styleUrls: ['./architect.component.scss'],
})
export class ArchitectComponent implements OnInit {
    searchQuery: any;
    loading: boolean = true;
    Tabledata: any[] = [];
     set_limit: number[] = [ 10,  15, 25, 100];
    selectedLimit: number = this.set_limit[0];
    fileSizeExceeded: boolean = false;
    maxFileSizeMB: number = 2; // Maximum file size in MB
    maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
    pageSize: number = 10;
    pageNo: number = 1;
    total_records: number = 0;
    totalPages: number = 0;
    hideDeregisterOption: boolean;
    hideSuspendOption: boolean;
    hideCancelOption: boolean;
    hideReadOption: boolean;
    shouldShowActionButtons: boolean;
    @ViewChild('fileInput') fileInput;
    @ViewChild('closeButton') closeButton: ElementRef;
    showErrorMessage:boolean=false
    selectedarchitectNo: any;
    formData: any = {
        Type: '',
        Date: '',
        deregisterby: '',
        Details: '',
    };
    errorMessage: any;
    receivedPrivileges: any;
    sessionDataForCrps: any;
    Privileges: any;
    uuid: any;
    today: string;
    selectedFile:File;
    fileId: any;
    allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
    fileTypeInvalid: boolean;
    constructor(
        private router: Router,
        private service: ArchitectService,
        private messageService:MessageService,
    ) {
    }
      
    ngOnInit() {
        this.getArchitectList();
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
    //hide and show base on permission
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
        } else {
            this.hideSuspendOption =  hasCancel;
            this.hideCancelOption = hasSuspend;
            this.hideReadOption = !hasRead;
        }
        return (hasRead || hasSuspend || hasCancel);
      }

    //function to navigate to the another page.
    navigate(data: any) {
        const title = 'List Of Active Architect'
        const navigationExtras: NavigationExtras = {
            state: {
                data: data,
                title:title
            },
        };
        this.router.navigate(
            ['/architect', 'architect-detail'],
            navigationExtras
        );
    }
     //validation 
     saveArchitecture(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.Savedata();
  }
  resetForm() {
    this.formData = {
      Type: '',
      Date: '',
      deregisterby: '',
      Details: ''
    };
  }
    // Method to handle the "Save"
    Savedata() {
        if (this.formData.Type === 'Suspend') {
            this.savedSuspend();
        } else if (this.formData.Type === 'Cancel') {
            this.savedCancelled();
        }
    }
    Searchfilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.getArchitectList(this.searchQuery); 
        } else {
            this.getArchitectList(); 
        }
    }
    //get architect list
    getArchitectList(searchQuery?: string) {
        const architect = {
            viewName: 'architect',
            pageSize: this.pageSize,
            pageNo: this.pageNo,
            condition: searchQuery
                ? [
                    {
                        field: "architectNo",
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
                  ]
                : [],
        };
        this.service.getListOfArchitect(architect).subscribe(
            (response: any) => {
                this.showErrorMessage=false
                this.loading=false
                this.Tabledata = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize); // Calculate total pages
            },
            (error) => {
                this.showErrorMessage=true
                this.loading=false
                console.error('Error fetching architect list:', error);
            }
        );
    }
    //GET BY ID
    getid(architectNo: any) {
        this.selectedarchitectNo = architectNo;
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
        this.UploadFileForArchitect();
      }
    }
   }
     UploadFileForArchitect() {
        this.service.uploadFile(this.selectedFile,).subscribe(response => {
          this.fileId = response;
          // this.loading = false;
        }, error => {
            // this.loading = false;
        });
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

            // Format to ISO string
            this.formData.Date = selectedDate.toISOString(); // UTC format
        }

        const suspendDetail = {
            type: this.formData.Type,
            suspendDate: this.formData.Date,
            suspendDetails: this.formData.Details,
            suspendBy: this.uuid,
            architectNo: this.selectedarchitectNo,
            fileId: this.fileId
        };

        // First API call
        this.service.saveSuspendDetails(suspendDetail).subscribe({
            next: (response: any) => {
            // Second API call after save
            const suspendPayload = {
                cdbNos: [this.selectedarchitectNo], // Array format like contractors
                firmType: 'Architect'
            };

            this.service.suspendedIng2cSystem(suspendPayload).subscribe({
                next: (suspendResponse: any) => {
                this.closeButton.nativeElement.click();
                this.showSuspendMessage();
                setTimeout(() => {
                    this.getArchitectList();
                }, 500);
                },
                error: (err) => {
                this.errorMessage = 'Suspension failed: ' + (err.error?.error || 'Unknown error');
                }
            });
            },
            error: (error: any) => {
            this.show500Message();
            this.errorMessage = 'Save failed: ' + (error.error?.error || 'Unknown error');
            }
        });
}

   
            showSuspendMessage() {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Architect suspended successfully' });
            }
            show500Message() {
                this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
            }

            //save cancelled
           savedCancelled() {
            if (this.formData.Date) {
                const selectedDate = new Date(this.formData.Date);
                // Attach Bhutan time to the selected date
                const nowUTC = new Date();
                const bhutanOffset = 6;
                const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
                selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
                this.formData.Date = selectedDate.toISOString();
            }

            const cancelledDetails = {
                type: this.formData.Type,
                cancelledDate: this.formData.Date,
                cancelledDetails: this.formData.Details,
                cancelledBy: this.uuid,
                architectNo: this.selectedarchitectNo,
                fileId: this.fileId
            };

            // Step 1: Save cancellation locally
            this.service.saveCancelledDetails(cancelledDetails).subscribe({
                next: (response: any) => {
                // Step 2: Also cancel in G2C system
                this.service.cancelledIng2cSystem({
                    cdbNos: [this.selectedarchitectNo], // ensure it's an array
                    firmType: 'Architect'               // firm type for architect
                }).subscribe({
                    next: () => {
                    // Both calls successful
                    this.closeButton.nativeElement.click();
                    this.showCancelledMessage();
                    setTimeout(() => {
                        this.getArchitectList(); // refresh list
                    }, 1000);
                    },
                    error: (g2cError: any) => {
                     this.showCancelledg2cMessage();
                    }
                });
                },
                error: (localError: any) => {
                this.errorMessage = 'Local cancellation failed: ' + (localError.error?.error || 'Unknown error');
                this.show500Message();
                console.error('Local cancellation error', localError);
                }
            });
            }

       
            showCancelledMessage() {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Architect cancelled successfully' });
            }
             showCancelledg2cMessage() {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'G2C cancellation failed' });
            }
          

            openModal(event: Event) {
                event.stopPropagation();
            }
            // Method to set limit value
            setLimitValue(value: any) {
                this.pageSize = parseInt(value);
                this.pageNo = 1;
                //this.loading=true
                this.getArchitectList();
                // console.log('loading')
            }
            previousPage() {
                if (this.pageNo > 1) {
                    this.pageNo--;
                    this.getArchitectList();
                }
            }
            nextPage() {
                if (this.pageNo < this.totalPages) {
                    this.pageNo++;
                    this.getArchitectList();
                }
            }
            goToPage(pageSize: number) {
                if (pageSize >= 1 && pageSize <= this.totalPages) {
                    this.pageNo = pageSize;
                    this.getArchitectList();
                }
            }
            range(totalPages: number): number[] {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
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
