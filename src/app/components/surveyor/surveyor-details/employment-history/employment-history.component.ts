import { Component, Input } from '@angular/core';
import { SurveyorService } from '../../../../service/surveyor.service';

@Component({
  selector: 'app-employment-history',
  templateUrl: './employment-history.component.html',
  styleUrls: ['./employment-history.component.scss']
})
export class EmploymentHistoryComponent {
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
  const surveyorDetails = {
    "viewName": "surveyorEmploymentHistory",
    "pageSize":this.pageSize,
    "pageNo":this.pageNo,
    "condition": [
      {
          "field":"surveyorNo",
        "value":this.data.surveyorNo
     }
 ]
}
  this.service.getListOfSurveyor(surveyorDetails).subscribe((response:any) => {
    this.TableData=response.data
  }, (Error)=>{
    console.log(Error)
  })
}
}
