import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardStats } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiBaseUrl}/dashboard`;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_BASE}/stats`);
  }
}
