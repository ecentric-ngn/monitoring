import { Component, Input } from '@angular/core';
import { SpecializedTradeService } from '../../../../service/specialized-trade.service';

@Component({
  selector: 'app-employment-history',
  templateUrl: './employment-history.component.html',
  styleUrls: ['./employment-history.component.scss']
})
export class EmploymentHistoryComponent {
  @Input() data: any;
  pageSize: number = 10;
  pageNo: number = 1;
  TableData:any;
constructor(private service:SpecializedTradeService){}
 
ngOnInit(){
  this.GetEmployeeHistory();
}

 //getting the employmentHistory information data
 GetEmployeeHistory(){
  const engineer = {
    "viewName": "specializedTradeEmploymentHistory",
    "pageSize":this.pageSize,
    "pageNo":this.pageNo,
    "condition": [
      {
          "field":"specializedTradeNo",
          "value":this.data.specializedTradeNo
     }
 ]
}
  this.service.ListOfSpecializedTrade(engineer).subscribe((response:any) => {
    this.TableData = response.data;
  }, (Error)=>{
  })
}
}
