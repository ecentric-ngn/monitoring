import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-office-signage',
  templateUrl: './office-signage.component.html',
  styleUrls: ['./office-signage.component.scss']
})
export class OfficeSignageComponent {
  formData: any = {}
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  data: any;
  applicationStatus: string = '';

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {

    this.initializeFormData();

    const WorkDetail = this.service.getData('BctaNo');
    console.log('Retrieved WorkDetail:', WorkDetail);

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.formData.firmType = WorkDetail.data;
    this.data = WorkDetail.data;

    console.log('Checking cdbNo from WorkDetail.data:', WorkDetail.data.consultantNo);
    this.bctaNo = WorkDetail.data.consultantNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;

    if (this.bctaNo) {
      console.log('bctaNo is valid. Calling fetchDataBasedOnBctaNo...');
      this.fetchDataBasedOnBctaNo();
    } else {
      console.warn('bctaNo is undefined or null. Skipping API call.');
    }
  }

  initializeFormData() {
    this.formData = {
      officeSignboardPath: null,
      officeLocation: '',
      signboardReview: '',
      resubmitDate: null,
      signboardRemarks: '',
      properFillingPath: null,
      filingReview: '',
      filingRemarks: '',
      filingResubmitDate: null,
    };
  }

  onReviewChange() {
    if (this.formData.signboardReview === 'No') {
      // Initialize resubmit fields when 'No' is selected
      this.formData.resubmitDate = null;
      this.formData.signboardRemarks = '';
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      // Merge API response with initialized formData
      this.formData = {
        ...this.formData, // Keep initialized values
        ...res.complianceEntities[0] // Add API data
      };
      console.log('Updated formData:', this.formData);
    });
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

  isOfficeSignboardEnabled(): boolean {
    return ['Resubmitted OS', 'Resubmitted OS and PFS', 'Submitted'].includes(this.applicationStatus);
  }

  isFilingSystemEnabled(): boolean {
    return ['Resubmitted PFS', 'Resubmitted OS and PFS', 'Submitted'].includes(this.applicationStatus);
  }

  isOhsEnabled(): boolean {
    return this.applicationStatus === 'Submitted';
  }

  isFieldEditable(field: string): boolean {
    switch (field) {
      case 'officeSignboard':
      case 'signboardReview':
        return this.isOfficeSignboardEnabled();
      case 'filingSystem':
      case 'filingReview':
        return this.isFilingSystemEnabled();
      case 'ohs':
      case 'ohsReview':
        return this.isOhsEnabled();
      default:
        return false;
    }
  }

  update() {
    const payload = {
      consultantRegistrationDto: {
        bctaNo: this.data.consultantNo || null,
        officeSignboard: this.formData.officeSignboardPath || null,
        signageResubmitDeadline: this.formData.signboardResubmitDate || null,
        osreview: this.formData.signboardReview || null,
        osremarks: this.formData.signboardRemarks || null,
        filingSystem: this.formData.properFillingPath || null,
        fsreview: this.formData.filingReview || null,
        fsremarks: this.formData.filingRemarks || null,
        fsresubmitDeadline: this.formData.filingResubmitDate || null
      }
    };

    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
      (response: any) => {
        try {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.id = parsedResponse.consultantRegistrationDto?.id;

          Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: 'Office signage and documents review saved successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['monitoring/construction']);
        } catch (e) {
          console.error('Error parsing response:', e);
          Swal.fire('Error', 'An unexpected error occurred while parsing the response.', 'error');
        }
      },
      (error) => {
        console.error('Error saving data:', error);
        Swal.fire('Error', 'Failed to save office signage and documents review.', 'error');
      }
    );
  }


  id: any;
  saveAndNext() {
    const payload = {
      consultantRegistrationDto: {
        bctaNo: this.data.consultantNo,
        firmName: this.formData.firmName,
        contactNo: this.formData.mobileNo,
        email: this.formData.emailAddress,
        classification: this.formData.classification,
        officeSignboard: this.formData.officeSignboardPath,
        // osNotificationDate: this.formData.createdAt,  faced an issue with date format
        signageResubmitDeadline: this.formData.resubmitDate,
        osResubmitted: true,
        filingSystem: this.formData.properFillingPath,
        fsreview: this.formData.filingReview,
        oslocation: this.data.officeLocation,
        osreview: this.formData.signboardReview,
        osremarks: this.formData.signboardRemarks,
        fsremarks: this.formData.filingRemarks,
        fsresubmitDeadline: this.formData.filingResubmitDate
      }
    }

    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe((response: any) => {
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.id = parsedResponse.consultantRegistrationDto.id
      console.log('this.id', this.id);
      //  this.id = res.registrationReview.id
      this.activateTab.emit({ id: this.id, tab: 'consultancyEmployee' });
    })

  }
}
