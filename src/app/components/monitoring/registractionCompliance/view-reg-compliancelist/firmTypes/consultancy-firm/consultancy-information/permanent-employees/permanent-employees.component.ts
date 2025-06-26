import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permanent-employees',
  templateUrl: './permanent-employees.component.html',
  styleUrls: ['./permanent-employees.component.scss']
})
export class PermanentEmployeesComponent {
  tableData: any[] = [];
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  @Input() id: string = '';
  applicationStatus: string = '';
  tData: any;
  isSaving = false;

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.id = this.id
    console.log('idinemployee', this.id);
    const WorkDetail = this.service.getData('BctaNo');
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.consultantNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.tData = {
      hrFulfilled: '',
      resubmitDate: '',
      remarksNo: ''
    };

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
    this.isSaving = true;

    const payload = {
      consultantRegistrationDto: {
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarks
      }
    };

    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;

        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/consultancy']);
        });
      },
      error: (err) => {
        this.isSaving = false;

        Swal.fire({
          icon: 'error',
          title: 'Update failed!',
          text: err?.error?.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  tableId: any;
  saveAndNext() {
    this.isSaving = true;

    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;
    const hr = this.tableData.map((item: any) => ({
      cidNo: item.cId,
      fullName: item.name,
      gender: item.sex,
      nationality: item.countryName,
      qualification: item.qualification,
      joiningDate: (item.joiningDate && !isNaN(new Date(item.joiningDate).getTime()))
        ? new Date(item.joiningDate).toISOString().split('T')[0]
        : ''
    }));
    const payload = {
      consultantRegistrationDto: {
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarks
      },
      consultantEmployeeDto: hr
    };
    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe((res: any) => {
      this.isSaving = false;
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'consultancyEquipment' });
    },
      (err) => {
        this.isSaving = false;

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err?.error?.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      });
  }

}
