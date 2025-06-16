import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SpecializedTradeService } from '../../../../service/specialized-trade.service';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-registration-information',
  templateUrl: './registration-information.component.html',
  styleUrls: ['./registration-information.component.scss']
})
export class RegistrationInformationComponent {
type: any;
@Input() data: any;
@Input() title: any;
pageSize:number=10;
pageNo:number=1;
formData: any = {};
receivedData: any;
countryList: any;
qualificationList: any;
dzongkhagList: any;
getGewogList: any;
@ViewChild('closeButton') closeButton: any;
villageList: any;
uuid: any;
countryId: any;
qualificationId: any;
constructor(private service:SpecializedTradeService,private messageService:MessageService,private router: Router,private location:Location){}

ngOnInit() {
  const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
  if (sessionLocalData) {
  this.uuid = sessionLocalData.userId
}
  if (this.data) {
    switch (this.data.status) {
      case 'Suspended':
        this.getsuspend(this.data);
        break;
      case 'Cancelled':
        this.GetCancelled(this.data);
        break;
      default:
        this.getGeneralinformation(this.data);
        break;
    }
  }
}
back(){
  this.location.back()
}
getGeneralinformation(data:any){
  const specializedTrade = {
    "viewName": "specializedTrade",
    "pageSize":this.pageSize,
    "pageNo":this.pageNo,
    "condition": [
      {
        "field": "specializedTradeNo", 
        "value": data.specializedTradeNo 
      }
  ]
}
this.loading=true
  this.service.ListOfSpecializedTrade(specializedTrade).subscribe((response:any) => {
    this.formData= response.data[0];
    this.loading=false
  }, (Error)=>{ 
    this.loading=false 
  })
}
getsuspend(data: any) {
const specializedTrade = {
  viewName: 'specializedTradeSuspended',
  pageSize: this.pageNo,
  pageNo: this.pageNo,
  condition: [
    {
      "field": "specializedTradeNo", 
      "value": data.specializedTradeNo 
    }
  ]
};
this.service.ListOfSpecializedTrade(specializedTrade).subscribe(
  (response: any) => {
    this.formData = response.data[0];
  },
  (error) => {
  }
);
}
GetCancelled(data: any) {
const specializedTrade = {
  viewName: 'specializedTradeCancelled',
  pageSize: this.pageNo,
  pageNo: this.pageNo,
  condition: [
    {
      "field": "specializedTradeNo", // Assuming contractorNo is the field to filter
      "value": data.specializedTradeNo // Use the value of contractorNo from the data object
    }
  ]
};
this.service.ListOfSpecializedTrade(specializedTrade).subscribe(
  (response: any) => {
    this.formData = response.data[0];
  },
  (error) => {
  }
);
}

openModal() {
  this.getCountryList();
  this.getQualificationList();
}
getCountryList() {
  const architect = {
    viewName: 'countryList',
    pageSize: 100,
    pageNo: 1,
    condition: [
    ]
  };
  this.service.ListOfSpecializedTrade(architect).subscribe(
    (response: any) => {
      this.countryList = response.data;
    },
    (error) => {
    }
  );
}

getQualificationList() {
  const architect = {
    viewName: 'qualificationList',
    pageSize: 100,
    pageNo: 1,
    condition: [
    ]
  };
  this.service.ListOfSpecializedTrade(architect).subscribe(
    (response: any) => {
      this.qualificationList = response.data;
    },
    (error) => {
    }
  );
}
onQualificationChange(selectedQualification: any): void {
  const matchingQualificationId= this.qualificationList.find(nat => nat.name === selectedQualification);
    if (matchingQualificationId) {
    this.qualificationId = matchingQualificationId.id;
    this.qualificationId = this.qualificationId
  } else {
      this.qualificationId = '';
     }
}
onCountryChange(selectedCountry: any): void {
  const matchingCountryId= this.countryList.find(nat => nat.name === selectedCountry);
    if (matchingCountryId) {
    this.countryId = matchingCountryId.id;
    this.countryId = this.countryId
  } else {
      this.countryId = '';
     }
}
loading:boolean=false
updateGeneralInformation(){
  const payload ={
  id:this.data.id,
  personalInformationId:this.data.personalInformationId,
  mobileNo:this.formData.mobileNo,
  email:this.formData.email,
  countryId:this.countryId,
  isGovEmployee:this.formData.type,
  qualificationId:this.qualificationId,
  yearOfGraduation:this.formData.yearOfGraduation,
  university:this.formData.university,
  editedBy:this.uuid,
}
this.service.updateGeneralInformation(payload).subscribe(
  (response: any) => {
    this.closeButton.nativeElement.click();
    this.showSucessMessage();
    setTimeout(() => {
      this.ngOnInit()
    }, 1000); // Adjust the delay (in milliseconds) if needed
  },
  (error: any) => { // Correct syntax for error handler
    this.showErrorMessage()
  }
);
}
showSucessMessage() {
this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Owner information added successfully' });
}
showErrorMessage() {
this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
}

onCancel(){
  this.ngOnInit()
}
}

