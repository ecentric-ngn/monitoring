import { Component } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';

@Component({
  selector: 'app-view-reg-details',
  templateUrl: './view-reg-details.component.html',
  styleUrls: ['./view-reg-details.component.scss']
})
export class ViewRegDetailsComponent {
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
  

  
  constructor(private service: CommonService) {}
  
  ngOnInit() {
    const userDetailsString = sessionStorage.getItem('userDetails');
    if (userDetailsString) {
      const userDetails = JSON.parse(userDetailsString);
      this.userId = userDetails.userId;
    }
    const data = this.service.getData('BctaNo');
    this.BctaNo = data.data;
    if(this.BctaNo) {
      this.FetchBasedOnBctaNo();
      
    }
  }

  formatDateToYMD(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  FetchBasedOnBctaNo() {
    const payload: any = [
      {
        "field": "bcta_no",
        "value": this.BctaNo,
        "condition": "like",
        "operator": "AND"
      },
    ];

    this.service.fetchDetails(payload, 1, 100, 'view_registration_review_summary').subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          const apiData = response.data[0];

          if (apiData.status === 'in process') {
          console.log('Status is in process. Rechecking in 5 seconds...');
          setTimeout(() => this.FetchBasedOnBctaNo (), 5000); // re-call after 5 seconds
          return; // do not proceed further until it's no longer "in process"
        }

          // Format the date for the input field (YYYY-MM-DD)
          const reviewedDate = apiData.reviewed_date ? 
            new Date(apiData.reviewed_date).toISOString().split('T')[0] : 
            null;
          
          this.formData.moniterReviewDate = reviewedDate;
          console.log('Formatted Review Date:', this.formData.moniterReviewDate);
          
          this.tableId = apiData.id;
          if(this.tableId) {
            this.FetchWorkBaseOnEquipmentDetails();
            this.FetchPermanentEmployeesDetails();
            this.getDatabasedOnChecklistId();
          }

          // Store registration data in formData
          this.formData = {
            ...this.formData, // Keep existing formData including the formatted date
            registration_no: apiData.bcta_no,
            full_name: apiData.firm_name,
            address: apiData.email,
            contact_no: apiData.contact_no || 'N/A',
            email: apiData.email,
            classification: apiData.classification,
            signboard: apiData.office_signboard,
            signboardReview: apiData.signage_review ? 'Yes' : 'No',
            resubmitDate: apiData.signage_resubmit_deadline,
            signboardRemarks: apiData.office_remarks,
            filingSystem: apiData.filing_system || 'N/A',
            filingReview: apiData.filing_review ? 'Yes' : 'No',
            ohsHandbook: apiData.ohs_handbook || 'N/A',
            ohsReview: apiData.ohs_review ? 'Yes' : 'No',
            generalRemarks: apiData.office_remarks,
          };
        }
      },
      (error) => {
        console.error('Error fetching contractor details:', error);
      }
    );
  }

  
FetchWorkBaseOnEquipmentDetails() {
  const payload: any = [
    {
      field: "contractor_registration_review_id",
      value: this.tableId,
      condition: "AND",
      operator: "="
    },
  ];

  this.service.fetchDetails(payload, 1, 100, 'view_equipment_review_summary').subscribe(
    (response: any) => {
      if (response.data && response.data.length > 0) {
        this.equipmentData = response.data.map((equipment: any) => ({
          isRegistered: equipment.is_registered ? 'Yes' : 'No',
          vehicleType: equipment.vehicle_type || 'N/A',
          registrationNo: equipment.registration_no || 'N/A',
          ownerName: equipment.owner_name || 'N/A',
          ownerCid: equipment.owner_cid || 'N/A',
          equipmentType: equipment.equipment_type || 'N/A',
          mandatoryEquipmentFulfilled: equipment.mandatory_equipment_fulfilled ? 'Yes' : 'No',
          resubmitDeadline: equipment.resubmit_deadline || 'N/A',
          remarks: equipment.remarks || 'N/A'
        }));
      } else {
        this.equipmentData = [];
      }
    },
    (error) => {
      console.error('Error fetching equipment details:', error);
    }
  );
}

  FetchPermanentEmployeesDetails() {
    const payload: any = [
      {
        "field": "contractor_registration_review_id",
        "value": this.tableId,
        "condition": "AND",
        "operator": "="
      },
    ]

    this.service.fetchDetails(payload, 1, 100, 'view_employee_review_summary').subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          // Store employee data in employeesData array
          this.employeesData = response.data.map((employee: any) => ({
            cidNo: employee.cid_no || 'N/A',
            fullName: employee.full_name || 'N/A',
            gender: employee.gender || 'N/A',
            nationality: employee.nationality || 'N/A',
            qualification: employee.qualification || 'N/A',
            joiningDate: employee.joining_date || 'N/A',
            tradeField: employee.trade_field || 'N/A',
            paySlip: employee.pay_slip ? 'Yes' : 'No',
            hrFulfilled: employee.hr_fulfilled ? 'Yes' : 'No',
            resubmitDeadline: employee.resubmit_deadline || 'N/A',
            remarks: employee.remarks || 'N/A'
          }));
        }
      },
      (error) => {
        console.error('Error fetching employee details:', error);
      }
    );
  }


   getDatabasedOnChecklistId() {
       const payload : any =[ {
                "field": "bcta_no",
                "value": 1024,
                "operator": "AND",
                "condition": "="
              }
        ]
          this.service.fetchDetails(payload,1,100,'v_monitoring_team_members').subscribe(
            (response: any) => {
            if (response.data && response.data.length > 0) {
          const checklists = response.data;
         this.moniterTeamList = checklists 
          // Store equipment data in equipmentData

            console.log('Monitoring Team List:', this.moniterTeamList);
          }
            },
            // Error handler
            (error) => {
              console.error('Error fetching contractor details:', error); // Log the error
            }
          );
        }

        //fetching view for consultancy firm details//
          
  
}