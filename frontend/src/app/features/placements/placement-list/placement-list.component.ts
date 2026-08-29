import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Placement } from '../../../core/models/placement.model';
import { PlacementService } from '../../../core/services/placement.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-placement-list',
  standalone: true,
  imports: [DatePipe, LoadingSpinnerComponent],
  templateUrl: './placement-list.component.html',
  styleUrl: './placement-list.component.scss',
})
export class PlacementListComponent implements OnInit {
  private placementService = inject(PlacementService);
  private confirmService = inject(ConfirmService);
  private notify = inject(NotificationService);
  auth = inject(AuthService);

  placements = signal<Placement[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.placementService.getAll().subscribe({
      next: (placements) => {
        this.placements.set(placements);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load placements.');
        this.loading.set(false);
      },
    });
  }

  async remove(id: number | undefined, name?: string): Promise<void> {
    if (!id) return;
    const ok = await this.confirmService.ask({
      title: 'Delete placement record',
      message: `Delete the placement record${name ? ' for ' + name : ''}?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.placementService.delete(id).subscribe({
      next: () => {
        this.notify.success('Placement record deleted.');
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not delete placement.'),
    });
  }
}
