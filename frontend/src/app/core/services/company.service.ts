import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Company } from '../models/company.model';
import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiBaseUrl}/companies`;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(API_BASE);
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${API_BASE}/${id}`);
  }

  create(company: Company): Observable<Company> {
    return this.http.post<Company>(API_BASE, company);
  }

  update(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${API_BASE}/${id}`, company);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
