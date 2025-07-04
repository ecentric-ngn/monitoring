import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from 'src/app/auth.service';

@Component({
  selector: 'app-cb-monitoring-team',
  templateUrl: './cb-monitoring-team.component.html',
  styleUrls: ['./cb-monitoring-team.component.scss']
})
export class CbMonitoringTeamComponent {
formData: any = {};
  teamList: any[] = [];
  tableId: string = ''; 
  bctaNo: any;
  isSaving = false;
  username: string = '';

  @Input() id: string = ''; // Input from parent component

  constructor(@Inject(CommonService) private service: CommonService,
   private router: Router,
  private authService: AuthServiceService) { }

  ngOnInit() {

    this.username = this.authService.getUsername() || 'NA';
    
    console.log("Monitor table id:",this.id);

    this.service.bctaNo$.subscribe(bctaNo => {
        this.bctaNo = bctaNo;
    });
    
    this.id = this.id;
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
        reviewDate: this.formData.reviewDate
      }
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
}
