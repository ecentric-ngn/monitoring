import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserTrainingService } from '../../../service/user-training.service';
import * as XLSX from 'xlsx';
import { MessageService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-training-form',
  templateUrl: './training-form.component.html',
  styleUrls: ['./training-form.component.scss']
})
export class TrainingFormComponent {
  //tableData:any
  formData: any = {};
  loading: boolean = true;
  pageSize: any;
  //loading: boolean = true;
  pageNo: any;
  receivedData: any;
  tableData: any[] = [];
  selectedTrainingType: string = '';
  selectedModule: string = '';
  trainingDate: string = '';
  modulesDisabled: boolean = false;
  fileSizeExceeded: boolean = false;
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024; // Maximum file size in bytes
  fileId: any;
  endDateError = false;
  selectedFile: File | null = null;
  headers: string[] = [];  // Initialize headers as an empty array
  //tableData: any[] = [];   // Initialize tableData as an empty array
  isModuleDisabled = true; 
  showSuccessModal: boolean = true; 
  @ViewChild('showSuccessModal') addAgencyBtn: ElementRef;
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('tableElement') table: ElementRef;
  // Define table headers for each course typ
  refresherCourseHeaders: any[] = ['bctaNo','Participant','CID No', 'Designation','Gender(M/F)','Mobile No'];
  inductionCourseHeaders: any[] = ['Participant', 'CID No', 'Gender(M/F)',,'Mobile No'];
  errorMessage: any;
  filePath: any;
  id: any;
  entityType: any;
  entityId: any;
  file: File;
  constructor(private service:UserTrainingService,private messageService:MessageService,private router:Router) {}
  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
    }, 500);
  
  }
  exportRefresherCourseToExcel(): void {
    // Call exportToExcel with the appropriate filename
    const refresherCourseHeaders = this.refresherCourseHeaders; // Or pass any required headers
    this.exportToExcel(refresherCourseHeaders, "Template for Refresher's Course");
  }
  exportInductionCourseToExcel(): void {
    // Call exportToExcel with the appropriate filename
    const inductionCourseHeaders = this.inductionCourseHeaders; // Or pass any required headers
    this.exportToExcel(inductionCourseHeaders, "Template for Induction's Course");
  }
  exportToExcel(headers: any[], fileNamePrefix: string = 'ExportedData'): void {
    if (!this.table || !this.table.nativeElement) {
      console.error('Table element is not available');
      return;
    }
    const tableElement: HTMLTableElement = this.table.nativeElement;
    const rows = tableElement.getElementsByTagName('tr');
    if (rows.length === 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers]);

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const dynamicFileName = `${fileNamePrefix}_${this.getCurrentDateTime()}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.setAttribute('download', dynamicFileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });
      if (headers.length > 0) {
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      }
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const dynamicFileName = `${fileNamePrefix}_${this.getCurrentDateTime()}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.setAttribute('download', dynamicFileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }
    // Utility method to get current date and time in the required format
    getCurrentDateTime(): string {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    }
   // Convert string to ArrayBuffer
  private s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  validateDateRange() {
    if (this.formData.endDate && this.formData.startDate) {
      this.endDateError = this.formData.endDate < this.formData.startDate;
    } else {
      this.endDateError = false;
    }
  }
  onTypeChange() {
    // Enable or disable module field based on selected type
    this.isModuleDisabled = this.formData.type !== 'Refresher Course';
  }
  allowedExtensions: string[] = ['xls', 'xlsx'];
 // Method triggered when files are selected
 onFileChanged(event: any): void {
  const file = event.target.files[0];
  // Reset error states
  this.fileSizeExceeded = false;
  this.errorMessage = null;
  // Check if a file is selected
  if (!file) {
    return;
  }
  // File size validation
  if (file.size > this.maxSizeInBytes) {
    console.error(`File size exceeds more than ${this.maxFileSizeMB} MB`);
    this.fileSizeExceeded = true; // Set error state
    event.target.value = ''; // Clear the file input
    return;
  }
  // File extension validation
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !this.allowedExtensions.includes(fileExtension)) {
    this.errorMessage = 'Only Excel files are allowed.';
    // Optionally clear the file input field to reset the selection
    event.target.value = '';
    return;
  }

  // Proceed with your file upload logic if validations pass
  this.selectedFile = file;
  this.uploadFileForUserTraining(); // Implement this method as needed
  this.readExcelFile(this.selectedFile); // Implement this method as needed
}
  cancel(trainingForm:NgForm){
    trainingForm.resetForm();
    this.formData={}
  }
  uploadFileForUserTraining() {
    // Call the uploadFile method from the service, passing selectedFile, entityId, and entityType
    this.service.uploadFile(this.selectedFile).subscribe(
      response => {
        console.log("File uploaded successfully!", response);
        this.fileId = response;
      },
      error => {
        // If there's an error during upload
        console.error("Error uploading!", error);
      }
    );
  }
  saveUserTraining(trainingForm: NgForm) {
    if (trainingForm.invalid) {
      Object.keys(trainingForm.controls).forEach(field => {
        const control = trainingForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Don't proceed if the form is invalid
    }
  
    // If valid, call the save function
    this.saveUserTrainingDetails();
  
    // Reset the form after successful save
    trainingForm.resetForm();
  }
  
  trainingId:any
  
  saveUserTrainingDetails() {
    const bhutanOffset = 6; // Bhutan is UTC+6
    if (this.formData.Date) {
        const selectedDate = new Date(this.formData.Date);
        const nowUTC = new Date();
        const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
        selectedDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
        this.formData.Date = selectedDate.toISOString();
    }
    if (this.formData.startDate) {
        const startDate = new Date(this.formData.startDate);
        const nowUTC = new Date();
        const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
        startDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
        this.formData.startDate = startDate.toISOString();
    }
    if (this.formData.endDate) {
        const endDate = new Date(this.formData.endDate);
        const nowUTC = new Date();
        const bhutanTime = new Date(nowUTC.getTime() + bhutanOffset * 60 * 60 * 1000);
        endDate.setHours(bhutanTime.getHours(), bhutanTime.getMinutes(), bhutanTime.getSeconds());
        this.formData.endDate = endDate.toISOString();
    }
  
    const trainingDetails = {
        trainingType: this.formData.type,
        module: this.formData.module,
        trainingStartDate: this.formData.startDate,
        trainingEndDate: this.formData.endDate,
        fileId: this.fileId
    };
  
    this.service.addUserTrainingData(trainingDetails).subscribe(
      (response: any) => {
        console.log('UserTrainingformData', response);
        this.formData = response;
        this.trainingId = response.id;
        
        // Show success message
        this.showSucessMessage();
        
        // Reset the form state and errors
        this.clearFormErrors();  // Call function to reset errors and form
        // Resets the form
  
        // Delay navigation to '/user-training'
        setTimeout(() => {
          this.sendUserTrainingData();
          this.router.navigate(['/user-training']);
        }, 3000);
      },
      (error: any) => {
        console.error('Error adding user training data', error);
      }
    );
  }
  
  // Function to clear error messages and reset the form state
  clearFormErrors() {
    this.endDateError = false;
    this.errorMessage = null;
  }
  
    
showSucessMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Training Form  added successfully' });
}
// }
readExcelFile(file: File) {
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (json.length > 0) {
      this.headers = json[0] ? json[0] as string[] : []; // Ensure headers is always an array of strings
      this.tableData = json.slice(1) ? json.slice(1) : []; // Ensure tableData is always an array
    }
  };
  reader.readAsArrayBuffer(file);
}
// this.trainingId
sendUserTrainingData(): void {
  // Define the mapping between table headers and backend headers
  const headerMapping: any = {
    'bctaNo': 'bctaNo',
    'Participant': 'fullName',
    'CID No': 'cidNo',
    'Designation': 'designation',
    'Gender(M/F)': 'gender',
    'Mobile No': 'mobileNo'
  };

  // Map the table data to match the backend format
  const data = this.tableData.map((row: any) => {
    return this.headers.reduce((acc: any, header: string, index: number) => {
      const backendHeader = headerMapping[header]; // Find the corresponding backend header
      if (backendHeader) {
        acc[backendHeader] = row[index]; // Assign each header as a key with the corresponding row value
      }
      return acc;
    }, {
      trainingId: this.trainingId // Add trainingId to each object
    });
  });

  console.log('data', data);
  
  // Send data to the backend
  this.service.saveUserParticipant(data).subscribe((response) => {
    console.log(response);
  });
}





}
