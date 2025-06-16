import { Component, Input  } from '@angular/core';
import { EngineerService } from '../../../../service/engineer.service';
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
  constructor(private service:EngineerService){}
   
  ngOnInit(){
    this.GetEmployeeHistory(this.data);
  }

   //getting the employmentHistory information data
   GetEmployeeHistory(data:any){
    const engineer = {
      "viewName": "engineerEmploymentHistory",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
        {
            "field":"engineerNo",
          "value":this.data.engineerNo
       }
   ]
}
    this.service.getRegistrationinformation(engineer).subscribe((response:any) => {
      this.TableData=response.data

    }, (Error)=>{
      console.log(Error)
    })
  }
}
