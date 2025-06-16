import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SurveyorComponent } from './surveyor.component';
import { SurveyorDetailsComponent } from './surveyor-details/surveyor-details.component';
import { SuspendSurveyorComponent } from './suspend-surveyor/suspend-surveyor.component';
import { CancelledSurveyorComponent } from './cancelled-surveyor/cancelled-surveyor.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component:SurveyorComponent },
        {path:'surveyor-details',component:SurveyorDetailsComponent},
        { path: 'suspendedSurveyor', component:SuspendSurveyorComponent},
        { path: 'cancelledSurveyor', component:CancelledSurveyorComponent},
    
    ])],
    exports: [RouterModule]
})
export class SurveyorRoutingModule { }
