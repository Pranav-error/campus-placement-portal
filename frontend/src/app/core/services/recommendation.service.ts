import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JobRecommendation } from '../models/recommendation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  constructor(private http: HttpClient) {}

  getFor(studentId: number, limit = 5): Observable<JobRecommendation[]> {
    return this.http.get<JobRecommendation[]>(
      `${environment.apiBaseUrl}/students/${studentId}/recommendations`,
      { params: { limit } }
    );
  }
}
