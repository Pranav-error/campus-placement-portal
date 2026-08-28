export interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  totalPlacements: number;
  applicationsByStatus: Record<string, number>;
}
