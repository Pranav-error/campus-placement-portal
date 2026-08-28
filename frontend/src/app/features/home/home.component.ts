import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NoticeService } from '../../core/services/notice.service';
import { Notice } from '../../core/models/notice.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  private noticeService = inject(NoticeService);
  apiStatus = signal<string>('checking...');
  latestNotices = signal<Notice[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ status: string; service: string }>(`${environment.apiBaseUrl}/health`).subscribe({
      next: (res) => this.apiStatus.set(`${res.status} (${res.service})`),
      error: () => this.apiStatus.set('unreachable'),
    });

    this.noticeService.getAll().subscribe({
      next: (notices) => this.latestNotices.set(notices.slice(0, 3)),
      error: () => this.latestNotices.set([]),
    });
  }
}
