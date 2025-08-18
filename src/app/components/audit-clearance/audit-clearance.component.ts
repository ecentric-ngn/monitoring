import { Component, ViewChild} from '@angular/core';
import { CommonService } from '../../service/common.service';
import {Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-audit-clearance',
  templateUrl: './audit-clearance.component.html',
  styleUrls: ['./audit-clearance.component.scss']
})
export class AuditClearanceComponent {
//formData: any = {};
loading: boolean = true;
searchQuery: any;
pageSize: number = 10;
pageNo: number = 1;
total_records: number = 0;
totalPages: number = 0;
 set_limit: number[] = [ 10,  15, 25, 100];
selectedLimit: number = this.set_limit[0];
formData ={
  Date:'',
  remarks:''
}
Tabledata: any[] = [];
Privileges: any;
uuid: any;
UserData: any;
  tableData: any;
  nameOfFirm: any;
  auditObservation: any;
  cidNo: any;
  cdbNo: any;
  id: any;
  @ViewChild('closeButton') closeButton: any;
constructor(private service:CommonService,private router: Router,private messageService:MessageService,) {}
ngOnInit() {
  this.GetAuditData()
  const storedPrivileges = sessionStorage.getItem('setPrivileges');
  if (storedPrivileges) {
      this.Privileges = JSON.parse(storedPrivileges);
  }  
  const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
  if (sessionLocalData) {
  this.uuid = sessionLocalData.userId
}
}
Searchfilter() {
  if (this.searchQuery && this.searchQuery.trim() !== '') {
    this.GetAuditData(this.searchQuery); // Pass search query to backend
  } else {
    this.GetAuditData(); // Fetch all data
  }
}
errorMessage:boolean=false
GetAuditData(searchQuery?: string) {
  const trainingDetails = {
    "viewName": "auditClearance",
    "pageSize":this.pageSize,
    "pageNo":this.pageNo,
    "condition": searchQuery ? [
      {
        field: "cdbNo",
        value: `%${searchQuery}%`,
        condition: "like",
        operator: " AND "
    },
    {
        field: "nameOfFirm",
        value: `%${searchQuery}%`,
        condition: " like ",
        operator: " OR "
    }
    ] : []
  };
  this.service.fetchAuditData(trainingDetails).subscribe(
  (response: any) => {
    this.errorMessage=false
    this.loading=false
    this.tableData = response.data
    this.total_records = response.totalCount;
    this.totalPages = Math.ceil(this.total_records / this.pageSize); 
    },
    (error) => {
      this.errorMessage=true
      this.loading=false
    }
  );
}
 
splitTextIntoChunks(text: string, wordCount: number): string[] {
  const words = text.split(' ');
  const auditObservation = [];
  // Split text into chunks of wordCount words
  for (let i = 0; i < words.length; i += wordCount) {
    auditObservation.push(words.slice(i, i + wordCount).join(' '));
  }
  return auditObservation;
}
 navigateToAddClearance(){
  this.router.navigate(['/add-audit-clearance'])
 } 
//  navigateToEditAuditClearance(){
//   this.router.navigate(['/edit-audit-clearance'])
//  }

 navigateToEditAuditClearance(id: any) {
  
  this.service.setData(id, 'auditDetailsWorkId', 'edit-audit-clearance');
}

storeId(id: any) {
  this.id = id;
  const confirmation = window.confirm("Are you sure you want to delete this record?");
  
  if (confirmation) {
    // Proceed with the delete action
    this.deleteRecord(id);
  } else {
  }
}

deleteRecord(id: any) {
  this.service.deleteAuditData(id).subscribe((response:any)=>{
    this.showdeleteMessage()
    setTimeout(() => {
      this.GetAuditData()
    }, 1000);
    }, error => {
      console.error(error);
    });
  }

showdeleteMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Audit memo deleted successfully' });
}
 getAuditById(id:any){
  this.id=id
  const auditDetails = {
    "viewName": "auditClearance",
    "pageSize":1,
    "pageNo":1,
    "condition": [
      {
        field: "id",
        value: this.id
    },
    ]
  }
  this.service.fetchAuditData(auditDetails).subscribe((response:any)=>{
    this.nameOfFirm = response.data[0].nameOfFirm
    this.auditObservation = response.data[0].auditObservation
    this.cdbNo = response.data[0].cdbNo
  })
}
dropDetails(actionForm) {
  if (actionForm.invalid) {
    Object.keys(actionForm.controls).forEach(field => {
      const control = actionForm.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return;
  }
 this.SaveDropDetails();
}
SaveDropDetails(){
  const payload={
    dropped:1,
    id:this.id,
    remarks:this.formData.remarks,
    dropedDate:this.formData.Date,
  }
  this.service.updateAuditMemo(payload).subscribe((response:any)=>{
    this.showdropMessage()
    this.formData.Date=''
    this.formData.remarks=''
    this.closeButton.nativeElement.click();
    setTimeout(() => {
    this.GetAuditData()
    }, 1000);
  }, error => {
    console.error(error);
  });
}

cancelDropDetails(actionForm: NgForm) {
    actionForm.resetForm(); // Reset the form using Angular's form reset method
  
  }

showdropMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Audit memo deleted successfully' });
}
// Method to set limit value
  setLimitValue(value: any) {
    this.pageSize = parseInt(value);
    this.pageNo = 1;
    this.GetAuditData();
  }
  previousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.GetAuditData();
    }
  }
  nextPage() {
    if (this.pageNo < this.totalPages) {
      this.pageNo++;
      this.GetAuditData();
    }
  }
  goToPage(pageSize: number) {
    if (pageSize >= 1 && pageSize <= this.totalPages) {
      this.pageNo = pageSize;
      this.GetAuditData();
    }
  } 
  // Method to calculate starting and ending entry numbers
  calculateOffset(): string {
    const currentPage = (this.pageNo - 1) * this.pageSize + 1;
    const limit_value = Math.min(
      this.pageNo * this.pageSize,
      this.total_records
    );
    return `Showing ${currentPage} to ${limit_value} of ${this.total_records} entries`;
  }
  generatePageArray(): number[] {
    const pageArray: number[] = [];

    // If total_pages is less than or equal to 4, display all pages
    if (this.totalPages <= 4) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageArray.push(i);
      }
    } else {
      // Display the first two and last two pages
      if (this.pageNo <= 2) {
        for (let i = 1; i <= 2; i++) {
          pageArray.push(i);
        }
        pageArray.push(-1); // Placeholder for ellipsis
        for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
          pageArray.push(i);
        }
      } else if (this.pageNo >= this.totalPages - 1) {
        for (let i = 1; i <= 2; i++) {
          pageArray.push(i);
        }
        pageArray.push(-1); // Placeholder for ellipsis
        for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
          pageArray.push(i);
        }
      } else {
        // Display the current page, previous and next page, and the first and last pages
        if (this.pageNo === 3) {
          for (let i = 1; i <= this.pageNo + 1; i++) {
            pageArray.push(i);
          }
          pageArray.push(-1); // Placeholder for ellipsis
          for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
            pageArray.push(i);
          }
        } else {
          for (let i = 1; i <= 2; i++) {
            pageArray.push(i);
          }
          pageArray.push(-1); // Placeholder for ellipsis
          for (let i = this.pageNo - 1; i <= this.pageNo + 1; i++) {
            pageArray.push(i);
          }
          pageArray.push(-1); // Placeholder for ellipsis
          for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
            pageArray.push(i);
          }
        }
      }
    }
    return pageArray;
  }
}











