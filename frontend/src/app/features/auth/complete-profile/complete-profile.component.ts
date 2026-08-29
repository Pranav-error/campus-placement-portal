import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrl: '../auth-form.scss',
})
export class CompleteProfileComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    branch: [''],
    rollNumber: [''],
  });

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.auth.completeProfile(this.form.getRawValue()).subscribe({
      next: () => {
        this.notify.success('Profile created — welcome!');
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Could not complete profile.');
        this.saving.set(false);
      },
    });
  }
}
