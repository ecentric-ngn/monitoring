import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { SurveyorService } from '../../service/surveyor.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-surveyor',
  templateUrl: './surveyor.component.html',
  styleUrls: ['./surveyor.component.scss']
})
export class SurveyorComponent {
  loading: boolean = true;
  searchQuery: string;
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
  selectedsurveyorNo: string = '';
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
  hideDeregisterOption: boolean;
  hideSuspendOption: boolean;
  hideCancelOption: boolean;
  shouldShowActionButtons: boolean;
  hideReadOption: boolean;
  Privileges: any;
  uuid: any;
  today: string;
  selectedFile:File;
  fileId: any;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  fileTypeInvalid: boolean;
  constructor(private router: Router, private service: SurveyorService,
    private messageService:MessageService,
  ) {}
  
    ngOnInit() {
      this.getSurveyorList();
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
        this.hideDeregisterOption = true;
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
      } else {
        this.hideSuspendOption =  hasCancel;
        this.hideCancelOption = hasSuspend;
        this.hideReadOption = !hasRead;
      }
    
      return (hasRead || hasSuspend || hasCancel);
    }
      navigate(data:any){
     const title = 'List Of Active Surveyor'
        const navigationExtras: NavigationExtras = {
          state: {
            data: data,
            title:title
          }
        };
    
        this.router.navigate(['/surveyor','surveyor-details'], navigationExtras);
      }
      SaveSurveyor(actionForm) {
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
      } else if (this.formData.Type === 'Cancel') {
        this.savedCancelled();
      }
    }
    getid(surveyorNo: any){
      this.selectedsurveyorNo = surveyorNo;
    
    }
    // search filter
    searchFilter() {
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        this.getSurveyorList(this.searchQuery); // Pass search query to backend
      } else {
        this.getSurveyorList(); // Fetch all data
      }
    }
    showErrorMessage:boolean=false 
    getSurveyorList(searchQuery?: string) {
      const surveyor = {
        "viewName": "surveyor",
        "pageSize":this.pageSize,
        "pageNo":this.pageNo,
        "condition": searchQuery ? [
          {
            field: "surveyorNo",
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
        ] : []
      };
      this.service.getListOfSurveyor(surveyor).subscribe(
        (response: any) => { 
          this.Tabledata = response.data;
          this.loading=false
          this.showErrorMessage=false
        this.total_records = response.totalCount;
        this.totalPages = Math.ceil(this.total_records / this.pageSize); 
        },
        (error) => {
          this.loading=false
          this.showErrorMessage=true
          console.error('Error fetching engineerlist list:', error);
          // Handle errors here
        }
      );
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
          console.error(`File size exceeds ${this.maxFileSizeMB} MB`);
          this.fileSizeExceeded = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
          console.error('Invalid file type:', file.type);
          this.fileTypeInvalid = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }
        // Proceed with your file upload logic
        this.selectedFile = file;
        this.uploadFileForSurveyor();
      }
    }
  }
  uploadFileForSurveyor() {
      this.service.uploadFile(this.selectedFile,).subscribe(response => {
        console.log("File uploaded succesfullly!", response);
        this.fileId = response;
        // this.loading = false;
      }, error => {
          console.error("Error uploading!", error);
          // this.loading = false;
      });
    }
      // //save savedSuspend  
      savedSuspend(){
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
          surveyorNo: this.selectedsurveyorNo,
          fileId:this.fileId
           };
           this.service.saveSuspendDetails(suspendDetail).subscribe((response: any) => {
             setTimeout(() => {
               this.closeButton.nativeElement.click();
                this.showSuspendedMessage();
               // Show the success message after the modal is closed
               setTimeout(() => {
                 this.getSurveyorList()
               }, 1000);
             },);
           },
           (error: any) => {
             console.error("Error:", error);
             this.errorMessage = error.error.error;
           }
         );
       }
       showSuspendedMessage() {
         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Surveyor suspended successfully' });
       }
  
  //save cancelled
       savedCancelled(){
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
          type: this.formData.Type,
          cancelledDate: this.formData.Date,
          cancelledDetails: this.formData.Details,
          cancelledBy: this.uuid,
          surveyorNo: this.selectedsurveyorNo,
          fileId:this.fileId
           };
           this.service.saveCancelledDetails(cancelledDetail).subscribe((response: any) => {
             setTimeout(() => {
               this.closeButton.nativeElement.click();
                this.showCancelMessage();
               // Show the success message after the modal is closed
               setTimeout(() => {
                 this.getSurveyorList()
               }, 1000);
             },);
           },
           (error: any) => {
             console.error("Error:", error);
             this.errorMessage = error.error.error;
           }
         );
       }
       showCancelMessage() {
         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Surveyor cancelled successfully' });
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
        this.getSurveyorList();
      // console.log('loading')
        
      } 
    previousPage() {
      if (this.pageNo > 1) {
        this.pageNo--;
        this.getSurveyorList();
      }
     }
     nextPage() {
      if (this.pageNo < this.totalPages) {
        this.pageNo++;
        this.getSurveyorList();
      }
    }
    goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.getSurveyorList();
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
