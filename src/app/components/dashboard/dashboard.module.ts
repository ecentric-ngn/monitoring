import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CommonModule,
        FormsModule,
        RouterModule,
        ToastModule,
        RippleModule,
        ButtonModule,
      
    ],
    declarations: [DashboardComponent]
})
export class DashboardModule { }
