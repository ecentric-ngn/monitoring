import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-mandatory-equipment',
  templateUrl: './mandatory-equipment.component.html',
  styleUrls: ['./mandatory-equipment.component.scss']
})
export class MandatoryEquipmentComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();

  firmType: any
  bctaNo: any
  tableData: any
  @Input() id: string = ''
  data: any;
  tData: any;
  applicationStatus: string = '';
  isSaving = false;

  constructor(private service: CommonService, private router: Router) { }

  ngOnInit() {
    console.log('id', this.id);
    // Initialize formData with default values
    this.formData = {
      equipmentType: '',
      requiredEquipment: '',
      categoryOfService: '',
      equipmentDeployed: '',
      finalRemarks: '',
    };

    this.tData = {
      eqFulfilled: '',
      eqResubmitDeadline: '',
      eqRemarks: ''
    }

    // Set the id from input
    this.id = this.id;
    const WorkDetail = this.service.getData('BctaNo');
    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.contractorNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.data = WorkDetail.data;
    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);
    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }

    this.service.setBctaNo(this.bctaNo);
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.vehicles
      console.log('contractor equipment', this.formData);
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
    this.isSaving = true;
    const table = this.service.setData(this.tableId, 'tableId', 'office-signage');
    this.tableId = this.id;
    const eq = this.tableData.map((item: any) => ({
      "isRegistered": item.equipmentType,
      "vehicleType": item.vehicleType,
      "registrationNo": item.registrationNo,
      "ownerName": item.ownerName,
      "ownerCid": item.ownerCid,
      "equipmentType": item.equipmentName,
      "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement,
      "remarks": this.formData.finalRemarks,
    }));

    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.resubmitRemarks
      },
      equipmentReviews: eq
    };
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      this.isSaving = false;
      console.log('res', res);
      // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
    },
      (error) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to save',
          icon: 'error'
        });
      }
    );
  }

  notifyContractor() {
    this.isSaving = true;
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "isRegistered": item.equipmentType,
      "vehicleType": item.vehicleType,
      "registrationNo": item.registrationNo,
      "ownerName": item.ownerName,
      "ownerCid": item.ownerCid,
      "equipmentType": item.equipmentName,
      "remarks": this.formData.finalRemarks,
    }));

    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.resubmitRemarks
      },

      equipmentReviews: eq
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Requirements Not Met',
          text: 'The contractor has been notified to resubmit the form',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        // this.router.navigate(['monitoring/construction']);   
        this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
      },
      error: (error) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to notify contractor',
          icon: 'error'
        });
      }
    });
  }

  update() {
    this.isSaving = true;
    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.resubmitRemarks
      },
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/construction']);
        });
      },
      error: (err) => {
        this.isSaving = false;
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