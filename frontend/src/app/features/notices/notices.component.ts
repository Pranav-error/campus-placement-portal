import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Notice } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.scss',
})
export class NoticesComponent implements OnInit {
  private noticeService = inject(NoticeService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  notices = signal<Notice[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showForm = signal(false);
  posting = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    body: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.noticeService.getAll().subscribe({
      next: (notices) => {
        this.notices.set(notices);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load notices.');
        this.loading.set(false);
      },
    });
  }

  post(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.posting.set(true);
    this.noticeService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.showForm.set(false);
        this.posting.set(false);
        this.load();
      },
      error: () => this.posting.set(false),
    });
  }

  remove(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Delete this notice?')) return;
    this.noticeService.delete(id).subscribe(() => this.load());
  }
}
