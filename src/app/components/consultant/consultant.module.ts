import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultantComponent } from './consultant.component';
import { ConsultantRoutingModule } from './consultant-routing.module';
import { ConsultantDetailsComponent } from './consultant-details/consultant-details.component';
import { ConsultantGeneralInformationComponent } from './consultant-details/consultant-general-information/consultant-general-information.component';
import { ConsultantOwnerInformationComponent } from './consultant-details/consultant-owner-information/consultant-owner-information.component';
import { ConsultantHumanResourceComponent } from './consultant-details/consultant-human-resource/consultant-human-resource.component';
import { ConsultantEquipmentComponent } from './consultant-details/consultant-equipment/consultant-equipment.component';
import { ConsultantWorkClassificationComponent } from './consultant-details/consultant-work-classification/consultant-work-classification.component';
import { ConsultantTrackRecordComponent } from './consultant-details/consultant-track-record/consultant-track-record.component';
import { ConsultantCommentsAdverseRecordsComponent } from './consultant-details/consultant-comments-adverse-records/consultant-comments-adverse-records.component';
import { RouterModule } from '@angular/router';
import { CancelledConsultantComponent } from './cancelled-consultant/cancelled-consultant.component';
import { SuspendConsultantComponent } from './suspend-consultant/suspend-consultant.component';
import { ConsultantService } from '../../service/consultant.service';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { DeregisterConsultantComponent } from './deregister-consultant/deregister-consultant.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ConsultantRoutingModule,
        ButtonModule,
        RippleModule,
        ToastModule
    ],
    declarations: [ConsultantComponent,DeregisterConsultantComponent, ConsultantDetailsComponent,ConsultantOwnerInformationComponent, ConsultantGeneralInformationComponent, ConsultantHumanResourceComponent, ConsultantEquipmentComponent, ConsultantWorkClassificationComponent, ConsultantTrackRecordComponent, ConsultantCommentsAdverseRecordsComponent, CancelledConsultantComponent, SuspendConsultantComponent],
    providers: [ConsultantService,MessageService]
})
export class ConsultantModule { }
