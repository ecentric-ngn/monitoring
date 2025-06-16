import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-office-signage',
  templateUrl: './office-signage.component.html',
  styleUrls: ['./office-signage.component.scss']
})
export class OfficeSignageComponent {
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
  
      console.log('Checking cdbNo from WorkDetail.data:', WorkDetail.data.consultantNo);
      this.bctaNo = WorkDetail.data.consultantNo;
  
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
        console.log('Consultancy officesignagedoc', this.formData);
      })
    }
  
    onReviewChange() {
      if (this.formData.signboardReview === 'No') {
        this.formData.resubmitDate = '';
        this.formData.remarks = '';
      }
    }
  
    id: any;
    saveAndNext() {
      const payload = {
        consultantRegistrationDto: {
          bctaNo: this.data.consultantNo,
          firmName: this.formData.nameOfFirm,
          contactNo: this.formData.mobileNo,
          email: this.formData.emailAddress,
          classification: this.formData.classification,
          officeSignboard: this.formData.signboardReview,
          // osNotificationDate: this.formData.createdAt,  faced an issue with date format
          osNotificationDate: "2024-01-01",
          signageResubmitDeadline: this.formData.resubmitDate,
          osResubmitted: true,
          filingSystem: this.formData.properFillingPath,
          fsreview: this.formData.filingReview,
          oslocation: this.formData.officeLocation,
          osreview: this.formData.signboardReview,
          osremarks: this.formData.remarks,
        }
  
      }
      this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe((response: any) => {
        const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
        this.id = parsedResponse.consultantRegistrationDto.id
        // this.service.setData(this.id, 'tableId', 'yourRouteValueHere');
        console.log('this.id', this.id);
        //  this.id = res.registrationReview.id
        this.activateTab.emit({ id: this.id, tab: 'consultancyEmployee' });
      })
  
      // this.router.navigate(['permanent-employee']);
    }
}
