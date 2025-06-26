import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultancy-mandatory-equipment',
  templateUrl: './consultancy-mandatory-equipment.component.html',
  styleUrls: ['./consultancy-mandatory-equipment.component.scss']
})
export class ConsultancyMandatoryEquipmentComponent {
  formData: any = {

  };
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();

  firmType: any
  bctaNo: any
  tableData: any[] = [];
  @Input() id: string = ''
  data: any;
  tData: any;
  applicationStatus: string = '';
  isSaving = false;

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    console.log('id', this.id);
    // Initialize formData with default values
    this.formData = {
      equipmentType: '',
      requiredEquipment: '',
      categoryOfService: '',
      equipmentDeployed: '',
      remarks: '',
      fulfillsRequirement: '',
      lastDateToResubmit: '',
      remarksIfNo: ''
    };
    // Set the id from input
    this.id = this.id;
    const WorkDetail = this.service.getData('BctaNo');
    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.consultantNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.data = WorkDetail.data;
    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);

    this.tData = {
      eqFulfilled: '',
      eqResubmitDeadline: '',
      eqRemarks: ''
    }

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }

    this.service.setBctaNo(this.bctaNo);
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.vehicles
      console.log('consultant equipments', this.formData);
    })
  }

  minResubmitDate: string = this.getMinDate();

  getMinDate(): string {
    const today = new Date();
    today.setDate(today.getDate()); // you can adjust if needed
    return today.toISOString().split('T')[0];
  }


  onSubmit() { }


  tableId: any
  saveAndNext() {
    this.isSaving = true;
    const table = this.service.setData(this.tableId, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "equipmentType": item.equipmentName,
      "requiredEquipment": item.vehicleType,
      "categoryOfService": null,
      "equipmentDeployed": null,
    }));

    const payload = {
      consultantRegistrationDto: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.remarks
      },
      consultantEquipmentDto: eq
    };
    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe((res: any) => {
      this.isSaving = false;
      console.log('res', res);
      // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      console.log('Emitting consultancyMonitoring', this.tableId);

      this.activateTab.emit({ id: this.tableId, tab: 'consultancyMonitoring' });
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
      "equipmentType": item.equipmentName,
      "requiredEquipment": item.vehicleType,
      "categoryOfService": null,
      "equipmentDeployed": null,
    }));

    const payload = {
      consultantRegistrationDto: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.remarks
      },
      consultantEquipmentDto: eq
    };

    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Requirements Not Met',
          text: 'The firm has been notified to resubmit the form',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        // this.router.navigate(['monitoring/consultancy']);
        this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
      },
      error: (error) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to notify firm',
          icon: 'error'
        });
      }
    });
  }

  update() {
    this.isSaving = true;
    const payload = {
      consultantRegistrationDto: { 
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.remarks
       },
    };

    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/consultancy']);
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
