import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EngineerComponent } from './engineer.component';
import { EngineerDetailsComponent } from './engineer-details/engineer-details.component';
import { SuspendEngineerComponent } from './suspend-engineer/suspend-engineer.component';
import { CancelledEngineerComponent } from './cancelled-engineer/cancelled-engineer.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:EngineerComponent },
        {path:'engineer-details',component:EngineerDetailsComponent },
        { path: 'suspendedEngineer', component:SuspendEngineerComponent},
        { path: 'cancelledEngineer', component:CancelledEngineerComponent},
       
        
        
    ])],
    exports: [RouterModule]
})
export class EngineerRoutingModule { }
