import { Component, Input } from '@angular/core';
import { ConsultantService } from '../../../../service/consultant.service';

@Component({
  selector: 'app-consultant-work-classification',
  templateUrl: './consultant-work-classification.component.html',
  styleUrls: ['./consultant-work-classification.component.scss']
})
export class ConsultantWorkClassificationComponent {
  @Input() data: any;
  formData: any = {}; // Object to hold form data
  TableData:any;
  pageSize:number=100;
  pageNo:number=1;
  loading:boolean=false
  constructor(private service:ConsultantService){}

  ngOnInit(){
    this.getWorkClassification(this.data)
  }
  getWorkClassification(data: any) {
    const workClassificationDetails = {
      consultantId: this.data.consultantId
    };
    this.loading=true
    this.service.getWorkClassification(workClassificationDetails).subscribe((response: any) => {
      // Step 1: Filter out items with null tableId
      this.loading=false
      const filteredResponse = response.filter((item: any) => item.tableId !== null);
      // Step 2: Aggregate data
      const aggregatedData = filteredResponse.reduce((acc: any, item: any) => {
        const key = `${item.workCategory}-${item.consultantWorkCategoryId}`;
        if (!acc[key]) {
          acc[key] = {
            workCategory: item.workCategory,
            existingWorkClassification: item.existingWorkClassification
          };
        } else {
          acc[key].existingWorkClassification += `, ${item.existingWorkClassification}`;
        }
        return acc;
      }, {});
  
      // Convert aggregated data to an array
      this.TableData = Object.values(aggregatedData);
      // this.showTable = this.TableData.length > 0;
    }, (Error) => {
      this.loading=false
    });
  }
  }
