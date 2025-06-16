import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppMenuComponent } from './app.menu.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AppMenuComponent }
    ])],
    exports: [RouterModule]
})
export class menuRoutingModule { }
