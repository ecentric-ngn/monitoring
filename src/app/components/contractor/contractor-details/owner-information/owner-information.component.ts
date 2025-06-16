import { Component, Input, ViewChild } from '@angular/core';
import { ContractorService } from '../../../../service/contractor.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-owner-information',
  templateUrl: './owner-information.component.html',
  styleUrls: ['./owner-information.component.scss']
})
export class OwnerInformationComponent {
  @Input() data: any;
  isLoading: boolean = false;
  TableData:any[]  
  pageSize:number= 100;
  pageNo:number= 1;
  searchQuery: string = '';
  fileTypeInvalid: boolean;
  loading:boolean=false
  owner = {
    cidNo: '',
    salutation: '',
    name: '',
    gender: '',
    nationality: '',
    designation: '',
    reasonForChange: '',
  };
  @ViewChild('fileInput') fileInput;
  showCidError:boolean=false
  isCidDisabled:boolean=false
  isNameDisabled:boolean=false
  isLoadingforcid:boolean=false
  isCIDDisabled: boolean;
  fileSizeExceeded: boolean = false;
  allowedTypes: string[] = ['application/pdf', 'image/jpeg'];
  maxFileSizeMB: number = 2; // Maximum file size in MB
  maxSizeInBytes: number = this.maxFileSizeMB * 1024 * 1024;
   @ViewChild('closeButton') closeButton: any;
   @ViewChild('editButton') editButton: any;
   
  ownerList: any[] = [];
  fileId: string;
  salutationList: any;
  deginationList: any;
  uuid: any;
  nationalityList: any;
  designationList: any;
  Data: any;
  hrId: any;
  Ownerdata= {
    nationalityId: '',
    designationId: '',
    SalutationId:''
  
  };
  nationalityId: string;
  salutationId: any;
  designationId: any;
  constructor(private service:ContractorService,private messageService:MessageService,){}
  ngOnInit(){
    this.getOwnershipDetails(this.data);
    const sessionLocalData = JSON.parse(sessionStorage.getItem('userDetails'));
    if (sessionLocalData) {
    this.uuid = sessionLocalData.userId
 }
}
  //getting the ownership details
    getOwnershipDetails(data:any){
        const contractor = {
          "viewName": "contractorHr",
          "pageSize":this.pageSize,
          "pageNo":this.pageNo,
          "condition": [
            {
            "field": "contractorNo",
              "value": data.contractorNo
          },
          {
            "field": "isPartnerOrOwner",
              "value": "Y"
          }
        ]
      }
      this.loading=true
      this.service.getContractorDetails(contractor).subscribe((response:any) => {
        this.loading=false
        this.TableData = response.data; 
      }, (Error)=>{
        console.log(Error)
        this.loading=false
      }) 
      }

      openModal(){
        this.getdeginationList()
        this.getsalutationList()
        this.getNationalityList()
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
            this.service.getContractorDetails(consultant).subscribe(
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
            this.service.getContractorDetails(consultant).subscribe(
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
            this.service.getContractorDetails(consultant).subscribe(
              (response: any) => {
                this.nationalityList = response.data;
              },
              (error) => {
              }
            );
          }
        
          onNationalityChange(selectedNationality: any): void {
            const matchingNationality = this.nationalityList.find(nat => nat.nationality === selectedNationality);
            if (matchingNationality) {
              this.Ownerdata.nationalityId = matchingNationality.id;
              this.nationalityId = this.Ownerdata.nationalityId
            } else {
              this.Ownerdata.nationalityId = '';
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
    this.fileInput.nativeElement.value = '';
    this.fileSizeExceeded = false;
    this.fileTypeInvalid= false
  }
  onCreateOwnerInformation() {
    this.submitted = true; // Mark the form as submitted
    if (!this.owner.salutation || !this.owner.cidNo || !this.owner.designation || !this.owner.nationality) {
      return; 
    }
  
    const payload = {
      cidNo: this.owner.cidNo,
      contractorId: this.data.contractorId,
      name: this.owner.name,
      gender: this.owner.gender,
      designation: this.owner.designation,
      salutation: this.owner.salutation,
      nationality: this.owner.nationality,
      fileId: this.fileId,
      reasonForChange: this.owner.reasonForChange,
      createdBy: this.uuid,
    };
  
    this.service.saveOwnerInformation(payload).subscribe(
      (response) => {
        console.log(response);
        this.closeButton.nativeElement.click();
        this.showSucessMessage();
        setTimeout(() => {
          this.getOwnershipDetails(this.data);
        }, 1000); // Adjust the delay (in milliseconds) if needed
      },
      (error: any) => {
        this.showErrorMessage();
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

  // Handle file selection


  onFileChanged(event: any) {
    const files = event.target.files;
    this.fileSizeExceeded = false; // Reset error state
    this.fileTypeInvalid = false; // Reset error state

    if (files.length > 0) {
      for (const file of files) {
        // Check file size
        if (file.size > this.maxSizeInBytes) {
          this.fileSizeExceeded = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
          this.fileTypeInvalid = true; // Set error state
          event.target.value = ''; // Clear the file input
          return;
        }
        // Proceed with your file upload logic
        this.selectedFile = file;
        this.uploadFileForContractor();
      }
    }
  }

  uploadFileForContractor() {
    this.isLoading = true;
    this.service.uploadFile(this.selectedFile).subscribe(
      response => {
        this.isLoading = false;
        this.fileId = response;
      },
      error => {
      this.isLoading = false;
      }
    );
  }
  ownerTableId:any
  cidNo:any
  editOwner(ownerDetail: any) {
    this.getdeginationList()
    this.getsalutationList()
    this.getNationalityList()
    this.isNameDisabled = true;
    this.hrId = ownerDetail.hrId;
    this.cidNo = ownerDetail.cidNo;
    // Map the owner details to the `owner` object to bind them to the form
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
  }
  onUpdateOwnerInformation() {
    const payload = {
      cidNo: this.owner.cidNo,
      oldCidNo:this.cidNo,
      contractorId: this.data.contractorId,
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
          this.getOwnershipDetails(this.data);
        }, 1000); 
      },
      (error: any) => { // Correct syntax for error handler
        this.showErrorMessage()
      }
    );
  }

  showUpdateMessage() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Owner information updated successfully' });
  }
}
