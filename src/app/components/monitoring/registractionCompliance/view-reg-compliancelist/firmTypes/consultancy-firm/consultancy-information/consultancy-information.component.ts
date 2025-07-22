import { Component, OnInit, Inject } from '@angular/core';
import { CommonService } from '../../../../../../../service/common.service';

@Component({
  selector: 'app-consultancy-information',
  templateUrl: './consultancy-information.component.html',
  styleUrls: ['./consultancy-information.component.scss']
})
export class ConsultancyInformationComponent implements OnInit {
  formData: any = {};
  bctaNo: any;
  applicationStatus: string = '';
  activeTabId: string = '';
WorkDetail: any={};
licenseStatus: string = '';
  constructor( private service: CommonService) { }

ngOnInit() {
  const WorkDetail = this.service.getData('BctaNo');
  if (!WorkDetail || !WorkDetail.data) {
    console.error('WorkDetail or WorkDetail.data is undefined');
    return;
  }
  this.WorkDetail = WorkDetail;
  this.licenseStatus = WorkDetail.data.licenseStatus;
  this.applicationStatus = WorkDetail.data.applicationStatus;
  this.formData.firmType = WorkDetail.data;
  this.bctaNo = WorkDetail.data.consultantNo;
  // Set activeTabId based on applicationStatus only if license is not suspended
  if (this.licenseStatus !== 'Suspended') {
    const status = this.applicationStatus;
    if (status === 'Resubmitted OS and PFS') {
      this.activeTabId = 'consultancyOffice';
    } else if (status === 'Resubmitted HR and EQ') {
      this.activeTabId = 'consultancyEmployee';
    } else if (status === 'Resubmitted HR and EQ') {
      this.activeTabId = 'consultancyEquipment';
    } else {
       //this.activeTabId = 'consultancyOffice';  // default tab
    }
  } else {
    // licenseStatus is 'Suspended', default active tab
    this.activeTabId = '';
  }

  if (this.bctaNo) {
    this.fetchDataBasedOnBctaNo();
  }
}


  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
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
  onActivateTab(event: { id: string, tab: string }) {
    this.type = event.tab;
    this.id = event.id

    console.log('id', this.id);
    if (this.type === 'consultancyEmployee') {
      this.activeTabId = 'consultancyEmployee';
    } else if (this.type === 'consultancyEquipment') {
      this.activeTabId = 'consultancyEquipment';
    } else if (this.type === 'consultancyMonitoring') {
      this.activeTabId = 'consultancyMonitoring';
    } else {
      this.activeTabId = 'consultancyOffice';
    }
  }

  specializedFirmForm() {
    this.id = this.id
    this.activeTabId = 'consultancyEmployee';
  }
  equipmentForm() {
    this.id = this.id
    this.activeTabId = 'consultancyEquipment';
  }

  monitoringTeam() {
    this.id = this.id
    this.activeTabId = 'consultancyMonitoring';
  }
}
