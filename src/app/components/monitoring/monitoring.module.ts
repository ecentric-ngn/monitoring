import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringRoutingModule } from './monitoring.module.routing';
import { OnsiteFacilitiesandManagementComponent } from '../monitoring/onsite-facilitiesand-management/onsite-facilitiesand-management.component';
import { BctaWorkDetailComponent } from './bcta-work-detail/bcta-work-detail.component';
import { ContractDocumentComponent } from './contract-document/contract-document.component';
import { WorkProgressComponent } from './work-progress/work-progress.component';
import { QualificationComponent } from './qualification/qualification.component';
import { WorkTaskQuantityComponent } from './work-task-quantity/work-task-quantity.component';
import { OnSiteQualityCheckComponent } from './on-site-quality-check/on-site-quality-check.component';
import { ReinforcementComponent } from './reinforcement/reinforcement.component';
import { OccupationalHealthAndSaftyComponent } from './occupational-health-and-safty/occupational-health-and-safty.component';
import { ListOFHRinContractComponent } from './list-ofhrin-contract/list-ofhrin-contract.component';
import { CertifiedSkilledWorkerComponent } from './certified-skilled-worker/certified-skilled-worker.component';
import { CommittedEquipmentComponent } from './committed-equipment/committed-equipment.component';
import { HRStrengthAtSiteComponent } from './hrstrength-at-site/hrstrength-at-site.component';
import { ContractorPresentDuringSiteMonitoringComponent } from './contractor-present-during-site-monitoring/contractor-present-during-site-monitoring.component';
import { AddingSiteEngineerComponent } from './adding-site-engineer/adding-site-engineer.component';
import { MonitorTeamListsComponent } from './monitor-team-lists/monitor-team-lists.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AddworkinformationComponent } from './other-construction-monitoring/addworkinformation/addworkinformation.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ViewRegFirmInformationComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/view-reg-firm-information.component';
import { OfficeSignageAndDocComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/office-signage-and-doc/office-signage-and-doc.component';
import { PermanentEmployeeComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/permanent-employee/permanent-employee.component';
import { MandatoryEquipmentComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/mandatory-equipment/mandatory-equipment.component';
import { MonitoringTeamUsersComponent } from './registractionCompliance/view-reg-compliancelist/view-reg-firm-information/monitoring-team-users/monitoring-team-users.component';
import { ViewRegistrationComplianceDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-registration-compliance-details.component';
import { ViewRegDetailsComponent } from './reviewCommitteDashboard/view-registration-compliance-details/view-reg-details/view-reg-details.component';
import { CbMandatoryEquipmentComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/cb-mandatory-equipment/cb-mandatory-equipment.component';
import { CbMonitoringTeamComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/cb-monitoring-team/cb-monitoring-team.component';
import { CbOfficeSignageComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/cb-office-signage/cb-office-signage.component';
import { CbPermanentEmployeesComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/cb-permanent-employees/cb-permanent-employees.component';
import { CertifiedBuildersInfoComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders-info/certified-builders-info.component';
import { CertifiedBuildersComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/certified-builders/certified-builders.component';
import { ConsultancyFirmComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-firm.component';
import { ConsultancyInformationComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/consultancy-information.component';
import { ConsultancyMandatoryEquipmentComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/consultancy-mandatory-equipment/consultancy-mandatory-equipment.component';
import { ConsultancyMonitoringTeamComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/consultancy-monitoring-team/consultancy-monitoring-team.component';
import { OfficeSignageComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/office-signage/office-signage.component';
import { PermanentEmployeesComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/consultancy-firm/consultancy-information/permanent-employees/permanent-employees.component';
import { SfMonitoringTeamComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms-info/sf-monitoring-team/sf-monitoring-team.component';
import { SfPermanentEmployeesComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms-info/sf-permanent-employees/sf-permanent-employees.component';
import { SpecializedFirmsInfoComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms-info/specialized-firms-info.component';
import { SpecializedFirmsComponent } from './registractionCompliance/view-reg-compliancelist/firmTypes/specialized-firms/specialized-firms.component';
import { ActionModalConstructionComponent } from './shared/action-modal-construction/action-modal-construction.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NzPopconfirmModule,
        MonitoringRoutingModule,
        NzButtonModule,
        NzIconModule,
       
    ],
    declarations: [
        OnsiteFacilitiesandManagementComponent,
        BctaWorkDetailComponent,
        ContractDocumentComponent,
        WorkProgressComponent,
        QualificationComponent,
        WorkTaskQuantityComponent,
        OnSiteQualityCheckComponent,
        ReinforcementComponent,
        OccupationalHealthAndSaftyComponent,
        ListOFHRinContractComponent,
        CertifiedSkilledWorkerComponent,
        CommittedEquipmentComponent,
        HRStrengthAtSiteComponent,
        ContractorPresentDuringSiteMonitoringComponent,
        AddingSiteEngineerComponent,
        MonitorTeamListsComponent,
        ReviewAndSubmitComponent,
        AddworkinformationComponent,
        ViewRegFirmInformationComponent,
        OfficeSignageAndDocComponent,
        PermanentEmployeeComponent,
        MandatoryEquipmentComponent,
        MonitoringTeamUsersComponent,
        ViewRegistrationComplianceDetailsComponent,
        ViewRegDetailsComponent,
         ConsultancyFirmComponent,
        CertifiedBuildersComponent,
        SpecializedFirmsComponent,
        ConsultancyInformationComponent,
        OfficeSignageComponent,
        PermanentEmployeesComponent,
        ConsultancyMonitoringTeamComponent,
        ConsultancyMandatoryEquipmentComponent,
        CertifiedBuildersInfoComponent,
        CbMandatoryEquipmentComponent,
        CbMonitoringTeamComponent,
        CbOfficeSignageComponent,
        CbPermanentEmployeesComponent,
        SpecializedFirmsInfoComponent,
        SfPermanentEmployeesComponent,
        SfMonitoringTeamComponent,
        ActionModalConstructionComponent,
        ],
    providers:[]
})
export class MonitoringModule { }
