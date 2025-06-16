import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyorService } from '../../../service/surveyor.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-surveyor-details',
  templateUrl: './surveyor-details.component.html',
  styleUrls: ['./surveyor-details.component.scss']
})
export class SurveyorDetailsComponent implements OnInit {
  selectedTab: string = 'registration-information';
  registrationInformation: any; 
  employmentHistory:any;
  paramData: any;
  title:any
  surveyorRecord:any
  isLoading: boolean = false;
  employmentHistoryLoaded: any;
  workRecord: any;

  constructor(private route:ActivatedRoute) {}

  ngOnInit() {
    // Retrieve data from route state
    this.route.paramMap.subscribe(params => {
      console.log(window.history.state)
      const data = window.history.state.data;
      this.paramData = data; // Combining both data into paramData
      this.title = window.history.state.title;
      if (data) {
        this.registrationInformation = data;
        if (this.selectedTab === 'registration-information') {
          this.employmentHistory= data;
        } else if (data.tab === 'employment-history') {
          this.employmentHistory= data;
        } else if (data.tab === 'surveyor-record') {
          this.surveyorRecord= data;
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
    }else if (tabName === 'surveyor-record'){
      this.surveyorRecord = this.paramData
    }else if (tabName === 'work-history'){
      this.workRecord = this.paramData
    }
  }
  }
  

