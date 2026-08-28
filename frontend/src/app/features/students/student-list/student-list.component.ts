import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Student } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit {
  students = signal<Student[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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

  remove(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Delete this student?')) return;
    this.studentService.delete(id).subscribe(() => this.load());
  }
}
