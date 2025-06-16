import { Component ,OnInit } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';

@Component({
  selector: 'app-view-specialize-details',
  templateUrl: './view-specialize-details.component.html',
  styleUrls: ['./view-specialize-details.component.scss']
})



export class ViewSpecializeDetailsComponent {
  FirmName: string = '';
  isLoading: boolean = false;
  specializedFirmData: any = null;
  displayedColumns: string[] = [
    'firm_name',
    'qualification',
    'nationality',
    'joining_date',
    'fulfills_hr_requirements',
    'final_remarks'
  ];
  constructor(private service: CommonService) {}
ngOnInit(): void {
    const data = this.service.getData('FirmName');
    // Ensure we're getting the actual firm name, not the specialized number
    this.FirmName = data?.data || '';
    
    if (this.FirmName) {
      this.fetchBasedOnFirmName(); // Changed to lowercase for convention
    }
  }

  fetchBasedOnFirmName(): void {
    this.isLoading = true;

    const payload = [{
      "field": "firm_name",
      "value": this.FirmName,
      "condition": "LIKE",
      "operator": "AND"
    }];

    console.log('API Payload:', payload);

    this.service
      .fetchSpecializedDetails(payload, 1, 2, 'view_specialized_firm_registration_summary')
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.data?.length > 0) {
            this.specializedFirmData = response.data[0];
            console.log('Firm Data Loaded:', this.specializedFirmData);
          } else {
            console.warn(`No firm found with name: ${this.FirmName}`);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('API Error:', error);
        }
      });
  }

  downloadPaySlip(fileName: string): void {
    if (fileName) {
      // Implement your file download logic here
      console.log('Downloading:', fileName);
      // this.service.downloadFile(fileName);
    }
  }
}


