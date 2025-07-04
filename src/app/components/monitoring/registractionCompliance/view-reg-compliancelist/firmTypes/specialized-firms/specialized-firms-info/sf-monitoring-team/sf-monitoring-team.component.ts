import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from 'src/app/auth.service';

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

  constructor(@Inject(CommonService) private service: CommonService, 
    private router: Router,
    private authService: AuthServiceService) { }

  ngOnInit() {
    this.username = this.authService.getUsername() || 'NA';
    console.log("Monitor table id:", this.id);

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
}
