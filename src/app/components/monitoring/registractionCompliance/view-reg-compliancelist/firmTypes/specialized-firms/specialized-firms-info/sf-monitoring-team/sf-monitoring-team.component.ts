import { Component, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sf-monitoring-team',
  templateUrl: './sf-monitoring-team.component.html',
  styleUrls: ['./sf-monitoring-team.component.scss']
})
export class SfMonitoringTeamComponent {
 formData: any = {};
  teamList: any[] = [];
  tableId: string = ''; // Initialize as empty string

  @Input() id: string = ''; // Input from parent component

  constructor(@Inject(CommonService) private service: CommonService, private router: Router) { }

  ngOnInit() {
    console.log("Monitor table id:",this.id);
    
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
    // Prepare the payload as required
    const payload = {
      registrationReview: {
        id: this.id,  // Using this.id directly instead of tableId
        reviewedDate: this.formData.reviewDate
      }
    };

    // Call the service with the payload
    this.service.setData(payload, 'registrationReview', 'monitoring-review');

    // Forward to review committee
    this.service.forwardToReviewCommiteeSF(this.id).subscribe({
      next: (res: any) => {
        console.log('Forwarding successful:', res);
        Swal.fire({
          icon: 'success',
          title: 'Submission Successful',
          text: `BCTA No ${this.id} forwarded to review committee.`,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/monitoring/sf-info']);
          }
        });
      },
      error: (error) => {
        console.error('Error forwarding to committee:', error);
        // Note: Changed from 'success' to 'error' for error case
        Swal.fire({
          icon: 'success',
          title: 'Forwarding Successful',
          text:  `Forwarded to review committee.`,
        });
        this.router.navigate(['/monitoring/sf-info']);
      }
    });
}
}
