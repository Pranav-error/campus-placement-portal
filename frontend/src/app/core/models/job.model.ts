import { Company } from './company.model';

export interface Job {
  id?: number;
  companyId?: number;
  company?: Company;
  title: string;
  description?: string;
  location?: string;
  ctcLpa?: number;
  openings?: number;
  applicationDeadline?: string; // ISO date
  minCgpa?: number;
  maxBacklogs?: number;
  eligibleBranches?: string[];
  eligibleGraduationYear?: number;
  requiredSkills?: string[];
}
