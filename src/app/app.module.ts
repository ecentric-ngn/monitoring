import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { ContractorModule } from './components/contractor/contractor.module';
import { ConsultantModule } from './components/consultant/consultant.module';
import { ArchitectModule } from './components/architect/architect.module';
import { SpecializedFirmModule } from './components/specialized-firm/specialized-firm.module';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { CertifiedBuilderModule } from './components/certified-builder/certified-builder.module';
import { AuditClearanceModule } from './components/audit-clearance/audit-clearance.module';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { EditUserTrainingComponent } from './components/user-training/edit-user-training/edit-user-training.component';
import { AuditClearanceComponent } from './components/audit-clearance/audit-clearance.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { PocuringAgencyWorkListComponent } from './components/monitoring/pocuring-agency-work-list/pocuring-agency-work-list.component';
import { ReviewReportListComponent } from './components/monitoring/reviewCommitteDashboard/review-report-list/review-report-list.component';
import { ApplicationDetailsComponent } from './components/monitoring/reviewCommitteDashboard/review-report-list/application-details/application-details.component';
import { ViewMonitoredSiteAppComponent } from './components/monitoring/view-monitored-site-app/view-monitored-site-app.component';
import { ViewSubmittedReportListComponent } from './components/monitoring/reviewCommitteDashboard/view-submitted-report-list/view-submitted-report-list.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { MonitoringModule } from './components/monitoring/monitoring.module';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { OtherConstructionMonitoringComponent } from './components/monitoring/other-construction-monitoring/other-construction-monitoring.component';
import { ViewRegCompliancelistComponent } from './components/monitoring/registractionCompliance/view-reg-compliancelist/view-reg-compliancelist.component';
import { ConsultencyFirmDetailsComponent } from './components/monitoring/reviewCommitteDashboard/consultency-firm-details/consultency-firm-details.component';
import { SpecilizedFirmDetailsComponent } from './components/monitoring/reviewCommitteDashboard/specilized-firm-details/specilized-firm-details.component';

import { CertifiedFirmDetailsComponent } from './components/monitoring/reviewCommitteDashboard/certified-firm-details/certified-firm-details.component';
import { ViewConultencyDetailsComponent } from './components/monitoring/reviewCommitteDashboard/view-registration-compliance-details/view-conultency-details/view-conultency-details.component';
import { ViewSpecializeDetailsComponent } from './components/monitoring/reviewCommitteDashboard/view-registration-compliance-details/view-specialize-details/view-specialize-details.component';
import { ViewCertifiedDetailsComponent } from './components/monitoring/reviewCommitteDashboard/view-registration-compliance-details/view-certified-details/view-certified-details.component';

@NgModule({
  declarations: [
    AppComponent,
    EditUserTrainingComponent,
    AuditClearanceComponent,
    MonitoringComponent,
    PocuringAgencyWorkListComponent,
    ReviewReportListComponent,
    ApplicationDetailsComponent,
    ViewMonitoredSiteAppComponent,
    ViewSubmittedReportListComponent,
    OtherConstructionMonitoringComponent,
    ViewRegCompliancelistComponent,
  
    ConsultencyFirmDetailsComponent,
    SpecilizedFirmDetailsComponent,
    CertifiedFirmDetailsComponent,
    ViewConultencyDetailsComponent,
    ViewSpecializeDetailsComponent,
    ViewCertifiedDetailsComponent

  ],
  imports: [
    HttpClientModule,
    AppRoutingModule,
    AppLayoutModule,
    DashboardModule,
    ContractorModule,
    ConsultantModule,
    ArchitectModule,
    SpecializedFirmModule,
    CertifiedBuilderModule,
    AuditClearanceModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    RouterModule.forRoot([]), // Initialize with empty routes array
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MonitoringModule,
    NzPopconfirmModule
  ],
  providers: [
    MessageService,
  { provide: NZ_I18N, useValue: en_US }
    // Add other providers as needed
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
