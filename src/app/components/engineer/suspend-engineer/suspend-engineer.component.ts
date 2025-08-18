
  import { Component, ElementRef, ViewChild } from '@angular/core';
  import { NgForm } from '@angular/forms';
  import { NavigationExtras, Router } from '@angular/router';
  import { MessageService } from 'primeng/api';
  import { EngineerService } from '../../../service/engineer.service';

  @Component({
    selector: 'app-suspend-engineer',
    templateUrl: './suspend-engineer.component.html',
    styleUrls: ['./suspend-engineer.component.scss']
  })
  export class SuspendEngineerComponent {
    loading: boolean = true;
    fileSizeExceeded: boolean = false;
    maxFileSizeMB: number = 2; // Maximum file size in MB
    maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
    searchQuery: any;
    errorMessage: any;
    Tabledata: any[] = [];
    pageSize: number = 10;
    pageNo: number = 1;
    limit_value: number = 10;
    set_limit: number[] = [ 10,  15, 25, 100];
    selectedLimit: number = this.set_limit[0];
    selectedengineerNo: string = '';
    total_records: number = 0;
    totalPages: number = 0;
    shouldShowActionButtons: boolean;
    formData: any = {
      Type: '',
      Date: '',
      deregisterby: '',
      Details: ''
    };
      @ViewChild('fileInput') fileInput;
      @ViewChild('closeButton') closeButton: ElementRef;
      Privileges: any;
      uuid: any;
      today: string;
      selectedFile:File;
      fileId: any;
      allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
      fileTypeInvalid: boolean;
      constructor(private router: Router, private service: EngineerService, 
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
    //validation
    ReinstateEngineer(actionForm) {
      if (actionForm.invalid) {
        Object.keys(actionForm.controls).forEach(field => {
          const control = actionForm.controls[field];
          control.markAsTouched({ onlySelf: true });
        });
        return;
      }
  
      this.ReinstateSuspendedEngineer();
    }
    navigate( data: any) {
      const title = 'List Of Suspended Engineer'
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
        this.getSuspendedList(this.searchQuery);
      } else {
        this.getSuspendedList();
      }
    }
    
    showErrorMessage:boolean=false
    getSuspendedList(searchQuery?: string) {
      const Engineer = {
        "viewName": "engineerSuspended",
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
        }
        ,
      {
        field: "cidNo",
        value: `%${searchQuery}%`,
        condition: " like ",
        operator: " OR "
    }
        ] : []
      };
      this.service.getListOfEngineer(Engineer).subscribe((response: any) => {
        this.showErrorMessage=false
        this.loading=false
        this.Tabledata = response.data;
        this.total_records = response.totalCount;
        this.totalPages = Math.ceil(this.total_records / this.pageSize); 
      }, (error) => {
        this.showErrorMessage=true
        this.loading=false
        console.error("Error:", error);
      });
    }
    getid(engineerNo: any) {
      this.selectedengineerNo = engineerNo;
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
        this.uploadFileForEngineer();
      }
    }
  }

  uploadFileForEngineer() {
    this.service.uploadFile(this.selectedFile,).subscribe(response => {
      this.fileId = response;
    }, error => {
    });
  }
ReinstateSuspendedEngineer() {
  if (this.formData.Date) {
    const selectedDate = new Date(this.formData.Date);

    // Get current time in UTC
    const nowUTC = new Date();
    // Calculate Bhutan Time (UTC+6)
    const bhutanOffset = 6;
    const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);

    // Attach Bhutan time to the selected date
    selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());

    // Format to ISO string
    this.formData.Date = selectedDate.toISOString();
  }

  const suspendRevoke = {
    revokedDate: this.formData.Date,
    revokedDetails: this.formData.Details,
    revokedBy: this.uuid,
    engineerNo: this.selectedengineerNo,
    fileId: this.fileId
  };

  const reinstatedDetail = {
    firmType: 'Engineer',
    cdbNos: this.selectedengineerNo // must be an array
  };

  // Step 1: Save revocation locally
  this.service.saveSuspendReregister(suspendRevoke).subscribe(
    (response: any) => {
      // Step 2: Call G2C approval endpoint
      this.service.approveReinstatementIng2cSystem(reinstatedDetail).subscribe(
        (g2cResponse: any) => {
          setTimeout(() => {
            this.closeButton.nativeElement.click();
            this.showReinstatmessage(); // Show success message
            setTimeout(() => {
              this.getSuspendedList(); // Refresh suspended list
            }, 1000);
          });
        },
        (g2cError: any) => {
          console.error('G2C approval failed:', g2cError);
          setTimeout(() => {
            this.closeButton.nativeElement.click();
            this.showReinstatmessage(); // Still show message even if G2C fails
            setTimeout(() => {
              this.getSuspendedList(); // Refresh suspended list
            }, 1000);
          });
        }
      );
    },
    (error: any) => {
      this.errorMessage = 'Local reinstatement failed: ' + (error.error?.error || 'Unknown error');
      console.error('Local reinstatement error:', error);
    }
  );
}

  showReinstatmessage() {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Engineer reinstated successfully' });
    }
    openModal(event: Event) {
      event.stopPropagation(); 
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
