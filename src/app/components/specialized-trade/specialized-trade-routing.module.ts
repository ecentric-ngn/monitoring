import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpecializedTradeComponent } from './specialized-trade.component';
import { SpecializedTradeDetailsComponent } from './specialized-trade-details/specialized-trade-details.component';
import { SuspendedSpecializedTradeComponent } from './suspended-specialized-trade/suspended-specialized-trade.component';
import { CancelledSpecializedTradeComponent } from './cancelled-specialized-trade/cancelled-specialized-trade.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:SpecializedTradeComponent },
        {path:'specialized-trade-details',component:SpecializedTradeDetailsComponent},
        { path: 'suspendedSpecialized-trade', component:SuspendedSpecializedTradeComponent},
        { path: 'cancelledSpecialized-trade', component:CancelledSpecializedTradeComponent},
    ])],
    exports: [RouterModule]
})
export class SpecializedTradeRoutingModule { }
