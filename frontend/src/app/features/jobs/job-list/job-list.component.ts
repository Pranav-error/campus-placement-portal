import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Job } from '../../../core/models/job.model';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  auth = inject(AuthService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  appliedJobIds = signal<Set<number>>(new Set());
  applyMessage = signal<string | null>(null);

  search = signal('');
  onlyEligibleBranch = signal('');

  branches = computed(() => {
    const set = new Set<string>();
    for (const j of this.jobs()) {
      (j.eligibleBranches || []).forEach((b) => set.add(b));
    }
    return Array.from(set).sort();
  });

  filteredJobs = computed(() => {
    const term = this.search().trim().toLowerCase();
    const branch = this.onlyEligibleBranch();
    return this.jobs().filter((j) => {
      const matchesTerm = !term
        || j.title.toLowerCase().includes(term)
        || (j.company?.name || '').toLowerCase().includes(term)
        || (j.requiredSkills || []).some((s) => s.toLowerCase().includes(term));
      const matchesBranch = !branch || (j.eligibleBranches || []).includes(branch);
      return matchesTerm && matchesBranch;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.jobService.getAll().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
        this.loadAppliedState();
      },
      error: () => {
        this.error.set('Could not load jobs.');
        this.loading.set(false);
      },
    });
  }

  private loadAppliedState(): void {
    const studentId = this.auth.currentUser()?.studentId;
    if (!studentId) return;

    this.applicationService.getByStudent(studentId).subscribe((apps) => {
      this.appliedJobIds.set(new Set(apps.map((a) => a.job.id!)));
    });
  }

  apply(job: Job): void {
    const studentId = this.auth.currentUser()?.studentId;
    if (!studentId || !job.id) return;

    this.applyMessage.set(null);
    this.applicationService.apply({ studentId, jobId: job.id }).subscribe({
      next: () => {
        this.applyMessage.set(`Applied to ${job.title}.`);
        this.loadAppliedState();
      },
      error: (err) => {
        this.applyMessage.set(err?.error?.error || 'Could not apply.');
      },
    });
  }

  remove(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Delete this job posting?')) return;
    this.jobService.delete(id).subscribe(() => this.load());
  }
}
