import { Component, EventEmitter, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-office-signage-and-doc',
  templateUrl: './office-signage-and-doc.component.html',
  styleUrls: ['./office-signage-and-doc.component.scss']
})
export class OfficeSignageAndDocComponent {
  formData: any = {}
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  data: any
  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    const WorkDetail = this.service.getData('BctaNo');
    console.log('Retrieved WorkDetail:', WorkDetail);

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.formData.firmType = WorkDetail.data;
    this.data = WorkDetail.data;

    console.log('Checking cdbNo from WorkDetail.data:', WorkDetail.data.contractorNo);
    this.bctaNo = WorkDetail.data.contractorNo;

    if (this.bctaNo) {
      console.log('bctaNo is valid. Calling fetchDataBasedOnBctaNo...');
      this.fetchDataBasedOnBctaNo();
    } else {
      console.warn('bctaNo is undefined or null. Skipping API call.');
    }
  }


  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.formData = res.complianceEntities[0]
      console.log('officesignagedoc', this.formData);
    })
  }

  onReviewChange() {
    if (this.formData.signboardReview === 'No') {
      this.formData.resubmitDate = '';
      this.formData.signboardRemarks = '';
    }
  }

  id: any;
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
        signageResubmitDeadline: this.formData.resubmitDate,
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.generalRemarks,
        fsreview: this.formData.filingReview,
        oslocation: this.formData.officeLocation,
        osreview: this.formData.signboardReview,
        osremarks: this.formData.signboardRemarks,

        // signageReview: true,
        // filingReview: this.formData.filingReview,
        // officeRemarks: this.formData.remarks,
        // submittedOn: this.data.createdBy,
        // status: this.data.status,
        // licenseStatus: this.data.licenseStatus,
        // notification: this.data.notification,
        // verifiedBy: this.data.verifiedBy,
      }

    }
    this.service.saveOfficeSignageAndDoc(payload).subscribe((response: any) => {
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.id = parsedResponse.registrationReview.id
      // this.service.setData(this.id, 'tableId', 'yourRouteValueHere');
      console.log('this.id', this.id);
      //  this.id = res.registrationReview.id
      this.activateTab.emit({ id: this.id, tab: 'employee' });
    })

    // this.router.navigate(['permanent-employee']);
  }

}
