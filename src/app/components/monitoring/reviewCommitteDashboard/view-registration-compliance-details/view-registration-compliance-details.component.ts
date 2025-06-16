import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface RegistrationApplication {
    id: number;
    bcta_no: string;
    firm_name: string;
    submitted_on: string | null;
    status: 'Not Submitted' | 'In Process' | 'Verified';
    license_status: 'Active' | 'Suspended';
    verified_by: string | null;
    notification: string | null;
    isEditing: boolean;
    selected?: boolean; // Add this
    rightSelected?: boolean; // Add this
    checklist_id?: string; // Add this if needed
    appStatus?: string; // Add this if needed
}

@Component({
    selector: 'app-view-registration-compliance-details',
    templateUrl: './view-registration-compliance-details.component.html',
    styleUrls: ['./view-registration-compliance-details.component.scss']
})
export class ViewRegistrationComplianceDetailsComponent {
    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: RegistrationApplication[] = [];
    pageNo: number = 1;
    pageSize: number = 10;
    totalCount: number = 0;
    totalPages: number = 0;
    checklist_id: number;
    searchTerm: string = '';
    statusFilter: string = 'All';
    filteredApplications: RegistrationApplication[] = [];
    isLoading: boolean = false;
    firmType: any;
    checklistIds: string[];
    closebutton: any;
    userId: any;
   

    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.getReportList();
    }

   getReportList(searchQuery?: string) {
    this.isLoading = true;
    this.service.getEmailedContractors().subscribe(
        (response: any[]) => {
            // Filter first
            const filteredResponse = response.filter(
  item => item.applicationStatus === 'In Process'
);

            // Then map
            this.tableData = filteredResponse.map(item => ({
               id: Number(item.id) || 0, 
                bcta_no: item.contractorNo,
                firm_name: item.nameOfFirm,
                submitted_on: item.sentDate,
                status: this.mapStatus(item.applicationStatus),
                notification: item.notification || null,
                license_status: item.licenseStatus,
                verified_by: item.verifiedBy || null,
                isEditing: false,
                selected: false,
            }));

            this.isLoading = false;
        },
        (error) => {
            this.isLoading = false;
        }
    );
}

  mapStatus(status: string): 'Not Submitted' | 'In Process' | 'Verified' {
    switch (status?.toLowerCase()) {
        case 'submitted':
            return 'In Process';
        case 'verified':
            return 'Verified';
        case 'in process':
            return 'In Process';
        default:
            return 'Not Submitted';
    }
}

    private determineLicenseStatus(status: string): string {
        switch (status) {
            case 'Not Submitted': return 'Suspended';
            case 'Verified': return 'Active';
            default: return 'Pending';
        }
    }

    filterApplications(): void {
        this.filteredApplications = this.tableData.filter((app) => {
            const matchesSearch =
                this.searchTerm === '' ||
                (app.firm_name?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (app.bcta_no?.toLowerCase().includes(this.searchTerm.toLowerCase()));

            const matchesStatus =
                this.statusFilter === 'All' || app.status === this.statusFilter;

            return matchesSearch && matchesStatus;
        });
    }

    Searchfilter() {
        this.pageNo = 1;
        this.getReportList(this.searchQuery);
    }

    setLimitValue(value: any) {
        this.pageSize = Number(value);
        this.pageNo = 1;
        this.getReportList(this.searchQuery);
    }

    onSearchChange(): void {
        this.filterApplications();
    }

    onStatusFilterChange(): void {
        this.filterApplications();
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Verified':
                return 'status-verified';
            case 'In Process':
                return 'status-in-process';
            case 'Not Submitted':
                return 'status-not-submitted';
            default:
                return 'status-default';
        }
    }

    getLicenseStatusClass(status: string | null): string {
        if (!status) return 'license-default';

        switch (status.toLowerCase()) {
            case 'active':
                return 'license-active';
            case 'suspended':
                return 'license-suspended';
            default:
                return 'license-default';
        }
    }

    formatDate(date: string | null): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    }

    navigate(bcta_no: any,) {
        const WorkDetail = {
            data: bcta_no,

        };
        console.log('WorkDetail', WorkDetail);
        this.service.setData(
            WorkDetail,
            'BctaNo',
            'monitoring/ViewRegDetails'
        );
    }



    selectedApplicationNo: number[] = [];

    onCheckboxChange(app: RegistrationApplication): void {
        if (app.selected) {
            if (!this.selectedApplicationNo.includes(app.id)) {
                this.selectedApplicationNo.push(app.id);
                console.log('Selected IDs:', this.selectedApplicationNo);
            }
        } else {
            this.selectedApplicationNo = this.selectedApplicationNo.filter(
                id => id !== app.id
            ); 
            console.log('Removed ID:', app.id);
            console.log('Selected IDs after removal:', this.selectedApplicationNo);
        }
    }



SaveAndForward(): void {
  if (this.selectedApplicationNo.length === 0) {
    return;
  }

  console.log('Sending IDs:', this.selectedApplicationNo);

  this.service.notifyMonitoringCommittee(this.selectedApplicationNo).subscribe({
    next: (response: any) => {
      console.log('Success:', response);

      // Filter out only the submitted applications
      this.tableData = this.tableData.filter(
        app => !this.selectedApplicationNo.includes(app.id)
      );

      this.selectedApplicationNo = [];

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Applications successfully forwarded to the monitoring committee.',
        confirmButtonColor: '#3085d6'
      });
    },
    error: (error: HttpErrorResponse) => {
      console.error('Error details:', {
        status: error.status,
        error: error.error,
        url: error.url
      });

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to forward applications. Please try again later.',
        confirmButtonColor: '#d33'
      });
    }
  });
}

 createNotification(type: string): void {
        const message =
            type.toLowerCase() === 'reject'
                ? 'The application has been rejected successfully'
                : 'The application has been endorsed successfully';

        this.notification.success('Success', message).onClick.subscribe(() => {
            console.log('notification clicked!');
        });
    }

onChangeFirmType(firmType: string) {
    this.firmType = firmType;

    switch (firmType) {
        case 'contractorFirm':
            this.router.navigate(['/monitoring/contractor-firm']);
            break;
        case 'consultancyFirm':
            this.router.navigate(['/monitoring/consultancy-firm']);
            break;
        case 'specializedFirm':
            this.router.navigate(['/monitoring/specialized-firm']);
            break;
        case 'certifiedBuilders':
            this.router.navigate(['/monitoring/certified-builders']);
            break;
        default:
            break;
    }
}
}