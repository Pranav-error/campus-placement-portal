import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Student } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit {
  auth = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private notify = inject(NotificationService);
  students = signal<Student[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  branchFilter = signal('');

  branches = computed(() => {
    const set = new Set((this.students() || []).map((s) => s.branch).filter((b): b is string => !!b));
    return Array.from(set).sort();
  });

  filteredStudents = computed(() => {
    const term = this.search().trim().toLowerCase();
    const branch = this.branchFilter();
    return this.students().filter((s) => {
      const matchesTerm = !term
        || s.name.toLowerCase().includes(term)
        || s.email.toLowerCase().includes(term)
        || (s.skills || []).some((sk) => sk.toLowerCase().includes(term));
      const matchesBranch = !branch || s.branch === branch;
      return matchesTerm && matchesBranch;
    });
  });

  importing = signal(false);
  importResult = signal<{ imported: number; skipped: number; errors: string[] } | null>(null);

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load students. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  async remove(id: number | undefined, name?: string): Promise<void> {
    if (!id) return;
    const ok = await this.confirmService.ask({
      title: 'Delete student',
      message: `Delete ${name || 'this student'}? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.studentService.delete(id).subscribe({
      next: () => {
        this.notify.success(`${name || 'Student'} deleted.`);
        this.load();
      },
      error: (err) => this.notify.error(err?.error?.error || 'Could not delete student.'),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing.set(true);
    this.importResult.set(null);
    this.studentService.bulkImport(file).subscribe({
      next: (result) => {
        this.importResult.set(result);
        this.importing.set(false);
        this.load();
        input.value = '';
        if (result.imported > 0) {
          this.notify.success(`Imported ${result.imported} student${result.imported === 1 ? '' : 's'}.`);
        }
      },
      error: () => {
        this.importResult.set({ imported: 0, skipped: 0, errors: ['Import failed. Check the file format.'] });
        this.importing.set(false);
        this.notify.error('Import failed. Check the file format.');
        input.value = '';
      },
    });
  }
}
