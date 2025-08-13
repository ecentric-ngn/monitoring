import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-consultancy-monitoring-team',
    templateUrl: './consultancy-monitoring-team.component.html',
    styleUrls: ['./consultancy-monitoring-team.component.scss'],
})
export class ConsultancyMonitoringTeamComponent {
    formData: any = {};
    teamList: any[] = [];
    tableId: string = ''; // Initialize as empty string
    bctaNo: any;
    isSaving = false;
    username: string = '';
    @Input() data: any;
    @Input() id: any; // Input from parent component
    applicationStatus: any;
    designation: any;
    userId: any;
userInfo: any={}
    constructor(
        @Inject(CommonService) private service: CommonService,
        private router: Router,
        private authService: AuthServiceService
    ) {}

    ngOnInit() {
       this.userInfo = this.authService.getUserInfo() || 'NA';
        this.userId = this.userInfo.userId;
        if (this.userId) {
            this.fetchCrpsUsers();
        }
        this.applicationStatus = this.data.applicationStatus;
        this.data = this.data;
        this.id = this.id;
        this.applicationStatus = this.data.applicationStatus;
        const WorkDetail = this.service.getData('BctaNo');
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.service.bctaNo$.subscribe((bctaNo) => {
            this.bctaNo = bctaNo;
        });
    }

    fetchCrpsUsers(): void {
        const userData = {
            viewName: 'crpsUsersList',
            pageSize: 100,
            pageNo: 1,
            condition: [
                // {
                //     field: "user_type",
                //     value: "monitor",
                // }
            ],
        };
        this.service.getUserDetails(userData).subscribe(
            (response: any) => {
                this.teamList = response.data;
                const matchedUser = this.teamList.find(
                    (user: any) => user.id === this.userId
                );
                if (matchedUser) {
                    this.designation = matchedUser.designation; // store designation
                } else {
                }
            },
            (error) => {
                console.error('Error fetching contractor details:', error);
            }
        );
    }
    onSubmit(monitoringForm: any) {
        this.isSaving = true;
        this.tableId = this.id; // Assign the input id to tableId at submit time
        if (!this.tableId) {
            this.isSaving = false;
            console.error('No tableId available');
            Swal.fire('Error', 'Missing required ID', 'error');
            return;
        }

        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.bctaNo,
                reviewDate: this.formData.reviewDate,
            },
        };

        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                console.log('res', res);
                Swal.fire({
                    icon: 'success',
                    title: 'Submission Successful',
                    text: `Details Saved Successfully!`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.router.navigate(['/monitoring/consultancy']);
                    }
                });
            },
            (error) => {
                this.isSaving = false;
                console.error('Error forwarding to committee:', error);
                Swal.fire('Error', 'Failed to complete submission', 'error');
                this.router.navigate(['/monitoring/consultancy']);
            }
        );
    }
    reinstate(row: any) {
        const payload = {
            firmNo: this.data.consultantNo,
            firmType: 'consultant',
            licenseStatus: 'Active',
            applicationStatus: 'Reinstated',
        };

        const approvePayload = {
            firmType: 'Consultant',
            cdbNos: this.data.consultantNo,
        };

        forkJoin({
            reinstate: this.service.reinstateLicense(payload),
            approve: this.service.approveReinstatement(approvePayload),
        }).subscribe({
            next: ({ reinstate, approve }) => {
                if (
                    reinstate &&
                    reinstate
                        .toLowerCase()
                        .includes('license status updated to active')
                ) {
                    Swal.fire(
                        'Success',
                        'License Reinstated and Approved Successfully',
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
                this.router.navigate(['/monitoring/consultancy']);
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                Swal.fire(
                    'Success',
                    'License Reinstated and Approved Successfully',
                    'success'
                );
            },
        });
    }
}
