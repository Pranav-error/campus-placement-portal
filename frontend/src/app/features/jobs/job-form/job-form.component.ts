import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { JobService } from '../../../core/services/job.service';
import { CompanyService } from '../../../core/services/company.service';
import { Company } from '../../../core/models/company.model';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss',
})
export class JobFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  jobId: number | null = null;
  saving = signal(false);
  error = signal<string | null>(null);
  companies = signal<Company[]>([]);

  form = this.fb.nonNullable.group({
    companyId: [null as number | null, Validators.required],
    title: ['', Validators.required],
    description: [''],
    location: [''],
    ctcLpa: [null as number | null],
    openings: [1, [Validators.min(1)]],
    applicationDeadline: [''],
    minCgpa: [null as number | null, [Validators.min(0), Validators.max(10)]],
    maxBacklogs: [null as number | null, [Validators.min(0)]],
    eligibleBranches: [''], // comma-separated
    eligibleGraduationYear: [null as number | null],
    requiredSkills: [''], // comma-separated
  });

  ngOnInit(): void {
    this.companyService.getAll().subscribe((companies) => this.companies.set(companies));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.jobId = Number(idParam);
      this.jobService.getById(this.jobId).subscribe((job) => {
        this.form.patchValue({
          ...job,
          companyId: job.company?.id ?? job.companyId ?? null,
          eligibleBranches: (job.eligibleBranches || []).join(', '),
          requiredSkills: (job.requiredSkills || []).join(', '),
        });
      });
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

    const raw = this.form.getRawValue();
    const payload: Job = {
      companyId: raw.companyId!,
      title: raw.title,
      description: raw.description || undefined,
      location: raw.location || undefined,
      ctcLpa: raw.ctcLpa ?? undefined,
      openings: raw.openings ?? 1,
      applicationDeadline: raw.applicationDeadline || undefined,
      minCgpa: raw.minCgpa ?? undefined,
      maxBacklogs: raw.maxBacklogs ?? undefined,
      eligibleBranches: (raw.eligibleBranches || '').split(',').map((s) => s.trim()).filter(Boolean),
      eligibleGraduationYear: raw.eligibleGraduationYear ?? undefined,
      requiredSkills: (raw.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
    };

    this.saving.set(true);
    this.error.set(null);

    const req = this.jobId ? this.jobService.update(this.jobId, payload) : this.jobService.create(payload);

    req.subscribe({
      next: () => this.router.navigate(['/jobs']),
      error: (err) => {
        this.error.set(err?.error?.error || 'Could not save job.');
        this.saving.set(false);
      },
    });
  }
}
