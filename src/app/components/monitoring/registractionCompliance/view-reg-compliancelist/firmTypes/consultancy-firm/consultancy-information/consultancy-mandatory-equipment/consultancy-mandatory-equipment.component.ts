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
  formData :any= {
     
    };
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
    equipmentMasterList = [
      { id: 'eq1', name: 'Excavator' },
      { id: 'eq2', name: 'Bulldozer' },
      { id: 'eq3', name: 'Concrete Mixer' }
    ];
  firmType:any
  bctaNo:any
  tableData:any
  @Input() id: string = ''
  data: any;
  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }
 
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
    this.id = this.id;
    const WorkDetail = this.service.getData('BctaNo');
    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.consultantNo;
    this.data = WorkDetail.data;
    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);
    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }
  
  fetchDataBasedOnBctaNo(){
    this.service.getDatabasedOnBctaNo(this.bctaNo ).subscribe((res: any) => {
      this.tableData = res.vehicles
      console.log('consultant equipments', this.formData);
    })
  }
  
    // formData: any = {
    //   equipmentType: '',
    //   requiredEquipment: '',
    //   categoryOfService: 'Auto-generated category',
    //   equipmentDeployed: '',
    //   remarks: '',
    //   fulfillsRequirement: '',
    //   lastDateToResubmit: '',
    //   remarksIfNo: ''
    // };
    // For date validation (optional)
    minResubmitDate: string = this.getMinDate();
  
    getMinDate(): string {
      const today = new Date();
      today.setDate(today.getDate()); // you can adjust if needed
      return today.toISOString().split('T')[0];
    }
  
  
  onSubmit() {}

  
  tableId:any
  saveAndNext() {
    const table = this.service.setData(this.tableId, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "equipmentType": item.vehicleType,
      "isRegistered": "string",
      "categoryOfService": "string",
      "equipmentDeployed": "string",
      "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement, // fixed here
      "resubmitDeadline": this.formData.ResubmitDate, // fixed here
      "deadlineRemarks": this.formData.resubmitRemarks, // fixed here
      "remarks": "string",
      "edremarks": "string" }));

    const payload = {
  consultantRegistrationDto: {
    id: this.tableId,
  },
     consultantEquipmentDto: eq
    };
    this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe((res: any) => {
      console.log('res', res);
      // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
        console.log('Emitting consultancyMonitoring', this.tableId);

      this.activateTab.emit({ id: this.tableId, tab: 'consultancyMonitoring' });
    });
  }

  notifyContractor() {
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "equipmentType": item.vehicleType,
      "requiredEquipment": "string",
      "categoryOfService": "string",
      "equipmentDeployed": "string",
      "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement, // fixed here
      "resubmitDeadline": this.formData.ResubmitDate, // fixed here
      "deadlineRemarks": this.formData.resubmitRemarks, // fixed here
      "remarks": "string",
      "edremarks": "string" })); 
    const payload = {
       registrationReview: { id: this.tableId },
       consultantEquipmentDto: eq
    };
    
    this.service.saveOfficeSignageAndDoc(payload).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Requirements Not Met',
          text: 'The firm has been notified to resubmit the form',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        this.router.navigate(['monitoring/consultancy']);
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
}
