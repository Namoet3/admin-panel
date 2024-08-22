// import { Injectable } from '@angular/core';

// export interface LogEntry {
//   action: string;
//   user: string;
//   timestamp: Date;
//   data?: any; 
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class LoggingService {
//   private logs: LogEntry[] = [];
//   private deletedData: any[] = [];

//   logAction(action: string, user: string, data?: any): void {
//     const logEntry: LogEntry = {
//         action,
//         user,
//         timestamp: new Date(),
//         data
//     };
//     this.logs.push(logEntry);
//     console.log('Log Action Called:', logEntry); // Check that this is actually called
//     if (action === 'Deleted') {
//         this.deletedData.push(data);
//     }
//     console.log('Current logs array:', this.logs);
//     console.log('Current deleted data array:', this.deletedData);
// }

//   getLogs(): LogEntry[] {
//     return [...this.logs]; // Return a copy of the logs array
//   }

//   getDeletedData(): any[] {
//     return [...this.deletedData]; // Return a copy of the deleted data array
//   }

//   clearLogs(): void {
//     this.logs = [];
//     this.deletedData = [];
//   }

//   restoreData(id: number): any | null {
//     const dataToRestore = this.deletedData.find(data => data.id === id);
//     if (dataToRestore) {
//       this.deletedData = this.deletedData.filter(data => data.id !== id);
//       return dataToRestore;
//     }
//     return null;
//   }
// }
// log.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private apiUrl = 'https://localhost:5231/api/User/deleted-users'; 
  private actionLogApiUrl = 'https://localhost:5231/api/User/action-logs';

  constructor(private http: HttpClient) {}

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // logAction(action: string, user: string, data?: any): void {
  //   const logEntry = {
  //     action,
  //     user,
  //     timestamp: new Date(),
  //     data
  //   };

  //   
  //   this.http.post(`${this.apiUrl}`, logEntry).subscribe({
  //     next: () => console.log('Log saved successfully'),
  //     error: (err) => console.error('Error saving log:', err)
  //   });
  // }
  logButtonClick(action: string, performedBy: string, details?: string): void {
    if (!action || !performedBy) {
      console.error('Action or PerformedBy is missing.');
      return;
    }
  
    const actionLog = {
      action,
      performedBy,
      timestamp: new Date(),
      details: details || ''
    };
  
    this.http.post(`${this.actionLogApiUrl}`, actionLog).subscribe({
      next: () => console.log('Action log saved successfully'),
      error: (err) => {
        console.error('Error saving action log:', err);
        console.error('Error details:', err.message);
      }
    });
  }
  

  getActionLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.actionLogApiUrl}`);
  }

}
