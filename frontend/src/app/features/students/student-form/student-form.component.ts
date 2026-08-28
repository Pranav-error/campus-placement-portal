import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  studentId: number | null = null;
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    rollNumber: [''],
    branch: [''],
    graduationYear: [null as number | null],
    cgpa: [null as number | null, [Validators.min(0), Validators.max(10)]],
    backlogs: [0, [Validators.min(0)]],
    skills: [''], // comma-separated in the UI
    resumeUrl: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.studentId = Number(idParam);
      this.studentService.getById(this.studentId).subscribe((s) => {
        this.form.patchValue({
          ...s,
          skills: (s.skills || []).join(', '),
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: Student = {
      name: raw.name,
      email: raw.email,
      phone: raw.phone || undefined,
      rollNumber: raw.rollNumber || undefined,
      branch: raw.branch || undefined,
      resumeUrl: raw.resumeUrl || undefined,
      graduationYear: raw.graduationYear ?? undefined,
      cgpa: raw.cgpa ?? undefined,
      backlogs: raw.backlogs ?? 0,
      skills: (raw.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    };

    this.saving.set(true);
    this.error.set(null);

    const req = this.studentId
      ? this.studentService.update(this.studentId, payload)
      : this.studentService.create(payload);

    req.subscribe({
      next: () => this.router.navigate(['/students']),
      error: (err) => {
        this.error.set(err?.error?.error || 'Could not save student.');
        this.saving.set(false);
      },
    });
  }
}
