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

  constructor(@Inject(CommonService) private service: CommonService) { }

  ngOnInit(): void {

    const status = this.applicationStatus;

    if (status === 'Resubmitted OS') {
      this.activeTabId = 'office';
    } else if (status === 'Resubmitted PFS') {
      this.activeTabId = 'office';
    } else if (status === 'Resubmitted HR') {
      this.activeTabId = 'employee';
    } else if (status === 'Resubmitted EQ') {
      this.activeTabId = 'equipment';
    } else if (status === 'Resubmitted OS and PFS') {
      this.activeTabId = 'office';
    }
    
    const WorkDetail = this.service.getData('BctaNo');

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.consultantNo;

    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);

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
