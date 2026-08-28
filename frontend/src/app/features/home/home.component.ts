import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  apiStatus = signal<string>('checking...');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ status: string; service: string }>('http://localhost:8080/api/health').subscribe({
      next: (res) => this.apiStatus.set(`${res.status} (${res.service})`),
      error: () => this.apiStatus.set('unreachable'),
    });
  }
}
