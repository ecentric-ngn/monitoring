import {Component,ElementRef,EventEmitter,Input,OnInit,Output,ViewChild,} from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ContractorService } from '../../../../service/contractor.service';
import { HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-comments-adverse-records',
    templateUrl: './comments-adverse-records.component.html',
    styleUrls: ['./comments-adverse-records.component.scss'],
})
export class CommentsAdverseRecordsComponent implements OnInit {
    @Input() data: any;
    formData: any = {}; // Object to hold form data
    type: string = '';
    pageSize: number = 1000;
    pageNo: number = 1;
    receivedPrivileges: any;
    hideAdverseOption: boolean;
    hideCommentOption: boolean;
    hideMonitoringOption: boolean;
    hideReadOption: boolean;
    @ViewChild('showSuccessModal') addAgencyBtn: ElementRef;
    @ViewChild('closeButton') closeButton: ElementRef;
    showSuccessModal: boolean = true;
    loading: boolean = false;
    errorMessage: any;
    Tabledata: any = [];
    Privileges: any;
    today: string;
    filePath: any;
    constructor(
      private service: ContractorService,
      private messageService: MessageService,
    ) {}
  
    ngOnInit() {
      this.getRecordList(this.data);
      this.dateValidation();
      const storedPrivileges = sessionStorage.getItem('setPrivileges');
      if (storedPrivileges) {
        this.Privileges = JSON.parse(storedPrivileges);
      }
    }
  
    dateValidation() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
      const dd = String(today.getDate()).padStart(2, '0');
      this.today = `${yyyy}-${mm}-${dd}`;
    }
    validateForm(form: NgForm, typeInput: any) {
      if (form.invalid || !this.formData.type) {
        Object.keys(form.controls).forEach((field) => {
          const control = form.control.get(field);
          control?.markAsTouched({ onlySelf: true });
        });
  
        if (!this.formData.type) {
          typeInput.control.markAsTouched();
          typeInput.control.setErrors({ required: true });
        }
      } else {
        this.Savedata();
      }
    }
    shouldShowActionButton(): boolean {
      const hasRead = this.Privileges && this.Privileges.some((privilege) => privilege.privilege_name === 'Read');
      const hasComment = this.Privileges && this.Privileges.some((privilege) => privilege.privilege_name === 'Comment');
      const hasAdverse = this.Privileges && this.Privileges.some((privilege) => privilege.privilege_name === 'Adverse');
      const hasMonitoring = this.Privileges && this.Privileges.some((privilege) => privilege.privilege_name === 'Monitoring');
  
      if (hasRead && !hasComment && !hasAdverse && !hasMonitoring) {
        this.hideAdverseOption = true;
        this.hideCommentOption = true;
        this.hideMonitoringOption = true;
        return false;
      }
  
      if (hasComment && hasAdverse && hasMonitoring) {
        this.hideCommentOption = false;
        this.hideAdverseOption = false;
        this.hideMonitoringOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasComment && hasAdverse) {
        this.hideMonitoringOption = true;
        this.hideAdverseOption = false;
        this.hideCommentOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasAdverse && hasMonitoring) {
        this.hideCommentOption = true;
        this.hideAdverseOption = false;
        this.hideMonitoringOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasMonitoring && hasComment) {
        this.hideAdverseOption = true;
        this.hideMonitoringOption = false;
        this.hideCommentOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasAdverse) {
        this.hideMonitoringOption = true;
        this.hideCommentOption = true;
        this.hideAdverseOption = false;
        this.hideReadOption = !hasRead;
      } else if (hasComment) {
        this.hideAdverseOption = true;
        this.hideCommentOption = false;
        this.hideMonitoringOption = true;
        this.hideReadOption = !hasRead;
      } else if (hasRead) {
        this.hideMonitoringOption = true;
        this.hideCommentOption = true;
        this.hideAdverseOption = true;
        this.hideReadOption = false;
      } else if (hasMonitoring) {
        this.hideMonitoringOption = false;
        this.hideCommentOption = true;
        this.hideAdverseOption = true;
        this.hideReadOption = !hasRead;
      } else {
        this.hideCommentOption = hasMonitoring || hasAdverse;
        this.hideMonitoringOption = hasComment || hasAdverse;
        this.hideAdverseOption = hasComment || hasMonitoring;
        this.hideReadOption = !hasRead;
      }
  
      return hasRead || hasAdverse || hasComment || hasMonitoring;
    }
  
    getRecordList(data: any) {
      const contractor = {
        viewName: 'contractorAdverseCommentRecord',
        pageSize: this.pageSize,
        pageNo: this.pageNo,
        condition: 
        [
          { field: 'contractorNo',  
          value: data.contractorNo 
      }
    ],
      };
      this.service.getContractorDetails(contractor).subscribe(
        (response: any) => {
          this.Tabledata = response.data;
          this.filePath= response.filePath
        },
        (error) => {
         
          console.log(error);
        }
      );
    }
  
    Savedata() {
      if (this.formData.type === 'Comment') {
        this.saveComment();
      } else if (this.formData.type === 'Adverse') {
        this.savedAdverseList();
      } else if (this.formData.type === 'Monitoring') {
        this.savedMonitoringList();
      }
    }
  
    saveComment(){
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
      const commentRecord = {
        type: this.formData.type,
        date: this.formData.Date,
        remarks: this.formData.Remarks,
        contractorNo: this.data.contractorNo,
      };
      this.service.saveRecord(commentRecord).subscribe(
        (response: any) => {
          this.closeModal();
          setTimeout(() => {
            this.showSuccessMessage('Contractor Comment successfully saved');
            this.getRecordList(this.data);
          }, 500);
        },
        (error: any) => {
          console.error('Error:', error);
          this.errorMessage = error.error.error;
        }
      );
    }
  
    savedAdverseList() {
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
        type: this.formData.type,
        date: this.formData.Date,
        remarks: this.formData.Remarks,
        contractorNo: this.data.contractorNo,
      };
      this.service.saveRecord(suspendDetail).subscribe(
        (response: any) => {
          this.closeModal();
          setTimeout(() => {
            this.showSuccessMessage('Adverse record successfully saved');
            this.reloadPage();
          }, 500);
        },
        (error: any) => {
          console.error('Error:', error);
          this.errorMessage = error.error.error;
        }
      );
    }
// To download the file with its original name based on the file path
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
      this.showErrorMessage('The requested file not found.Download failed');
      console.error('Download failed', error);
    }
  );
}
// Extract filename from the file path
extractFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath.split('\\').pop() || 'downloaded-file';
}
  //method to save the monitoring
    savedMonitoringList() {
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
      const MonitoringList = {
        type: this.formData.type,
        date: this.formData.Date,
        remarks: this.formData.Remarks,
        contractorNo: this.data.contractorNo,
      };
      this.service.saveRecord(MonitoringList).subscribe(
        (response: any) => {
          this.closeModal();
          setTimeout(() => {
            this.showSuccessMessage('Monitoring record successfully saved');
            this.reloadPage();
          }, 500);
        },
        (error: any) => {
          console.error('Error:', error);
          this.errorMessage = error.error.error;
        }
      );
    }
  
    showSuccessMessage(message: string) {
      this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
      
    }
    showErrorMessage(message: string) {
      this.messageService.clear();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      
    }
    closeModal() {
      this.closeButton.nativeElement.click();
    }
   
    cancel() {
      this.formData = [];
      // Reset the form using Angular's form reset method
    }
    reloadPage() {
      this.getRecordList(this.data);
    }
  }
  
