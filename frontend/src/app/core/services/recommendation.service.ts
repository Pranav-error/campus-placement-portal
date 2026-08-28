import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JobRecommendation } from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  constructor(private http: HttpClient) {}

  getFor(studentId: number, limit = 5): Observable<JobRecommendation[]> {
    return this.http.get<JobRecommendation[]>(
      `http://localhost:8080/api/students/${studentId}/recommendations`,
      { params: { limit } }
    );
  }
}
