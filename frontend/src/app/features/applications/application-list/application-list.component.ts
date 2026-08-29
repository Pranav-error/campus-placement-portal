import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { ApplicationStatus, JobApplication } from '../../../core/models/application.model';
import { ApplicationService } from '../../../core/services/application.service';
import { PlacementService } from '../../../core/services/placement.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RecordPlacementDialogComponent, RecordPlacementResult } from './record-placement-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const STATUSES: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [DatePipe, LoadingSpinnerComponent],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
})
export class ApplicationListComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private placementService = inject(PlacementService);
  private confirmService = inject(ConfirmService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  auth = inject(AuthService);

  statuses = STATUSES;
  applications = signal<JobApplication[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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
      next: () => {
        this.notify.success(`${app.student.name}'s application marked ${status}.`);
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not update status.'),
    });
  }

  async recordPlacement(app: JobApplication): Promise<void> {
    if (!app.id) return;

    const ref = this.dialog.open(RecordPlacementDialogComponent, {
      data: { studentName: app.student.name, jobTitle: app.job.title },
      width: '400px',
    });
    const result = await firstValueFrom(ref.afterClosed()) as RecordPlacementResult | null;
    if (!result) return;

    this.placementService.create({
      applicationId: app.id,
      packageLpa: result.packageLpa,
      offerDate: result.offerDate,
    }).subscribe({
      next: () => {
        this.notify.success(`Placement recorded for ${app.student.name}.`);
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not record placement.'),
    });
  }

  async withdraw(app: JobApplication): Promise<void> {
    if (!app.id) return;
    const ok = await this.confirmService.ask({
      title: 'Withdraw application',
      message: `Withdraw ${app.student.name}'s application to ${app.job.title}?`,
      confirmLabel: 'Withdraw',
      danger: true,
    });
    if (!ok) return;

    this.applicationService.withdraw(app.id).subscribe({
      next: () => {
        this.notify.success('Application withdrawn.');
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not withdraw application.'),
    });
  }
}
