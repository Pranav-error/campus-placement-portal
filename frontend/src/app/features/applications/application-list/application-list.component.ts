import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ApplicationStatus, JobApplication } from '../../../core/models/application.model';
import { ApplicationService } from '../../../core/services/application.service';
import { PlacementService } from '../../../core/services/placement.service';
import { AuthService } from '../../../core/services/auth.service';

const STATUSES: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
})
export class ApplicationListComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private placementService = inject(PlacementService);
  auth = inject(AuthService);

  statuses = STATUSES;
  applications = signal<JobApplication[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const studentId = this.auth.currentUser()?.studentId;
    const source = this.auth.isStudent() && studentId
      ? this.applicationService.getByStudent(studentId)
      : this.applicationService.getAll();

    source.subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load applications.');
        this.loading.set(false);
      },
    });
  }

  updateStatus(app: JobApplication, status: ApplicationStatus): void {
    if (!app.id) return;
    this.applicationService.updateStatus(app.id, status).subscribe({
      next: () => this.load(),
      error: (err) => this.message.set(err?.error?.error || 'Could not update status.'),
    });
  }

  recordPlacement(app: JobApplication): void {
    if (!app.id) return;
    const packageLpa = prompt('Package offered (LPA)?');
    if (packageLpa === null) return;

    this.placementService.create({
      applicationId: app.id,
      packageLpa: packageLpa ? Number(packageLpa) : undefined,
      offerDate: new Date().toISOString().slice(0, 10),
    }).subscribe({
      next: () => {
        this.message.set(`Placement recorded for ${app.student.name}.`);
        this.load();
      },
      error: (err) => this.message.set(err?.error?.error || 'Could not record placement.'),
    });
  }

  withdraw(app: JobApplication): void {
    if (!app.id) return;
    if (!confirm('Withdraw this application?')) return;
    this.applicationService.withdraw(app.id).subscribe(() => this.load());
  }
}
