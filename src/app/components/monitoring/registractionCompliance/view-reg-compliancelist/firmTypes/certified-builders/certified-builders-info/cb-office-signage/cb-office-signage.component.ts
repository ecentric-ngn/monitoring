import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cb-office-signage',
  templateUrl: './cb-office-signage.component.html',
  styleUrls: ['./cb-office-signage.component.scss']
})
export class CbOfficeSignageComponent {
  formData: any = {}
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  data: any;
  applicationStatus: string = '';
  isSaving = false;

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    const WorkDetail = this.service.getData('BctaNo');
    console.log('Retrieved WorkDetail:', WorkDetail);

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.formData.firmType = WorkDetail.data;
    this.data = WorkDetail.data;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    console.log('Checking cdbNo from WorkDetail.data:', WorkDetail.data.certifiedBuilderNo);
    this.bctaNo = WorkDetail.data.certifiedBuilderNo;

    if (this.bctaNo) {
      console.log('bctaNo is valid. Calling fetchDataBasedOnBctaNo...');
      this.fetchDataBasedOnBctaNo();
    } else {
      console.warn('bctaNo is undefined or null. Skipping API call.');
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      Object.assign(this.formData, res.complianceEntities[0]);
      console.log('cb-officesignagedoc', this.formData);
    })
  }

  onReviewChange() {
    if (this.formData.signboardReview === 'No') {
      this.formData.resubmitDate = '';
      this.formData.signboardRemarks = '';
    }
  }

  // Handle review change
  onFilingReviewChange() {
    if (this.formData.filingReview === 'No') {
      // Reset fields when switching to "No"
      this.formData.filingResubmitDate = null;
      this.formData.filingRemarks = '';
    }
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
      this.isSaving = true;
      const payload = {
        cbReviewDto: {
          bctaNo: this.data.certifiedBuilderNo || null,
          location: this.formData.officeLocation || null,
          locationReview: this.formData.reviewLocation || null,
          locationResubmitDeadline: this.formData.resubmitDate || null,
          locationRemarks: this.formData.resubmitRemarks || null,
          filingSystem: this.formData.properFillingPath || null,
          fsreview: this.formData.filingReview || null,
          fsremarks: this.formData.filingRemarks || null,
          fsresubmitDeadline: this.formData.filingResubmitDate || null
        }
      };
  
      this.service.saveOfficeSignageAndDocCB(payload).subscribe(
        (response: any) => {
          this.isSaving = false;
          try {
            const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
            this.id = parsedResponse.cbReviewDto?.id;
  
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
          this.isSaving = false;
          console.error('Error saving data:', error);
          Swal.fire('Error', 'Failed to save office signage and documents review.', 'error');
        }
      );
    }

  id: any;
  saveAndNext() {
    this.isSaving = true;
    const payload = {
      cbReviewDto: {
        bctaNo: this.data.certifiedBuilderNo,
        firmName: this.data.nameOfFirm,
        contactNo: this.formData.mobileNo,
        email: this.formData.emailAddress,
        location: this.formData.officeLocation,
        locationReview: this.formData.reviewLocation,
        locationResubmitDeadline: this.formData.resubmitDate,
        locationRemarks: this.formData.resubmitRemarks,
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.generalRemarks,
        fsresubmitDeadline: this.formData.fsresubmitDeadline,
        fsreview: this.formData.filingReview,
        fsremarks: this.formData.fsRemarks,
        reviewDate: this.formData.reviewDate,
        hrFulfilled: "",
        hrResubmitDeadline: "",
        hrRemarks: "",
        eqFulfilled: "",
        eqResubmitDeadline: "",
        eqRemarks: ""
      }

    }
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((response: any) => {
      this.isSaving = false;
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.id = parsedResponse.cbReviewDto.id
      // this.service.setData(this.id, 'tableId', 'yourRouteValueHere');
      console.log('this.id', this.id);
      //  this.id = res.registrationReview.id
      this.activateTab.emit({ id: this.id, tab: 'cbEmployee' });
    },
  (error) => {
        this.isSaving = false;
         console.error('Error saving data:', error);
         Swal.fire('Error', 'Failed to save office signage and documents review.', 'error');
      })

    // this.router.navigate(['permanent-employee']);
  }
}
