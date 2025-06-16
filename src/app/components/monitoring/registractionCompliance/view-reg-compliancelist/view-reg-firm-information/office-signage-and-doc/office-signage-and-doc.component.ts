import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';

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

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe(
      (res: any) => {
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

// In your component
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

  saveAndNext() {
    const payload = {
      registrationReview: {
        bctaNo: this.data.contractorNo,
        firmName: this.data.nameOfFirm,
        contactNo: this.data.mobileNo,
        email: this.data.emailAddress,
        classification: this.data.classificationDescription,
        applicationStatus: this.data.status,
        officeSignboard: this.formData.signboardReview,
        signageResubmitDeadline: this.formData.signboardResubmitDate, // Fixed to match formData
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.ohsRemarks, // Changed from generalRemarks
        fsreview: this.formData.filingReview,
        fsremarks: this.formData.filingRemarks,
        fsresubmitDeadline: this.formData.filingResubmitDate,
        oslocation: this.formData.officeLocation,
        osreview: this.formData.signboardReview,
        osremarks: this.formData.signboardRemarks,
        generalRemarks: this.formData.generalRemarks
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