import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';

@Component({
  selector: 'app-permanent-employee',
  templateUrl: './permanent-employee.component.html',
  styleUrls: ['./permanent-employee.component.scss']
})
export class PermanentEmployeeComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  tableData: any;
  @Input() id: string = '';
  data: any;
  constructor(private service: CommonService) { }

  ngOnInit() {
    const WorkDetail = this.service.getData('BctaNo');

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.contractorNo;
    this.data = WorkDetail.data;

    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.hrCompliance
      console.log('contractor employee', this.formData);
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

      registrationReview: { id: this.tableId }, // fixed here
      // employeeReviews: hr
      employeeReviews: [
        {
          cidNo: this.data.cId,
          fullName: this.data.name,
          gender: this.data.sex,
          nationality: this.data.countryName,
          qualification: this.data.qualification,
          joiningDate: this.data.joiningDate || "2025-06-12", // default date if not provided
          tradeField: this.data.tradeName, // fixed here
          paySlip: this.data.paySlipFileName || "paySlipFileName.pdf", // default value if not provided
          hrFulfilled: this.formData.hrFulfilled,
          resubmitDeadline: this.formData.resubmitDate,
          remarks: "All documents are in order.",
          tdsFetched: true
        }
      ]
    };
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'equipment' });
    });
  }

  saveAndForward() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');

    this.tableId = this.id;
    const payload = {
      registrationReview: { id: this.tableId }, // fixed here
      // employeeReviews: hr
      employeeReviews: [
        {
          cidNo: this.data.cId,
          fullName: this.data.name,
          gender: this.data.sex,
          nationality: this.data.countryName,
          qualification: this.data.qualification,
          joiningDate: this.data.joiningDate || "2025-06-12", // default date if not provided
          tradeField: this.data.tradeName, // fixed here
          paySlip: this.data.paySlipFileName || "paySlipFileName.pdf", // default value if not provided
          hrFulfilled: this.formData.hrFulfilled,
          resubmitDeadline: this.formData.resubmitDate,
          remarks: "Requirements not met!",
          tdsFetched: true
        }
      ]
    };
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'equipment' });
    });
  }

}