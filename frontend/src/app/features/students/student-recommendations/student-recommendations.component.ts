import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { JobRecommendation } from '../../../core/models/recommendation.model';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Student } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-recommendations',
  standalone: true,
  imports: [RouterLink, DecimalPipe, LoadingSpinnerComponent],
  templateUrl: './student-recommendations.component.html',
  styleUrl: './student-recommendations.component.scss',
})
export class StudentRecommendationsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recommendationService = inject(RecommendationService);
  private studentService = inject(StudentService);

  student = signal<Student | null>(null);
  recommendations = signal<JobRecommendation[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const studentId = Number(this.route.snapshot.paramMap.get('id'));
    if (!studentId) return;

    this.studentService.getById(studentId).subscribe((s) => this.student.set(s));

    this.recommendationService.getFor(studentId, 10).subscribe({
      next: (recs) => {
        this.recommendations.set(recs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load recommendations.');
        this.loading.set(false);
      },
    });
  }
}
