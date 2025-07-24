import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
    selector: 'app-monitor-team-lists',
    templateUrl: './monitor-team-lists.component.html',
    styleUrls: ['./monitor-team-lists.component.scss'],
})
export class MonitorTeamListsComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: string;
    errorMessages: any = {};
    @Input() tableId: any;
    applicationNumber: any;
    teamList: any;
    @Input() prevTableId: any;
    @Input() data: any;
    @Input() workId: any;
    @Output() monitoringData = new EventEmitter<any>();
    @Output() previousClicked = new EventEmitter<void>();
    appNoStatus: any;
    constructor(private service: CommonService, private router: Router,private notification: NzNotificationService) {}
  
    ngOnInit() {
       
        this.tableId = this.tableId
        // if(!this.tableId){
        // this.fetchCrpsUsers()
        // }
        this.data = this.data
        const today = new Date();
        this.formData.monitoringDate = today.toISOString().split('T')[0];
        this.appNoStatus = this.data.applicationStatus
        this.prevTableId = this.prevTableId
        
          if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId();
        }
    }

    getDatabasedOnChecklistId() {
  const payload: any = [
    {
      field: 'checklist_id',
      value: this.prevTableId,
      operator: 'AND',
      condition: '='
    },
       {
        field: 'workid',
        value: this.workId,
        operator: 'AND',
        condition: '=',
        },
  ];

  this.service.fetchDetails(payload, 1, 100, 'v_monitoring_team_members').subscribe(
    (response: any) => {
      const data = response.data;

      // If empty, call fetchCrpsUsers()
      if (!data || data.length === 0) {
        this.fetchCrpsUsers();
        return;
      }

      // Otherwise map the data
      this.teamList = data.map((item: any) => {
        return {
          id: item.id,
          cid_emp_id: item.cid_no,
          name: item.full_name,
          contact_no: item.mobile_no,
          email: item.email
        };
      });
    },
    (error) => {
      console.error('Error fetching contractor details:', error);
    }
  );
}


    /**
     * Fetches the list of users with role 'monitor' from the CRPS user list.
     * This will be used to populate the team list.
     */
    fetchCrpsUsers(): void {
        const userData = {
            viewName: 'crpsUsersList',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: "user_type",
                    value: "monitor",
                }
            ],
        };
        this.service.getUserDetails(userData).subscribe(
            (response: any) => {
                this.teamList = response.data;
            },
            (error) => {
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }

    /**
     * Validates the mobile number from the provided form data.
     * Updates the error message if validation fails.
     * 
     * @param formData - Object containing form data, expected to have a mobileNo property.
     */
    validateMobileNumber(formData: any): void {
        const mobile = (formData?.mobileNo || '').toString().trim();
        this.errorMessages.mobile = mobile.length > 8
            ? "Contact number can't be more than 8 digits."
            : '';
    }


    isLoading = false;
    isDataPresent = false;
    onCidChange(formData: any) {
        if (formData.cidNo && formData.cidNo.toString().length === 11) {
            this.getCidDetails(formData);
        }
    }

    /**
     * Fetches citizen details based on the provided CID number from the DCRC database.
     * Updates the fullName property of the provided formData with the citizen's full name if found.
     * Displays error messages if the citizen is not found or if there's a server error.
     * @param formData - Object containing form data, expected to have a cidNo property.
     */
    getCidDetails(formData: any): void {
        this.isLoading = true;
        this.service.getCitizenDetails(formData.cidNo).subscribe(
            (response: any) => {
                // Check if the response contains the citizen details
                if (response?.citizenDetailsResponse?.citizenDetail?.length) {
                    const citizen =
                        response.citizenDetailsResponse.citizenDetail[0];
                    const name = [
                        citizen.firstName,
                        citizen.middleName,
                        citizen.lastName,
                    ]
                        // Remove any null or undefined parts before joining the name
                        .filter((part) => part)
                        .join(' ');
                    // Update the fullName property of the formData with the full name
                    formData.fullName = name;
                    console.log('fullName', formData.fullName);
                } else {
                    // Set error message if the citizen is not found
                    this.errorMessages.notFound = 'Not Registered in DCRC';
                }
                // Hide loading indicator
                this.isLoading = false;
            },
            (error) => {
                // Handle server error
                if (error.status === 500) {
                    this.errorMessages.server = 'Something went wrong';
                    console.error('Something went wrong:', error);
                }
                // Hide loading indicator
                this.isLoading = false;
            }
        );
    }

    dataList = [
        {
            cidNo: '',
            fullName: '',
            mobileNo: '',
            designation: '',
            email: '',
        },
    ];


    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/Adding-site-engineer']);
    }
    addRow() {
        this.showAddMore = true
        this.dataList.push({
            cidNo: '',
            fullName: '',
            mobileNo: '',
            designation: '',
            email: '',
        });
    }
showAddMore: boolean = false;
    removeRow(index: number) {
        this.dataList.splice(index, 1);
    }


saveMonitorTeamList(form: NgForm) {
  // Optional: Form validation block if needed
  if (form.invalid) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return;
  }

  // Convert teamList (existing rows) only if not empty
  const existingTeam = this.teamList.length > 0
    ? this.teamList.map(item => ({
        cidNo: item.cid_emp_id,
        fullName: item.name,
        mobileNo: item.contact_no,
        email: item.email,
        monitoringDate: this.formData.monitoringDate,
      }))
    : [];

  // Convert dataList (newly added rows)
  const newTeam = this.dataList.map(item => ({
    cidNo: item.cidNo,
    fullName: item.fullName,
    mobileNo: item.mobileNo,
    email: item.email,
    monitoringDate: this.formData.monitoringDate,
  }));

  // Merge both arrays, filter out any empty ones
  const payload = [...existingTeam, ...newTeam].filter(item =>
    item.cidNo && item.fullName && item.mobileNo && item.email 
  );

  if (payload.length === 0) {
    console.warn('No team data to submit.');
    return;
  }

  console.log('Combined Payload:', payload);

  // Send merged data to backend
  this.service.saveMonitoringTeamData(payload, this.tableId,this.workId || '').subscribe({
    next: (response: any) => {
      this.createNotification();
      this.monitoringData.emit(this.tableId);
      this.router.navigate(['monitoring/contractor-present-during-site-monitoring']);
    },
    error: (err: any) => {
      console.error('Error saving monitoring team data:', err);
    }
  });
}


createNotification(): void {
  this.notification
    .success(
      'Success',
      'The data has been saved successfully'
    )
    .onClick.subscribe(() => {
      console.log('notification clicked!');
    });
}
   

}
