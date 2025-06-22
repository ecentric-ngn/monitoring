import { Component, Inject } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';

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

  constructor(@Inject(CommonService) private service: CommonService) { }

  ngOnInit(): void {
    const WorkDetail = this.service.getData('BctaNo');

    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }

    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.specializedFirmNo;

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
 