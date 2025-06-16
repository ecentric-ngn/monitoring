import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ArchitectService } from '../../../../service/architect.service';

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
  loading:boolean=false
  constructor(private service:ArchitectService){}
  ngOnInit(){
    this.getEmployeeHistory(this.data);
  }
  //getting the general information data
  getEmployeeHistory(data:any){
    const architect = {
      "viewName": "architectEmploymentHistory",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
        {
          "field": "architectNo", // Assuming contractorNo is the field to filter
          "value": data.architectNo // Use the value of contractorNo from the data object
        }
    ]
  }
    this.service.getListOfArchitect(architect).subscribe((response:any) => {
      this.TableData = response.data;
    }, (Error)=>{
      console.log(Error)
    })
  }
  
  }
