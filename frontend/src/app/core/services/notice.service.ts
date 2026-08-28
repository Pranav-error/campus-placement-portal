import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Notice } from '../models/notice.model';
import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiBaseUrl}/notices`;

@Injectable({ providedIn: 'root' })
export class NoticeService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Notice[]> {
    return this.http.get<Notice[]>(API_BASE);
  }

  create(notice: Notice): Observable<Notice> {
    return this.http.post<Notice>(API_BASE, notice);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
