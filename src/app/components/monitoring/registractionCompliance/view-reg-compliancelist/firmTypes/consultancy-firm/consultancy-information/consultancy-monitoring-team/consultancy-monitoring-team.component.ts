import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultancy-monitoring-team',
  templateUrl: './consultancy-monitoring-team.component.html',
  styleUrls: ['./consultancy-monitoring-team.component.scss']
})

export class ConsultancyMonitoringTeamComponent {
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
       this.tableId = this.id; // Assign the input id to tableId at submit time
       if (!this.tableId) {
         console.error('No tableId available');
         Swal.fire('Error', 'Missing required ID', 'error');
         return;
       }
   
       // Prepare the payload as required
       const payload = {
         registrationReview: {
           id: this.tableId,
           reviewedDate: this.formData.reviewDate
         }
       };
   
       // Call the service with the payload (replace with your actual service method)
       this.service.setData(payload, 'registrationReview', 'monitoring-review');
   
       // Then forward to review committee
       this.service.forwardToReviewCommiteeConsultancy(this.tableId).subscribe(
         (res: any) => {
           console.log('res', res);
           Swal.fire({
             icon: 'success',
             title: 'Submission Successful',
             text: `BCTA No ${this.tableId} forwarded to review committee.`,
           }).then((result) => {
             if (result.isConfirmed) {
               this.router.navigate(['/monitoring/consultancy']);
             }
           });
         },
         (error) => {
           console.error('Error forwarding to committee:', error);
           Swal.fire('success', 'Forwarded to review committee', 'success');
           this.router.navigate(['/monitoring/consultancy']);
         }
       );
     }
}
