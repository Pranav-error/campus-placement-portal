import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Company } from '../../../core/models/company.model';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
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

  remove(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Delete this company?')) return;
    this.companyService.delete(id).subscribe(() => this.load());
  }
}
