import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-specialized-trade-details',
  templateUrl: './specialized-trade-details.component.html',
  styleUrls: ['./specialized-trade-details.component.scss']
})
export class SpecializedTradeDetailsComponent {
  selectedTab: string = 'registration-information';
  registrationInformation: any; 
  getEmployeeHistory:any;
  getCategoryInformation:any;
  specializedtraderecord:any;
  paramData: any;
  isLoading: boolean = false;
  employmentHistoryLoaded: any;
  title:any
  workRecord: any;
  constructor(private route:ActivatedRoute) {}

  ngOnInit() {
    // Retrieve data from route state
    this.route.paramMap.subscribe(params => {
      const data = window.history.state.data;
      this.paramData = data; // this.paramData is assigned the value of data
      this.title = window.history.state.title; // this.title is assigned the value of title
      if (data) {
        this.registrationInformation = data;
        if (this.selectedTab === 'registration-information') {
          this.getEmployeeHistory= data;
        } else if (data.tab === 'employment-history') {
          this.getEmployeeHistory= data;
        }else if (data.tab === 'specialized-trade-record') {
          this.specializedtraderecord= data;
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
      this.getEmployeeHistory = this.paramData
    } else if (tabName === 'employment-history'){
      this.getEmployeeHistory = this.paramData
    }else if (tabName === 'category-information'){
      this.getCategoryInformation = this.paramData
    }else if (tabName === 'specialized-trade-record'){
      this.specializedtraderecord = this.paramData
    }else if (tabName === 'work-history'){
      this.workRecord = this.paramData
    }

  }
  }

 
