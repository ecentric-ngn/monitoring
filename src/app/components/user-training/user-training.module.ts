import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserTrainingComponent } from './user-training.component';
import { TrainingFormComponent } from './training-form/training-form.component';
import { TrainingRoutingModule } from './user-training-routing.module';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TrainingRoutingModule,
    ToastModule,
    RippleModule,
    ButtonModule
  ],
  declarations: [
    UserTrainingComponent,
    TrainingFormComponent
  ],
  providers:[MessageService]
})
export class UserTrainingModule { }
