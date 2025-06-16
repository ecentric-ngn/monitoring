import { Component, ViewChild } from '@angular/core';
import { Input } from '@angular/core';
import { ConsultantService } from '../../../../service/consultant.service';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-consultant-general-information',
  templateUrl: './consultant-general-information.component.html',
  styleUrls: ['./consultant-general-information.component.scss']
})
export class ConsultantGeneralInformationComponent {
  @Input() data: any;
  @Input() title: any;
  pageSize:number=10;
  pageNo:number=1;
  showMore = false;
  formData: any = {};
  receivedData: any;
  loading:boolean=false
  OwnerShipTypeList: any;
  dzongkhagList: any;
  getGewogList: any;
  villageList: any;
  @ViewChild('closeButton') closeButton: any;
  uuid: any;
  dzongkhagId: any;
  constructor(private service:ConsultantService,
    private location:Location,
    private messageService:MessageService
  ){}
 
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
        case 'Deregistered':
            this.getDeregistered(this.data);
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
    const consultant = {
      "viewName": "consultant",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
        {
          "field": "consultantNo", // Assuming contractorNo is the field to filter
          "value": data.consultantNo // Use the value of contractorNo from the data object
        }
    ]
  }
  this.loading=true
    this.service.getListOfConsultant(consultant).subscribe((response:any) => {
      this.loading=false
      this.formData= response.data[0];
      if(this.formData.isGovEmployee==='Y'){
        this.formData.type = 'Government'
       }else{
       this.formData.type='Private'
       }
      
    }, (Error)=>{  
    })
  }
  getDeregistered(data: any) {
    const contractor = {
      viewName: 'consultantDeregistered',
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      condition: [
        {
          "field": "consultantNo", // Assuming contractorNo is the field to filter
          "value": data.consultantNo // Use the value of contractorNo from the data object
        }
      ]
    };
    this.loading=true
    this.service.getListOfConsultant(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
       if(this.formData.isGovEmployee==='Y'){
        this.formData.type = 'Government'
       }else{
       this.formData.type='Private'
       }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
getsuspend(data: any) {
  const contractor = {
    viewName: 'consultantSuspended',
    pageSize: this.pageNo,
    pageNo: this.pageNo,
    condition: [
      {
        "field": "consultantNo", // Assuming contractorNo is the field to filter
        "value": data.consultantNo // Use the value of contractorNo from the data object
      }
    ]
  };
  this.loading=true
  this.service.getListOfConsultant(contractor).subscribe(
    (response: any) => {
      this.loading=false
      this.formData = response.data[0];
     if(this.formData.isGovEmployee==='Y'){
      this.formData.type = 'Government'
     }else{
     this.formData.type='Private'
     }
    },
    (error) => {
      console.error('Error:', error);
    }
  );
}
GetCancelled(data: any) {
  const consultant = {
    viewName: 'consultantCancelled',
    pageSize: this.pageNo,
    pageNo: this.pageNo,
    condition: [
      {
        "field": "consultantNo", // Assuming contractorNo is the field to filter
        "value": data.consultantNo // Use the value of contractorNo from the data object
      }
    ]
  };
  this.loading=true
  this.service.getListOfConsultant(consultant).subscribe(
    (response: any) => {
      this.loading=false
      this.formData = response.data[0];
      if(this.formData.isGovEmployee==='Y'){
        this.formData.type = 'Government'
       }else{
       this.formData.type='Private'
       }
    },
    (error) => {
      console.error('Error:', error);
        this.loading=false
    }
  );
}
openModal(){
  this.getDzongkhagList()
}

    getDzongkhagList() {
      const contractor = {
        viewName: 'dzongkhagList',
        pageSize: 20,
        pageNo: 1,
        condition: [
        ]
      };
      this.service.getListOfConsultant(contractor).subscribe(
        (response: any) => {
          this.dzongkhagList = response.data;
        },
        (error) => {
        }
      );
    }

showSucessMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Owner information added successfully' });
}
showErrorMessage() {
  this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
}
onDzongkhagChange(selectedDzongkhag: any): void {
  const matchingDzongkhagId= this.dzongkhagList.find(nat => nat.name === selectedDzongkhag);
          if (matchingDzongkhagId) {
            this.dzongkhagId = matchingDzongkhagId.id;
            this.dzongkhagId = this.dzongkhagId
            console.log('Selected dzongkhagId ID:', this.dzongkhagId);
          } else {
            this.dzongkhagId = '';
            console.log('dzongkhagId not found.');
          }
        }

        onCancel(){
          this.ngOnInit()
        }

  updateGeneralInformation(){
  const payload ={
    id:this.data.consultantId,
    businessLicenseNo:this.formData.businessLicenseNo,
    tpn:this.formData.tpn,
    permanentDzongkhag:this.formData.permanentDzongkhag,
    permanentGewog:this.formData.permanentGewog,
    permanentVillage:this.formData.permanentVillage,
    establishmentAddress:this.formData.establishmentAddress,
    establishmentDzongkhagId:this.dzongkhagId,
    telephoneNo:this.formData.telephoneNo,
    mobileNo:this.formData.mobileNo,
    faxNo:this.formData.faxNo,
    email:this.formData.email,
    editedBy:this.uuid
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
}
