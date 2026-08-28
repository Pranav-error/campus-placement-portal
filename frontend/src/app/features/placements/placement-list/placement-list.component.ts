import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Placement } from '../../../core/models/placement.model';
import { PlacementService } from '../../../core/services/placement.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-placement-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './placement-list.component.html',
  styleUrl: './placement-list.component.scss',
})
export class PlacementListComponent implements OnInit {
  private placementService = inject(PlacementService);
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

  remove(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Delete this placement record?')) return;
    this.placementService.delete(id).subscribe(() => this.load());
  }
}
