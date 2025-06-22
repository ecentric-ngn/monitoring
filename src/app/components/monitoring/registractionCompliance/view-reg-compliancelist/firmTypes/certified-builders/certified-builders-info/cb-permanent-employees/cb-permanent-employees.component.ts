import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cb-permanent-employees',
  templateUrl: './cb-permanent-employees.component.html',
  styleUrls: ['./cb-permanent-employees.component.scss']
})
export class CbPermanentEmployeesComponent {
formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  tableData: any
  @Input() id: string = '';
  applicationStatus: string = '';

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.id = this.id
    console.log('idinemployee', this.id);
    const WorkDetail = this.service.getData('BctaNo');
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.certifiedBuilderNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo()
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.hrCompliance
      console.log('employee', this.formData);
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

   update() {
    const payload = {
      cbReviewDto: { bctaNo: this.bctaNo },
      cbEmployeeReviewDto: [{
        hrFulfilled: this.formData.hrFulfilled,
        resubmitDeadline: this.formData.resubmitDate,
        resubmitRemarks: this.formData.remarksNo,
      }]
    };
  
    this.service.saveOfficeSignageAndDocCB(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/certified']);
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

  tableId: any

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
      paySlip: item.paySlipFileName,
      hrFulfilled: this.formData.hrFulfilled,
      resubmitDeadline: this.formData.resubmitDate,
      deadlineRemarks: this.formData.remarksNo,
      remarks: this.formData.remarksYes,
      psremarks: ""
    }));
    const payload = {
      cbReviewDto: {
        id: this.tableId,
      },
      cbEmployeeReviewDto: hr
    };
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'cbEquipment' });
    });
  }

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
      paySlip: item.paySlipFileName,
      hrFulfilled: this.formData.hrFulfilled,
      resubmitDeadline: this.formData.resubmitDate,
      deadlineRemarks: this.formData.remarksNo,
      remarks: this.formData.remarksYes,
      psremarks: ""
    }));
    const payload = {
      cbReviewDto: {
        id: this.tableId,
      },
      cbEmployeeReviewDto: hr
    };
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'cbEquipment' });
    });
  }
}
