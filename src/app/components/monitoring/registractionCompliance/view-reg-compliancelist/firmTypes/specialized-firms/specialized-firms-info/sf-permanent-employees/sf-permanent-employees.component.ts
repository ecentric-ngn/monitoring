import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sf-permanent-employees',
  templateUrl: './sf-permanent-employees.component.html',
  styleUrls: ['./sf-permanent-employees.component.scss']
})
export class SfPermanentEmployeesComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  tableData: any;
  applicationStatus: string = '';
  tData: any;

  @Input() id: string = '';
  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.id = this.id
    console.log('idinemployee', this.id);
    const WorkDetail = this.service.getData('BctaNo');
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.specializedFirmNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.tData = {
      hrFulfilled: '',
      hrResubmitDeadline: '',
      hrRemarks: ''
    };

    this.service.setBctaNo(this.bctaNo);

    this.service.firmInfo$.subscribe(info => {
      if (info) {
        this.formData.firmName = info.firmName;
        this.formData.mobileNo = info.mobileNo;
        this.formData.email = info.email;
      }
    });

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo()
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.hrCompliance
      console.log('sf employee', this.formData);
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
      sfReviewDto: {
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarks,
      }
    };

    this.service.saveOfficeSignageAndDocSF(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/specialized']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Update failed!',
          text: err?.error?.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
        this.router.navigate(['monitoring/specialized']);
      }
    });
  }

  tableId: any

  saveAndNext() {
    const sfReviewEmployeeDto = (this.tableData || []).map((item: any) => ({
      nationality: item?.countryName || 'string',
      qualification: item?.qualification || 'string',
      joiningDate: item?.joiningDate ? this.formatDate(item.joiningDate) : '2025-06-26',
    }));

    const sfReviewDto = {
      bctaNo: this.bctaNo || 'string',
      firmName: this.formData?.firmName || 'string',
      contactNo: this.formData?.mobileNo || 'string',
      email: this.formData?.email || 'string',
      hrFulfilled: this.tData?.hrFulfilled || 'string',
      hrResubmitDeadline: this.tData?.resubmitDate,
      hrRemarks: this.tData?.remarks || 'string'
    };

    const payload = {
      sfReviewDto,
      sfReviewEmployeeDto
    };

    this.service.saveOfficeSignageAndDocSF(payload).subscribe({
      next: (res: any) => {
        let emittedId = '';
        if (typeof res === 'string') {
          try {
            const parsed = JSON.parse(res);
            emittedId = parsed && parsed.id ? parsed.id : '';
          } catch (e) {
            emittedId = '';
          }
        } else if (res && res.id) {
          emittedId = res.id;
        }
        this.activateTab.emit({
          id: emittedId,
          tab: 'sfmonitoring'
        });
      },
      error: (err) => {
        console.error('Error Saving!', err);
      }
    });
  }

  private formatDate(date: any): string {
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      return '2025-06-14'; // Fallback date
    }
  }
}
