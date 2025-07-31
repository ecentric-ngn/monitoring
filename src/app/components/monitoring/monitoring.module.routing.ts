import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MonitoringComponent } from './monitoring.component';
import { BctaWorkDetailComponent } from './bcta-work-detail/bcta-work-detail.component';
import { OtherConstructionMonitoringComponent } from './other-construction-monitoring/other-construction-monitoring.component';
import { ViewSubmittedReportListComponent } from './reviewCommitteDashboard/view-submitted-report-list/view-submitted-report-list.component';
import { ViewMonitoredSiteAppComponent } from './view-monitored-site-app/view-monitored-site-app.component';
import { ViewRegFirmInformationComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/view-reg-firm-information.component';
import { PermanentEmployeeComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/permanent-employee/permanent-employee.component';
import { MandatoryEquipmentComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/mandatory-equipment/mandatory-equipment.component';
import { ConsultencyFirmDetailsComponent } from './reviewCommitteDashboard/consultency-firm-details/consultency-firm-details.component';
import { SpecilizedFirmDetailsComponent } from './reviewCommitteDashboard/specilized-firm-details/specilized-firm-details.component';
import { CertifiedFirmDetailsComponent } from './reviewCommitteDashboard/certified-firm-details/certified-firm-details.component';
import { ViewRegCompliancelistComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-compliancelist.component';
import { ViewRegistrationComplianceDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-registration-compliance-details.component';
import { ConsultancyInformationComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/consultancy-information.component';
import { CertifiedBuildersInfoComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/certified-builders-info.component';
import { SpecializedFirmsInfoComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms-info/specialized-firms-info.component';
import { ConsultancyFirmComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-firm.component';
import { SpecializedFirmsComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms.component';
import { CertifiedBuildersComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders.component';
import { ViewAppDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-downgrade-request-app-no/view-app-details/view-app-details.component';
import { ViewSuspendAppDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-suspend-request-app-no/view-suspend-app-details/view-suspend-app-details.component';
import { ViewCancelAppDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-cancel-request-app-no/view-cancel-app-details/view-cancel-app-details.component';
import { ViewActiveAppDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-active-app-details/view-active-app-details.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: MonitoringComponent },
        { path: 'WorkDetail', component: BctaWorkDetailComponent },
        { path: 'OtherConstruction	', component: OtherConstructionMonitoringComponent },
        { path: 'view-Monitored-App', component: ViewMonitoredSiteAppComponent },
        { path: 'RegFirmInformation', component: ViewRegFirmInformationComponent },
        { path: 'contractor-firm', component:ViewRegistrationComplianceDetailsComponent},
        { path: 'consultancy-firm', component: ConsultencyFirmDetailsComponent },
        { path: 'specialized-firm', component: SpecilizedFirmDetailsComponent },
        { path: 'certified-builders', component: CertifiedFirmDetailsComponent },
         { path: 'consultancy-information', component: ConsultancyInformationComponent},
        { path: 'cb-info', component: CertifiedBuildersInfoComponent},
        { path: 'sf-info', component: SpecializedFirmsInfoComponent},
        { path: 'viewDetails', component: ViewAppDetailsComponent},
        { path: 'viewSuspendDetails', component: ViewSuspendAppDetailsComponent},
        { path: 'viewCancelDetails', component: ViewCancelAppDetailsComponent},
        { path: 'viewActiveDetails', component: ViewActiveAppDetailsComponent},
        {
            path: 'construction',
            component: ViewRegCompliancelistComponent
        },
        {
            path: 'consultancy',
            component: ConsultancyFirmComponent
        },
        {
            path: 'specialized',
            component: SpecializedFirmsComponent
        },
        {
            path: 'certified',
            component: CertifiedBuildersComponent
        }




    ])],
    exports: [RouterModule]
})
export class MonitoringRoutingModule { }
