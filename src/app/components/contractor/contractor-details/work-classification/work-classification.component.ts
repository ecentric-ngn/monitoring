import { Component, Input } from '@angular/core';
import { ContractorService } from '../../../../service/contractor.service';

@Component({
  selector: 'app-work-classification',
  templateUrl: './work-classification.component.html',
  styleUrls: ['./work-classification.component.scss']
})
export class WorkClassificationComponent {
  @Input() data: any;
  formData: any = {}; // Object to hold form data
  TableData:any[]  
  pageSize:number= 100;
  pageNo:number= 1;
  searchQuery: string = '';
  loading: boolean = false;
  showTable: boolean;
  constructor(private service:ContractorService){}

  ngOnInit(){
     this.getWorkClassification(this.data)
}
  //getting the ownership details
  getWorkClassification(data){
    const workClassificationDetails = {
    contractorId:data.contractorId || data.contractorNo
  }
  this.loading=true
  this.service.getWorkClassification(workClassificationDetails).subscribe((response:any) => {
  this.loading=false
  const filteredResponse = response.filter((item: any) => item.tableId !== null);
  this.TableData = filteredResponse;
   // this.showTable = this.TableData.length > 0;
  }, (Error)=>{
    console.log(Error)
    this.loading=false
  })
}
}
