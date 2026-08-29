import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Job } from '../../../core/models/job.model';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private confirmService = inject(ConfirmService);
  private notify = inject(NotificationService);
  auth = inject(AuthService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  appliedJobIds = signal<Set<number>>(new Set());

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

    this.applicationService.apply({ studentId, jobId: job.id }).subscribe({
      next: () => {
        this.notify.success(`Applied to ${job.title}.`);
        this.loadAppliedState();
      },
      error: (err) => {
        this.notify.error(err?.error?.error || 'Could not apply.');
      },
    });
  }

  async remove(id: number | undefined, title?: string): Promise<void> {
    if (!id) return;
    const ok = await this.confirmService.ask({
      title: 'Delete job posting',
      message: `Delete ${title || 'this job'}? This will fail if students have already applied — withdraw those applications first.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.jobService.delete(id).subscribe({
      next: () => {
        this.notify.success(`${title || 'Job'} deleted.`);
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not delete job.'),
    });
  }
}
