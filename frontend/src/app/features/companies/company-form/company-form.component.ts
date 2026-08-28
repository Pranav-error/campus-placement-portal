import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CompanyService } from '../../../core/services/company.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.scss',
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  companyId: number | null = null;
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    industry: [''],
    website: [''],
    contactEmail: ['', Validators.email],
    description: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.companyId = Number(idParam);
      this.companyService.getById(this.companyId).subscribe((c) => this.form.patchValue(c));
    }
  }

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

    const payload = this.form.getRawValue();
    const req = this.companyId
      ? this.companyService.update(this.companyId, payload)
      : this.companyService.create(payload);

    req.subscribe({
      next: () => this.router.navigate(['/companies']),
      error: (err) => {
        this.error.set(err?.error?.error || 'Could not save company.');
        this.saving.set(false);
      },
    });
  }
}
