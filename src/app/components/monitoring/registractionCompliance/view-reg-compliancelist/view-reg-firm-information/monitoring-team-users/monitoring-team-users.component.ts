import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-monitoring-team-users',
  templateUrl: './monitoring-team-users.component.html',
  styleUrls: ['./monitoring-team-users.component.scss']
})
export class MonitoringTeamUsersComponent implements OnInit {
  formData: any = {};
  teamList: any[] = [];
  tableId: string = ''; // Initialize as empty string

  @Input() id: string = ''; // Input from parent component

  constructor(private service: CommonService, private router: Router) { }

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
  this.tableId = this.id;

  if (!this.tableId) {
    console.error('No tableId available');
    Swal.fire('Error', 'Missing required ID', 'error');
    return;
  }

  const payload = {
    registrationReview: {
      id: this.tableId,
      reviewDate: this.formData.reviewDate
    }
  };

  this.service.saveOfficeSignageAndDoc(payload).subscribe(
    (res: any) => {
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
      console.error('Error during submission:', error);
      Swal.fire('Error', 'Failed to complete submission', 'error');
      this.router.navigate(['/monitoring/construction']);
    }
  );
}

}