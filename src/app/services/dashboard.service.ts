import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://localhost:5231/api/User'; 

  constructor(private http: HttpClient) { }

  getApplicationsToday(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/applications/today`);
  }

  getApplicationsThisWeek(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/applications/this-week`);
  }

  getPageVisitsToday(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/page-visits/today`);
  }

  getPageVisitsThisWeek(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/page-visits/this-week`);
  }

  getPopularApplicationTime(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/applications/popular-time`);
  }

  getBusiestDay(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/applications/busiest-day`);
  }
}
