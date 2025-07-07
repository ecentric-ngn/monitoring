import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
interface FormData {
  cidNo: string;
  fullName: string;
  mobileNo: string;
  otp?: string;
  showOtpInput?: boolean;
  otpValidated?: boolean;
  errorMessages?: {
    notFound?: string;
    server?: string;
  };
}
@Component({
    selector: 'app-contractor-present-during-site-monitoring',
    templateUrl: './contractor-present-during-site-monitoring.component.html',
    styleUrls: ['./contractor-present-during-site-monitoring.component.scss'],
})
export class ContractorPresentDuringSiteMonitoringComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: string;
    errorMessages: any = {};
    @Input() tableId: any;
    @Output() contractorPresentData = new EventEmitter<{
        tableId: any;
        data: any;
    }>();
      @Input() prevTableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    // inspectionType='OTHERS';
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    fileAndRemark: any;
      dataList: FormData[] = [];
      showMessage: any;
        showValidateMessage: any;
         isOtpValid = false;
          appNoStatus:any={}
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.inspectionType = this.inspectionType;
        this.tableId = this.tableId;
        this.data = this.data;
        this.appNoStatus = this.data.applicationStatus;
        this.prevTableId = this.prevTableId;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId;
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
    }
   getDatabasedOnChecklistId() {
    const payload: any = [
        {
            field: 'checklist_id',
            value: this.prevTableId,
            operator: 'AND',
            condition: '=',
        },
    ];

    this.service
        .fetchDetails(payload, 1, 100, 'comprehensive_checklist_view') // increase limit if needed
        .subscribe({
            next: (response: any) => {
                const contractors = response.data;
                this.dataList = []; // clear existing if needed
                contractors.forEach((data: any) => {
                    this.dataList.push({
                        cidNo: data.contractor_cid_no,
                        fullName: data.contractor_full_name,
                        mobileNo: data.contractor_mobile_no,
                        otp: '',
                        showOtpInput: false,
                        errorMessages: {},
                    });
                });
            },
            error: (error) => {
                console.error('Error fetching contractor details:', error);
            },
        });
}

    isLoading = false;
  

otpSent = false;
otpVerified = false;
otpError = '';
isResendingOtp = false;

formRows = [
  {
    cidNo: '',
    fullName: '',
    mobileNo: '',
    mobileError: '',
    enteredOtp: '',
    otpSent: false,
    otpVerified: false,
    otpError: '',
    isLoading: false,
    isResendingOtp: false
  }
];


  validateMobileNumber(formData) {
    
    const mobile = (formData?.mobileNo || '').toString().trim();
    this.errorMessages.mobile = mobile.length > 8 ? "Contact number can't be more than 8 digits." : '';
  }
  isDataPresent = false;
  onCidChange(formData: any) {
    if (formData.cidNo && formData.cidNo.toString().length === 11) {
      this.getCidDetails(formData);
    }
  }

clearErrorMessage(formData: FormData): void {
  if (formData.errorMessages) {
    formData.errorMessages.notFound = '';
    formData.errorMessages.server = '';
  }
}

addRow() {
  this.dataList.push({
    cidNo: '',
    fullName: '',
    mobileNo: '',
    otp: '',
    showOtpInput: false,     // Flag to control OTP input field visibility
    otpValidated: false      // Flag to track OTP validation
  });
}

  
  removeRow(index: number) {
    this.dataList.splice(index, 1);
  }
   isOtpDisabled = true; 
   otpMessage: string = '';
generateOtp(row: any) {
  if (!row.mobileNo) {
    this.otpMessage = 'Mobile number is required.';
    return;
  }

  this.service.generateOtp(row.mobileNo).subscribe(
    (response: any) => {
      this.showMessage = response;
      this.otpMessage = 'OTP sent. Please verify.';
      row.showOtpInput = true;      // Show OTP input only for this row
      row.otpValidated = false;     // Reset validation
      this.isOtpDisabled = false;   // Optional: control if OTP input is disabled

      setTimeout(() => {
        this.showMessage = null;
      }, 3000);
    },
    (error: any) => {
      this.otpMessage = 'Failed to send OTP. Please try again.';
    }
  );
}
getCidDetails(formData): void {
  this.isLoading = true;
  // Clear previous error messages for this row
  formData.errorMessages = {
    notFound: '',
    server: ''
  };

  this.service.getBaseOnEid(formData.cidNo).subscribe(
    (response: any) => {
      if (response?.employeedetails?.employeedetail?.length) {
        const employeeDetail = response.employeedetails.employeedetail[0];
        const name = `${employeeDetail.firstName} ${employeeDetail.middleName} ${employeeDetail.lastName}`;
        formData.fullName = name;
        formData.mobileNo = employeeDetail.MobileNo;
        formData.email = employeeDetail.Email;
      } else {
        formData.errorMessages.notFound = 'Not Registered in RCSC';
      }
      this.isLoading = false;
    },
    (error) => {
      if (error.status === 500) {
        formData.errorMessages.server = 'Something went wrong';
        console.error('Server error:', error);
      }
      this.isLoading = false;
    }
  );
}
  saveAndNext(form: NgForm): void {
  // Skip validation if inspectionType is 'OTHERS'
  if (this.inspectionType !== 'OTHERS' && form.invalid) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return;
  }

  const payload = {
    id: parseInt(this.tableId, 10),
    contractorCidNo: this.formData.cidNo,
    contractorFullName: this.formData.fullName,
    contractorMobileNo: this.formData.mobileNo,
  };

  this.service.saveAsDraft(payload).subscribe(
    (response: any) => {
      this.createNotification();
      this.contractorPresentData.emit({
        tableId: this.tableId,
        data: this.data,
      });
      this.router.navigate(['monitoring/adding-site-engineer']);
    },
    (error: any) => {}
  );
}


    opt: any
 onOtpChange(row: any) {
  const otp = row.otp;

  if (otp && otp.toString().length === 4) {
    this.validateOtp(row);
  }
}

  otpvalidated: string = '';
  validateOtp(row: any) {
  row.isOtpLoading = true; // Optional: show spinner
  this.service.validateOtp(row.mobileNo, row.otp).subscribe(
    (res: any) => {
      this.isOtpValid = true;
    },
    (error) => {
      row.isOtpLoading = false;
      row.otpValidated = false;
      row.otpError = 'Server error. Please try again later.';
      row.otpMessage = null;
    }
  );
}

    createNotification(): void {
        this.notification
            .success('Success', 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    onPreviousClick() {
        this.previousClicked.emit(this.tableId);
        this.router.navigate(['monitoring/hrstrength-at-site']);
    }
}
