import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-architect-detail',
  templateUrl: './architect-detail.component.html',
  styleUrls: ['./architect-detail.component.scss']
})
export class ArchitectDetailComponent {
  selectedTab: string = 'registration-information';
  registrationInformation: any; 
  employmentHistory:any;
  architectRecord:any;
  paramData: any;
  title:any
  workRecord: any;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const data = window.history.state.data;
      this.paramData = data; 
      this.title = window.history.state.title;
      if (data) {
        this.registrationInformation = data;
        if (this.selectedTab === 'registration-information') {
          this.employmentHistory= data;
        } else if (data.tab === 'employment-history') {
          this.employmentHistory= data;
        } else if (data.tab === 'architect-record') {
          this.architectRecord= data;
        } else if (data.tab === 'work-history') {
          this.workRecord= data;
        }
      }
    });
  }
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
    // Pass data when changing tabs
    if (tabName === 'registration-information') {
      this.registrationInformation = this.paramData;
      this.employmentHistory = this.paramData
      console.log(this.registrationInformation)
    } else if (tabName === 'employment-history'){
      this.employmentHistory = this.paramData
    }else if (tabName === 'architect-record'){
      this.architectRecord = this.paramData
    }else if (tabName === 'work-history'){
      this.workRecord = this.paramData
    }

  }
}
