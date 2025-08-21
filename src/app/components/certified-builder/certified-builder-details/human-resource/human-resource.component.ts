import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CertifiedBuilderService } from '../../../../service/certified-builder.service';
import { MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-human-resource',
  templateUrl: './human-resource.component.html',
  styleUrls: ['./human-resource.component.scss']
})
export class HumanResourceComponent {
  @Input() data: any;
  TableData:any;
  pageSize:number=100;
  pageNo:number=1;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  formData={
    remarks:''
  }
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('fileInput') fileInput;
    showSuccessMessage: boolean = false;
  errorMessage: any;
  selectedFile: File;
  fileId: any;
  Privileges: any;
  constructor(private service:CertifiedBuilderService,
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
    const certifiedBuilder = {
      "viewName": "certifiedBuilderHr",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
         {
          "field": "certifiedBuilderNo",
          "value": data.certifiedBuilderNo 
       },
       {
        "field": "isPartnerOrOwner",
          "value": "N"
      }
    ]
  }
    this.service.getListOfCertifiedBuilder(certifiedBuilder).subscribe((response:any) => {
      this.TableData= response.data;
    },(Error) => {
     
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

  removeHumanResourceDetails() {
    const removeHr = {
      remarks:this.formData.remarks,
      fileId:this.fileId,
      hrId:this.humanResourceId
    }
    this.service.removeHrData(removeHr).subscribe(
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
    viewFile(filePath: string): void {
      this.service.downloadhrandeqFile(filePath).subscribe(
        (response: HttpResponse<Blob>) => {
          const filename: string = this.extractFileName(filePath);
          const binaryData = [response.body];
          const blob = new Blob(binaryData, { type: response.body.type });
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadLink.href);
        },
        (error) => {
          this.showErrorMessage();
          console.error('Download failed', error);
        }
      );
    }
    showErrorMessage() {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'The requested file was not found' });
    }
    // Extract filename from the file path
    extractFileName(filePath: string): string {
      return filePath.split('/').pop() || filePath.split('\\').pop() || 'downloaded-file';
    }
  //to show sucessful downgrade message
  showReleaseMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Certified Builder Released successfully' });
  }
//method to stire hrid
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
    remarks: '',
  };
}
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
  this.onUpload();
}
onUpload() {
  this.service.uploadFile(this.selectedFile,).subscribe(response => {
    this.fileId = response;
    // this.loading = false;
  }, error => {
      // this.loading = false;
  });
}
}
