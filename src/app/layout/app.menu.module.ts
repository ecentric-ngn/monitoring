import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppMenuComponent } from './app.menu.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule
    ],
    declarations: [AppMenuComponent]
})
export class appMenuModule { }
