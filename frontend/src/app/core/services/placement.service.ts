import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Placement } from '../models/placement.model';
import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiBaseUrl}/placements`;

@Injectable({ providedIn: 'root' })
export class PlacementService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Placement[]> {
    return this.http.get<Placement[]>(API_BASE);
  }

  create(placement: { applicationId: number; packageLpa?: number; offerDate?: string; joiningDate?: string }): Observable<Placement> {
    return this.http.post<Placement>(API_BASE, placement);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
