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
import { ViewRegDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-reg-details/view-reg-details.component';
import { ConsultencyFirmDetailsComponent } from './reviewCommitteDashboard/consultency-firm-details/consultency-firm-details.component';
import { SpecilizedFirmDetailsComponent } from './reviewCommitteDashboard/specilized-firm-details/specilized-firm-details.component';
import { CertifiedFirmDetailsComponent } from './reviewCommitteDashboard/certified-firm-details/certified-firm-details.component';
import { ViewRegCompliancelistComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-compliancelist.component';
import { ViewRegistrationComplianceDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-registration-compliance-details.component';
import { ViewConultencyDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-conultency-details/view-conultency-details.component';
import { ViewSpecializeDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-specialize-details/view-specialize-details.component';
import { ViewCertifiedDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-certified-details/view-certified-details.component';
import { ConsultancyInformationComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/consultancy-information.component';
import { CertifiedBuildersInfoComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/certified-builders-info.component';
import { SpecializedFirmsInfoComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms-info/specialized-firms-info.component';
import { ConsultancyFirmComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-firm.component';
import { SpecializedFirmsComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms.component';
import { CertifiedBuildersComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: MonitoringComponent },
        { path: 'WorkDetail', component: BctaWorkDetailComponent },
        { path: 'OtherConstruction	', component: OtherConstructionMonitoringComponent },
        { path: 'view-Monitored-App', component: ViewMonitoredSiteAppComponent },
        { path: 'RegFirmInformation', component: ViewRegFirmInformationComponent },
        { path: 'ViewRegDetails', component: ViewRegDetailsComponent },
        { path: 'contractor-firm', component:ViewRegistrationComplianceDetailsComponent},
        { path: 'consultancy-firm', component: ConsultencyFirmDetailsComponent },
        { path: 'specialized-firm', component: SpecilizedFirmDetailsComponent },
        { path: 'certified-builders', component: CertifiedFirmDetailsComponent },
        { path: 'ViewConultencyDetails', component: ViewConultencyDetailsComponent },
        { path: 'ViewSpecializeDetails', component: ViewSpecializeDetailsComponent },
        { path: 'ViewCertifiedDetails', component: ViewCertifiedDetailsComponent },
         { path: 'consultancy-information', component: ConsultancyInformationComponent},
        { path: 'cb-info', component: CertifiedBuildersInfoComponent},
        { path: 'sf-info', component: SpecializedFirmsInfoComponent},
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
