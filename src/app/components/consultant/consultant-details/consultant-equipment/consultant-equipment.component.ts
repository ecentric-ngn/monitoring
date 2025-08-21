import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConsultantService } from '../../../../service/consultant.service';
import { MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-consultant-equipment',
  templateUrl: './consultant-equipment.component.html',
  styleUrls: ['./consultant-equipment.component.scss']
})
export class ConsultantEquipmentComponent {
  @Input() data: any;
  formData: any = {}; // Object to hold form data
  TableData:any;
  pageSize:number=100;
  pageNo:number=1;
  errorMessage: any;
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('fileInput') fileInput;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024;
  showSuccessMessage: boolean = false;
  fileId: any;
  selectedFile: File;
  loading:boolean=false
  Privileges: any;
  constructor(private service:ConsultantService,
    private messageService:MessageService,
    private ngZone:NgZone
  ){}

  ngOnInit(){
    this.getEquipmentDetails(this.data)
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
  getEquipmentDetails(data:any){
    const consultant = {
      "viewName": "consultantEquipment",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
         {
          "field": "consultantNo", 
          "value": data.consultantNo 
       }
    ]
  }
 this.loading=true
    this.service.getListOfConsultant(consultant).subscribe((response:any) => {
      this.loading=false
      this.TableData= response.data;
    },(Error) => {
     
      console.log(Error)
    })
  }
  removeEq(actionForm) {
    if (actionForm.invalid) {
      Object.keys(actionForm.controls).forEach(field => {
        const control = actionForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

   this.saveEquipmentDetails();
  }   
    reloadPage() {
      this.getEquipmentDetails(this.data);
  }
  //method to store the equipment id
  equipmentId:any
  storeEquipementID(id){
    this.equipmentId= id
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
    this.UploadFileForEquipment();
  }
  //method to upload the file/attachment
  UploadFileForEquipment() {
    this.service.uploadFile(this.selectedFile,).subscribe(response => {
      this.fileId = response;
      // this.loading = false;
    }, error => {
        console.error("Error uploading!", error);
        // this.loading = false;
    });
  }
    //method to save the equipment
    saveEquipmentDetails(){
      const eqDetails={
        remarks:this.formData.remarks,
        fileId:this.fileId,
        equipmentId:this.equipmentId

      }
      this.loading=true
      this.service.saveEqData(eqDetails).subscribe((response:any)=> {
        this.loading=false
          setTimeout(() => {
            this.closeButton.nativeElement.click();
            this.loading=false
            // Show the success message after the modal is closed
            setTimeout(() => {
              this.showReleaseMessage();
              this.ngZone.run(() => {
                this.getEquipmentDetails(this.data); // Refresh data
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
    //to show sucessful downgrade message
    showReleaseMessage() {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Consultant Released successfully' });
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
 
}

