import { Component, Input, ViewChild } from '@angular/core';
import { ContractorService } from '../../../../service/contractor.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.scss']
})
export class GeneralInformationComponent {
  @Input() data: any;
  @Input() title: any;
  @ViewChild('closeButton') closeButton: any;
  pageSize: number = 10;
  pageNo: number = 1;
  formData: any = {};
  loading:boolean=false
  OwnerShipTypeList: any;
  dzongkhagList: any;
  dzongkhagId: any;
  getGewogList: any;
  villageList: any;
  uuid: any;
  constructor(private service: ContractorService,private messageService:MessageService,private router: Router, private location:Location) {
  }
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
          this.getDeregister(this.data);
          break;
        case 'Cancelled':
          this.GetCancelled(this.data);
          break;
        default:
          this.getGeneralInformation(this.data);
          break;
      }
    }
  }
  getGeneralInformation(data: any) {
    const contractor = {
      viewName: 'contractor',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'contractorNo',
          value: data.contractorNo
        }
      ]
    };
    this.loading=true
    this.service.getContractorDetails(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
      }
    );
  }
  getDeregister(data: any) {
    const contractor = {
      viewName: 'contractorDeregistered',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'contractorNo',
          value: data.contractorNo
        }
      ]
    };
    this.loading=true
    this.service.getContractorDetails(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
      }
    );
  }

  getsuspend(data: any) {
    const contractor = {
      viewName: 'contractorSuspended',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'contractorNo',
          value: data.contractorNo
        }
      ]
    };
    this.loading=true
    this.service.getContractorDetails(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
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
    this.service.getContractorDetails(contractor).subscribe(
      (response: any) => {
        this.dzongkhagList = response.data;
        console.log('dzongkhagList',this.dzongkhagList)
      },
      (error) => {
      }
    );
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
  
  updateGeneralInformation(){
  const payload ={
    id:this.data.contractorId,
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
      }, 500);
    },
    (error: any) => {
      this.showErrorMessage()
    }
  );
}
onCancel(){
  this.ngOnInit()
}
showSucessMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Owner information added successfully' });
}
showErrorMessage() {
  this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
}
  GetCancelled(data: any) {
    const contractor = {
      viewName: 'contractorCancelled',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'contractorNo',
          value: data.contractorNo
        }
      ]
    };
    this.loading=true
    this.service.getContractorDetails(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
      }
    );
  }

  back(){
    this.location.back()
  }
}
