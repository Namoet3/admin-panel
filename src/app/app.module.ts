import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
import { IlkOnayComponent } from './ilk-onay/ilk-onay.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatDialog } from '@angular/material/dialog';


@NgModule({
  declarations: [
    // RecaptchaValueAccessorDirective,
  ],
  imports: [
    
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // RecaptchaModule,
    // RecaptchaFormsModule,
    // RecaptchaV3Module,
    RouterModule.forRoot(routes),
  ],
  providers: [    ],
})
// provide: RECAPTCHA_V3_SITE_KEY,
//       useValue: environment.recaptcha.siteKey,
export class AppModule {
  // (provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.RECAPTCHA_KEY )
 }
