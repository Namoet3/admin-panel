import { Component, OnInit } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule} from '@angular/router';
import { UserService } from '../services/user.service'; 
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { FormsModule } from '@angular/forms';
import { PasswordDialogComponent } from '../password-dialog/password-dialog.component';
interface ActionLog {
  id?: number;            
  action: string;         
  performedBy: string;    
  timestamp: Date;        
  details?: string;       
}

@Component({
  selector: 'app-log-page',
  templateUrl: './log-page.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styleUrls: ['./log-page.component.scss']
})
export class LogPageComponent implements OnInit {
  deletedData: any[] = [];
  logs: any[] = [];
  actionLogs: any[] = [];
  pageVisitLogs: any[] = [];
  lastClearAction: any;
  visibleLogs: number = 5;
  visibleActionLogs: number = 5; 
  visiblePageVisitLogs: number = 5;
  isDropdownOpen: boolean = false;

  constructor(
    private loggingService: LoggingService, 
    private userService: UserService, 
    private dialog: MatDialog, 
    private http: HttpClient,
    private snackBar: MatSnackBar, 
  ) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadActionLogs();
    this.loadPageVisitLogs();
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  loadLogs(): void {
    this.loggingService.getLogs().subscribe(
      data => {
        this.logs = data;
      },
      error => {
        console.error('Error fetching logs:', error);
      }
    );
  }
  showMoreLogs(): void {
    this.visibleLogs += 5; 
  }
  showLessPageVisitLogs(): void {
    this.visiblePageVisitLogs = 5; // Show only the first 5 logs
}
  showMoreActionLogs(): void {
    this.visibleActionLogs += 5; 
  }
  loadActionLogs(): void {
    this.loggingService.getActionLogs().subscribe(
      data => {
        this.actionLogs = data;
      },
      error => {
        console.error('Error fetching action logs:', error);
      }
    );
  }
  loadPageVisitLogs(): void {
    this.http.get<any[]>('https://localhost:5231/api/User/page-visit-logs').subscribe(data => {
        this.pageVisitLogs = data;
    });
}

showMorePageVisitLogs(): void {
    this.visiblePageVisitLogs += 5;
}
  

  clearLogs(): void {
    const dialogRef = this.dialog.open(PasswordDialogComponent);
  
    dialogRef.afterClosed().subscribe(password => {
      if (password) {
        this.validatePasswordAndClearLogs(password);
      } else {
        this.snackBar.open('Log silme işleme iptal edildi', 'Kapat', { duration: 3000 });
      }
    });
  }

  validatePasswordAndClearLogs(password: string): void {
  const payload = { password: password };

  this.http.post('https://localhost:5231/api/User/validate-password', payload).subscribe(
    () => {
      this.http.delete('https://localhost:5231/api/User/delete-all-logs').subscribe(
        () => {
          this.snackBar.open('Tüm loglar başarıyla silindi', 'Kapat', { duration: 3000 });
          this.logLastClearAction();  
        },
        error => {
          console.error('Error clearing logs:', error);
        }
      );
    },
    error => {
      this.snackBar.open('Yanlış şifre', 'Kapat', { duration: 3000 });
    }
  );
  }

  logLastClearAction(): void {
    const clearLog = {
      action: 'Clear All Logs',
      performedBy: 'Admin',
      timestamp: new Date(),
      details: 'All logs cleared by Admin'
    };

    this.http.post('https://localhost:5231/api/User/action-logs', clearLog).subscribe(
      () => {
        this.loadLastClearAction();  
      },
      error => {
        console.error('Error logging clear action:', error);
      }
    );
  }
  loadLastClearAction(): void {
    this.http.get<ActionLog>('https://localhost:5231/api/User/last-clear-action').subscribe(
      (lastAction) => {
        this.lastClearAction = lastAction;
      },
      error => {
        console.error('Error fetching last clear action:', error);
      }
    );
  }

  restoreSelected(): void {
    const selectedUsers = this.logs.filter(log => log.selected).map(log => log.id);
  
    if (selectedUsers.length === 0) {
      this.snackBar.open('Geri yüklemek için başvuru seçilmedi', 'Kapat', {
        duration: 3000,
      });
      return;
    }
  
    if (confirm('Seçili kişileri geri yüklenmek istediğinizden emin misiniz?')) {
      const restoredUserDetails: string[] = [];
  
      selectedUsers.forEach(userId => {
        this.userService.restoreUser(userId).subscribe((user: any) => {
          const userDetail = `${user.userDetails.firstName} ${user.userDetails.lastName}`;
          restoredUserDetails.push(userDetail);
  
          
          this.logs = this.logs.filter(log => log.id !== userId);
  
          
          if (restoredUserDetails.length === selectedUsers.length) {
            this.loggingService.logButtonClick(
              'Seçilenleri geri yükle',
              'Admin',
              `Geri yüklenen başvurular: ${restoredUserDetails.join(', ')}`
            );
            this.snackBar.open('Seçilen kişiler başarıyla geri yüklendi', 'Kapat', {
              duration: 3000,
            });
          }
        }, error => {
          console.error('Error restoring user:', error);
        });
      });
    }
  }

  restoreDeletedData(userId: number): void {
      this.userService.restoreUser(userId).subscribe(
        () => {
          console.log(`Kullanıcı ID ${userId} başarıyla geri yüklendi`);
          this.snackBar.open(`Kullanıcı ID ${userId} başarıyla geri yüklendi`, 'Kapat', {
            duration: 3000,
          });
          this.loadLogs(); 
        },
        error => {
          console.error('Error restoring user:', error);
        }
      );
  }
  deleteAllDeletedUsers(): void {
    if (confirm('Tüm başvuruları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      this.http.delete('https://localhost:5231/api/User/delete-all-deleted-users').subscribe(
        () => {
          this.snackBar.open('All deleted users were permanently removed.', 'Close', {
            duration: 3000,
          });
          this.loggingService.logButtonClick(
            'Tüm başvuruları sil',
            'Admin',
            'Tüm başvurular silindi'
          );
          this.loadLogs();
        },
        error => {
          console.error('Error deleting all deleted users:', error);
        }
      );
    }
  }
  
  deleteSelectedDeletedUsers(): void {
    
    const selectedUserDetails = this.logs
      .filter(log => log.selected)
      .map(log => `${log.userDetails.firstName} ${log.userDetails.lastName}`);
  
    if (selectedUserDetails.length === 0) {
      this.snackBar.open('Silmek için başvuru seçilmedi', 'Kapat', {
        duration: 3000,
      });
      return;
    }
  
    if (confirm('Seçili başvuruları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      
      const selectedUserIds = this.logs.filter(log => log.selected).map(log => log.id);
  
      this.http.post('https://localhost:5231/api/User/delete-selected-deleted-users', selectedUserIds).subscribe(
        () => {
          this.snackBar.open('Seçili başvurular başarıyla silindi', 'Kapat', {
            duration: 3000,
          });
          this.loggingService.logButtonClick(
            'Seçilenleri sil',
            'Admin',
            `Silinen başvurular: ${selectedUserDetails.join(', ')}`
          );
          this.loadLogs(); 
        },
        error => {
          console.error('Error deleting selected deleted users:', error);
        }
      );
    }
  }
}
