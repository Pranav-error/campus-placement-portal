import { Student } from './student.model';
import { Job } from './job.model';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED';

export interface JobApplication {
  id?: number;
  student: Student;
  job: Job;
  status: ApplicationStatus;
  appliedAt?: string;
  updatedAt?: string;
}

export interface ApplicationRequest {
  studentId: number;
  jobId: number;
}
