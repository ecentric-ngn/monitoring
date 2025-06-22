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

  @Input() id: string = '';
  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.id = this.id
    console.log('idinemployee', this.id);
    const WorkDetail = this.service.getData('BctaNo');
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.specializedFirmNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;

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
        hrFulfilled: this.formData.hrFulfilled,
        resubmitDeadline: this.formData.resubmitDate,
        resubmitRemarks: this.formData.remarksNo,
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
      }
    });
  }

  tableId: any

  saveAndNext() {
    // Get the first employee or create a default object
    const firstEmployee = this.tableData?.[0] || {};

    // Create single object payload
    const payload = {
      firmName: firstEmployee?.name || 'string',
      nationality: firstEmployee?.countryName || 'string',
      qualification: firstEmployee?.qualification || 'string',
      joiningDate: firstEmployee?.joiningDate ? this.formatDate(firstEmployee.joiningDate) : '2025-06-14',
      paySlip: firstEmployee?.paySlipFileName || 'string',
      fulfillsHrRequirements: this.formData?.hrFulfilled ? 'Yes' : 'No',
      lastDateToResubmit: this.formData?.resubmitDate || '2025-06-14',
      resubmissionRemarks: this.formData?.remarksNo || 'string',
      finalRemarks: this.formData?.remarksYes || 'string',
      psremarks: "string"
    };

    this.service.saveOfficeSignageAndDocSF(payload).subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        // Debug: log typeof res and its keys
        console.log('typeof res:', typeof res, 'res keys:', res && Object.keys(res));
        // Defensive: handle stringified JSON
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
        console.error('API error:', err);
        // Handle error (show message, etc.)
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
