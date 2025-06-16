import { Component, Input } from '@angular/core';
import { SpecializedFirmService } from '../../../../service/specialized-firm.service';

@Component({
  selector: 'app-work-classification',
  templateUrl: './work-classification.component.html',
  styleUrls: ['./work-classification.component.scss']
})
export class WorkClassificationComponent {

  formData: any = {}; // Object to hold form data
  @Input() data: any;
  pageSize: number = 100;
  pageNo: number = 1;
  type: any;
  TableData:any

  constructor(private service:SpecializedFirmService){}

  ngOnInit(){
this.getWorkClassification(this.data)
  }
//getting track record
getWorkClassification(data: any) {
  const workClassificationDetails = {
    specializedFirmId: this.data.specializedFirmId
  };

  this.service.getWorkClassification(workClassificationDetails).subscribe((response: any) => {
    const filterResponseData = response.filter((category:any)=>category.tableId !==null);
    this.TableData = filterResponseData
    
  }, (Error) => {
    console.log(Error);
  });
}
}
