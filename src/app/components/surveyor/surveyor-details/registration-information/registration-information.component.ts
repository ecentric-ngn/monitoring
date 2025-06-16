import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyorService } from '../../../../service/surveyor.service';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registration-information',
  templateUrl: './registration-information.component.html',
  styleUrls: ['./registration-information.component.scss']
})
export class RegistrationInformationComponent implements OnInit {
  formData:any = {};
  pageSize: number = 10;
  pageNo: number = 1;
  paramData:{}; // Assuming you want to store data from route state
  @Input() title: any;
  @Input() data: any;
  qualificationList: any;
  dzongkhagList: any;
  getGewogList: any;
  villageList: any;
  countryList: any;
 @ViewChild('closeButton') closeButton: any;
  countryId: any;
  qualificationId: any;
  uuid: any;
  constructor(
    private route: ActivatedRoute,
    private service: SurveyorService,
    private location: Location,
    private messageService:MessageService
  ) {}

  ngOnInit() {
    const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
    if (sessionLocalData) {
    this.uuid = sessionLocalData.userId
 }
    if (this.data && this.data.status) {
      switch (this.data.status) {
        case 'Suspended':
          this.getSuspend(this.data);
          break;
        case 'Cancelled':
          this.getCancelled(this.data);
          break;
        default:
          this.getGeneralInformation(this.data);
          break;
      }
    } else {
      console.error('Data or status is undefined:', this.data);
    }
  }

  back(): void {
    this.location.back();
  }

  getGeneralInformation(data: any): void {
    const surveyor = {
      viewName: 'surveyor',
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'surveyorNo',
          value: data.surveyorNo
        }
      ]
    };

    this.service.getListOfSurveyor(surveyor).subscribe(
      (response: any) => {
        this.formData = response.data[0];
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  getSuspend(data: any): void {
    const surveyor = {
      viewName: 'surveyorSuspended',
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'surveyorNo',
          value: data.surveyorNo
        }
      ]
    };

    this.service.getListOfSurveyor(surveyor).subscribe(
      (response: any) => {
        this.formData = response.data[0];
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  getCancelled(data: any): void {
    const surveyor = {
      viewName: 'surveyorCancelled',
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      condition: [
        {
          field: 'surveyorNo',
          value: data.surveyorNo
        }
      ]
    };

    this.service.getListOfSurveyor(surveyor).subscribe(
      (response: any) => {
        this.formData = response.data[0];
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
  openModal() {
    this.getCountryList()
    this.getQualificationList()
  }
  getCountryList() {
    const architect = {
      viewName: 'countryList',
      pageSize: 100,
      pageNo: 1,
      condition: [
      ]
    };
    this.service.getListOfSurveyor(architect).subscribe(
      (response: any) => {
        this.countryList = response.data;
        console.log('countryList',this.countryList)
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
    this.service.getListOfSurveyor(architect).subscribe(
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
  
  
  updateGeneralInformation(){
    const isCancelOrSuspend = this.data.type === 'Cancel' || this.data.type === 'Suspend';
    const payload = {
      id: isCancelOrSuspend ? this.data.surveyorId : this.data.id,
      personalInformationId: this.data.personalInformationId,
      mobileNo: this.formData.mobileNo,
      email: this.formData.email,
      countryId: this.countryId,
      isGovEmployee: this.formData.isGovEmployee,
      qualificationId: this.qualificationId,
      yearOfGraduation: this.formData.yearOfGraduation,
      university: this.formData.university,
      editedBy: this.uuid,
    };
  this.service.updateGeneralInformation(payload).subscribe(
    (response: any) => {
      this.closeButton.nativeElement.click();
      this.showSucessMessage();
      this.ngOnInit()
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
  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'General information updated successfully' });
  }
  showErrorMessage() {
  this.messageService.add({ severity: 'error', summary: 'error', detail: 'Something went wrong.Please try again later' });
  }

  onCancel(){
    this.ngOnInit()
  }
  }
  
