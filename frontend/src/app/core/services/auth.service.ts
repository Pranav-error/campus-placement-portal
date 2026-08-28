import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../models/auth.model';

const API_BASE = 'http://localhost:8080/api/auth';
const STORAGE_KEY = 'cpp_auth';

interface StoredAuth {
  token: string;
  email: string;
  role: Role;
  studentId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private state = signal<StoredAuth | null>(this.readStorage());

  currentUser = computed(() => this.state());
  isLoggedIn = computed(() => this.state() !== null);
  isTpo = computed(() => this.state()?.role === 'TPO');
  isStudent = computed(() => this.state()?.role === 'STUDENT');

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/register`, request).pipe(
      tap((res) => this.persist(res))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/login`, request).pipe(
      tap((res) => this.persist(res))
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state.set(null);
  }

  getToken(): string | null {
    return this.state()?.token ?? null;
  }

  private persist(res: AuthResponse): void {
    const stored: StoredAuth = {
      token: res.token,
      email: res.email,
      role: res.role,
      studentId: res.studentId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    this.state.set(stored);
  }

  private readStorage(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredAuth) : null;
    } catch {
      return null;
    }
  }
}
