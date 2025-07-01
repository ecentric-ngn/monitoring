import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from 'src/app/auth.service';

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

  @Input() id: string = ''; // Input from parent component

  constructor(@Inject(CommonService) private service: CommonService,
   private router: Router,
  private authService: AuthServiceService) { }

  ngOnInit() {
    this.username = this.authService.getUsername() || 'NA';
    console.log("Monitor table id:", this.id);

    this.id = this.id;
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
}
