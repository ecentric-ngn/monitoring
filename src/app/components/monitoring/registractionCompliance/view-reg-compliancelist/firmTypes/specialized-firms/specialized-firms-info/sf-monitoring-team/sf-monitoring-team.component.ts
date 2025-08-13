import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-sf-monitoring-team',
    templateUrl: './sf-monitoring-team.component.html',
    styleUrls: ['./sf-monitoring-team.component.scss'],
})
export class SfMonitoringTeamComponent {
    formData: any = {};
    teamList: any[] = [];
    tableId: string = ''; // Initialize as empty string
    bctaNo: any;
    isSaving = false;
    username: string = '';
    @Input() id: string = ''; // Input from parent component
    bsModal: any;
    applicationStatus: string;
    data: any;
    designation: any;
    userId: any;
    userInfo: any;

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
        const WorkDetail = this.service.getData('BctaNo');
        this.applicationStatus = WorkDetail.data.applicationStatus;
        this.data = WorkDetail.data;
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
        // Prepare the payload as required
        const payload = {
            sfReviewDto: {
                bctaNo: this.bctaNo,
                reviewDate: this.formData.reviewDate,
            },
        };

        this.service.saveOfficeSignageAndDocSF(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                console.log('Forwarding successful:', res);
                Swal.fire({
                    icon: 'success',
                    title: 'Submission Successful',
                    text: `Details Saved Successfully!`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.router.navigate(['/monitoring/specialized']);
                    }
                });
            },
            error: (error) => {
                this.isSaving = false;
                console.error('Error forwarding to committee:', error);
                // Note: Changed from 'success' to 'error' for error case
                Swal.fire({
                    icon: 'error',
                    title: 'Forwarding Unsuccessful',
                    text: `Forwarding to review committee failed!`,
                });
                this.router.navigate(['/monitoring/specialized']);
            },
        });
    }

    reinstate(row: any) {
        const payload = {
            firmNo: this.data.specializedFirmNo,
            firmType: 'specialized-firm',
            licenseStatus: 'Active',
            applicationStatus: 'Reinstated',
        };
        const approvePayload = {
            firmType: 'SpecializedFirm',
            cdbNos: this.data.specializedFirmNo,
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
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'License Reinstated and Approved Successfully',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        this.closeModal();
                        this.router.navigate(['/monitoring/specialized']);
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Warning',
                        text: 'Unexpected response from server.',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        this.closeModal();
                        this.router.navigate(['/monitoring/specialized']);
                    });
                }
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong during reinstatement. Please try again.',
                    confirmButtonText: 'OK',
                }).then(() => {
                    this.closeModal();
                    this.router.navigate(['/monitoring/specialized']);
                });
            },
        });
    }

    closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }
}
