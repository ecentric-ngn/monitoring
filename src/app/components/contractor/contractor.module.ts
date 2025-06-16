import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractorComponent } from './contractor.component';
import { ContractorRoutingModule } from './contractor-routing.module';
import { ContractorDetailsComponent } from './contractor-details/contractor-details.component';
import { GeneralInformationComponent } from './contractor-details/general-information/general-information.component';
import { HumanResourceComponent } from './contractor-details/human-resource/human-resource.component';
import { EquipmentComponent } from './contractor-details/equipment/equipment.component';
import { WorkClassificationComponent } from './contractor-details/work-classification/work-classification.component';
import { TrackRecordComponent } from './contractor-details/track-record/track-record.component';
import { CommentsAdverseRecordsComponent } from './contractor-details/comments-adverse-records/comments-adverse-records.component';
import { OwnerInformationComponent } from './contractor-details/owner-information/owner-information.component';
import { RouterModule } from '@angular/router';
import { SuspendContractorComponent } from './suspend-contractor/suspend-contractor.component';
import { CancelledContractorComponent } from './cancelled-contractor/cancelled-contractor.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ContractorService } from '../../service/contractor.service';
import { AppMenuComponent } from '../../components/../layout/app.menu.component';
import { DeRegisterContractorComponent } from './de-register-contractor/de-register-contractor.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ToastModule,
        RippleModule,
        ButtonModule,
        ContractorRoutingModule,
    ],
    declarations: [ContractorComponent, ContractorDetailsComponent,DeRegisterContractorComponent, GeneralInformationComponent, HumanResourceComponent, EquipmentComponent, WorkClassificationComponent, TrackRecordComponent, CommentsAdverseRecordsComponent, OwnerInformationComponent,SuspendContractorComponent,CancelledContractorComponent],
    providers: [ContractorService,MessageService,AppMenuComponent]
})
export class ContractorModule { }
