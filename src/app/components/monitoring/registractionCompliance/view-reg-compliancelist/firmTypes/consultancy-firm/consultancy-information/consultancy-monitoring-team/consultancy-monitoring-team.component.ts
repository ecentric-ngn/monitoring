import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-consultancy-monitoring-team',
  templateUrl: './consultancy-monitoring-team.component.html',
  styleUrls: ['./consultancy-monitoring-team.component.scss']
})

export class ConsultancyMonitoringTeamComponent {
  formData: any = {};
  teamList: any[] = [];
  tableId: string = ''; // Initialize as empty string
  bctaNo: any;
  isSaving = false;
  username: string = '';
@Input() data: any;
  @Input() id:any; // Input from parent component
  applicationStatus: any;

  constructor(@Inject(CommonService) private service: CommonService,
   private router: Router,
  private authService: AuthServiceService) { }

  ngOnInit() {
    this.username = this.authService.getUsername() || 'NA';
     this.applicationStatus = this.data.applicationStatus;
    console.log("Monitor table id:", this.id);
     this.data = this.data;
    this.id = this.id;
      this.applicationStatus = this.data.applicationStatus;
    const WorkDetail = this.service.getData('BctaNo');
     this.applicationStatus = WorkDetail.data.applicationStatus;
    // console.log('Table ID:', this.tableId);
    // Assign the input id to tableId
    this.service.bctaNo$.subscribe(bctaNo => {
      this.bctaNo = bctaNo;
    });
    
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
        reviewDate: this.formData.reviewDate
      }
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
