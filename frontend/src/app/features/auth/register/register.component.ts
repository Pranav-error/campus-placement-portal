import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../core/models/student.model';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../auth-form.scss',
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private studentService = inject(StudentService);
  private router = inject(Router);

  saving = signal(false);
  error = signal<string | null>(null);
  students = signal<Student[]>([]);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['STUDENT' as Role, Validators.required],
    studentId: [null as number | null],
  });

  ngOnInit(): void {
    this.studentService.getAll().subscribe((students) => this.students.set(students));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    this.auth.register({
      email: raw.email,
      password: raw.password,
      role: raw.role,
      studentId: raw.role === 'STUDENT' && raw.studentId ? raw.studentId : undefined,
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.error || 'Registration failed.');
        this.saving.set(false);
      },
    });
  }
}
