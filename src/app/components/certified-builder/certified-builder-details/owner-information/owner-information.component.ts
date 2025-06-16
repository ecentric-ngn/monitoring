import { Component, Input, ViewChild } from '@angular/core';
import { CertifiedBuilderService } from '../../../../service/certified-builder.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-owner-information',
  templateUrl: './owner-information.component.html',
  styleUrls: ['./owner-information.component.scss']
})
export class OwnerInformationComponent {
  @Input() data: any;
  TableData:any;
  pageSize:number=100;
  pageNo:number=1;
  formData: any;
  isCIDDisabled: boolean;
  @ViewChild('closeButton') closeButton: any;
  @ViewChild('editButton') editButton: any;
  ownerList: any[] = [];
  deginationList: any;
  salutationList: any;
  nationalityList: any;
  Ownerdata= {
  nationalityId: '',
  designationId: '',
  SalutationId:''
  
  };
  nationalityId: any;
  designationList: any;
  designationId: any;
  owner = {
    cidNo: '',
    salutation: '',
    name: '',
    gender: '',
    nationality: '',
    designation: '',
    reasonForChange: '',
  };
  salutationId: string;
  showCidError: boolean;
  uuid: any;
  constructor(private service:CertifiedBuilderService , private messageService:MessageService){}

  ngOnInit(){
    const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
    if (sessionLocalData) {
    this.uuid = sessionLocalData.userId
  }
  this.getdeginationList()
  this.getsalutationList()
  this.getNationalityList()
  this.getOwnerDetails(this.data) 
  }
//getting the human resource
  getOwnerDetails(data:any){
    const certifiedBuilder = {
      "viewName": "certifiedBuilderHr",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
         {
          "field": "certifiedBuilderNo",
          "value": data.certifiedBuilderNo 
       },
       {
        "field": "isPartnerOrOwner",
          "value": "Y"
      }
    ]
  }
    this.service.getListOfCertifiedBuilder(certifiedBuilder).subscribe((response:any) => {
      this.TableData= response.data;
    },(Error) => {
     
    })
  }
  openModal(){
    this.owner.cidNo='',
    this.owner.name='',
    this.owner.gender=''
  }
  
  getdeginationList() {
    const consultant = {
      viewName: 'designationList',
      pageSize: 100,
      pageNo: 1,
      condition: [
      ]
    };
    this.service.getListOfCertifiedBuilder(consultant).subscribe(
      (response: any) => {
        this.designationList = response.data;
        
      },
      (error) => {
      }
    );
  }
  getsalutationList() {
    const consultant = {
      viewName: 'salutationList',
      pageSize: 10,
      pageNo: 1,
      condition: [
      ]
    };
    this.service.getListOfCertifiedBuilder(consultant).subscribe(
      (response: any) => {
        this.salutationList = response.data;
      
      },
      (error) => {
      }
    );
  }

  getNationalityList() {
    const consultant = {
      viewName: 'nationalityList',
      pageSize: 100,
      pageNo: 1,
      condition: [
      ]
    };
    this.service.getListOfCertifiedBuilder(consultant).subscribe(
      (response: any) => {
        this.nationalityList = response.data;
     
      },
      (error) => {
      }
    );
  }

  isNameDisabled:boolean=false
  isCidDisabled:boolean=false
  onNationalityChange(selectedNationality: any): void {
    const matchingNationality = this.nationalityList.find(nat => nat.nationality === selectedNationality);
    if (matchingNationality) {
      this.Ownerdata.nationalityId = matchingNationality.id;
      this.nationalityId = this.Ownerdata.nationalityId
    } else {
      this.Ownerdata.nationalityId = '';
      console.log('Nationality not found.');
    }
  }
  onDesignationChange(selectedDesignationChange: any): void {
    const matchingDesignationId= this.designationList.find(nat => nat.name === selectedDesignationChange);
    if (matchingDesignationId) {
      this.Ownerdata.designationId = matchingDesignationId.id;
      this.designationId = this.Ownerdata.designationId
    } else {
      this.Ownerdata.nationalityId = '';
    }
  }
  isLoadingforcid:boolean=false
  onSalutationChange(selectedSalutationChange: any): void {
    const matchingSalutationId= this.salutationList.find(nat => nat.name === selectedSalutationChange);
    if (matchingSalutationId) {
      this.Ownerdata.SalutationId = matchingSalutationId.id;
      this.salutationId = this.Ownerdata.SalutationId
    } else {
      this.Ownerdata.SalutationId = '';
    }
  }
  fetchDetailsFromDCRC(cidNo: any) {
    if (!cidNo) {
      this.showCidError = true; // Show error message
      return; // Exit the method early
    }
    this.showCidError = false;
    this.isLoadingforcid = true;
    this.service.getCitizenDetails(cidNo).subscribe(
      (response: any) => {
        this.isLoadingforcid = false;
        // Check if citizenDetail is null or empty
        if (!response?.citizenDetailsResponse?.citizenDetail) {
          this.isLoadingforcid = false;
          this.isNameDisabled = false;
          this.isNameDisabled = false;
          alert("Cannot found in DCRC"); // Show error message if citizenDetail is null
          return;
        }
        // If citizenDetail is not null or empty, proceed with the normal flow
        const citizenDetail = response.citizenDetailsResponse.citizenDetail;
        if (citizenDetail?.length === 0) {
          alert("Not Registered in DCRC");
          this.isNameDisabled = false;
          this.isNameDisabled = false;
          this.isLoadingforcid = false;
        } else {
          const firstCitizenDetail = citizenDetail[0]; // Assuming you're using the first item from the array
          this.owner.name = [
            firstCitizenDetail.firstName,
            firstCitizenDetail.middleName,
            firstCitizenDetail.lastName
          ]
            .filter(namePart => namePart) // Remove any null or undefined name parts
            .join(' ');
          this.owner.gender = firstCitizenDetail.gender // Map gender F -> Female, M -> Male
        }
        this.isLoadingforcid = false;
        this.isCidDisabled = true;
        this.isNameDisabled = true;
      },
      (error) => {
        this.isLoadingforcid = false;
        alert("Something went wrong, system could not fetch from DCRC system");
        console.error('Error fetching citizen details:', error);
        this.isLoadingforcid = false;
      }
    );
  }
 
  submitted = false;
  clearData(){
  this.owner.cidNo='',
  this.owner.name='',
  this.owner.gender=''
  this.isCidDisabled = false;
  this.isNameDisabled = false;
  this.submitted = false; 
    }

  resetData(){
  this.submitted = false;
  this.isCidDisabled = false;
  this.owner.cidNo='',
  this.owner.name='',
  this.owner.gender=''
  this.owner.salutation=''
  this.owner.nationality=''
  this.owner.reasonForChange=''
  }
  onCreateOwnerInformation() {
    this.submitted = true; // Mark the form as submitted
    if (!this.owner.salutation || !this.owner.cidNo || !this.owner.designation || !this.owner.nationality) {
      return; 
    }
  const payload = {
    cidNo: this.owner.cidNo,
    certifiedBuilderId: this.data.certifiedBuilderId,
    name: this.owner.name,
    gender: this.owner.gender,
    designation: this.owner.designation,
    salutation: this.owner.salutation,
    nationality:this.owner.nationality,
    reasonForChange: this.owner.reasonForChange,
    createdBy: this.uuid,
  };

  this.service.saveOwnerInformation(payload).subscribe(
  (response) => {
  console.log(response);
  this.closeButton.nativeElement.click();
  this.showSucessMessage();
  setTimeout(() => {
    this.getOwnerDetails(this.data);
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
  this.messageService.add({ severity: 'error', summary: 'error', detail: 'The cid already exist.Try with another cid' });
  }
  selectedFile: File | null = null; // Store uploaded file
  reasonForChange: string = ''; // Store reason for change

  ownerTableId:any
  cidNo:any
  editOwner(ownerDetail: any) {
    this.isNameDisabled = true;
    this.cidNo = ownerDetail.cidNo;
    this.owner = {
    cidNo: ownerDetail.cidNo || '',
    salutation: ownerDetail.salutation || '',
    name: ownerDetail.name || '',
    gender: ownerDetail.gender || '',
    nationality: ownerDetail.nationality || '',
    designation: ownerDetail.designation || '',
    reasonForChange:ownerDetail.reasonForChange || '',
    };

    }

    // Cancel button click
    onCancel() {
    this.selectedFile = null;
    this.reasonForChange = '';
    console.log('Operation canceled.');
    }
    onUpdateOwnerInformation() {
    const payload = {
    cidNo: this.owner.cidNo,
    oldCidNo:this.cidNo,
    certifiedBuilderId: this.data.certifiedBuilderId,
    name: this.owner.name,
    gender: this.owner.gender,
    designation: this.designationId,
    salutation: this.salutationId,
    nationality: this.nationalityId,
    editedBy: this.uuid,
    };
    this.service.updateOwnerInformation(payload).subscribe(
    (response) => {
    console.log(response);
    this.editButton.nativeElement.click();
    this.showUpdateMessage();
    setTimeout(() => {
      this.getOwnerDetails(this.data);
    }, 1000); // Adjust the delay (in milliseconds) if needed
    },

    );
    }

    showUpdateMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Owner information updated successfully' });
    }
    }
