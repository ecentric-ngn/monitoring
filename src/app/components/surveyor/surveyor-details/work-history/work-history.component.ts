import { Component, Input } from '@angular/core';
import { SurveyorService } from '../../../../service/surveyor.service';

@Component({
  selector: 'app-work-history',
  templateUrl: './work-history.component.html',
  styleUrls: ['./work-history.component.scss']
})
export class WorkHistoryComponent {

  @Input() data: any;
  formData: any = {}; // Object to hold form data
  pageSize: number = 100;
  pageNo: number = 1;
  TableData:any;
constructor(private service:SurveyorService){}
 
ngOnInit(){
  this.GetEmployeeHistory(this.data);
}

 //getting the employmentHistory information data
 GetEmployeeHistory(data:any){
  const engineer = {
    "viewName": "workHistoryForEngineer",
    "pageSize":this.pageSize,
    "pageNo":this.pageNo,
    "condition": [
      {
          "field":"cidWorkPermitNo",
        "value":data.cidNo
     }
 ]
}
  this.service.getListOfSurveyor(engineer).subscribe((response:any) => {
    this.TableData=response.data
  }, (Error)=>{
    console.log(Error)
  })
}
}

