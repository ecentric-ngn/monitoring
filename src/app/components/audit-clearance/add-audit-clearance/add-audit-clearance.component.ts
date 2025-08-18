import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import * as XLSX from 'xlsx';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-audit-clearance',
  templateUrl: './add-audit-clearance.component.html',
  styleUrls: ['./add-audit-clearance.component.scss']
})
export class AddAuditClearanceComponent {
  tableData: any;
  selectedFile: any;
  auditClearanceExcelSheet: any[] = ['Type (1 for Contractor, 2 for Consultant)', 'CDB No', 'Audited Agency', 'Audited period', 'AIN', 'Para No.', 'Observation in brief'];
  table: any;
  uploadedData: unknown[] = [];
  fileId: string;
  // Define the header mapping object
  headerMapping = {
    "Type (1 for Contractor, 2 for Consultant)": "type",
    "CDB No": "cdbNo",
    "Audited Agency": "agency",
    "Audited period": "auditedPeriod",
    "AIN": "ain",
    "Para No.": "paroNo",
    "Observation in brief": "auditObservation"
  };
  Privileges: any;
  uuid: any;
  loading: boolean;

  constructor(private router: Router, private service: CommonService, private messageService:MessageService,) {}

  ngOnInit() {
    const storedPrivileges = sessionStorage.getItem('setPrivileges');
    if (storedPrivileges) {
        this.Privileges = JSON.parse(storedPrivileges);
    }  
    const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
    if (sessionLocalData) {
    this.uuid = sessionLocalData.userId
  }
     setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  downloadExcel(): void {
    // Call exportToExcel with the appropriate filename
    const auditClearanceExcelSheet = this.auditClearanceExcelSheet; // Or pass any required headers
    this.exportToExcel(auditClearanceExcelSheet, "Template for Audit Clearance");
  }

  exportToExcel(headers: any[], fileNamePrefix: string = 'ExportedData'): void {
    // Create a worksheet with the provided headers
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers]);

    // Create a workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Generate a dynamic filename with the current date and time
    const dynamicFileName = `${fileNamePrefix}_${this.getCurrentDateTime()}.xlsx`;

    // Write the workbook as a binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Convert the binary string to a Blob
    const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });

    // Create a download link and trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', dynamicFileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  s2ab(wbout: any): BlobPart {
    // Convert the binary string to an array buffer
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  getCurrentDateTime(): string {
    // Utility function to get the current date and time in YYYYMMDD_HHMMSS format
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  }

  onFileChanged(event: any) {
    const files = event.target.files[0];
    this.selectedFile = files;
    this.uploadAuditClearanceFile();
  }

  uploadAuditClearanceFile() {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      // Assuming the Excel file has only one sheet, extract data from the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Convert the sheet to JSON (array of objects)
      this.uploadedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Optionally, log the data to see the structure
      console.log(this.uploadedData);
    };

    // Read the file as binary string
    reader.readAsBinaryString(this.selectedFile);
  }

  // This will be triggered when the Save button is clicked
  isLoading = false;
  saveAuditDetails() {
    this.isLoading = true;
    if (this.uploadedData.length > 0) {
      const headers = this.uploadedData[0];
      const data = this.uploadedData.slice(1);
  
      // Transform the data into an array of objects with renamed keys based on the headerMapping
      const transformedData = data.map((row: any[]) => {
        let rowData: any = {};
  
        row.forEach((value, index) => {
          const key = headers[index];
          if (this.headerMapping[key]) {
            // Use the mapped key from the headerMapping
            rowData[this.headerMapping[key]] = value;
          }
        });
        return Object.values(rowData).some(value => value !== '') ? rowData : null;
      }).filter(row => row !== null);
      // Assuming only the first row is required
      const firstRow = transformedData[0];
      // Create the payload with only the necessary fields
      const payload = {
        agency: firstRow.agency, 
        ain: firstRow.ain,
        auditObservation: firstRow.auditObservation,
        auditedPeriod: firstRow.auditedPeriod,
        cdbNo: firstRow.cdbNo,
        paroNo: firstRow.paroNo,
        type: firstRow.type,
        createdBy: this.uuid
      };
      // Call the service with the payload
      this.service.createAuditMemo(payload).subscribe(
        (response) => {
          this.showUpdateMessage();
            this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/audit-clearance']);
          }, 1000);
        },
        (error) => {
          if (error.status === 500) {
            console.error('Something went wrong. Please try again later.');
            this.showErrorMessage();
              this.isLoading = false;
          } else {
            console.error(error);
            this.showErrorMessage();
              this.isLoading = false;
          }
        }
      );
    }
  }
      
  showUpdateMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Work details updated successfully' });
  }
  showErrorMessage() {
    this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong. Please try again later' });
  }
}
