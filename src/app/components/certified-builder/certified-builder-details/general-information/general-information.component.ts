import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CertifiedBuilderService } from '../../../../service/certified-builder.service';
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
  formData:any = {};
  certifiedBuilderNo:number;
  dzongkhagList: any;
  dzongkhagId: any;
  uuid: any;
  @ViewChild('closeButton') closeButton: any;
  constructor(private service: CertifiedBuilderService,
  private router: Router,
  private location:Location,
  private messageService:MessageService
  ) {}

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
          this.getGeneralInformation(this.data);
          break;
      }
    }
  }
  back(){
    this.location.back()
  }
  // Getting the active general information data
  getGeneralInformation(data: any) {
    const certifiedBuilder = {
      viewName: 'certifiedBuilder',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'certifiedBuilderNo', 
          value: data.certifiedBuilderNo 
        }
      ]
    };
    this.service.getListOfCertifiedBuilder(certifiedBuilder).subscribe(
      (response: any) => {
        this.formData = response.data[0];
      },
      (error) => {
      }
    );
  }

  getsuspend(data: any) {
    const certifiedBuilder = {
      viewName: 'certifiedBuilderSuspended',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'certifiedBuilderNo', 
          value: data.certifiedBuilderNo 
        }
      ]
    };
    this.service.getListOfCertifiedBuilder(certifiedBuilder).subscribe(
      (response: any) => {
        this.formData = response.data[0];
       
      },
      (error) => {
      }
    );
  }
  GetCancelled(data: any) {
    const certifiedBuilder = {
      viewName: 'certifiedBuilderCancelled',
      pageSize: this.pageNo,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'certifiedBuilderNo', 
          value: data.certifiedBuilderNo 
        }
      ]
    };
    this.service.getListOfCertifiedBuilder(certifiedBuilder).subscribe(
      (response: any) => {
        this.formData = response.data[0];
      },
      (error) => {
      }
    );
  }
  openModal() {
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
        this.service.getListOfCertifiedBuilder(contractor).subscribe(
          (response: any) => {
            this.dzongkhagList = response.data;
          },
          (error) => {
          }
        );
      }
  
  showSucessMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'General information updated successfully' });
  }
  showErrorMessage() {
    this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
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
      id:this.data.certifiedBuilderId,
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
      (error: any) => { // Correct syntax for error handler
        this.showErrorMessage()
      }
    );
    }
  }
