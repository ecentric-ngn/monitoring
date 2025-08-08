import { Component, Inject } from '@angular/core';
import { CommonService } from '../../../../../../../service/common.service';

@Component({
  selector: 'app-certified-builders-info',
  templateUrl: './certified-builders-info.component.html',
  styleUrls: ['./certified-builders-info.component.scss']
})
export class CertifiedBuildersInfoComponent {
formData: any = {};
  bctaNo: any;
  applicationStatus: string = '';
  activeTabId: string = '';
  licenseStatus: any;
  data: any = {};
  appNo: any;
  formTPN: any;
  constructor(@Inject(CommonService) private service: CommonService) { }

ngOnInit(): void {
  const WorkDetail = this.service.getData('BctaNo');

  if (!WorkDetail || !WorkDetail.data) {
    return;
  }

  this.licenseStatus = WorkDetail.data.licenseStatus;
  this.applicationStatus = WorkDetail.data.applicationStatus;
  this.formData.firmType = WorkDetail.data;
   this.formTPN = WorkDetail.data.tpnNumber;
  this.bctaNo = WorkDetail.data.certifiedBuilderNo;
  this.appNo = WorkDetail.data.appNo;

  // Set default active tab based on status
  if (this.applicationStatus === 'Resubmitted OS and PFS') {
    this.activeTabId = 'cbOffice';
  } else if (this.applicationStatus === 'Resubmitted HR and EQ') {
    this.activeTabId = 'cbEmployee';
  } else {
    this.activeTabId = 'cbOffice'; // default tab
  }

  if (this.bctaNo && this.appNo) {
    this.fetchDataBasedOnBctaNo();
  }
}
isTabEnabled(tabId: string): boolean {
  const status = this.applicationStatus;

  if (status === 'Submitted' || status === 'Suspension Resubmission' || status === 'Rejected') {
    return true; // Enable all tabs
  }

  if (status === 'Resubmitted OS and PFS') {
    return tabId === 'cbOffice';
  }

  if (status === 'Resubmitted HR and EQ') {
    return tabId === 'cbEmployee' || tabId === 'cbEquipment';
  }

  return false; // Disable by default
}


  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNos(this.bctaNo,this.appNo).subscribe((res: any) => {
      this.formData = res.complianceEntities[0];
      console.log('this.formData', this.formData);
    })
  }
  /**
   * Set the active tab id when a tab is activated
   * @param {string} tabId - The id of the tab to activate
   */
  setActiveTab(tabId: string): void {
    this.activeTabId = tabId;
  }

  type: string = '';
  id: string = '';
  onActivateTab(event: { id: string, data: string, tab: string }) {
    this.type = event.tab;
    this.id = event.id

    console.log('id', this.id);
    if (this.type === 'cbEmployee') {
      this.activeTabId = 'cbEmployee';
      this.data = event.data
    } else if (this.type === 'cbEquipment') {
      this.activeTabId = 'cbEquipment';
         this.data = event.data
    } else if (this.type === 'cbMonitoring') {
      this.activeTabId = 'cbMonitoring';
         this.data = event.data
    } else {
      this.activeTabId = 'cbOffice';
    }
  }

  specializedFirmForm() {
    this.id = this.id
    this.data=this.data
    this.activeTabId = 'cbEmployee';
  }
  equipmentForm() {
    this.id = this.id
    this.data=this.data
    this.activeTabId = 'cbEquipment';
  }

  monitoringTeam() {
    this.id = this.id
       this.data=this.data
    this.activeTabId = 'cbMonitoring';
  }
}

