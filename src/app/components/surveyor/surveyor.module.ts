import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyorComponent } from './surveyor.component';
import { SurveyorRoutingModule } from './surveyor-routing.module';
import { SurveyorDetailsComponent } from './surveyor-details/surveyor-details.component';
import { CancelledSurveyorComponent } from './cancelled-surveyor/cancelled-surveyor.component';
import { SuspendSurveyorComponent } from './suspend-surveyor/suspend-surveyor.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { SurveyorRecordComponent } from './surveyor-details/surveyor-record/surveyor-record.component';
import { RegistrationInformationComponent } from './surveyor-details/registration-information/registration-information.component';
import { EmploymentHistoryComponent } from './surveyor-details/employment-history/employment-history.component';
import { WorkHistoryComponent } from './surveyor-details/work-history/work-history.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SurveyorRoutingModule,
        ToastModule,
        ButtonModule,
        RippleModule
    ],
    declarations: [SurveyorComponent,SurveyorRecordComponent, SurveyorDetailsComponent, CancelledSurveyorComponent, SuspendSurveyorComponent, SurveyorRecordComponent, RegistrationInformationComponent, EmploymentHistoryComponent, WorkHistoryComponent],
    providers:[MessageService]
})
export class SurveyorModule { }
