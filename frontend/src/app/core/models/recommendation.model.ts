import { Job } from './job.model';

export interface JobRecommendation {
  job: Job;
  matchScore: number;
  eligible: boolean;
}
