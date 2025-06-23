import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-office-signage-and-doc',
  templateUrl: './office-signage-and-doc.component.html',
  styleUrls: ['./office-signage-and-doc.component.scss']
})
export class OfficeSignageAndDocComponent implements OnInit {
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  formData: any;
  bctaNo: any;
  data: any;
  id: any;
  applicationStatus: string = '';

  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    this.initializeFormData();
    this.loadWorkDetail();
  }

  initializeFormData() {
    this.formData = {
      officeSignboardPath: '',
      officeLocation: '',
      signboardReview: '',
      signboardResubmitDate: null,
      signboardRemarks: '',
      properFillingPath: '',
      filingReview: '',
      filingResubmitDate: null,
      filingRemarks: '',
      ohsHandBook: '',
      ohsReview: '',
      ohsResubmitDate: null,
      ohsRemarks: '',
      generalRemarks: ''
    };
  }

  loadWorkDetail() {
    const WorkDetail = this.service.getData('BctaNo');
    if (!WorkDetail?.data) {
      console.error('WorkDetail data not available');
      return;
    }
    

    this.data = WorkDetail.data;
    this.bctaNo = this.data.contractorNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    console.log("application Status:", this.applicationStatus);

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe(
      (res: any) => {
        debugger
        if (res?.complianceEntities?.length) {
          // Merge API response with initialized formData
          this.formData = { ...this.formData, ...res.complianceEntities[0] };
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  onReviewChange() {
    if (!this.formData) return;

    this.formData = {
      ...this.formData,
      signboardResubmitDate: this.formData.signboardReview === 'No' ? null : this.formData.signboardResubmitDate,
      signboardRemarks: this.formData.signboardReview === 'No' ? '' : this.formData.signboardRemarks
    };
  }

  onFilingReviewChange() {
    if (!this.formData) return;

    // Create a new object reference to maintain change detection
    this.formData = {
      ...this.formData,
      filingResubmitDate: this.formData.filingReview === 'No' ? null : this.formData.filingResubmitDate,
      filingRemarks: this.formData.filingReview === 'No' ? '' : this.formData.filingRemarks
    };
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
      registrationReview: {
        bctaNo: this.data.contractorNo || null,
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

    this.service.saveOfficeSignageAndDoc(payload).subscribe(
      (response: any) => {
        try {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.id = parsedResponse.registrationReview?.id;

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

  saveAndNext() {
    if (this.formData.signboardReview === 'No' && !this.formData.signboardResubmitDate) {
      alert("Please provide resubmit date for office signboard.");
      return;
    }

    if (this.formData.filingReview === 'No' && !this.formData.filingResubmitDate) {
      alert("Please provide resubmit date for proper filing system.");
      return;
    }

    const payload = {
      registrationReview: {
        bctaNo: this.data.contractorNo,
        firmName: this.formData.firmName,
        contactNo: this.formData.mobileNo,
        email: this.formData.emailAddress,
        classification: this.formData.classification,
        applicationStatus: this.data.status,
        officeSignboard: this.formData.officeSignboardPath,
        signageResubmitDeadline: this.formData.signboardResubmitDate,
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.ohsRemarks,
        reviewDate: this.formData.reviewDate,
        fsreview: this.formData.filingReview,
        fsremarks: this.formData.filingRemarks,
        fsresubmitDeadline: this.formData.filingResubmitDate,
        oslocation: this.formData.officeLocation,
        osreview: this.formData.signboardReview,
        osremarks: this.formData.signboardRemarks,
      }
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe(
      (response: any) => {
        try {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.id = parsedResponse.registrationReview?.id;
          this.activateTab.emit({ id: this.id, tab: 'employee' });
        } catch (e) {
          console.error('Error parsing response:', e);
        }
      },
      (error) => {
        console.error('Error saving data:', error);
      }
    );
  }

}