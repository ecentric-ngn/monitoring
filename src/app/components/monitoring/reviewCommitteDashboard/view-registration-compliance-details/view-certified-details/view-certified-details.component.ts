import { Component } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';

@Component({
  selector: 'app-view-certified-details',
  templateUrl: './view-certified-details.component.html',
  styleUrls: ['./view-certified-details.component.scss']
})
export class ViewCertifiedDetailsComponent {
  formData: any;
  BctaNo: any;
  userId: any;
  isLoading: boolean;
  builderDetails: any;
  errorMessage: string;
certifiedBuilders: any;
  tableId: any;
  equipmentDetails: any;
 

  constructor(private service: CommonService) {}

 ngOnInit() {
    const data = this.service.getData('BctaNo');
    this.BctaNo = data?.data || '';
    
    if (this.BctaNo) {
      this.FetchCertifiedBuilderBasedOnBctaNo();
    } else {
      this.errorMessage = 'BCTA number not found';
    }
  }

  FetchCertifiedBuilderBasedOnBctaNo() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const payload = [
      {
        "field": "bcta_no",
        "value": this.BctaNo,
        "condition": "=",
        "operator": "" // Removed "AND" as it's not needed for single condition
      }
    ];

    this.service.fetchCertifiedBuilderDetails(payload, 1, 2, 'v_certified_builder_registration_review').subscribe(
      (response: any) => {
        this.isLoading = false;
        
        if (response.data && response.data.length > 0) {
          this.builderDetails = response.data[0];
          console.log('Builder details:', this.builderDetails);

              this.tableId = this.builderDetails.id;
        if (this.tableId) {
          this.FetchCertifiedBuilderBasedOnEquipment();
          this.FetchCertifiedEmployeeDetails()
        }
       
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching builder details. Please try again.';
        console.error('Error:', error);
      }
    );
  }

   FetchCertifiedBuilderBasedOnEquipment() {
    this.isLoading = true;
    
    const payload = [
      {
        "field": "certified_builder_review_id",
        "value": this.tableId,
        "condition": "=",
        "operator": "" // Removed "AND" as it's not needed for single condition
      }
    ];

    this.service.fetchCertifiedBuilderDetails(payload, 1, 10, 'v_certified_builder_equipment_review').subscribe(
      (response: any) => {
        this.isLoading = false;
        
        if (response.data && response.data.length > 0) {
          this.equipmentDetails = response.data;
          console.log('Equipment details:', this.equipmentDetails);
        } else {
          console.warn('No equipment found for this builder');
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching equipment details:', error);
      }
    );
  }

  employeesData: any[] = [];

 FetchCertifiedEmployeeDetails() {
    this.isLoading = true;
    
    const payload = [
      {
        "field": "certified_builder_review_id",
        "value": this.tableId,
        "condition": "=",
        "operator": "" // Removed "AND" for single condition
      }
    ];

    this.service.fetchCertifiedBuilderDetails(payload, 1, 10, 'v_certified_builder_employee_review').subscribe(
      (response: any) => {
        this.isLoading = false;
        
        if (response.data && response.data.length > 0) {
          this.employeesData = response.data;
          console.log('Employee details:', this.employeesData);
        } else {
          console.warn('No employee details found');
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching employee details:', error);
      }
    );
  }
}

