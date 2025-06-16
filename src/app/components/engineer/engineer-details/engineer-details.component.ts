import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-engineer-details',
  templateUrl: './engineer-details.component.html',
  styleUrls: ['./engineer-details.component.scss']
})
export class EngineerDetailsComponent { 
  selectedTab: string = 'registration-information';
  registrationInformation: any; 
  employmentHistory:any;
  paramData: any;
  title:any
  engineerRecord:any
  workRecord:any
  isLoading: boolean = false;
  employmentHistoryLoaded: any;

  constructor(private route:ActivatedRoute) {}

  ngOnInit() {
    // Retrieve data from route state
    this.route.paramMap.subscribe(params => {
      const data = window.history.state.data;
      this.paramData = data; // Combining both data into paramData
      this.title = window.history.state.title;
      if (data) {
        this.registrationInformation = data;
        if (this.selectedTab === 'registration-information') {
          this.employmentHistory= data;
        } else if (data.tab === 'employment-history') {
          this.employmentHistory= data;
        } else if (data.tab === 'engineer-record') {
          this.engineerRecord= data;
        } else if (data.tab === 'work-history') {
          this.workRecord= data;
        }
      }
    });
  }

  //Changing the tab function
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
    // Pass data when changing tabs
    if (tabName === 'registration-information') {
      this.registrationInformation = this.paramData;
      this.employmentHistory = this.paramData
    } else if (tabName === 'employment-history'){
      this.employmentHistory = this.paramData
    }else if (tabName === 'engineer-record'){
      this.engineerRecord = this.paramData
    }else if (tabName === 'work-history'){
      this.workRecord = this.paramData
    }
  }
  }
  

