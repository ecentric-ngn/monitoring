import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

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

  @Input() id: string = ''; // Input from parent component

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    console.log("Monitor table id:",this.id);

    this.service.bctaNo$.subscribe(bctaNo => {
        this.bctaNo = bctaNo;
    });
    
    this.id = this.id;
    // console.log('Table ID:', this.tableId);
     // Assign the input id to tableId
    this.getDatabasedOnChecklistId();
  }

  getDatabasedOnChecklistId() {
    const payload: any = [{
      field: 'bcta_no',
      value: 1024, // Hardcoded value - consider using this.id if needed
      operator: 'AND',
      condition: '=',
    }];
    
    this.service.fetchDetails(payload, 1, 100, 'v_monitoring_team_members').subscribe(
      (response: any) => {
        this.teamList = response.data;
        console.log('response', this.teamList);
      },
      (error) => {
        console.error('Error fetching contractor details:', error);
        Swal.fire('Error', 'Failed to fetch team members', 'error');
      }
    );
  }

  onSubmit(monitoringForm: any) {
    this.tableId = this.id; // Assign the input id to tableId at submit time
    if (!this.tableId) {
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
        console.error('Error forwarding to committee:', error);
        Swal.fire('Error', 'Failed to complete submission', 'error');
       this.router.navigate(['/monitoring/certified']);
      }
    );
  }
}
