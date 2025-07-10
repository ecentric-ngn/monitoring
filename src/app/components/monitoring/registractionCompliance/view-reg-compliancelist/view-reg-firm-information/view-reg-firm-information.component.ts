import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';
import { es_ES } from 'ng-zorro-antd/i18n';

@Component({
  selector: 'app-view-reg-firm-information',
  templateUrl: './view-reg-firm-information.component.html',
  styleUrls: ['./view-reg-firm-information.component.scss']
})
export class ViewRegFirmInformationComponent implements OnInit {
  formData: any = {};
  bctaNo: any;
  applicationStatus: string = '';
  activeTabId: string = '';
WorkDetail: any = {};
licenseStatus: string = '';
  constructor(private service: CommonService) { }

ngOnInit(): void {
  const WorkDetail = this.service.getData('BctaNo');
  if (!WorkDetail || !WorkDetail.data) {
    console.error('WorkDetail or WorkDetail.data is undefined');
    return;
  }

  this.WorkDetail = WorkDetail.data;
  this.licenseStatus = WorkDetail.data.licenseStatus;
  this.applicationStatus = WorkDetail.data.applicationStatus;

  console.log("WorkDetail in view:", WorkDetail);
  console.log("application Status:", this.applicationStatus);
  console.log("licenseStatus:", this.licenseStatus);

  // Set activeTabId depending on applicationStatus
  const status = this.applicationStatus;
  if (this.licenseStatus === 'Suspended') {
    // Show all tabs enabled, so no change to activeTabId needed here
    this.activeTabId = this.activeTabId || 'office';  // default to office if undefined
  } else {
    // Existing logic when not suspended
    if (status === 'Resubmitted OS' || status === 'Resubmitted PFS' || status === 'Resubmitted OS and PFS') {
      this.activeTabId = 'office';
    } else if (status === 'Resubmitted HR') {
      this.activeTabId = 'employee';
    } else if (status === 'Resubmitted EQ') {
      this.activeTabId = 'equipment';
    }
  }

  this.formData.firmType = WorkDetail.data;
  this.bctaNo = WorkDetail.data.contractorNo;

  console.log('bctaNo', this.bctaNo);

  if (this.bctaNo) {
    this.fetchDataBasedOnBctaNo();
  }

  this.service.setBctaNo(this.bctaNo);
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
    if (this.type === 'employee') {
      this.activeTabId = 'employee';
    } else if (this.type === 'equipment') {
      this.activeTabId = 'equipment';
    } else if (this.type === 'monitoring') {
      this.activeTabId = 'monitoring';
    } else {
      this.activeTabId = 'office';
    }
  }

  specializedFirmForm() {
    this.id = this.id
    this.activeTabId = 'employee';
  }
  equipmentForm() {
    this.id = this.id
    this.activeTabId = 'equipment';
  }

  monitoringTeam() {
    this.id = this.id
    this.activeTabId = 'monitoring';
  }
}