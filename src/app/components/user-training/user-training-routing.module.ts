import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserTrainingComponent } from './user-training.component';
import { TrainingFormComponent } from './training-form/training-form.component';
import { EditUserTrainingComponent } from './edit-user-training/edit-user-training.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: UserTrainingComponent },
        { path: 'training-form', component: TrainingFormComponent },
        { path: 'edit-user-training', component: EditUserTrainingComponent },
    ])],
    exports: [RouterModule]
})
export class TrainingRoutingModule { }
