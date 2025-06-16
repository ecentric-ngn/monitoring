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
  formData: any = {
  
    };
    @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
    equipmentMasterList = [
      { id: 'eq1', name: 'Excavator' },
      { id: 'eq2', name: 'Bulldozer' },
      { id: 'eq3', name: 'Concrete Mixer' }
    ];
    firmType: any
    bctaNo: any
    tableData: any
    @Input() id: string = ''
  
    constructor(@Inject(CommonService) private service: CommonService,  private router: Router){}
  
    ngOnInit() {
      console.log('id', this.id);
      // Initialize formData with default values
      this.formData = {
        equipmentType: '',
        requiredEquipment: '',
        categoryOfService: 'Auto-generated category',
        equipmentDeployed: '',
        remarks: '',
        fulfillsRequirement: '',
        lastDateToResubmit: '',
        remarksIfNo: ''
      };
      // Set the id from input
  
      this.id = this.id
      const WorkDetail = this.service.getData('BctaNo');
      this.formData.firmType = WorkDetail.data
      this.bctaNo = WorkDetail.data.certifiedBuilderNo
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
      // const eq = this.tableData.map((item: any) => ({
      //   isRegistered: 'true',
      //   vehicleType: item.vehicleType,
      //   registrationNo: item.vehicleNumber,
      //   ownerName: item.owner,
      //   ownerCid: item.vehicleType,
      //   equipmentType: item.vehicleType,
      //   mandatoryEquipmentFulfilled: 'true',
      //   resubmitDeadline: '2023-09-01',
      //   remarks: this.formData.remarks, // fixed here
      // }));
      const payload = {
        cbReviewDto: { id: this.tableId },
        cbEquipmentReviewDto: [
          {
            equipmentDescription: "Heavy Earth Moving Equipment",
            requiredEquipment: "Excavator",
            requiredEquipmentFulfilled: this.formData.fulfillsRequirement,
            remark: this.formData.resubmitRemarks,
          }
        ]
      };
      this.service.saveOfficeSignageAndDocCB(payload).subscribe((res: any) => {
        console.log('res', res);
        // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
        this.activateTab.emit({ id: this.tableId, tab: 'cbMonitoring' });
      });
    }
  
    notifyContractor() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;
    const payload = {
       cbReviewDto: { id: this.tableId },
          cbEquipmentReviewDto: [
            {
            equipmentDescription: "Heavy Earth Moving Equipment",
            requiredEquipment: "Excavator",
            requiredEquipmentFulfilled: this.formData.fulfillsRequirement,
            remark: this.formData.resubmitRemarks,
            }
          ]
    };
    
    this.service.saveOfficeSignageAndDocCB(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Requirements Not Met',
          text: 'The Firm has been notified to resubmit the form',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        this.router.navigate(['monitoring/cerified-builders']);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to notify contractor',
          icon: 'error'
        });
      }
    });
  }
}
