import { Component, Inject } from '@angular/core';
import { CommonService } from '../../../../../../../service/common.service';

@Component({
  selector: 'app-specialized-firms-info',
  templateUrl: './specialized-firms-info.component.html',
  styleUrls: ['./specialized-firms-info.component.scss']
})
export class SpecializedFirmsInfoComponent {
  formData: any = {};
  bctaNo: any;
  applicationStatus: string = '';
  activeTabId: string = 'sfemployee';
  licenseStatus: any;
  appNo: any;
  formTPN: any;

  constructor(private service: CommonService) { }

  ngOnInit(): void {
    const WorkDetail = this.service.getData('BctaNo');
    this.licenseStatus = WorkDetail.data.licenseStatus;
    if (!WorkDetail || !WorkDetail.data) {
      return;
    }
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.formData.firmType = WorkDetail.data;
     this.formTPN = WorkDetail.data.tpnNumber;
    this.bctaNo = WorkDetail.data.specializedFirmNo;
    this.appNo = WorkDetail.data.appNo;

    if (this.bctaNo && this.appNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNos(this.bctaNo,this.appNo).subscribe((res: any) => {
      this.formData = res.complianceEntities[0];
      // Set firm info in the service
      this.service.setFirmInfo({
        firmName: this.formData.firmName,
        mobileNo: this.formData.mobileNo,
        email: this.formData.emailAddress
      });
    });
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
    if (this.type === 'sfmonitoring') {
      this.activeTabId = 'sfmonitoring';
    } else {
      this.activeTabId = 'sfemployee'; // Default to employee tab if no match
    }
  }
  specializedFirmForm() {
    this.id = this.id
    this.activeTabId = 'sfemployee';
  }
  monitoringTeam() {
    this.id = this.id
    this.activeTabId = 'sfmonitoring';
  }
}
