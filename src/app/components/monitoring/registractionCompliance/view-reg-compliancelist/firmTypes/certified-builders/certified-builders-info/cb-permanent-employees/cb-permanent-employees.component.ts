import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-cb-permanent-employees',
  templateUrl: './cb-permanent-employees.component.html',
  styleUrls: ['./cb-permanent-employees.component.scss']
})
export class CbPermanentEmployeesComponent {
formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  tableData: any
  @Input() id: string = '';
  constructor(@Inject(CommonService) private service: CommonService) { }

  ngOnInit() {
    this.id = this.id
    console.log('idinemployee', this.id);
    const WorkDetail = this.service.getData('BctaNo');
    this.formData.firmType = WorkDetail.data
    this.bctaNo = WorkDetail.data.certifiedBuilderNo
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

  tableId: any
  // saveAndNext() {
  //   const table= this.service.setData(this.id, 'tableId', 'office-signage');
  //   this.tableId = this.id
  //    this.activateTab.emit({ id: this.id, tab: 'equipment' });
  // }

  saveAndNext() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;
    // const hr = this.tableData.map((item: any) => ({
    //   cidNo: item.cdbno,
    //   fullName: item.fullName,
    //   mobileNo: item.mobileNo,
    //   designation: item.designationName,
    //   email: item.email,
    //   gender: item.sex,
    //   nationality: item.countryName,
    //   qualification: item.qualification,
    //   joiningDate: '2023-09-01',
    //   tradeField: item.tradeName, // fixed here
    //   paySlip: this.formData.paySlipFileName,
    //   hrFulfilled: this.formData.hrFulfilled,
    //   resubmitDeadline: this.formData.resubmitDate,
    //   remarks: this.formData.remarks,
    //   tdsFetched: this.formData.tdsFetched
    // }));
    const payload = {

      cbReviewDto: { id: this.tableId }, // fixed here
      // employeeReviews: hr
      cbEmployeeReviewDto: [
        {
          cidNo: "1241112222",
          fullName: "John Doe",
          gender: "Male",
          nationality: "Bhutanese",
          qualification: "Bachelor's Degree",
          joiningDate: "2025-06-12",
          tradeField: "Engineering",
          paySlip: "paySlipFileName.pdf",
          hrFulfilled: this.formData.hrFulfilled,
          resubmitDeadline: this.formData.resubmitDate,
          deadlineRemarks: "All documents are in order.",
          psremarks: "Requirements met!",
        }
      ]
    };
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'cbEquipment' });
    });
  }

  saveAndForward() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');

    this.tableId = this.id;
    const payload = {
      cbReviewDto: { id: this.tableId }, // fixed here
      // employeeReviews: hr
      cbEmployeeReviewDto: [
        {
          cidNo: "1241112222",
          fullName: "John Doe",
          gender: "Male",
          nationality: "Bhutanese",
          qualification: "Bachelor's Degree",
          joiningDate: "2025-06-12",
          tradeField: "Engineering",
          paySlip: "paySlipFileName.pdf",
          hrFulfilled: this.formData.hrFulfilled,
          resubmitDeadline: this.formData.resubmitDate,
          deadlineRemarks: "All documents are not order.",
          psremarks: "Requirements not met!",
        }
      ]
    };
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'cbEquipment' });
    });
  }
}
