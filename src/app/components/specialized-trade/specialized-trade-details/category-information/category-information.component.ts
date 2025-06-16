import { Component, Input } from '@angular/core';
import { SpecializedTradeService } from '../../../../service/specialized-trade.service';

@Component({
  selector: 'app-category-information',
  templateUrl: './category-information.component.html',
  styleUrls: ['./category-information.component.scss']
})
export class CategoryInformationComponent {
  @Input() data: any;
  pageSize: number = 100;
  pageNo: number = 1;
  TableData:any;
constructor(private service:SpecializedTradeService){}
 
ngOnInit(){
this.getWorkClassification(this.data)
}
//getting track record
getWorkClassification(data: any) {
const workClassificationDetails = {
  specializedTradeId: this.data.specializedTradeId
};

this.service.getWorkClassification(workClassificationDetails).subscribe((response: any) => {
  const filterResponseData = response.filter((category:any)=>category.tableId !==null);
  this.TableData = filterResponseData
}, (Error) => {
});
}
}
