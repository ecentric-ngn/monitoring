import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contractor-details',
  templateUrl: './contractor-details.component.html',
  styleUrls: ['./contractor-details.component.scss']
})
export class ContractorDetailsComponent {
  selectedTab: string = 'general-information';
  generalInformationData: any; 
  ownerInformationData: any; 
  humanResourceData: any;
  equipmentData: any;
  workClassificationData: any;
  trackRecordData: any;
  commentsAdverseRecordsData: any;
  paramData: any;
  title:any;
  status: any;
  constructor(private route: ActivatedRoute){}

  ngOnInit() {
    // Retrieve data from route state
    this.route.paramMap.subscribe((_params:any) => {
      const data = window.history.state.data;
      this.paramData = data; // Combining both data into paramData
      this.title = window.history.state.title;
      this.status= window.history.state.data.status
      if (data) {
        this.generalInformationData = data;
        // Set owner information data if the initial tab is general-information
        if (this.selectedTab === 'general-information') {
          this.ownerInformationData = data;
        }
        if (data.tab === 'owner-information') {
          this.ownerInformationData = data;
        } else if (data.tab === 'human-resource') {
          this.humanResourceData = data;
        } else if (data.tab === 'equipment') {
          this.equipmentData = data;
        } else if (data.tab === 'work-classification') {
          this.workClassificationData = data;
        } else if (data.tab === 'track-record') {
          this.trackRecordData = data;
        } else if (data.tab === 'comments-adverse-records') {
          this.commentsAdverseRecordsData = data;
        }
      }
    });
  }
  // Method to handle formSaved event from child component
  onFormSaved() {
    this.selectTab('comments-adverse-records');
  }
  // Changing the tab function
  selectTab(tabName: string) {
    this.selectedTab = tabName;
    // Pass data when changing tabs
    if (tabName === 'general-information') {
      this.generalInformationData = this.paramData;
      this.ownerInformationData = this.paramData; // Also show owner information
    } else if (tabName === 'owner-information') {
      this.ownerInformationData = this.paramData;
    } else if (tabName === 'human-resource') {
      this.humanResourceData = this.paramData;
    } else if (tabName === 'equipment') {
      this.equipmentData = this.paramData;
    } else if (tabName === 'work-classification') {
      this.workClassificationData = this.paramData;
    } else if (tabName === 'track-record') {
      this.trackRecordData = this.paramData;
    } else if (tabName === 'comments-adverse-records') {
      this.commentsAdverseRecordsData = this.paramData;
    }
  }
}
