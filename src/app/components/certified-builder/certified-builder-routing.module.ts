import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CertifiedBuilderComponent } from './certified-builder.component';
import { CertifiedBuilderDetailsComponent } from './certified-builder-details/certified-builder-details.component';
import { SuspendCertifiedBuilderComponent } from './suspend-certified-builder/suspend-certified-builder.component';
import { CancelledCertifiedBuilderComponent } from './cancelled-certified-builder/cancelled-certified-builder.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:CertifiedBuilderComponent },
        {path:'certified-builder-details',component:CertifiedBuilderDetailsComponent},
        { path: 'suspendedCertified-builder', component:SuspendCertifiedBuilderComponent},
        { path: 'cancelledCertified-builder', component:CancelledCertifiedBuilderComponent},

    ])],
    exports: [RouterModule]
})
export class CertifiedBuilderRoutingModule { }
