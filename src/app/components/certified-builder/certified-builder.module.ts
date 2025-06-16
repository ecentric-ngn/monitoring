import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertifiedBuilderRoutingModule } from './certified-builder-routing.module';
import { CertifiedBuilderDetailsComponent } from './certified-builder-details/certified-builder-details.component';
import { GeneralInformationComponent } from './certified-builder-details/general-information/general-information.component';
import { OwnerInformationComponent } from './certified-builder-details/owner-information/owner-information.component';
import { HumanResourceComponent } from './certified-builder-details/human-resource/human-resource.component';
import { EquipmentComponent } from './certified-builder-details/equipment/equipment.component';
import { TrackRecordComponent } from './certified-builder-details/track-record/track-record.component';
import { CommentsAdverseRecordComponent } from './certified-builder-details/comments-adverse-record/comments-adverse-record.component';
import { CancelledCertifiedBuilderComponent } from './cancelled-certified-builder/cancelled-certified-builder.component';
import { SuspendCertifiedBuilderComponent } from './suspend-certified-builder/suspend-certified-builder.component';
import { CertifiedBuilderComponent } from './certified-builder.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CertifiedBuilderRoutingModule,
        ToastModule,
        ButtonModule,
        RippleModule,


    ],
    declarations: [
    CertifiedBuilderDetailsComponent,
    GeneralInformationComponent,
    OwnerInformationComponent,
    HumanResourceComponent,
    EquipmentComponent,
    TrackRecordComponent,
    CommentsAdverseRecordComponent,
    CancelledCertifiedBuilderComponent,
    SuspendCertifiedBuilderComponent,
    CertifiedBuilderComponent
  ],
  providers:[MessageService]
})

export class CertifiedBuilderModule { }
