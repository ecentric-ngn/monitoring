import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConsultantComponent } from './consultant.component';
import { ConsultantDetailsComponent } from './consultant-details/consultant-details.component';
import { SuspendConsultantComponent } from './suspend-consultant/suspend-consultant.component';
import { CancelledConsultantComponent } from './cancelled-consultant/cancelled-consultant.component';
import { DeregisterConsultantComponent } from './deregister-consultant/deregister-consultant.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:ConsultantComponent },
        { path: 'consultant-details', component:ConsultantDetailsComponent},
        { path: 'suspendConsultant', component:SuspendConsultantComponent},
        { path: 'cancelledConsultant', component:CancelledConsultantComponent},
        { path: 'deregisteredConsultant', component:DeregisterConsultantComponent},
    ])],
    exports: [RouterModule]
})
export class ConsultantRoutingModule { }
