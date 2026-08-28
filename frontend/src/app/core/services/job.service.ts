import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Job } from '../models/job.model';

const API_BASE = 'http://localhost:8080/api/jobs';

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Job[]> {
    return this.http.get<Job[]>(API_BASE);
  }

  getById(id: number): Observable<Job> {
    return this.http.get<Job>(`${API_BASE}/${id}`);
  }

  create(job: Job): Observable<Job> {
    return this.http.post<Job>(API_BASE, job);
  }

  update(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${API_BASE}/${id}`, job);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
