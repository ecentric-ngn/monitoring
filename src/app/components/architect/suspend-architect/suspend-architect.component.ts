import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from '../../../service/app.layout.service';
import { ArchitectService } from '../../../service/architect.service';

@Component({
  selector: 'app-suspend-architect',
  templateUrl: './suspend-architect.component.html',
  styleUrls: ['./suspend-architect.component.scss']
})
export class SuspendArchitectComponent {
  loading: boolean = true;
  searchQuery: any;
  typeOptions: any;
  errorMessage: any;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  Tabledata: any[] = []; 
  pageSize: number = 10;
  pageNo: number = 1;
  total_records: number = 0;
  totalPages: number = 0;
  data: any;
  limit_value: number = 10;
   set_limit: number[] = [ 10,  15, 25, 100];
  selectedLimit: number = this.set_limit[0];
  selectedarchitectNo: string = '';
  @ViewChild('fileInput') fileInput;
  @ViewChild('closeButton') closeButton: ElementRef;
  formData: any = {
    Type: '',
    Date: '',
    deregisterby: '',
    Details: ''
  };
  receivedPrivileges: any;
  sessionDataForCrps: any;
  shouldShowActionButtons: boolean;
  Privileges: any;
  uuid: any;
  today: string;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  selectedFile:File;
  fileId: any;
  constructor(private router: Router, private service: ArchitectService, private dataService: LayoutService,
    private messageService:MessageService,
  ) {
  }
  ngOnInit() {
    this.getSuspendList();
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
     
  //FUNCTION TO NAVIGATE TO ANOTHER PAGE
  navigate(data: any) {
    const title = 'List Of Suspended Architect'
    const navigationExtras: NavigationExtras = {
        state: {
            data: data,
            title: title
        },
    };
    this.router.navigate(
        ['/architect', 'architect-detail'],
        navigationExtras
    );
}
  // search filter
  Searchfilter() {
    if (this.searchQuery && this.searchQuery.trim() !== "") {
      this.getSuspendList(this.searchQuery); // Pass search query to backend
    } else {
      this.getSuspendList(); // Fetch all data
    }
  }
//get suspend list
showErrorMessage:boolean=false
  getSuspendList(searchQuery?: string) {
    const contractor = {
      "viewName": "architectSuspended",
      "pageSize": this.pageSize,
      "pageNo": this.pageNo,
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
      }
      ,
         {
          field: "cidNo",
          value: `%${searchQuery}%`,
          condition: " like ",
          operator: " OR "
          }
        ]
      : [],
  };
      this.service.getListOfArchitect(contractor).subscribe((response: any) => {
      this.showErrorMessage=false
      this.loading=false
      this.Tabledata = response.data;
      this.total_records = response.totalCount;
      this.totalPages = Math.ceil(this.total_records / this.pageSize); // Calculate total pages
      }, (error) => {
        this.showErrorMessage=true
        this.loading=false
      });
  }
  //get base on id
  getid(architectNo: any) {
    this.selectedarchitectNo = architectNo;
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
      this.reInstateSuspendedArchitect();
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
            }, error => {
            });
          }
        //revoke the suspended architect
   reInstateSuspendedArchitect() {
    if (this.formData.Date) {
        const selectedDate = new Date(this.formData.Date);
        // Attach the current time to the selected date
        const now = new Date();
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        this.formData.Date = selectedDate.toISOString(); // Format as 'YYYY-MM-DDTHH:MM:SS.000Z'
    }

    const suspendRevoke = {
        revokedDate: this.formData.Date,
        revokedDetails: this.formData.Details,
        revokedBy: this.uuid,
        architectNo: this.selectedarchitectNo,
        fileId: this.fileId
    };

    const reinstatedDetail = {
        firmType: 'Architect',
        cdbNos: this.selectedarchitectNo,
    };

    // Save the suspension/revocation first
    this.service.saveSuspendReregister(suspendRevoke).subscribe(
        (response: any) => {
            // After successful save, call the second endpoint for approval
            this.service.approveReinstatementIng2cSystem(reinstatedDetail).subscribe(
                (g2cResponse: any) => {
                    setTimeout(() => {
                        this.closeButton.nativeElement.click();
                        this.showReinstatmessage(); // Show reinstatement success message
                        setTimeout(() => {
                            this.getSuspendList(); // Refresh the list
                        }, 1000);
                    });
                },
                (g2cError: any) => {
                    console.error('G2C approval failed:', g2cError);
                    setTimeout(() => {
                        this.closeButton.nativeElement.click();
                        this.showReinstatmessage(); // Show reinstatement message even if G2C fails
                        setTimeout(() => {
                            this.getSuspendList(); // Refresh the list
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

      showReinstatmessage() {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Architect reinstated successfully' });
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
        this.getSuspendList();
      // console.log('loading')
        
      } 
    previousPage() {
      if (this.pageNo > 1) {
        this.pageNo--;
        this.getSuspendList();
      }
     }
     nextPage() {
      if (this.pageNo < this.totalPages) {
        this.pageNo++;
        this.getSuspendList();
      }
    }
    goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getSuspendList();
     }
    }
    range(totalPages: number): number[] {
      return Array.from({ length: totalPages }, (_, i) => i + 1); 
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
