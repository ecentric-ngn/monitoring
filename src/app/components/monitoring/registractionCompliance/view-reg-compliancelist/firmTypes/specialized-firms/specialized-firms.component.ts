import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-specialized-firms',
  templateUrl: './specialized-firms.component.html',
  styleUrls: ['./specialized-firms.component.scss']
})
export class SpecializedFirmsComponent {
    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: any = [];

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
        // this.autoUpdateLicenseStatus();
        // this.filterApplications();
    }

    onChangeFirmType(firmType: string) {
    this.firmType = firmType;

    switch (firmType) {
        case 'constructionFirm':
            this.router.navigate(['/monitoring/construction']);
            break;
        case 'consultancyFirm':
            this.router.navigate(['/monitoring/consultancy']);
            break;
        // case 'specializedFirm':
        //     this.router.navigate(['/monitoring/specialized']);
        //     break;
        case 'certifiedBuilders':
            this.router.navigate(['/monitoring/certified']);
            break;
        default:
            break;
        }
    }

    fetchComplianceDetails() {
        this.service.fetchComplianceDataSpecializedFirms().subscribe(
            (response: any) => {
                this.tableData = response;
                console.log('Fetched Data', this.tableData);
            },
            (error) => {
                console.error('Error fetching compliance data:', error);
            }
        )
    }

    Searchfilter() { }

    setLimitValue(value: any) { }


    // In your component class
    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (data.applicationStatus === 'Submitted') {
            const workId = data.specialFirmNo; // Using contractorNo as workId
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
            'monitoring/sf-info'
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
