import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Student } from '../models/student.model';

const API_BASE = 'http://localhost:8080/api/students';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(API_BASE);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${API_BASE}/${id}`);
  }

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(API_BASE, student);
  }

  update(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${API_BASE}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/${id}`);
  }
}
