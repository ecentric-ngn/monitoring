import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-cb-monitoring-team',
    templateUrl: './cb-monitoring-team.component.html',
    styleUrls: ['./cb-monitoring-team.component.scss'],
})
export class CbMonitoringTeamComponent {
    formData: any = {};
    teamList: any[] = [];
    tableId: string = '';
    bctaNo: any;
    isSaving = false;
    username: string = '';

    @Input() id: string = ''; // Input from parent component
    applicationStatus: any = {};
    @Input() data: any;
    userInfo: any;
    userId: any;
    designation: any;
    constructor(
        @Inject(CommonService) private service: CommonService,
        private router: Router,
        private authService: AuthServiceService
    ) {}

    ngOnInit() {
        this.data = this.data;
        this.applicationStatus = this.data.applicationStatus;
        this.userInfo = this.authService.getUserInfo() || 'NA';
        this.userId = this.userInfo.userId;
        if (this.userId) {
            this.fetchCrpsUsers();
        }
        const WorkDetail = this.service.getData('BctaNo');
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.service.bctaNo$.subscribe((bctaNo) => {
            this.bctaNo = bctaNo;
        });

        this.id = this.id;
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
            cbReviewDto: {
                bctaNo: this.bctaNo,
                reviewDate: this.formData.reviewDate,
            },
        };

        this.service.saveOfficeSignageAndDocCB(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                console.log('res', res);
                Swal.fire({
                    icon: 'success',
                    title: 'Submission Successful',
                    text: `Details Saved Successfully!`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.router.navigate(['/monitoring/certified']);
                    }
                });
            },
            (error) => {
                this.isSaving = false;
                console.error('Error forwarding to committee:', error);
                Swal.fire('Error', 'Failed to complete submission', 'error');
                this.router.navigate(['/monitoring/certified']);
            }
        );
    }

    reinstate(row: any) {
        const payload = {
            firmNo: this.data.certifiedBuilderNo,
            firmType: 'certified-builder',
            licenseStatus: 'Active',
            applicationStatus: 'Reinstated',
        };

        const approvePayload = {
            firmType: 'certified-builder',
            cdbNos: this.data.certifiedBuilderNo,
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
                    this.closeModal();
                } else {
                    Swal.fire(
                        'Warning',
                        'Unexpected response from server.',
                        'warning'
                    );
                }
                this.router.navigate(['/monitoring/certified']);
                this.closeModal();
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                this.closeModal();
                Swal.fire(
                    'Warning',
                    'License Reinstated and Approved Successfully',
                    'success'
                );
            },
        });
    }

    bsModal: any;
    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
        this.router.navigate(['/monitoring/certified']);
    }
}
