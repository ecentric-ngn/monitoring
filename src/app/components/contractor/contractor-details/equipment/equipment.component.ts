import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ContractorService } from '../../../../service/contractor.service';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent {
    @Input() data: any;
    formData: any = {}; // Object to hold form data
    TableData:any;
    @ViewChild('closeButton') closeButton: ElementRef;
    showSuccessMessage: boolean = false;
    errorMessage: any;
    pageSize:number=100;
    pageNo:number=1;
    selectedFile: File;
    fileId: Object;
    Privileges: any;
    loading:boolean=false
    @ViewChild('fileInput') fileInput;
    fileSizeExceeded: boolean = false;
    maxFileSizeMB: number = 2; // Maximum file size in MB
    maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
    constructor(private service:ContractorService,
      private messageService:MessageService,
      private ngZone: NgZone
    ){}
  
    ngOnInit(){
       this.getEquipmenDetails(this.data)
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
     getEquipmenDetails(data:any){
      const contractor = {
        "viewName": "contractorEquipment",
        "pageSize":this.pageSize,
        "pageNo":this.pageNo,
        "condition": [
          {
            "field": "contractorNo", 
            "value": data.contractorNo 
          }
      ]
    }
    this.loading=true
      this.service.getContractorDetails(contractor).subscribe((response:any) => {
        this.loading=false
        this.TableData=response.data;
      },(Error) => {
        this.loading=false
        console.log(Error)
      })
    }
    //method to save the uploaded file
    onFileChanged(event: any) {
      const file = event.target.files[0];
      this.fileSizeExceeded = false; // Reset error state
        if (file.size > this.maxSizeInBytes) {
          console.error(`File size exceeds more than ${this.maxFileSizeMB} MB`);
          this.fileSizeExceeded = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }
        // Proceed with your file upload logic
      
      this.selectedFile = file;
      this.uploadFileForContractor();
    }
  
  uploadFileForContractor() {
    this.service.uploadFile(this.selectedFile).subscribe(response => {
      this.fileId = response;
    }, error => {
    });
  }
    RemoveEq(actionForm) {
      if (actionForm.invalid) {
        Object.keys(actionForm.controls).forEach(field => {
          const control = actionForm.controls[field];
          control.markAsTouched({ onlySelf: true });
        });
        return;
      }
  
     this.RemoveEqDetails();
    }
    // }
    RemoveEqDetails() {
      const saveEqDetails = {
        remarks: this.formData.remarks,
        fileId: this.fileId,
        equipmentId: this.EquipmentID
      };
    this.loading=true
      this.service.removeEqData(saveEqDetails).subscribe(
        response => {
          this.loading=false
          setTimeout(() => {
            this.loading=false
            this.closeButton.nativeElement.click();
            // Show the success message after the modal is closed
            setTimeout(() => {
              this.showReleaseMessage();
              this.loading=false
              this.ngZone.run(() => {
                this.getEquipmenDetails(this.data); // Refresh data
              });
            }, 1000);
          }, ); // Ensure timeout is set to 0
        },
        (error: any) => {
          console.error("Error:", error);
          this.errorMessage = error.error.error;
        }
      );
    }
   
  // Method to show the success message and refresh the component
  showReleaseMessage() {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Equipment released successfully' 
    });
  }
    EquipmentID:any;
    storeEquipementID(contractorEquipmentId){
      this.EquipmentID = contractorEquipmentId;
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

  }
     
  
