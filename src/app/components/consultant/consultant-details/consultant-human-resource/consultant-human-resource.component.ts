import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { ConsultantService } from '../../../../service/consultant.service';
import { Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-consultant-human-resource',
  templateUrl: './consultant-human-resource.component.html',
  styleUrls: ['./consultant-human-resource.component.scss']
})
export class ConsultantHumanResourceComponent {
  @Input() data: any;
  formData: any = {}; // Object to hold form data
  TableData:any;
  pageSize:number=100;
  pageNo:number=1;
  errorMessage: any;
  @ViewChild('fileInput') fileInput;
  @ViewChild('closeButton') closeButton: ElementRef;
    showSuccessMessage: boolean = false;
  fileId: any;
  selectedFile: File;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024;
  Privileges: any;
  loading:boolean=false
  constructor(private service:ConsultantService,
    private messageService:MessageService,
    private ngZone:NgZone
  ){}

  ngOnInit(){
    this.getHumanResourceDetails(this.data) 
    const storedPrivileges = sessionStorage.getItem('setPrivileges');
    if (storedPrivileges) {
      this.Privileges = JSON.parse(storedPrivileges);    
}
}
shouldShowActionButton(): boolean {
  // Check if the Privileges array exists and is not empty
  if (!this.Privileges || this.Privileges.length === 0) {
      return true; // Show the button if no privileges are available
  }
  // Check if "Read" privilege is present
  const hasRead = this.Privileges.some(privilege => privilege.privilege_name === 'Read');
  // Show the button if "Read" is absent or there are other privileges besides "Read"
  return !hasRead || this.Privileges.length > 1;
}
//getting the human resource
  getHumanResourceDetails(data:any){
    const consultant = {
      "viewName": "consultantHr",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
         {
          "field": "consultantNo",
          "value": data.consultantNo 
       },
       {
        "field": "isPartnerOrOwner",
          "value": "N"
      }
    ]
  }
  this.loading=true
    this.service.getListOfConsultant(consultant).subscribe((response:any) => {
      this.TableData= response.data;
      this.loading=false
    },(Error) => {
      this.loading=false
     
    })
  }
  removeHumanResource(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
   this.removeHumanResourceDetails();
  }
    //method to store the file
    onFileChanged(event: any) {
      const file = event.target.files[0];
      this.fileSizeExceeded = false; // Reset error state
        if (file.size > this.maxSizeInBytes) {
          this.fileSizeExceeded = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }
        // Proceed with your file upload logic
      this.selectedFile = file;
      this.UploadFileForHr();
    }
    //method to upload the file/images
    UploadFileForHr() {
    this.service.uploadFile(this.selectedFile,).subscribe(response => {
      this.fileId = response;
      // this.loading = false;
    }, error => {
        console.error("Error uploading!", error);
        // this.loading = false;
    });
  }
  //Method to remove the Human resource
  removeHumanResourceDetails() {
    const removeHRDetails={
      remarks:this.formData.remarks,
      fileId:this.fileId,
      hrId:this.humanResourceId
    }
    this.service.removeHrData(removeHRDetails).subscribe(
      response => {
        setTimeout(() => {
          this.closeButton.nativeElement.click();
          // Show the success message after the modal is closed
          setTimeout(() => {
            this.showReleaseMessage();
            this.ngZone.run(() => {
              this.getHumanResourceDetails(this.data); // Refresh data
            });
          }, 1000);
        }, ); // Ensure timeout is set to 0
      },
      (error: any) => {
        this.errorMessage = error.error.error;
      }
    );
  }
  //to show sucessful downgrade message
  showReleaseMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Consultant Released successfully' });
  }
  reloadPage() {
    this.getHumanResourceDetails(this.data);
}
//method to store the HrId
humanResourceId:any;
storeHrID(hrId){
  this.humanResourceId = hrId
}
cancel(actionForm: NgForm) {
  actionForm.resetForm(); // Reset the form using Angular's form reset method
  this.resetModalData(); // Reset additional modal data
  this.fileInput.nativeElement.value = '';
  this.fileSizeExceeded = false;
}
resetModalData() {
  this.formData = {
    Remarks: '',
  };
}
  }


