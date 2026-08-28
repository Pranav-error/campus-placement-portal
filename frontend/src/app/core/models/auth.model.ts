export type Role = 'STUDENT' | 'TPO';

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  studentId?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  studentId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}
