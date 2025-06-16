import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ArchitectService } from '../../../../service/architect.service';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registration-information',
  templateUrl: './registration-information.component.html',
  styleUrls: ['./registration-information.component.scss']
})
export class RegistrationInformationComponent implements OnInit {
  @Input() data: any;
  @Input() title: any;
  formData: any = {}; // Object to hold form data
   form: any;
   pageSize: number = 100;
   pageNo: number = 1;
    govtpvtDetails: any;
    loading:boolean=false
    dzongkhagList: any;
    countryList: any;
    qualificationList: any;
    qualificationId: any;
    @ViewChild('closeButton') closeButton: any;
    countryId: any;
    uuid: any;
  constructor(private service: ArchitectService,  private messageService:MessageService,private router: Router,private location:Location) {}

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
          this.getRegistrationInformation(this.data);
          break;
      }
    
    }
  }
 back(){
  this.location.back()
}
  // Getting the registration information data
  getRegistrationInformation(data: any) {
    const architect = {
      "viewName": "architect",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
        {
          "field": "architectNo", 
          "value": data.architectNo 
        }
    ]
  }
    this.service.getListOfArchitect(architect).subscribe(
      (response: any) => {
        this.loading = false;
        this.govtpvtDetails = response.data[0];
        this.formData = response.data[0]; // Keep the original 'isGovEmployee' value
        // You can still map and use 'type' elsewhere if needed
        if (this.formData.isGovEmployee === 'Y') {
          this.formData.type = 'Government';
        } else if (this.formData.isGovEmployee === 'N') {
          this.formData.type = 'Private';
        } else {
          this.formData.type = '';
        }
      },
      (error) => {
        console.error('Error fetching registration information:', error);
        // Handle errors here
      })
    }      
    getsuspend(data: any) {
      const architect = {
        viewName: 'architectSuspended',
        pageSize: this.pageNo,
        pageNo: this.pageNo,
        condition: [
          {
            "field": "architectNo", // Assuming architectNo is the field to filter
            "value": data.architectNo // Use the value of architectNo from the data object
          }
        ]
      };
      this.loading=true
      this.service.getListOfArchitect(architect).subscribe(
        (response: any) => {
          this.loading = false;
          this.govtpvtDetails = response.data[0];
          this.formData = response.data[0]; // Keep the original 'isGovEmployee' value
          // You can still map and use 'type' elsewhere if needed
          if (this.formData.isGovEmployee === 'Y') {
            this.formData.type = 'Government';
          } else if (this.formData.isGovEmployee === 'N') {
            this.formData.type = 'Private';
          } else {
            this.formData.type = '';
          }
        },
        (error) => {
          console.error('Error fetching registration information:', error);
          // Handle errors here
        })
      } 
    GetCancelled(data: any) {
      const architect = {
        viewName: 'architectCancelled',
        pageSize: this.pageNo,
        pageNo: this.pageNo,
        condition: [
          {
            "field": "architectNo", // Assuming architectNo is the field to filter
            "value": data.architectNo // Use the value of architectNo from the data object
          }
        ]
      };
      this.loading=true
      this.service.getListOfArchitect(architect).subscribe(
        (response: any) => {
          this.loading = false;
          this.govtpvtDetails = response.data[0];
          this.formData = response.data[0]; // Keep the original 'isGovEmployee' value
          // You can still map and use 'type' elsewhere if needed
          if (this.formData.isGovEmployee === 'Y') {
            this.formData.type = 'Government';
          } else if (this.formData.isGovEmployee === 'N') {
            this.formData.type = 'Private';
          } else {
            this.formData.type = '';
          }
        },
        (error) => {
          console.error('Error fetching registration information:', error);
          // Handle errors here
        })
      } 

    openModal() {
      this.getQualificationList()
      this.getCountryList()
    }
    
    getCountryList() {
      const architect = {
        viewName: 'countryList',
        pageSize: 100,
        pageNo: 1,
        condition: [
        ]
      };
      this.service.getListOfArchitect(architect).subscribe(
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
      this.service.getListOfArchitect(architect).subscribe(
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
  personalInformationId
    updateGeneralInformation(){
      const isCancelOrSuspend = this.data.type === 'Cancel' || this.data.type === 'Suspend';
      const payload = {
      id: isCancelOrSuspend ? this.data.architectId : this.data.id,
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
        setTimeout(() => {
       this.ngOnInit()
        }, 1000); 
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
