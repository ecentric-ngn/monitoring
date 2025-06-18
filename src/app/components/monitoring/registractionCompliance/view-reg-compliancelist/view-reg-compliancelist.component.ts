import { Component, ViewChild } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
interface RegistrationApplication {
    id: number;
    bctaNo: string;
    firmName: string;
    submittedOn: string;
    status: 'Not Submitted' | 'In Process' | 'Verified';
    licenseStatus: 'Active' | 'Suspended';
    verifiedBy: string;
    notification: string;
    isEditing: boolean;
}
@Component({
    selector: 'app-view-reg-compliancelist',
    templateUrl: './view-reg-compliancelist.component.html',
    styleUrls: ['./view-reg-compliancelist.component.scss'],
})
export class ViewRegCompliancelistComponent {

    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: any = [];

    selectedIds: number[] = [];
    private isFetching = false;
    private autoRefreshInterval: any;
    private statusPriority = {
        'Submitted': 1,
        'Verified': 2,
        'In Process': 3,
        'Not Submitted': 4
    };

    firmType: string = '';

    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router
    ) { }

    searchTerm: string = '';
    statusFilter: string = 'All';

    ngOnInit() {
        this.fetchComplianceDetails();

        // Auto-refresh every 60 seconds (60000 ms)
        this.autoRefreshInterval = setInterval(() => {
            this.fetchComplianceDetails();
            console.log('Auto-refreshed compliance data');
        }, 60000); // 60 seconds
    }

    ngOnDestroy() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }
    onChangeFirmType(firmType: string) {
        this.firmType = firmType;

        switch (firmType) {
            // case 'constructionFirm':
            //     this.router.navigate(['/reg-compliance/construction']);
            //     break;
            case 'consultancyFirm':
                this.router.navigate(['/monitoring/consultancy']);
                break;
            case 'specializedFirm':
                this.router.navigate(['/monitoring/specialized']);
                break;
            case 'certifiedBuilders':
                this.router.navigate(['/monitoring/certified']);
                break;
            default:
                break;
        }
    }

    fetchComplianceDetails() {
        if (this.isFetching) return;

        this.isFetching = true;
        this.service.fetchComplianceData().subscribe(
            (response: any) => {
                this.tableData = response;
                console.log('Fetched Data', this.tableData);
                this.isFetching = false;
            },
            (error) => {
                console.error('Error fetching compliance data:', error);
                this.isFetching = false;
            }
        );
    }

    Searchfilter() { }

    setLimitValue(value: any) { }


    // In your component class
    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (data.applicationStatus === 'Submitted') {
            const workId = data.contractorNo; // Using contractorNo as workId
            this.prepareAndNavigate(data, workId);
        }
    }

    private prepareAndNavigate(data: any, workId: string) {
        const workDetail = {
            data: data,
            firmType: this.firmType
        };

        console.log('Navigation payload:', workDetail);

        this.service.setData(
            workDetail,
            'BctaNo',
            'monitoring/RegFirmInformation'
        );
    }

    onCheckboxChange(event: Event, id: string) {
        const isChecked = (event.target as HTMLInputElement).checked;
        const numericId = Number(id); // convert to number

        if (isChecked) {
            if (!this.selectedIds.includes(numericId)) {
                this.selectedIds.push(numericId);
            }
        } else {
            this.selectedIds = this.selectedIds.filter(item => item !== numericId);
        }

        console.log('Selected IDs (as numbers):', this.selectedIds);
    }


    forwardToRC() {
        if (this.selectedIds.length === 0) {
            Swal.fire('Warning', 'No items selected', 'warning');
            return;
        }

        const payload = this.selectedIds

        this.service.forwardToReviewCommitee(payload).subscribe(
            (res) => {
                console.log('Successfully sent selected IDs:', res);
                Swal.fire('Success', 'Selected contractors submitted successfully', 'success');
            },
            (error) => {
                console.error('Error sending selected IDs:', error);
                Swal.fire('Error', 'Failed to submit selected contractors', 'error');
            }
        );
    }



    // autoUpdateLicenseStatus(): void {
    //     this.applications = this.applications.map((app) => {
    //         if (app.status === 'Not Submitted') {
    //             return { ...app, licenseStatus: 'Suspended' };
    //         }
    //         return app;
    //     });
    // }

    // filterApplications(): void {
    //     this.filteredApplications = this.applications.filter((app) => {
    //         const matchesSearch =
    //             app.firmName
    //                 .toLowerCase()
    //                 .includes(this.searchTerm.toLowerCase()) ||
    //             app.bctaNo
    //                 .toLowerCase()
    //                 .includes(this.searchTerm.toLowerCase());
    //         const matchesStatus =
    //             this.statusFilter === 'All' || app.status === this.statusFilter;
    //         return matchesSearch && matchesStatus;
    //     });
    // }

    // onSearchChange(): void {
    //     this.filterApplications();
    // }

    // onStatusFilterChange(): void {
    //     this.filterApplications();
    // }

    // toggleEditNotification(appId: number): void {
    //     const app = this.applications.find((a) => a.id === appId);
    //     if (app) {
    //         app.isEditing = !app.isEditing;
    //     }
    // }

    // updateNotification(appId: number, notification: string): void {
    //     const app = this.applications.find((a) => a.id === appId);
    //     if (app) {
    //         app.notification = notification;
    //     }
    // }

    toggleEditNotification(id: number) {
        this.tableData = this.tableData.map(row =>
            row.id === id ? { ...row, isEditing: true } : row
        );
    }

    cancelEdit(id: number) {
        this.tableData = this.tableData.map(row =>
            row.id === id ? { ...row, isEditing: false } : row
        );
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

    getLicenseStatusClass(status: string): string {
        switch (status) {
            case 'Active':
                return 'license-active';
            case 'Suspended':
                return 'license-suspended';
            default:
                return 'license-default';
        }
    }
}
