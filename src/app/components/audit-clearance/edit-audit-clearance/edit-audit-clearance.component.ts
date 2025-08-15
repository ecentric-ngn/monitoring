import { Component } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
@Component({
  selector: 'app-edit-audit-clearance',
  templateUrl: './edit-audit-clearance.component.html',
  styleUrls: ['./edit-audit-clearance.component.scss']
})
export class EditAuditClearanceComponent {
paramData: any;
  tableData: any;
  uuid: any;
  Privileges: any;
  selectedData: any;


constructor(private service:CommonService,private messageService:MessageService,private router: Router,){}

ngOnInit(){
   this.paramData = this.service.getData('auditDetailsWorkId');
   this.getAuditById()
   const storedPrivileges = sessionStorage.getItem('setPrivileges');
   if (storedPrivileges) {
    this.Privileges = JSON.parse(storedPrivileges);
}  
const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
if (sessionLocalData) {
this.uuid = sessionLocalData.userId
}
 setTimeout(() => {
}, 1000);
}

getAuditById(){
  const auditDetails = {
    "viewName": "auditClearance",
    "pageSize":1,
    "pageNo":1,
    "condition": [
      {
        field: "id",
        value: this.paramData
    },
    ]
  }
  this.service.fetchAuditData(auditDetails).subscribe((response:any)=>{
    this.tableData = response.data
  })
}

editAuditClearance(tableData: any): void{
const payload={
  agency:tableData[0].agency,
  ain:tableData[0].AIN,
  auditedPeriod:tableData[0].auditPeriod,
  paroNo:tableData[0].paraNo,
  auditObservation:tableData[0].auditObservation,
  id:this.paramData,
  editedBy:this.uuid
}

this.service.updateAuditMemo(payload).subscribe((response:any)=>{
  this.showUpdateMessage()
  setTimeout(() => {
   this.getAuditById()
  }, 1000);


  }, error => {
    console.error(error);
  });
}
back(){
  this.router.navigate(['/audit-clearance'])
}

showUpdateMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Audit Detail updated successfully' });
}
}

