import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-cb-office-signage',
  templateUrl: './cb-office-signage.component.html',
  styleUrls: ['./cb-office-signage.component.scss']
})
export class CbOfficeSignageComponent {
formData: any = {}
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  data: any
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

  id: any;
  saveAndNext() {
    const payload = {
      cbReviewDto: {
        bctaNo: this.data.certifiedBuilderNo,
        firmName: this.data.nameOfFirm,
        contactNo: this.formData.mobileNo,
        email: "yesheydorjee4@gmail.com",
        location: this.data.location,
        applicationStatus: this.data.applicationStatus,
        officeSignboard: this.formData.signboardReview,
        signageResubmitDeadline: this.formData.resubmitDate,
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.generalRemarks,
        fsreview: this.formData.filingReview,
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
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((response: any) => {
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.id = parsedResponse.cbReviewDto.id
      // this.service.setData(this.id, 'tableId', 'yourRouteValueHere');
      console.log('this.id', this.id);
      //  this.id = res.registrationReview.id
      this.activateTab.emit({ id: this.id, tab: 'cbEmployee' });
    })

    // this.router.navigate(['permanent-employee']);
  }
}
