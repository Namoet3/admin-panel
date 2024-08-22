import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {IlkOnayComponent} from './ilk-onay/ilk-onay.component';
import {IkinciOnayComponent} from './ikinci-onay/ikinci-onay.component';

import {LogPageComponent} from './log-page/log-page.component';


export const routes: Routes = [ 
    { path : 'dashboard', component: DashboardComponent},
    { path: 'ilk-onay', component: IlkOnayComponent },
    { path: 'ikinci-onay', component: IkinciOnayComponent },
    { path: 'logs', component: LogPageComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' },
    
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}
