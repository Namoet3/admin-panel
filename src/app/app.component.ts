import { Component, OnInit, HostListener  } from '@angular/core';
import { UserService } from './services/user.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { routes } from './app.routes';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { UserDetailDialogComponent } from './user-detail-dialog/user-detail-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import {IlkOnayComponent} from './ilk-onay/ilk-onay.component';
import {LogPageComponent} from './log-page/log-page.component';
import {DashboardComponent} from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, HttpClientModule, IlkOnayComponent, LogPageComponent, DashboardComponent, RouterModule, MatDialogModule,  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(private userService: UserService, private router: Router) { }

  isDropdownOpen: boolean = false;

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); 
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  navigatetoIlkOnay(){
    this.router.navigate(['/ilk-onay']);
  }
  navigatetoTable(){
    this.router.navigate(['/table']);
  }
  navigatetoDashboard(){
    this.router.navigate(['/dashboard']);
  }

  users: any[] = [];

  

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: any[]) => {
        this.users = data;
        console.log(this.users);
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
  }

  viewUser(user: any): void {
    console.log('User details:', user);
  }
}
