import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-monitoring-team-users',
  templateUrl: './monitoring-team-users.component.html',
  styleUrls: ['./monitoring-team-users.component.scss']
})
export class MonitoringTeamUsersComponent implements OnInit {
  formData: any = {};
  teamList: any[] = [];
  tableId: string = ''; // Initialize as empty string
  bctaNo: any;
  isSaving = false;
  username: string = '';
applicationStatus : any;
  @Input() id: string = ''; // Input from parent component
@Input() data: any;
  complianceData: string;
  constructor(private service: CommonService,
    private router: Router,
    private authService: AuthServiceService) { }

  ngOnInit() {
    this.data = this.data;
    this.username = this.authService.getUsername() || 'NA';
    this.id = this.id;
    //  const WorkDetail = this.service.getData('BctaNo');
    this.applicationStatus = this.data.applicationStatus;
     console.log('this.applicationStatus', this.applicationStatus);
     
    this.service.bctaNo$.subscribe(bctaNo => {
        this.bctaNo = bctaNo;
    });

  }
   reinstate(row: any) {
        const payload = {
            firmNo: this.data.contractorNo,
            firmType: 'Contractor',
            licenseStatus: 'Active',
             applicationStatus: 'Reinstated',
        };

        const approvePayload = {
            firmType: 'Contractor',
            cdbNos: this.data.contractorNo,
        };

        forkJoin({
            reinstate: this.service.reinstateLicense(payload),
           approve: this.service.approveReinstatement(approvePayload),
        }).subscribe({
            next: ({ reinstate }) => {
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
                this.router.navigate(['/monitoring/construction']);
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
            bsModal: any;
  reinstateModal: any = null;
    reinstateData: any = null;
    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }
       closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }
  onSubmit(monitoringForm: any) {
    this.isSaving = true;
    this.tableId = this.id;

    if (!this.tableId) {
      this.isSaving = false;
      console.error('No tableId available');
      Swal.fire('Error', 'Missing required ID', 'error');
      return;
    }

    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        reviewDate: this.formData.reviewDate
      }
    };
    
    this.service.saveOfficeSignageAndDoc(payload).subscribe(
      (res: any) => {
        this.isSaving = false;
        console.log('res', res);
        Swal.fire({
          icon: 'success',
          title: 'Submission Successful',
          text: `Details Saved Successfully!`,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/monitoring/construction']);
          }
        });
      },
      (error) => {
        this.isSaving = false;
        console.error('Error during submission:', error);
        Swal.fire('Error', 'Failed to complete submission', 'error');
        this.router.navigate(['/monitoring/construction']);
      }
    );
  }

}