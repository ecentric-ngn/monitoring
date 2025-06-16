import { Component, ViewChild } from '@angular/core';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import { SpecializedFirmService } from '../../../../service/specialized-firm.service';
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
  pageSize: number = 10;
  pageNo: number = 1;
  formData: any = {};
  receivedData: any;
  OwnerShipTypeList: any;
  dzongkhagList: any;
  getGewogList: any;
  villageList: any;
  dzongkhagId: any;
  uuid: any;
  loading:boolean=false
  @ViewChild('closeButton') closeButton: any;
  constructor(private service: SpecializedFirmService,private messageService:MessageService,private router: Router,private location:Location) {}

  ngOnInit() {
    if (this.data) {
      switch (this.data.status) {
        case 'Suspended':
          this.getsuspend(this.data);
          break;
        case 'Deregistered':
          this.Deregister(this.data);
          break;
        case 'Cancelled':
          this.GetCancelled(this.data);
          break;
        default:
          this.getGeneralInformation(this.data);
          break;
      }
      const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
      if (sessionLocalData) {
      this.uuid = sessionLocalData.userId
   }
    }
  }
  back(){
    this.location.back()
  }
  // Getting the active general information data
  getGeneralInformation(data: any) {
    const specializedfirm = {
      viewName: 'specializedFirm',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'specializedFirmNo', 
          value: data.specializedFirmNo 
        }
      ]
    };
    this.loading=true
    this.service.getListOfSpecializedFirm(specializedfirm).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
        this.loading=false
        console.error('Error:', error);
      }
    );
  }
  Deregister(data: any) {
    const contractor = {
      viewName: 'specializedFirmDeregistered',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'specializedFirmNo', 
          value: data.specializedFirmNo 
        }
      ]
    };
    this.loading=true
    this.service.getListOfSpecializedFirm(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
  getsuspend(data: any) {
    const contractor = {
      viewName: 'specializedFirmSuspended',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'specializedFirmNo', 
          value: data.specializedFirmNo 
        }
      ]
    };
    this.loading=true
    this.service.getListOfSpecializedFirm(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
        this.loading=false
        console.error('Error:', error);
      }
    );
  }
  GetCancelled(data: any) {
    const contractor = {
      viewName: 'specializedFirmCancelled',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'specializedFirmNo', 
          value: data.specializedFirmNo 
        }
      ]
    };
    this.loading=true
    this.service.getListOfSpecializedFirm(contractor).subscribe(
      (response: any) => {
        this.loading=false
        this.formData = response.data[0];
      },
      (error) => {
        this.loading=false
        console.error('Error:', error);
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
    this.service.getListOfSpecializedFirm(contractor).subscribe(
      (response: any) => {
        this.dzongkhagList = response.data;
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
            } else {
              this.dzongkhagId = '';
            }
          }

  onCancel(){
    this.ngOnInit()
  }
  updateGeneralInformation(){
  const payload ={
    id:this.formData.specializedFirmId,
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
      }, 500); // Adjust the delay (in milliseconds) if needed
    },
    (error: any) => { // Correct syntax for error handler
      this.showErrorMessage()
    }
  );
}
showSucessMessage() {
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'General information added successfully' });
}
showErrorMessage() {
  this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
}
}
  
