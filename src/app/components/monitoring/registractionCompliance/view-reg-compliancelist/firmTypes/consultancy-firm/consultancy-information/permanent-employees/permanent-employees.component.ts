import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { faJoint } from '@fortawesome/free-solid-svg-icons';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-permanent-employees',
  templateUrl: './permanent-employees.component.html',
  styleUrls: ['./permanent-employees.component.scss']
})
export class PermanentEmployeesComponent {
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
    this.bctaNo = WorkDetail.data.consultantNo
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
    const hr = this.tableData.map((item: any) => ({
      cidNo: item.cId,
      fullName: item.name,
      mobileNo: item.mobileNo,
      designation: item.designationName,
      email: item.email,
      gender: item.sex,
      nationality: item.countryName,
      qualification: item.qualification,
      // joiningDate:  item.joiningDate, encountered an issue with date format
      joiningDate: "2024-01-01",
      tradeField: item.tradeName,
      paySlip: item.paySlipFileName,
      hrFulfilled: this.formData.hrFulfilled,
      resubmitDeadline: this.formData.resubmitDate,
      deadlineRemarks: this.formData.remarksNo,
      remarks: this.formData.remarksYes,
      psremarks: ""
    }));
    const payload = {
      consultantRegistrationDto: {
        id: this.tableId,
      },
      consultantEmployeeDto: hr
    };
    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe((res: any) => {
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'consultancyEquipment' });
    });
  }

}
