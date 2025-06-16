import {  Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ContractorService } from '../../../../service/contractor.service';
import { MessageService } from 'primeng/api';
import { NgZone } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-human-resource',
  templateUrl: './human-resource.component.html',
  styleUrls: ['./human-resource.component.scss']
})
export class HumanResourceComponent {
    @Input() data: any;
    TableData:any[]  
    pageSize:number=100;
    pageNo:number=1;
    loading: boolean = true;
    formData: any = {};
    errorMessage: any;
    @ViewChild('closeButton') closeButton: ElementRef;
    @ViewChild('fileInput') fileInput;
    fileId: any;
    selectedFile: File;
    fileSizeExceeded: boolean = false;
    maxFileSizeMB: number = 2; // Maximum file size in MB
    maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
    Privileges: any;
    constructor(private service:ContractorService,
      private messageService:MessageService,
       private ngZone: NgZone
    ){}

    ngOnInit(){
      this.getHumanResourceDetails(this.data);
      const storedPrivileges = sessionStorage.getItem('setPrivileges');
       if (storedPrivileges) {
         this.Privileges = JSON.parse(storedPrivileges);    
  }
    setTimeout(() => {
      this.loading = false;
    }, 1000);
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
      const contractor = {
        "viewName": "contractorHr",
        "pageSize":this.pageSize,
        "pageNo":this.pageNo,
        "condition": [
           {
           "field": "contractorNo", 
             "value": data.contractorNo 
         },
         {
          "field": "isPartnerOrOwner",
            "value": "N"
        }
      ]
    }
      this.service.getContractorDetails(contractor).subscribe((response:any) => {
        this.TableData = response.data; 
      },(Error) => {
        console.log(Error)
      })
    }
    onFileChanged(event: any) {
      const file = event.target.files[0];
      this.fileSizeExceeded = false; 
        if (file.size > this.maxSizeInBytes) {
          console.error(`File size exceeds more than ${this.maxFileSizeMB} MB`);
          this.fileSizeExceeded = true;
          event.target.value = ''; 
          return;
        }
      this.selectedFile = file;
      this.uploadFileForContractor();
    }
    uploadFileForContractor() {
      this.service.uploadFile(this.selectedFile).subscribe(response => {
        this.fileId = response;
      }, error => {
          console.error("Error uploading!", error);
      });
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
    //remove equipment
    removeHumanResourceDetails() {
      const saveHrDetails={
        remarks:this.formData.remarks,
        hrId:this.humanResourceId,
        fileId:this.fileId
      }
      this.service.removeHrData(saveHrDetails).subscribe(
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
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Human Resource released successfully' });

    }
  reloadPage() {
  this.getHumanResourceDetails(this.data);
    }
  //method to save the Hr Id
  humanResourceId:any;
  storeHrID(id){
      this.humanResourceId = id;
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
  viewFile(filePath: string): void {
    this.service.downloadFile(filePath).subscribe(
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
        console.error('Download failed', error);
      this.showErrorMessage('The requested file not found.Download failed')
      }
    );
  }
  showErrorMessage(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    
  }
  extractFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath.split('\\').pop() || 'downloaded-file';
  }

  }
