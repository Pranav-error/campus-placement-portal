import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Company } from '../../../core/models/company.model';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private confirmService = inject(ConfirmService);
  private notify = inject(NotificationService);
  auth = inject(AuthService);

  companies = signal<Company[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.companyService.getAll().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load companies.');
        this.loading.set(false);
      },
    });
  }

  async remove(id: number | undefined, name?: string): Promise<void> {
    if (!id) return;
    const ok = await this.confirmService.ask({
      title: 'Delete company',
      message: `Delete ${name || 'this company'}? This will fail if it still has job postings — delete those first.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.companyService.delete(id).subscribe({
      next: () => {
        this.notify.success(`${name || 'Company'} deleted.`);
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not delete company.'),
    });
  }
}
