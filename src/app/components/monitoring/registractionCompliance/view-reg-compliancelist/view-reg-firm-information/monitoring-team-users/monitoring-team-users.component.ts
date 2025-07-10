import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../../../../../auth.service';

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

  @Input() id: string = ''; // Input from parent component

  constructor(private service: CommonService,
    private router: Router,
    private authService: AuthServiceService) { }

  ngOnInit() {

    this.username = this.authService.getUsername() || 'NA';
    
    console.log("Monitor table id:", this.id);

    this.id = this.id;

    this.service.bctaNo$.subscribe(bctaNo => {
        this.bctaNo = bctaNo;
    });

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