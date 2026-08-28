import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationRequest, ApplicationStatus, JobApplication } from '../models/application.model';
import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiBaseUrl}/applications`;

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(API_BASE);
  }

  getByStudent(studentId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(API_BASE, { params: { studentId } });
  }

  getByJob(jobId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(API_BASE, { params: { jobId } });
  }

  apply(request: ApplicationRequest): Observable<JobApplication> {
    return this.http.post<JobApplication>(API_BASE, request);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${API_BASE}/${id}/status`, { status });
  }

  withdraw(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
