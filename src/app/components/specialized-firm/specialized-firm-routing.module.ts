import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpecializedFirmComponent } from './specialized-firm.component';
import { SpecializedFirmDetailsComponent } from './specialized-firm-details/specialized-firm-details.component';
import { SuspendSpecializedFirmComponent } from './suspend-specialized-firm/suspend-specialized-firm.component';
import { CancelledSpecializedFirmComponent } from './cancelled-specialized-firm/cancelled-specialized-firm.component';
import { DeregisterSpecializedFirmComponent } from './deregister-specialized-firm/deregister-specialized-firm.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:SpecializedFirmComponent },
        { path: 'specialized-firm-details', component:SpecializedFirmDetailsComponent },
        { path: 'suspendedSpecialized-firm', component:SuspendSpecializedFirmComponent},
        { path: 'cancelledSpecialized-firm', component:CancelledSpecializedFirmComponent},
        { path: 'deregisteredSpecialized-firm', component:DeregisterSpecializedFirmComponent},
    ])],
    exports: [RouterModule]
})
export class SpecializedFirmRoutingModule { }
