import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EngineerComponent } from './engineer.component';
import { EngineerRoutingModule } from './engineer-routing.module';
import { EngineerDetailsComponent } from './engineer-details/engineer-details.component';
//import { RegistrationInformationComponent } from './registration-information/registration-information.component';
//import { EmploymentHistoryComponent } from './employment-history/employment-history.component';
import { RegistrationInformationComponent } from './engineer-details/registration-information/registration-information.component';
import { EmploymentHistoryComponent } from './engineer-details/employment-history/employment-history.component';
import { SuspendEngineerComponent } from './suspend-engineer/suspend-engineer.component';
import { CancelledEngineerComponent } from './cancelled-engineer/cancelled-engineer.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { EngineerRecordComponent } from './engineer-details/engineer-record/engineer-record.component';
import { WorkHistoryComponent } from './engineer-details/work-history/work-history.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        EngineerRoutingModule,
        RippleModule,
        ToastModule,
        ButtonModule
    ],
    declarations: [EngineerComponent, EngineerDetailsComponent, RegistrationInformationComponent, EmploymentHistoryComponent, SuspendEngineerComponent, CancelledEngineerComponent, EngineerRecordComponent, WorkHistoryComponent],
    providers: [MessageService]
})
export class EngineerModule { }
