import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permanent-employee',
  templateUrl: './permanent-employee.component.html',
  styleUrls: ['./permanent-employee.component.scss']
})
export class PermanentEmployeeComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  tableData: any;
  @Input() id: string = '';
  data: any;
  tData: any;
  applicationStatus: string = '';

  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    const WorkDetail = this.service.getData('BctaNo');

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.contractorNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.data = WorkDetail.data;
    this.tData = { 
       hrFulfilled: '',
       resubmitDate: '',
       remarksNo: ''
    };

    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.hrCompliance
      console.log('contractor employee', this.formData);
    })
  }

  fetchTdsHcPension() {
  }

  downloadFile(filePath: string) {
    this.service.downloadFileFirm(filePath).subscribe({
      next: (response) => {
        this.handleFileDownload(response);
      },
      error: (error) => {
        console.error('Download failed:', error);
        // Handle error (show toast/message to user)
      }
    });
  }

  private handleFileDownload(response: any) {
    // Extract filename from content-disposition header if available
    let filename = 'document.pdf'; // default filename
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    // Create download link
    const blob = new Blob([response.body], { type: response.headers.get('content-type') });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  tableId: any

  saveAndNext() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;
    const hr = this.tableData.map((item: any) => ({
      cidNo: item.cId,
      fullName: item.name,
      gender: item.sex,
      nationality: item.countryName,
      qualification: item.qualification,
      // joiningDate:  item.joiningDate, encountered an issue with date format
      joiningDate: "2024-01-01",
      tradeField: item.tradeName,
      paySlip: item.paySlipFileName,
      remarks: this.formData.remarksYes,
      tdsFetched: true
    }));
    const payload = {
      registrationReview: { 
        // id: this.tableId,
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarksNo
       },
       
      employeeReviews: hr

    };
    
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'equipment' });
    });
  }

  saveAndForward() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');

    this.tableId = this.id;
    const hr = this.tableData.map((item: any) => ({
      cidNo: item.cId,
      fullName: item.name,
      gender: item.sex,
      nationality: item.countryName,
      qualification: item.qualification,
      // joiningDate:  item.joiningDate, encountered an issue with date format
      joiningDate: "2024-01-01",
      tradeField: item.tradeName,
      paySlip: item.paySlipFileName,
      remarks: this.formData.remarksYes,
      tdsFetched: true
    }));
    const payload = {

      registrationReview: { 
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarksNo
      },
      employeeReviews: hr

    };
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      console.log('res', res);
      this.activateTab.emit({ id: this.tableId, tab: 'equipment' });
    });
  }

  update() {
    const payload = {
      registrationReview: { 
        bctaNo: this.bctaNo,
        hrFulfilled: this.formData.hrFulfilled,
        hrResubmitDeadline: this.formData.resubmitDate,
        hrRemarks: this.formData.remarksNo
       }
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/construction']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Update failed!',
          text: err?.error?.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

}