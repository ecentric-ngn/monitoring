import { Component } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';



@Component({
  selector: 'app-view-conultency-details',
  templateUrl: './view-conultency-details.component.html',
  styleUrls: ['./view-conultency-details.component.scss']
})
export class ViewConultencyDetailsComponent {


formData: any = {}; // For registration details
  equipmentData: any = {}; // For equipment details
  employeesData: any[] = []; // For employee details (array since there can be multiple)
  userId: any;
  BctaNo: any;
  tableId: any;
  checklistData: { isRegistered?: string; vehicleType?: any; registrationNo?: any; ownerName?: any; ownerCid?: any; equipmentType?: any; mandatoryEquipmentFulfilled?: string; resubmitDeadline?: any; remarks?: any; fullName?: string; Designation?: any; };
  moniterTeamList: any;
  moniterReviewDate: any;
  consultantEmployeesData: any;
  apiData: any;
  registrationReviewData: any;

  
  constructor(private service: CommonService) {}
  
  ngOnInit() {
    const userDetailsString = sessionStorage.getItem('userDetails');
    
    const data = this.service.getData('BctaNo');
    this.BctaNo = data.data;
    if(this.BctaNo) {
    
      this.FetchConsultantEmployeeReview();
    }
    // Assuming tableId should come from BctaNo or another source; update as needed
   
  }

 FetchConsultantEmployeeReview(): void {
  const payload: any = [
    {
      field: 'bcta_no',
      value: this.BctaNo,
      condition: '=',
      operator: 'AND'
    }
  ];

  this.service.fetchconsultantDetails(payload, 1, 2, 'view_consultant_registration_review').subscribe(
    (response: any) => {
      if (response.data && response.data.length > 0) {
        this.registrationReviewData = response.data; // Store the data for the table
        const apiData = response.data[0];

       if (apiData.status === 'in process') {
          console.log('Status is in process. Rechecking in 5 seconds...');
          setTimeout(() => this.FetchConsultantEmployeeReview(), 5000); // re-call after 5 seconds
          return; // do not proceed further until it's no longer "in process"
        }
        
        this.tableId = apiData.registration_review_id;
        if (this.tableId) {
          this.FetchEmployeeBasedOnTableId();
          this.FetchWorkBasedOnEquipmentDetails();
        }
        
        this.formData = {
          firmName: apiData.firm_name || 'N/A',
          bctaNo: apiData.bcta_no || 'N/A',
          classification: apiData.classification || 'N/A',
          contactNo: apiData.contact_no || 'N/A',
          email: apiData.email || 'N/A',
          filingSystem: apiData.filing_system || 'N/A',
          officeSignboard: apiData.office_signboard || 'N/A',
          osReview: apiData.os_review || 'N/A',
          osLocation: apiData.oslocation || 'N/A',
          osRemarks: apiData.os_remarks || 'N/A',
          osNotificationDate: apiData.os_notification_date || 'N/A',
          osResubmitted: apiData.os_resubmitted ? 'Yes' : 'No',
          signageResubmitDeadline: apiData.signage_resubmit_deadline || 'N/A',
          fsReview: apiData.fsreview || 'N/A'
        };
      }
    },
    (error) => {
      console.error('Error fetching consultant registration review:', error);
    }
  );
}

  employeeReviewData: any[] = [];

FetchEmployeeBasedOnTableId() {
  const payload: any = [
    {
      "field": "consultant_registration_review_id",
      "value": this.tableId,
      "condition": "like",
      "operator": "AND"
    },
  ];

  this.service.fetchconsultantDetails(payload, 1, 2, 'view_consultant_employee_review').subscribe(
    (response: any) => {
      if (response.data && response.data.length > 0) {
        this.employeeReviewData = response.data;
      }
    },
    (error) => {
      console.error('Error fetching employee details:', error);
    }
  );
}

FetchWorkBasedOnEquipmentDetails() {
  const payload: any = [
    {
      "field": "consultant_registration_review_id",
      "value": this.tableId,
      "condition": "like",
      "operator": "AND"
    },
  ];

  this.service.fetchconsultantDetails(payload, 1, 2, 'view_consultant_equipment_review').subscribe(
    (response: any) => {
      if (response.data && response.data.length > 0) {
        this.equipmentData = response.data; // Store all equipment data
      }
    },
    (error) => {
      console.error('Error fetching equipment details:', error);
    }
  );
}}
