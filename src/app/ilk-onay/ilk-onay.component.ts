import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { UserDetailDialogComponent } from '../user-detail-dialog/user-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { LoggingService } from '../services/logging.service';
export interface JobExperience {
  company: string;
  startDate: string;
  endDate: string;
}

export interface Reference {
  referenceName: string;
  referenceCompany: string;
}

export interface Membership {
  membershipName: string;
}

export interface Language {
  languageName: string;
  proficiency: string;
}

export interface User {
  firstName: string;
  lastName: string;
  city: string;
  university: string;
  program: string;
  gpa: number;
  disability: string;
  experience: string;
  jobExperiences: JobExperience[];
  references: Reference[];
  memberships: Membership[];
  languages: Language[];
}


@Component({
  selector: 'app-ilk-onay',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './ilk-onay.component.html',
  styleUrl: './ilk-onay.component.scss'
})
export class IlkOnayComponent implements OnInit{
  isDropdownOpen: boolean = false;
  users: any[] = [];
  filteredUsers: any[] = [];
  linesToShow = 5;
  
  filter = {
    firstName: '',
    lastName: '',
    referenceName: '',
    disability: '',
    gpaMin: '',
    gpaMax: '',
    languageName: '',
    Proficiency: '',
    city: '',
    experience: ''
  };

  sortState = {
    firstName: 0, 
    lastName: 0,
    city: 0,
    university: 0,
    program: 0,
    gpa: 0,
    reference: 0
  };
  
  

  constructor(private userService: UserService, private dialog: MatDialog, private loggingService: LoggingService) { }
  ngOnInit(): void {
    this.loadUsers();
  }
  
  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: any[]) => {
        this.users = data.map(user => ({ ...user, selected: false })); 
        this.filteredUsers = [...this.users];
      },
      error => console.error('Error fetching users', error)
    );
  }
  
  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.filteredUsers.forEach(user => user.selected = checked);
  }
  
  confirmDeleteSelectedUsers(): void {
    const selectedUsers = this.filteredUsers.filter(user => user.selected);
    if (selectedUsers.length > 0) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteSelectedUsers(selectedUsers); 
        }
      });
    } else {
      alert('Please select at least one user to delete.');
    }
  }
  
  deleteSelectedUsers(selectedUsers: any[]): void {
    selectedUsers.forEach(user => {
      this.deletePerson(user.id); 
    });
  }
  
  deletePerson(id: number): void {
    const user = this.users.find(user => user.id === id);
    this.users = this.users.filter(user => user.id !== id);
    this.filteredUsers = this.filteredUsers.filter(user => user.id !== id);
  
    if (user) {
      this.loggingService.logAction('Deleted', 'Admin', user);
    }
  
    this.userService.deleteUser(id).subscribe({
      next: () => {
        console.log(`User with ID ${id} deleted successfully`);
      },
      error: err => {
        console.error('Error deleting user:', err);
      }
    });
  }
  

  sort(column: keyof typeof this.sortState): void {
    
    for (const key in this.sortState) {
      if (key !== column) {
        this.sortState[key as keyof typeof this.sortState] = 0;
      }
    }
  
    
    if (this.sortState[column] === 0) {
      this.sortState[column] = 1;
    } else if (this.sortState[column] === 1) {
      this.sortState[column] = -1;
    } else {
      this.sortState[column] = 0;
    }
  
    
    if (this.sortState[column] !== 0) {
      this.filteredUsers.sort((a, b) => {
        let valueA, valueB;
  
        if (column === 'gpa') {
          valueA = parseFloat(a[column]);
          valueB = parseFloat(b[column]);
        } else if (column === 'reference') {
          valueA = a.references[0]?.referenceName?.toLowerCase() || '';
          valueB = b.references[0]?.referenceName?.toLowerCase() || '';
        } else {
          valueA = a.userDetails[column]?.toLowerCase() || '';
          valueB = b.userDetails[column]?.toLowerCase() || '';
        }
  
        if (this.sortState[column] === 1) {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    } else {
      this.filteredUsers = [...this.users]; 
    }
  }
  
  filterUsers(): void {
    console.log('Applying filters:', this.filter);
  
    this.filteredUsers = this.users.filter(user => {
      const matchesFirstName = this.filter.firstName === '' || user.userDetails.firstName?.toLowerCase().startsWith(this.filter.firstName.toLowerCase());
      const matchesLastName = this.filter.lastName === '' || user.userDetails.lastName?.toLowerCase().startsWith(this.filter.lastName.toLowerCase());
      const matchesReference = this.filter.referenceName === '' || user.references?.some((ref: { referenceName: string }) => ref.referenceName?.toLowerCase().startsWith(this.filter.referenceName.toLowerCase()));
      const matchesGpaMin = this.filter.gpaMin === '' || user.gpa >= parseFloat(this.filter.gpaMin);
      const matchesGpaMax = this.filter.gpaMax === '' || user.gpa <= parseFloat(this.filter.gpaMax);
      const matchesCity = this.filter.city === '' || user.userDetails.city?.toLowerCase() === this.filter.city.toLowerCase();
  
      const matchesLanguage = this.filter.languageName === '' && this.filter.Proficiency === '' ||
        user.languages?.some((lang: { languageName: string; proficiency: string }) => {
          if (!lang.languageName || !lang.proficiency) {
            console.warn('Language entry missing name or proficiency:', lang);
            return false;
          }
          const nameMatches = lang.languageName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(this.filter.languageName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
          const proficiencyMatches = lang.proficiency.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === this.filter.Proficiency.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          console.log(`Checking language: ${lang.languageName}, proficiency: ${lang.proficiency}, nameMatches: ${nameMatches}, proficiencyMatches: ${proficiencyMatches}`);
          return nameMatches && proficiencyMatches;
        });
  
      const matchesDisability = this.filter.disability === '' || user.disability?.toLowerCase() === this.filter.disability.toLowerCase();
  
      
      const totalExperienceYears = user.jobExperiences?.reduce((total: number, job: { startDate: string; endDate: string }) => {
        const start = new Date(job.startDate);
        const end = job.endDate ? new Date(job.endDate) : new Date();
        const experience = (end.getTime() - start.getTime()) / (1000 * 3600 * 24 * 365);
        return total + experience;
      }, 0) || 0;
  
      
      let experienceCategory = '1 yıldan az';
      if (totalExperienceYears >= 1 && totalExperienceYears < 2) {
        experienceCategory = '1-2 yıl';
      } else if (totalExperienceYears >= 2 && totalExperienceYears < 5) {
        experienceCategory = '2-5 yıl';
      } else if (totalExperienceYears >= 5) {
        experienceCategory = '5 yıldan fazla';
      }
  
      const matchesExperience = this.filter.experience === '' || experienceCategory === this.filter.experience;
  
      return matchesFirstName && matchesLastName && matchesReference && matchesGpaMin && matchesGpaMax && matchesCity && matchesLanguage && matchesDisability && matchesExperience;
    });
  
    console.log('Filtered users:', this.filteredUsers);
  }

  resetFilters(): void {
    this.filter = {
      firstName: '',
      lastName: '',
      referenceName: '',
      disability: '',
      gpaMin: '',
      gpaMax: '',
      languageName: '',
      Proficiency: '',
      city: '',
      experience: ''
    };
    this.filteredUsers = this.users; 
  }

  showMoreLines(): void {
    this.linesToShow += 5;
  }

  viewUser(user: any): void {
    this.dialog.open(UserDetailDialogComponent, {
      width: '99%',
      maxWidth: '1500px',
      height: '95%',
      maxHeight: '850px',
      data: user
    });
  }

  

  // deletePerson(id: number): void {
  //   this.users = this.users.filter(user => user.id !== id);
  //   this.filteredUsers = this.filteredUsers.filter(user => user.id !== id);
  //   this.userService.deleteUser(id).subscribe({
  //     next: () => {
  //       console.log(`User with ID ${id} deleted successfully`);
  //     },
  //     error: err => {
  //       console.error('Error deleting user:', err);
  //     }
  //   });
  // }
  
  exportAsExcel(): void {
    const flattenedData = this.filteredUsers.map((user: User) => ({
      ...user,
      jobExperiences: user.jobExperiences.map((je: JobExperience) => `${je.company}: ${je.startDate} - ${je.endDate}`).join(', '),
      references: user.references.map((ref: Reference) => `${ref.referenceName} (${ref.referenceCompany})`).join(', '),
      memberships: user.memberships.map((mem: Membership) => mem.membershipName).join(', '),
      languages: user.languages.map((lang: Language) => `${lang.languageName} (${lang.proficiency})`).join(', ')
    }));
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    XLSX.writeFile(wb, 'UsersData.xlsx');
  }
}