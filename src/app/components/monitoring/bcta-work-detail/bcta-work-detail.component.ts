import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bcta-work-detail',
  templateUrl: './bcta-work-detail.component.html',
  styleUrls: ['./bcta-work-detail.component.scss']
})
export class BctaWorkDetailComponent {
  formData:any=[];
  data: any;
  pageSize: number = 10;
  pageNo:number = 1;
  bctaNo: any;
  @ViewChild('contractorDocTab', { static: false }) contractorDocTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('workProgressTab', { static: false }) workProgressTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('qualificationofSubcontractorsTab', { static: false }) qualificationofSubcontractorsTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('workTaskQuantityTab', { static: false }) workTaskQuantityTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('onsiteTab', { static: false }) onsiteTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('reinforcementTab', { static: false }) reinforcementTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('occupationalHealthAndSaftyTab', { static: false }) occupationalHealthAndSaftyTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('CertifiedSkilledWorkerTab', { static: false }) CertifiedSkilledWorkerTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('HumanResourceTab', { static: false }) HumanResourceTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('onSiteQualityCheckTab', { static: false }) onSiteQualityCheckTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('humanResourceTab', { static: false }) humanResourceTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('certifiedSkilledWorkerTab', { static: false }) certifiedSkilledWorkerTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('committedEquipmentTab', { static: false }) committedEquipmentTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('contractorPresentDuringSiteMonitoringTab', { static: false }) contractorPresentDuringSiteMonitoringTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('addingSiteEngineerTab', { static: false }) addingSiteEngineerTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('monitorTeamListsTab', { static: false }) monitorTeamListsTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('hrstrengthAtSiteTab', { static: false }) hrstrengthAtSiteTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('complianceTab', { static: false }) complianceTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('monitoringTab', { static: false }) monitoringTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('reviewSubmitTab', { static: false }) reviewSubmitTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('addworkinformationTab', { static: false }) addworkinformationTab!: ElementRef<HTMLButtonElement>;
  tableId: any;
  currentTableId: string;
  inspectionType: any;
  datas: any;
  workType: any;
  ownerId: any;
  prevTableId: string;
  workInformationdata: any;
  prevOwnerTableId: string;
  Previousdata: any;
  contractorPrevId: any;
  newContractorId: any;
  workId: any;
  applicationStatus: any;
  
constructor(private router: Router,private service:CommonService) {
 
}

ngOnInit() {
  const WorkDetail = this.service.getData('BctaNo');
  this.bctaNo = WorkDetail.data.BCTANo || WorkDetail.data.awardedBctaNo || WorkDetail.data.bctaregNumber || WorkDetail.data.awardedBctaNo || WorkDetail.data.other_bcta_no;
  this.workType = WorkDetail.workType;
  this.data = WorkDetail.data;
  this.tableId = WorkDetail.data.checklist_id || WorkDetail.checklistid;
  this.workId = WorkDetail.data.id || WorkDetail.data.workid;
  this.newContractorId = WorkDetail.newContractorId;
  this.ownerId = WorkDetail.data;
  
  this.applicationStatus = WorkDetail.data.applicationStatus;
  if (this.workType === 'OTHERS') {
    this.getContractorDetails();
    this.DisplayonWorkInformationForm();
    this.addworkinformationTab.nativeElement.click();
  } else {
    this.getList();

    // ✅ Only call getChecklistId if applicationStatus is not 'REJECTED'
    if (WorkDetail.data.applicationStatus !== 'REJECTED') {
      this.getChecklistId();
    }
  }
}


getContractorDetails() {
  const payload: any = [
    {
      field: 'id',
      value: this.newContractorId || null,
      operator: 'AND',
      condition: '=',
    },
  ];

  this.service.fetchDetails(payload,1,1,'contractor_view').subscribe(
    (response: any) => {
      this.formData = response.data[0];
      console.log('response', response);
    },
    (error) => {
    }
);
}
getChecklistId() {
  const payload: any = [
    {
      field: 'workid',
      value: this.workId,
      operator: 'AND',
      condition: '=',
    },
  ];

this.service.fetchDetails(payload, 1, 1, 'checklist_view').subscribe(
  (response: any) => {
    const data = response?.data?.[0];
    if (data) {
      // Show alert only if status is defined and not 'SUBMITTED'
      if (data.status && data.status !== 'SUBMITTED') {
        Swal.fire({
          icon: 'info',
          title: 'Application is under process',
          confirmButtonText: 'OK',
          allowOutsideClick: true,
          allowEscapeKey: true
        }).then((result) => {
          // Redirect on OK or outside click or ESC
          if (result.isConfirmed || result.isDismissed) {
            this.router.navigate(['viewApplication']);
          }
        });
        return; // Stop further execution if not submitted
      }

      // Continue if status is SUBMITTED or null
      this.tableId = data.id;
      console.log('response', response);
    }
  },
  (error) => {
    console.error('Error fetching checklist data', error);
  }
);

}
getList() {
  const contractor = {
      viewName: "contractor",
      pageSize: this.pageSize,
      pageNo: this.pageNo,
     condition:[
      {
       field: "contractorNo",
       value: this.bctaNo 
      }
     ]
  };
  this.service.viewData(contractor).subscribe(
    (response: any) => {
      this.formData = response.data[0];
      console.log('response', response);
    },
    (error) => {
    }
);
}
currentFormIndex = 0;
ownerData: any={}
goBackward(tableId:any) {
  if (this.showReviewSubmitForm) {
    this.showReviewSubmitForm = false;
    this.showMonitorForm = true;
    this.monitoringTab.nativeElement.click();
    this.monitoringTab.nativeElement.classList.add('active');
    this.reviewSubmitTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.showMonitorTeamListsForm();
  }else if (this.showMonitorForm) {
    this.showMonitorForm = false;
    this.showMonitorForm = true;
    this.addingSiteEngineerTab.nativeElement.click();
    this.addingSiteEngineerTab.nativeElement.classList.add('active');
    this.monitoringTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.DisplayAddingSiteEngineer();
  }else if (this.showAddingSiteEngineer) {
    this.showMonitorForm = false;
    this.showContractorPresentDuringSiteMonitoring = true;
    this.contractorPresentDuringSiteMonitoringTab.nativeElement.click();
    this.contractorPresentDuringSiteMonitoringTab.nativeElement.classList.add('active');
    this.addingSiteEngineerTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.DisplayContractorPresentDuringSiteMonitoring();
  }else if (this.showContractorPresentDuringSiteMonitoring) {
    this.showContractorPresentDuringSiteMonitoring = false;
    this.showHRStrengthAtSite = true;
    this.hrstrengthAtSiteTab.nativeElement.click();
    this.hrstrengthAtSiteTab.nativeElement.classList.add('active');
    this.contractorPresentDuringSiteMonitoringTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.DisplayHRStrengthAtSite();
  }
   else if (this.showHRStrengthAtSite) {
    this.showHRStrengthAtSite = false;
    this.showCommittedEquipment = true;
    this.committedEquipmentTab.nativeElement.click();
    this.committedEquipmentTab.nativeElement.classList.add('active');
    this.hrstrengthAtSiteTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.DisplayCommittedEquipment();
  } else if (this.showHRStrengthAtSite) {
    this.showHRStrengthAtSite = false;
    this.showHumanResourceForm = true;
    this.HumanResourceTab.nativeElement.click();
    this.hrstrengthAtSiteTab.nativeElement.classList.add('active');
    this.contractorPresentDuringSiteMonitoringTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.DisplayHumanResourceForm();
  } else if (this.showCommittedEquipment) {
    this.showCommittedEquipment = false;
    this.showCertifiedSkilledWorkerForm = true;
    this.certifiedSkilledWorkerTab.nativeElement.click();
    this.certifiedSkilledWorkerTab.nativeElement.classList.add('active');
    this.committedEquipmentTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.DisplayCertifiedSkilledWorkerForm();
  } else if (this.showCertifiedSkilledWorkerForm) {
    this.showCertifiedSkilledWorkerForm = false;
    this.showHumanResourceForm = true;
    this.humanResourceTab.nativeElement.classList.add('active');
    this.certifiedSkilledWorkerTab.nativeElement.classList.remove('active');
    this.humanResourceTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayHumanResourceForm();
  } else if (this.showOccupationalHealthAndSaftyForm) {
    this.showOccupationalHealthAndSaftyForm = false;
    this.reinforcementTab.nativeElement.classList.add('active');
    this.occupationalHealthAndSaftyTab.nativeElement.classList.remove('active');
    this.showReinforcementForm = true;
    this.reinforcementTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayReinforcementForm();
  }else if (this.showHumanResourceForm) {
    this.showOccupationalHealthAndSaftyForm = true;
    this.occupationalHealthAndSaftyTab.nativeElement.classList.add('active');
    this.humanResourceTab.nativeElement.classList.remove('active');
    this.showHumanResourceForm = false;
    this.occupationalHealthAndSaftyTab.nativeElement.click();
    this.prevTableId = tableId;
    
    this.DisplayOccupationalHealthAndSaftyForm();
  } else if (this.showReinforcementForm) {
    this.showReinforcementForm = false;
    this.showOnSiteQualityCheck = true;
    this.onSiteQualityCheckTab.nativeElement.classList.add('active');
    this.reinforcementTab.nativeElement.classList.remove('active');
    this.onSiteQualityCheckTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayOnSiteQualityCheck();
  } else if (this.showOnSiteQualityCheck) {
    this.showOnSiteQualityCheck = false;
    this.showWorkTaskQuantityForm = true;
     this.workTaskQuantityTab.nativeElement.classList.add('active');
    this.onSiteQualityCheckTab.nativeElement.classList.remove('active');
    this.workTaskQuantityTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayWorkTaskQuantityForm();
  } else if (this.showWorkTaskQuantityForm) {
    this.showWorkTaskQuantityForm = false;
    this.showQualificationForm = true;
     this.qualificationofSubcontractorsTab.nativeElement.classList.add('active');
    this.workTaskQuantityTab.nativeElement.classList.remove('active');
    this.qualificationofSubcontractorsTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayQualificationForm();
  } else if (this.showQualificationForm) {
    this.showQualificationForm = false;
    this.showWorkProgressForm = true;
    this.workProgressTab.nativeElement.classList.add('active');
    this.qualificationofSubcontractorsTab.nativeElement.classList.remove('active');
    this.workProgressTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayWorkProgressForm();
    
  } else if (this.showWorkProgressForm) {
    this.showWorkProgressForm = false;
    this.showContractorDocForm = true;
    this.highestCompletedStep = 1;
    this.contractorDocTab.nativeElement.classList.add('active');
    this.workProgressTab.nativeElement.classList.remove('active');
    this.contractorDocTab.nativeElement.click();
    this.prevTableId = tableId;
    this.DisplayContractorDocForm();
  } else if (this.showContractorDocForm) {
    this.showContractorDocForm = false;
    this.showonsiteForm = true;
    this.onsiteTab.nativeElement.click();
    this.highestCompletedStep = 0;
    this.onsiteTab.nativeElement.classList.add('active');
    this.contractorDocTab.nativeElement.classList.remove('active');
    this.prevTableId = tableId;
    this.Previousdata=this.data.applicationStatus;
    this.DisplayonsiteForm();
  } else if (this.showonsiteForm) {
    this.showonsiteForm = false;
    this.showonWorkInformationForm = true;
    this.prevOwnerTableId = tableId;
     this.ownerData =  this.workInformationdata
    console.log('prevOwnerTableId', this.prevOwnerTableId);
    this.addworkinformationTab.nativeElement.classList.add('active');
    this.onsiteTab.nativeElement.classList.remove('active');
    this.addworkinformationTab.nativeElement.click();
    this.DisplayonWorkInformationForm();
  } else if (this.showAddingSiteEngineer) {
    console.log("Already at the first step.");
  }
}

moveToStep(step: number): void {
  const tabMap: { [key: number]: ElementRef<HTMLButtonElement> } = {
    0: this.addworkinformationTab,
    1: this.onsiteTab,
    2: this.contractorDocTab,
    3: this.workProgressTab,
    4: this.qualificationofSubcontractorsTab,
    5: this.workTaskQuantityTab,
    6: this.onSiteQualityCheckTab,
    7: this.reinforcementTab,
    8: this.occupationalHealthAndSaftyTab,
    9: this.humanResourceTab,
    10: this.certifiedSkilledWorkerTab,
    11: this.committedEquipmentTab,
    12: this.hrstrengthAtSiteTab,
    13: this.contractorPresentDuringSiteMonitoringTab,
    14: this.addingSiteEngineerTab,
    15: this.monitoringTab,
    16: this.reviewSubmitTab
  };

  console.log('Requested to move to step:', step);

  const tabButton = tabMap[step];

  if (tabButton && tabButton.nativeElement) {
    console.log('Tab button found:', tabButton.nativeElement.id);
    tabButton.nativeElement.click();
    tabButton.nativeElement.scrollIntoView({ behavior: 'smooth', inline: 'center' }); // optional smooth scroll
    this.highestCompletedStep = step;
    console.log('Moved to step:', step, '| Tab:', tabButton.nativeElement.id);
  } else {
    console.warn('Tab button not found for step:', step);
  }
}



showonsiteForm:boolean=true;
DisplayonsiteForm(){
  this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.workId = this.workId;
   this.applicationStatus = this.applicationStatus;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null ;
  this.showonsiteForm=true;
  this.showonWorkInformationForm=false;
  this.showContractorDocForm=false;
  this.showWorkProgressForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showQualificationForm=false;
  this.showComplianceChecklist=false;
  this.showWorkTaskQuantityForm=false;
  this.showOnSiteQualityCheck=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showMonitorForm=false;
  this.showReviewSubmitForm=false;
  this.showHRStrengthAtSite=false;
  this.showCommittedEquipment=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
}
showContractorDocForm:boolean=false;
DisplayContractorDocForm(){
  this.prevTableId = this.tableId;

  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showonsiteForm=false;  
  this.data=this.data;
   this.workId = this.workId;
  this.showRecordOfMonitoringObservation=false;
    this.showonWorkInformationForm=false;
  this.showContractorDocForm=true;
  this.showComplianceChecklist=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;
  this.showWorkTaskQuantityForm=false;
  this.showOnSiteQualityCheck=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showHRStrengthAtSite=false;
  this.showMonitorForm=false;
  this.showCommittedEquipment=false;
    this.showReviewSubmitForm=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
}
showWorkProgressForm:boolean=false;
DisplayWorkProgressForm(){
  this.prevTableId = this.tableId;
   this.workId = this.workId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showWorkProgressForm=true;
  this.showonWorkInformationForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showQualificationForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showRecordOfMonitoringObservation=false;
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showComplianceChecklist=false;
  this.showWorkTaskQuantityForm=false;
  this.showOnSiteQualityCheck=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showHRStrengthAtSite=false;
  this.showCommittedEquipment=false;
  this.showAddingSiteEngineer=false;
    this.showReviewSubmitForm=false;
  this.showMonitorForm=false;
  this.showContractorPresentDuringSiteMonitoring=false;
}
showonWorkInformationForm:boolean=false;
DisplayonWorkInformationForm(){
  this.prevTableId = this.tableId;
   this.workId = this.workId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showonWorkInformationForm=true;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false; 
  this.showRecordOfMonitoringObservation=false; 
  this.showComplianceChecklist=false;
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showWorkTaskQuantityForm=false;
  this.showOnSiteQualityCheck=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
  this.showReviewSubmitForm=false;
  
}
showQualificationForm:boolean=false;
DisplayQualificationForm(){
  this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.workId = this.workId;

  this.showQualificationForm=true;
  this.showonWorkInformationForm=false;
  this.showWorkProgressForm=false; 
  this.showRecordOfMonitoringObservation=false; 
  this.showComplianceChecklist=false;
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showWorkTaskQuantityForm=false;
  this.showOnSiteQualityCheck=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
    this.showReviewSubmitForm=false;
 
}
showWorkTaskQuantityForm:boolean=false;
DisplayWorkTaskQuantityForm(){
  this.prevTableId = this.tableId;
   this.workId = this.workId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showonWorkInformationForm=false;
  this.showWorkTaskQuantityForm=true;
  this.showQualificationForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showRecordOfMonitoringObservation=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showComplianceChecklist=false;
  this.showContractorDocForm=false;
  this.showOnSiteQualityCheck=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
    this.showReviewSubmitForm=false;
}
showOnSiteQualityCheck:boolean=false;
DisplayOnSiteQualityCheck(){
  this.prevTableId = this.tableId;
   this.workId = this.workId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showonWorkInformationForm=false;
  this.showOnSiteQualityCheck=true;
  this.showComplianceChecklist=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showReinforcementForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
    this.showReviewSubmitForm=false;
 
}
showReinforcementForm:boolean=false;
DisplayReinforcementForm(){
  this.prevTableId = this.tableId;
    this.workId = this.workId;
    this.tableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
    this.showonWorkInformationForm=false;
  this.showReinforcementForm=true;
  this.showOnSiteQualityCheck=false;
  this.showRecordOfMonitoringObservation=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showComplianceChecklist=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showHumanResourceForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showMonitorForm=false;
   this.showReviewSubmitForm=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
}
showOccupationalHealthAndSaftyForm:boolean=false;
DisplayOccupationalHealthAndSaftyForm(){
  this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
    this.showonWorkInformationForm=false;
  this.showOccupationalHealthAndSaftyForm=true;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showRecordOfMonitoringObservation=false;
  this.showComplianceChecklist=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showHumanResourceForm=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
   this.showReviewSubmitForm=false;
  this.showMonitorForm=false;
 
}
showHumanResourceForm:boolean=false;
DisplayHumanResourceForm(){
  this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType || this.workType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showHumanResourceForm=true;
  this.workId = this.workId;
  this.showonWorkInformationForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showRecordOfMonitoringObservation=false;
  this.showOnSiteQualityCheck=false;
  this.showComplianceChecklist=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showCertifiedSkilledWorkerForm=false;
  this.showContractorDocForm=false;
  this.showCommittedEquipment=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
   this.showReviewSubmitForm=false;
 
}
showCertifiedSkilledWorkerForm:boolean=false;
DisplayCertifiedSkilledWorkerForm(){
  this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showCertifiedSkilledWorkerForm=true;
  this.showonWorkInformationForm=false;
  this.showHumanResourceForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showComplianceChecklist=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showCommittedEquipment=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showHRStrengthAtSite=false;
  this.showMonitorForm=false;
  this.showAddingSiteEngineer=false;
   this.showReviewSubmitForm=false;
}
showCommittedEquipment:boolean=false;
DisplayCommittedEquipment(){
    this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType || this.workType;;
  this.workId = this.workId;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
    this.showonWorkInformationForm=false;
  this.showCommittedEquipment=true;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showComplianceChecklist=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showHRStrengthAtSite=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
   this.showReviewSubmitForm=false;
  this.showMonitorForm=false;
 
}
showHRStrengthAtSite:boolean=false;
DisplayHRStrengthAtSite(){
    this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType || this.workType;;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
    this.showonWorkInformationForm=false;
    this.workId = this.workId;
  this.showHRStrengthAtSite=true;
  this.showComplianceChecklist=false;
  this.showCommittedEquipment=false;
  this.showRecordOfMonitoringObservation=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
  this.showReviewSubmitForm=false;
}
showContractorPresentDuringSiteMonitoring:boolean=false;
DisplayContractorPresentDuringSiteMonitoring(){
    this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.workId = this.workId;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showContractorPresentDuringSiteMonitoring=true;
    this.showonWorkInformationForm=false;
  this.showHRStrengthAtSite=false;
  this.showCommittedEquipment=false;
  this.showRecordOfMonitoringObservation=false;
  this.showComplianceChecklist=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
   this.showReviewSubmitForm=false;
  this.showContractorDocForm=false;
  this.showAddingSiteEngineer=false;
  this.showMonitorForm=false;
 
}
showAddingSiteEngineer:boolean=false;
DisplayAddingSiteEngineer(){
    this.prevTableId = this.tableId;
    this.workId = this.workId;
  this.inspectionType = this.inspectionType || this.workType;;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showRecordOfMonitoringObservation=false;
    this.showonWorkInformationForm=false;
  this.showAddingSiteEngineer=true;
  this.showComplianceChecklist=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showHRStrengthAtSite=false;
  this.showCommittedEquipment=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showMonitorForm=false;
  this.showContractorDocForm=false;
   this.showReviewSubmitForm=false;
}
showMonitorForm:boolean
showMonitorTeamListsForm(){
  this.prevTableId = this.tableId;
  this.workId = this.workId;
  this.inspectionType = this.inspectionType || this.workType;;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showMonitorForm=true;
    this.showonWorkInformationForm=false;
  this.showRecordOfMonitoringObservation=false;
  this.showComplianceChecklist=false;
  this.showAddingSiteEngineer=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showHRStrengthAtSite=false;
  this.showCommittedEquipment=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
   this.showReviewSubmitForm=false;
}
showComplianceChecklist:boolean=false;
showRecordOfMonitoringObservation:boolean=false;
showReviewSubmitForm:boolean=false;
DisplayReviewSubmitForm(){
    this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType || this.workType;;
   this.workId = this.workId;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.showComplianceChecklist=false;
  this.showReviewSubmitForm=true
  this.showRecordOfMonitoringObservation=false;
  this.showMonitorForm=false;
  this.showAddingSiteEngineer=false;
  this.showContractorPresentDuringSiteMonitoring=false;
  this.showHRStrengthAtSite=false;
  this.showCommittedEquipment=false;
  this.showCertifiedSkilledWorkerForm=false;
  this.showHumanResourceForm=false;
  this.showOccupationalHealthAndSaftyForm=false;
  this.showReinforcementForm=false;
  this.showOnSiteQualityCheck=false;
  this.showWorkTaskQuantityForm=false;
  this.showQualificationForm=false;
  this.showWorkProgressForm=false;  
  this.showonsiteForm=false;  
  this.showContractorDocForm=false;
}
highestCompletedStep: number = 0;
contractorDocTabEnabled: boolean = false;
onSiteCheckTabEnabled:boolean=false
saveOwnerInformationData(event: { workType: any,ownerId: any ,data:any}) {
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 0);
    this.moveToStep(0);
    this.workId = this.workId 
  this.showonsiteForm = true;
  this.showonWorkInformationForm = false;
  this.onSiteCheckTabEnabled=true
  this.workType = event.workType;	
  this.workInformationdata = event.data.data;
   this.contractorPrevId = event.data.contractorId;
   this.workId = event.data.contractorId;
  this.ownerId = event.ownerId;	
  // Access the native element safely and click it
  setTimeout(() => {
    this.onsiteTab.nativeElement.click();
  });
  
}
qualificationofSubcontractorsTabEnabled: boolean = false;
workTaskQuantityTabEnabled: boolean = false;
onSiteQualityCheckTabEnabled: boolean = false;
reinforcementTabEnabled: boolean = false;
occupationalHealthAndSaftyTabEnabled: boolean = false;

 onDataSaved(event: { tableId: any, data: any,inspectionType:any }) {
    this.moveToStep(1);
    this.workId = this.workId
    this.highestCompletedStep = Math.max(this.highestCompletedStep, 1);
    this.tableId = event.tableId;
    this.data = event.data;
    this.inspectionType = event.inspectionType;
    this.showContractorDocForm = true;
    this.contractorDocTabEnabled = true;
    // Access the native element safely and click it
    setTimeout(() => {
      this.contractorDocTab.nativeElement.click();
    });
  }
workProgressTabEnabled: boolean = false;
onContractorDocSaved(event: { tableId: any, data: any,inspectionType:any}) {
    this.moveToStep(2);
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 2);
  this.tableId = event.tableId;
  this.data = event.data;
  this.workId = this.workId 
  this.inspectionType = event.inspectionType;
  this.showWorkProgressForm = true;
  this.workProgressTabEnabled = true;
  // Access the native element safely and click it
    setTimeout(() => {
      this.workProgressTab.nativeElement.click();
    });
  }

SavedWorkProgressData(event: { tableId: any, data: any, inspectionType: any }) {
    this.moveToStep(3);
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 3);
  this.tableId = event.tableId;
  this.data = event.data;
  this.workId = this.workId 
  this.inspectionType = event.inspectionType;
  this.showWorkProgressForm = false;
  this.showQualificationForm = true;
  this.qualificationofSubcontractorsTabEnabled = true;

  setTimeout(() => {
    this.qualificationofSubcontractorsTab?.nativeElement.click();
  });
}

SavedQualificationData(event: { tableId: any, data: any, inspectionType: any }) {
  this.moveToStep(4);
  this.workId = this.workId 
  
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 4);
  this.tableId = event.tableId;
  this.data = event.data;
  this.inspectionType = event.inspectionType;
  this.showQualificationForm = false;
  this.showWorkTaskQuantityForm = true;
  this.workTaskQuantityTabEnabled = true;

  setTimeout(() => {
    this.workTaskQuantityTab?.nativeElement.click();
  });
}

SavedWorkTaskQuantityData(event: { tableId: any, data: any, inspectionType: any }) {
   this.moveToStep(5);
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 5);
  this.tableId = event.tableId;
  this.data = event.data;
  this.workId = this.workId 
  this.inspectionType = event.inspectionType;
  this.showOnSiteQualityCheck = true;
  this.onSiteQualityCheckTabEnabled = true;

  setTimeout(() => {
    this.onSiteQualityCheckTab?.nativeElement.click();
  });
}

SavedOnSiteQualityCheckData(event: { tableId: any, data: any, inspectionType: any }) {
  this.moveToStep(6);
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 6);
  this.tableId = event.tableId;
  this.data = event.data;
  this.workId = this.workId 
  this.inspectionType = event.inspectionType;
  this.showReinforcementForm = true;
  this.reinforcementTabEnabled = true;

  setTimeout(() => {
    this.reinforcementTab?.nativeElement.click();
  });
}

SavedReinforcementData(event: { tableId: any, data: any, inspectionType: any }) {
  this.moveToStep(7);
  this.workId = this.workId 
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 7);
  this.tableId = event.tableId;
  this.data = event.data;
  this.inspectionType = event.inspectionType;
  this.showOccupationalHealthAndSaftyForm = true;
  this.occupationalHealthAndSaftyTabEnabled = true;

  setTimeout(() => {
    this.occupationalHealthAndSaftyTab?.nativeElement.click();
  });
}

humanResourceTabEnabled: boolean = false;
SavedOccupationalHealthAndSaftyData(event: { tableId: any, data: any,inspectionType:any }) {
   this.moveToStep(8);
   this.workId = this.workId 
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 8);
  this.tableId = event.tableId;
  this.data = event.data;
  this.inspectionType = event.inspectionType;
  this.showOccupationalHealthAndSaftyForm = false;
  this.humanResourceTabEnabled = true;
  this.showHumanResourceForm = true;
  setTimeout(() => {
      this.humanResourceTab.nativeElement.click();
    });

}
certifiedSkilledWorkerTabEnabled: boolean = false;
saveHumanResourceContractData(event: { tableId: any, data: any,inspectionType:any }) {
   this.moveToStep(9);
   this.workId = this.workId 
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 9);
  this.tableId = event.tableId;
  this.data = event.data;
  this.inspectionType = event.inspectionType;
  this.showHumanResourceForm = false;
  this.showCertifiedSkilledWorkerForm = true;
  this.certifiedSkilledWorkerTabEnabled = true;
  setTimeout(() => {
      this.certifiedSkilledWorkerTab.nativeElement.click();
    });

}
committedEquipmentTabEnabled: boolean = false;
savedCertifiedSkilledWorkerData(event: { tableId: any, data: any,inspectionType:any }) {
   this.moveToStep(10);
   this.workId = this.workId 
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 10);
  this.tableId = event.tableId;
  this.inspectionType = event.inspectionType;
  this.data = event.data;
  this.showCommittedEquipment = true;
  this.committedEquipmentTabEnabled = true;
  setTimeout(() => {
      this.committedEquipmentTab.nativeElement.click();
    });

}
hrstrengthAtSiteTabEnabled: boolean = false;	
saveCommittedEquipmentData(event: { tableId: any, data: any,inspectionType:any }) {
   this.moveToStep(11);
   this.workId = this.workId 
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 11);
 this.tableId = event.tableId;
  this.data = event.data;
  this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.inspectionType = event.inspectionType;
  this.showHRStrengthAtSite = true;
  this.hrstrengthAtSiteTabEnabled = true;
  setTimeout(() => {
      this.hrstrengthAtSiteTab.nativeElement.click();
    });

}
contractorPresentDuringSiteMonitoringTabEnabled: boolean = false;
humanResourcestrengthsitedata(event: { tableId: any, data: any,inspectionType:any }) {
   this.moveToStep(12);
  this.tableId = event.tableId;
  this.data = event.data;
  this.workId = this.workId 
   this.prevTableId = this.tableId;
  this.inspectionType = this.inspectionType;
  this.prevOwnerTableId = this.prevOwnerTableId ?? null;
  this.inspectionType = event.inspectionType;
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 12);
  this.showHRStrengthAtSite = false
  this.showContractorPresentDuringSiteMonitoring = true;
  this.contractorPresentDuringSiteMonitoringTabEnabled = true;
  setTimeout(() => {
      this.contractorPresentDuringSiteMonitoringTab.nativeElement.click();
    });
  }
addingSiteEngineerTabEnabled: boolean = false;
contractorPresentData(event: { tableId: any, data: any}) {
   this.moveToStep(13);
   this.workId = this.workId 
   this.tableId = event.tableId;
  this.data = event.data;
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 13);
  this.showAddingSiteEngineer = true;
  this.addingSiteEngineerTabEnabled = true;
  setTimeout(() => {
      this.addingSiteEngineerTab.nativeElement.click();
    });

}
monitoringTabEnabled: boolean = false;
siteEngineersData( event: { tableId: any, data: any}) {
   this.moveToStep(15);
   this.workId = this.workId 
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 15);
  this.tableId = event.tableId;
  this.data = event.data;
  this.showMonitorForm = true;
  this.monitoringTabEnabled = true;
    this.showAddingSiteEngineer = false
  this.monitoringTab.nativeElement.click();
}
reviewSubmitTabEnabled: boolean = false;
monitoringData( tableId:any) {
this.workId = this.workId 
   this.moveToStep(14);
  this.highestCompletedStep = Math.max(this.highestCompletedStep, 14);
  this.tableId = tableId
  this.showReviewSubmitForm = true;
  this.reviewSubmitTabEnabled = true;
  setTimeout(() => {
      this.reviewSubmitTab.nativeElement.click();
    });

}

}
