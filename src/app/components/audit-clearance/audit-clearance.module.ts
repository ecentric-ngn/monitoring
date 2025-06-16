import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditClearanceRoutingModule } from './audit-clearance-routing.module';
import { AddAuditClearanceComponent } from './add-audit-clearance/add-audit-clearance.component';
import { EditAuditClearanceComponent } from './edit-audit-clearance/edit-audit-clearance.component';
import { ToastModule } from 'primeng/toast';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        AuditClearanceRoutingModule
    ],
    declarations: [
    AddAuditClearanceComponent,
    EditAuditClearanceComponent
  ]
})

export class AuditClearanceModule { }
