import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArchitectComponent } from './architect.component';
import { ArchitectDetailComponent } from './architect-detail/architect-detail.component';
import { SuspendArchitectComponent } from './suspend-architect/suspend-architect.component';
import { CancelledArchitectComponent } from './cancelled-architect/cancelled-architect.component';
@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:ArchitectComponent },
        { path: 'architect-detail', component:ArchitectDetailComponent},
        { path: 'SuspendArchitect', component:SuspendArchitectComponent},
        { path: 'CancelledArchitect', component:CancelledArchitectComponent},
 
    ])],
    exports: [RouterModule],
    
})
export class ArchitectRoutingModule { }
