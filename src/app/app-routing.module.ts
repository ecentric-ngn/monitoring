import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EditUserTrainingComponent } from './components/user-training/edit-user-training/edit-user-training.component';
import { AuthGuard } from './auth.guard';
import { AddAuditClearanceComponent } from './components/audit-clearance/add-audit-clearance/add-audit-clearance.component';
import { EditAuditClearanceComponent } from './components/audit-clearance/edit-audit-clearance/edit-audit-clearance.component';
import { ReviewReportListComponent } from './components/monitoring/reviewCommitteDashboard/review-report-list/review-report-list.component';
import { ApplicationDetailsComponent } from './components/monitoring/reviewCommitteDashboard/review-report-list/application-details/application-details.component';
import { ViewMonitoredSiteAppComponent } from './components/monitoring/view-monitored-site-app/view-monitored-site-app.component';
import { ViewSubmittedReportListComponent } from './components/monitoring/reviewCommitteDashboard/view-submitted-report-list/view-submitted-report-list.component';
import { OtherConstructionMonitoringComponent } from './components/monitoring/other-construction-monitoring/other-construction-monitoring.component';
import { OnsiteFacilitiesandManagementComponent } from './components/monitoring/onsite-facilitiesand-management/onsite-facilitiesand-management.component';
import { ViewRegCompliancelistComponent } from './components/monitoring/registractionCompliance/view-reg-compliancelist/view-reg-compliancelist.component';
import { ViewRegistrationComplianceDetailsComponent } from './components/monitoring/reviewCommitteDashboard/view-registration-compliance-details/view-registration-compliance-details.component';
@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                //canActivate: [AuthGuard],
                children: [
                    { path: '', component: DashboardComponent, pathMatch: 'full' },
                    { path: 'contractor', loadChildren: () => import('./components/contractor/contractor.module').then(m => m.ContractorModule) },
                    { path: 'consultant', loadChildren: () => import('./components/consultant/consultant.module').then(m => m.ConsultantModule) },
                    { path: 'architect', loadChildren: () => import('./components/architect/architect.module').then(m => m.ArchitectModule) },
                    { path: 'engineer', loadChildren: () => import('./components/engineer/engineer.module').then(m => m.EngineerModule) },
                    { path: 'specialized-firm', loadChildren: () => import('./components/specialized-firm/specialized-firm.module').then(m => m.SpecializedFirmModule) },
                    { path: 'specialized-trade', loadChildren: () => import('./components/specialized-trade/specialized-trade.module').then(m => m.SpecializedTradeModule) },
                    { path: 'surveyor', loadChildren: () => import('./components/surveyor/surveyor.module').then(m => m.SurveyorModule) },
                    { path: 'certified-builder', loadChildren: () => import('./components/certified-builder/certified-builder.module').then(m => m.CertifiedBuilderModule) },
                    { path: 'audit-clearance', loadChildren: () => import('./components/audit-clearance/audit-clearance.module').then(m => m.AuditClearanceModule) },
                    { path: 'monitoring', loadChildren: () => import('./components/monitoring/monitoring.module').then(m => m.MonitoringModule) },
                    { path: 'user-training', loadChildren: () => import('./components/user-training/user-training.module').then(m => m.UserTrainingModule) },
                    { path: 'edit-user-training', component: EditUserTrainingComponent },
                    { path: 'add-audit-clearance', component: AddAuditClearanceComponent },
                    { path: 'edit-audit-clearance', component: EditAuditClearanceComponent },
                    { path: 'viewApplication', component: ViewMonitoredSiteAppComponent },
                    { path: 'SubmittedReport', component: ViewSubmittedReportListComponent },
                    { path: 'regCompliance', component: ViewRegCompliancelistComponent },
                    { path: 'dashboard', component: DashboardComponent },
                    { path: 'report', component: ReviewReportListComponent },
                    { path: 'details', component: ApplicationDetailsComponent },
                    { path: 'viewRegComplianceDetails', component: ViewRegistrationComplianceDetailsComponent },
                    {path:'',component:OtherConstructionMonitoringComponent}
                ]
            },
            { path: '**', redirectTo: '/notfound' }, // Redirect any other route to NotFoundComponent
          
        ],  
        { 
            scrollPositionRestoration: 'enabled', 
            anchorScrolling: 'enabled', 
            onSameUrlNavigation: 'reload' 
        })
    ], 
    exports: [RouterModule]
})
export class AppRoutingModule { }
