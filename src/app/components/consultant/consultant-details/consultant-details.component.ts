import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-consultant-details",
  templateUrl: "./consultant-details.component.html",
  styleUrls: ["./consultant-details.component.scss"],
})
export class ConsultantDetailsComponent {
  selectedTab: string = "consultant-general-information";
  consultantGeneralInformationsData: any;
  consultantownerInformation: any;
  consultanthumanResourceData: any;
  consultantequipmentData: any;
  consultantworkClassificationData: any;
  consultanttrackRecordData: any;
  consultantcommentsAdverseRecordsData: any;
  paramData: any;
  title:any;
  status: any;
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    // Retrieve data from route state
    this.route.paramMap.subscribe((_params:any) => {
      const data = window.history.state.data;
      this.paramData = data; // Combining both data into paramData
      this.title = window.history.state.title;
      this.status= window.history.state.data.status
      if (data) {
        this.consultantGeneralInformationsData = data;
        
        if (this.selectedTab === "consultant-general-information") {
          this.consultantownerInformation = data;
        }if (data.tab === "consultant-owner-information") {
          this.consultantownerInformation = data;
        }
      } else if (data.tab === "consultant-human-resource") {
        this.consultanthumanResourceData = data;
      } else if (data.tab === "consultant-equipment") {
        this.consultantequipmentData = data;
      } else if (data.tab === "consultant-work-classification") {
        this.consultantworkClassificationData = data;
      } else if (data.tab === "consultant-track-record") {
        this.consultanttrackRecordData = data;
      } else if (data.tab === "consultant-comments-adverse-records") {
        this.consultantcommentsAdverseRecordsData = data;
      }
    });
  }
  //Changing the tab function
  selectTab(tabName: string) {
    this.selectedTab = tabName;
    if (tabName === "consultant-general-information") {
      this.consultantGeneralInformationsData = this.paramData;
      this.consultantownerInformation = this.paramData;
    } else if (tabName === "consultant-owner-information") {
      this.consultantownerInformation = this.paramData;
    } else if (tabName === "consultant-human-resource") {
      this.consultanthumanResourceData = this.paramData;
    } else if (tabName === "consultant-equipment") {
      this.consultantequipmentData = this.paramData;
    } else if (tabName === "consultant-work-classification") {
      this.consultantworkClassificationData = this.paramData;
    } else if (tabName === "consultant-track-record") {
      this.consultanttrackRecordData = this.paramData;
    } else if (tabName === "consultant-comments-adverse-records") {
      this.consultantcommentsAdverseRecordsData = this.paramData;
    }
  }
}
