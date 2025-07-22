import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sf-monitoring-team',
  templateUrl: './sf-monitoring-team.component.html',
  styleUrls: ['./sf-monitoring-team.component.scss']
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
  applicationStatus : string;

  constructor(@Inject(CommonService) private service: CommonService, 
    private router: Router,
    private authService: AuthServiceService) { }

  ngOnInit() {
    this.username = this.authService.getUsername() || 'NA';
    console.log("Monitor table id:", this.id);
      const WorkDetail = this.service.getData('BctaNo');
   this.applicationStatus = WorkDetail.data.applicationStatus;
    this.service.bctaNo$.subscribe(bctaNo => {
      this.bctaNo = bctaNo;
    });

    this.id = this.id;
    // console.log('Table ID:', this.tableId);
    // Assign the input id to tableId
    
  }

  onSubmit(monitoringForm: any) {
    this.isSaving = true;
    // Prepare the payload as required
    const payload = {
      sfReviewDto: {
        bctaNo: this.bctaNo,
        reviewDate: this.formData.reviewDate
      }
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
      }
    });
  }

    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: 'specialized-firm',
            licenseStatus: 'Active',
        };
        const approvePayload = {
            firmType: 'SpecializedFirm',
            cdbNos: row,
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
                this.router.navigate(['/monitoring/special']);
                this.closeModal();
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                this.closeModal();
                Swal.fire(
                    'Success',
                    'License Reinstated and Approved Successfully',
                    'success'
                );
            },
        });
    }

        closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

}
