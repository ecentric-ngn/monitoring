 import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
interface FormData {
  cidNo: string;
  fullName: string;
  mobileNo: string;
  designation: string;
  email: string;
  otp?: string;
  showOtpInput?: boolean;
  otpValidated?: boolean;
  errorMessages?: {
    notFound?: string;
    server?: string;
  };
}


@Component({
  selector: 'app-adding-site-engineer',
  templateUrl: './adding-site-engineer.component.html',
  styleUrls: ['./adding-site-engineer.component.scss']
})
export class AddingSiteEngineerComponent {
@Input() tableId: any; 
@Output() siteEngineersData = new EventEmitter<{ tableId: any ; data: any}>();
@Output() previousClicked = new EventEmitter<{ tableId: any }>();
dataList: FormData[] = [];
  fileError: string | null = null;
  fileId: string;
  errorMessages: any = {};
 
  showMessage: any;
  showValidateMessage: any;
  @Input() prevTableId: any;
  @Input() data: any;
  appNoStatus: any;
constructor(private service:CommonService,private router: Router,private notification: NzNotificationService) { }

ngOnInit() {
  this.tableId=this.tableId
  this.data = this.data
   this.appNoStatus = this.data.applicationStatus
  this.prevTableId=this.prevTableId
    if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
     
}

   getDatabasedOnChecklistId() {
      const payload : any =[ {
                "field": "checklist_id",
                "value": this.prevTableId,
                "operator": "AND",
                "condition": "="
              }
        ]
          this.service.fetchDetails(payload,1,2,'client_site_engineers_view').subscribe(
            (response: any) => {
            const data = response.data;
            this.dataList = data.map((item: any) => {
            return {
                id: item.id,
                cidNo: item.cid_no,
                fullName: item.full_name,
                mobileNo: item.mobile_no,
                designation: item.designation,
                email: item.email,
            };
            });
            },
            // Error handler
            (error) => {
              console.error('Error fetching contractor details:', error); // Log the error
            }
          );
        }

  validateMobileNumber(formData) {
    
    const mobile = (formData?.mobileNo || '').toString().trim();
    this.errorMessages.mobile = mobile.length > 8 ? "Contact number can't be more than 8 digits." : '';
  }
  isLoading = false;
  isDataPresent = false;
  onCidChange(formData: any) {
    if (formData.cidNo && formData.cidNo.toString().length === 11) {
      this.getCidDetails(formData);
    }
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
        formData.errorMessages.notFound = 'Not Registered in DCRC';
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
    designation: '',
    email: '',
    otp: '',
    showOtpInput: false,     // Flag to control OTP input field visibility
    otpValidated: false      // Flag to track OTP validation
  });
}

  
  removeRow(index: number) {
    this.dataList.splice(index, 1);
  }


saveAndNext(form: NgForm) {
  if (form.invalid) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return; // Exit early if the form is invalid
  }
  const payload = this.dataList.map((item) => ({
    cidNo: item.cidNo,
    fullName: item.fullName,
    mobileNo: item.mobileNo,
    designation: item.designation,
    email: item.email
  }));
  this.service.saveSiteEngineerData(payload, this.tableId).subscribe(
    (response: any) => {
      this.createNotification();
      this.siteEngineersData.emit({
                        tableId: this.tableId,
                        data: this.data,
                    });
      this.router.navigate(['monitoring/monitor-team-lists']);
    },
    (error: any) => {
    }
  )
}


 createNotification(): void {
  this.notification
    .success(
      'Success',
      'The data has been saved successfully'
    )
    .onClick.subscribe(() => {
      console.log('notification clicked!');
    });
}
otpMessage: string = '';
hideInput : boolean = false;
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

  isOtpDisabled = true; // OTP input will be disabled initially
// Call this method when you want to enable the OTP input
enableOtpInput() {
  this.isOtpDisabled = false;
}
opt: any
 onOtpChange(row: any) {
  const otp = row.otp;

  if (otp && otp.toString().length === 4) {
    this.validateOtp(row);
  }
}

  isOtpValid = false; // Initially false to keep button disabled
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


 

  onPreviousClick() {
    this.previousClicked.emit(this.tableId);
    this.router.navigate(['monitoring/contractor-present-during-site-monitoring']);
  }
}
