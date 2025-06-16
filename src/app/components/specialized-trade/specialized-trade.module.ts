import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecializedTradeComponent } from './specialized-trade.component';
import { SpecializedTradeRoutingModule } from './specialized-trade-routing.module';
import { SpecializedTradeDetailsComponent } from './specialized-trade-details/specialized-trade-details.component';
import { RegistrationInformationComponent } from './specialized-trade-details/registration-information/registration-information.component';
import { EmploymentHistoryComponent } from './specialized-trade-details/employment-history/employment-history.component';
import { SuspendedSpecializedTradeComponent } from './suspended-specialized-trade/suspended-specialized-trade.component';
import { CancelledSpecializedTradeComponent } from './cancelled-specialized-trade/cancelled-specialized-trade.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { CategoryInformationComponent } from './specialized-trade-details/category-information/category-information.component';
import { SpecializedTradeRecordComponent } from './specialized-trade-details/specialized-trade-record/specialized-trade-record.component';
import { WorkHistoryComponent } from './specialized-trade-details/work-history/work-history.component';
//import { SpecializedTradeRecordComponent } from './specialized-trade-details/specialized-trade-record/specialized-trade-record.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SpecializedTradeRoutingModule,
        ToastModule,
        ButtonModule,
        RippleModule,

    ],
    declarations: [SpecializedTradeComponent,SpecializedTradeRecordComponent, SpecializedTradeDetailsComponent, RegistrationInformationComponent, EmploymentHistoryComponent,SuspendedSpecializedTradeComponent, CancelledSpecializedTradeComponent, CategoryInformationComponent, WorkHistoryComponent],
    providers: [MessageService]
})
export class SpecializedTradeModule { }
