import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-certified-builder-details',
  templateUrl: './certified-builder-details.component.html',
  styleUrls: ['./certified-builder-details.component.scss']
})
export class CertifiedBuilderDetailsComponent {
  selectedTab: string = 'general-information';
  generalInformationData: any; 
  ownerInformationData: any; 
  humanResourceData: any;
  equipmentData: any;
  workClassificationData: any;
  trackRecordData: any;
  commentsAdverseRecordsData: any;
  paramData:any;
  title:any;
  status: any;
  constructor(private route: ActivatedRoute){}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const data = window.history.state.data;
      this.paramData = data;
      this.title = window.history.state.title; 
      this.status= window.history.state.data.status
      if (data) {
        this.generalInformationData = data;
        if (this.selectedTab === 'general-information') {
          this.ownerInformationData = data;
          //this.generalInformationData = viewName;
        } if (data.tab === 'owner-information') {
          this.ownerInformationData = data;
        }
        else if (data.tab === 'human-resource') {
          this.humanResourceData = data;
        }
        else if (data.tab === 'equipment') {
          this.equipmentData = data;
        }
        else if (data.tab === 'work-classification') {
          this.workClassificationData = data;
        }
        else if (data.tab === 'track-record') {
          this.trackRecordData = data;
        }
        else if (data.tab === 'comments-adverse-records') {
          this.commentsAdverseRecordsData = data;
        }
      }
    });
  }

  //Changing the tab function
  selectTab(tabName: string) {
    this.selectedTab = tabName;
    // Pass data when changing tabs

    if (tabName === 'general-information') {
      this.generalInformationData = this.paramData
      this.ownerInformationData = this.paramData
    } else if (tabName === 'owner-information') {
      this.ownerInformationData = this.paramData
    } else if (tabName === 'human-resource') {
      this.humanResourceData = this.paramData
    } else if (tabName === 'equipment') {
      this.equipmentData = this.paramData
    } else if (tabName === 'work-classification') {
      this.workClassificationData = this.paramData
    } else if (tabName === 'track-record') {
      this.trackRecordData = this.paramData
    } else if (tabName === 'comments-adverse-records'){
      this.commentsAdverseRecordsData = this.paramData
    }
  }
}
