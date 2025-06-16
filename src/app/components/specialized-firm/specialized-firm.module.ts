import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecializedFirmComponent } from './specialized-firm.component';
import { SpecializedFirmRoutingModule } from './specialized-firm-routing.module';
import { SpecializedFirmDetailsComponent } from './specialized-firm-details/specialized-firm-details.component';
import { GeneralInformationComponent } from './specialized-firm-details/general-information/general-information.component';
import { OwnerInformationComponent } from './specialized-firm-details/owner-information/owner-information.component';
import { HumanResourceComponent } from './specialized-firm-details/human-resource/human-resource.component';
import { EquipmentComponent } from './specialized-firm-details/equipment/equipment.component';
import { WorkClassificationComponent } from './specialized-firm-details/work-classification/work-classification.component';
import { TrackRecordComponent } from './specialized-firm-details/track-record/track-record.component';
import { CancelledSpecializedFirmComponent } from './cancelled-specialized-firm/cancelled-specialized-firm.component';
import { SuspendSpecializedFirmComponent } from './suspend-specialized-firm/suspend-specialized-firm.component';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { CommentsAdverseRecordComponent } from './specialized-firm-details/comments-adverse-record/comments-adverse-record.component';
import { DeregisterSpecializedFirmComponent } from './deregister-specialized-firm/deregister-specialized-firm.component';

@NgModule({

    imports: [
        CommonModule,
        FormsModule,
        SpecializedFirmRoutingModule,
        ToastModule,
        ButtonModule,
        RippleModule

    ],
    declarations: [SpecializedFirmComponent, SpecializedFirmDetailsComponent, GeneralInformationComponent, OwnerInformationComponent, HumanResourceComponent, EquipmentComponent,DeregisterSpecializedFirmComponent, WorkClassificationComponent, TrackRecordComponent, CommentsAdverseRecordComponent, CancelledSpecializedFirmComponent, SuspendSpecializedFirmComponent],
    providers:[MessageService]
})
export class SpecializedFirmModule { }
