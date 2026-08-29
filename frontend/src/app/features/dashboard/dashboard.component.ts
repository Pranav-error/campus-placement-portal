import { Component, OnInit, inject, signal } from '@angular/core';

import { DashboardStats } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  statusOrder = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load dashboard stats.');
        this.loading.set(false);
      },
    });
  }

  maxStatusCount(): number {
    const stats = this.stats();
    if (!stats) return 1;
    return Math.max(1, ...Object.values(stats.applicationsByStatus));
  }
}
