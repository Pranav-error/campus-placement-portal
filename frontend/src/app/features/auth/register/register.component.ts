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
    name: [''],
  });

  ngOnInit(): void {
    this.studentService.getAll().subscribe((students) => this.students.set(students));

    this.form.get('studentId')!.valueChanges.subscribe((studentId) => {
      const nameControl = this.form.get('name')!;
      if (this.form.get('role')!.value === 'STUDENT' && !studentId) {
        nameControl.setValidators(Validators.required);
      } else {
        nameControl.clearValidators();
      }
      nameControl.updateValueAndValidity();
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    // Re-check name requirement in case role/studentId changed without a studentId valueChanges tick.
    const nameControl = this.form.get('name')!;
    if (this.form.get('role')!.value === 'STUDENT' && !this.form.get('studentId')!.value) {
      nameControl.setValidators(Validators.required);
      nameControl.updateValueAndValidity();
    }

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
      name: raw.role === 'STUDENT' && !raw.studentId ? raw.name : undefined,
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.error || 'Registration failed.');
        this.saving.set(false);
      },
    });
  }
}
