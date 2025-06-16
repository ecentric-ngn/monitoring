import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContractorComponent } from './contractor.component';
import { ContractorDetailsComponent } from './contractor-details/contractor-details.component';
import { SuspendContractorComponent } from './suspend-contractor/suspend-contractor.component';
import { CancelledContractorComponent } from './cancelled-contractor/cancelled-contractor.component';
import { DeRegisterContractorComponent } from './de-register-contractor/de-register-contractor.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:ContractorComponent },
        { path: 'contractor-details', component:ContractorDetailsComponent},
        { path: 'suspendedContractor', component:SuspendContractorComponent},
        { path: 'cancelledContractor', component:CancelledContractorComponent},
        { path: 'deregisteredContractor', component:DeRegisterContractorComponent},
       
    ])],
    exports: [RouterModule]
})
export class ContractorRoutingModule { }
