import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchitectComponent } from './architect.component';
import { ArchitectRoutingModule } from './architect-routing.module';
import { ArchitectDetailComponent } from './architect-detail/architect-detail.component';
import { RegistrationInformationComponent } from './architect-detail/registration-information/registration-information.component';
import { EmploymentHistoryComponent } from './architect-detail/employment-history/employment-history.component';
import { SuspendArchitectComponent } from './suspend-architect/suspend-architect.component';
import { CancelledArchitectComponent } from './cancelled-architect/cancelled-architect.component';
import { ArchitectRecordComponent } from './architect-detail/architect-record/architect-record.component';
import { WorkHistoryComponent } from './architect-detail/work-history/work-history.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ArchitectRoutingModule,
        ToastModule,
        ButtonModule,
        RippleModule
        
    ],
    declarations: [ArchitectComponent,ArchitectRecordComponent, ArchitectDetailComponent, RegistrationInformationComponent, EmploymentHistoryComponent, SuspendArchitectComponent, CancelledArchitectComponent,WorkHistoryComponent],
    providers: [MessageService]
})
export class ArchitectModule { }
