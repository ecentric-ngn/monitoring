import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cb-mandatory-equipment',
  templateUrl: './cb-mandatory-equipment.component.html',
  styleUrls: ['./cb-mandatory-equipment.component.scss']
})
export class CbMandatoryEquipmentComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  firmType: any;
  bctaNo: any;
  tableData: any;
  applicationStatus: string = '';

  @Input() id: string = ''

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    console.log('id', this.id);
    // Initialize formData with default values
    this.formData = {
      vehicleType: '',
      requiredEquipment: '',
      finalRemarks: '',
      fulfillsRequirement: '',
      resubmitRemarks: '',
      resubmitDate: ''
    };
    // Set the id from input

    this.id = this.id
    const WorkDetail = this.service.getData('BctaNo');
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.certifiedBuilderNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo()
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.vehicles
      console.log('CB equipments', this.formData);
    })
  }


  // For date validation (optional)
  minResubmitDate: string = this.getMinDate();

  getMinDate(): string {
    const today = new Date();
    today.setDate(today.getDate()); // you can adjust if needed
    return today.toISOString().split('T')[0];
  }

  onSubmit() {

  }

  tableId: any

  saveAndNext() {
    const table = this.service.setData(this.tableId, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "equipmentDescription": "string",
      "requiredEquipment": "string",
      "requiredEquipmentFulfilled": this.formData.fulfillsRequirement,
      "resubmitDeadline": this.formData.resubmitDate,
      "deadlineRemarks": this.formData.resubmitRemarks,
      "remarks": this.formData.finalRemarks,

      //  "isRegistered": item.equipmentType,
      // "vehicleType": item.vehicleType,
      // "registrationNo": item.registrationNo,
      // "ownerName": item.ownerName,
      // "ownerCid": item.ownerCid,
      // "equipmentType": item.equipmentName,
      // "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement,
    }));

    const payload = {
      cbReviewDto: {
        id: this.tableId,
      },
      cbEquipmentReviewDto: eq
    };
    this.service.saveOfficeSignageAndDocCB(payload).subscribe((res: any) => {
      console.log('res', res);
      // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      console.log('Emitting cbMonitoring', this.tableId);

      this.activateTab.emit({ id: this.tableId, tab: 'cbMonitoring' });
    });
  }

  notifyContractor() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "equipmentDescription": "string",
      "requiredEquipment": "string",
      "requiredEquipmentFulfilled": this.formData.fulfillsRequirement,
      "resubmitDeadline": this.formData.resubmitDate,
      "deadlineRemarks": this.formData.resubmitRemarks,
      "remarks": this.formData.finalRemarks,
    }));

    const payload = {
      cbReviewDto: {
        id: this.tableId,
      },
      cbEquipmentReviewDto: eq
    };

    this.service.saveOfficeSignageAndDocCB(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Requirements Not Met',
          text: 'The firm has been notified to resubmit the form',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        this.router.navigate(['monitoring/cerified-builders']);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to notify firm',
          icon: 'error'
        });
      }
    });
  }

  update() {
    const payload = {
      cbReviewDto: { bctaNo: this.bctaNo },
      cbEquipmentReviewDto: [{
        mandatoryEquipmentFulfilled: this.formData.fulfillsRequirement,
        resubmitDeadline: this.formData.resubmitDate,
        resubmitRemarks: this.formData.resubmitRemarks
      }]
    };

    this.service.saveOfficeSignageAndDocCB(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/certified']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Update failed!',
          text: err?.error?.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
