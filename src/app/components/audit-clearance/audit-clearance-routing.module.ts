import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuditClearanceComponent } from './audit-clearance.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:AuditClearanceComponent },
        // // {path:'add-audit-clearance',component:AddAuditClearanceComponent},
        // // {path: 'edit-audit-clearance', component:EditAuditClearanceComponent},

    ])],
    exports: [RouterModule]
})
export class AuditClearanceRoutingModule { }

