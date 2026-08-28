import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { StudentListComponent } from './features/students/student-list/student-list.component';
import { StudentFormComponent } from './features/students/student-form/student-form.component';
import { StudentRecommendationsComponent } from './features/students/student-recommendations/student-recommendations.component';
import { CompanyListComponent } from './features/companies/company-list/company-list.component';
import { CompanyFormComponent } from './features/companies/company-form/company-form.component';
import { JobListComponent } from './features/jobs/job-list/job-list.component';
import { JobFormComponent } from './features/jobs/job-form/job-form.component';
import { ApplicationListComponent } from './features/applications/application-list/application-list.component';
import { PlacementListComponent } from './features/placements/placement-list/placement-list.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NoticesComponent } from './features/notices/notices.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { tpoGuard } from './core/guards/tpo.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'students', component: StudentListComponent },
  { path: 'students/new', component: StudentFormComponent, canActivate: [tpoGuard] },
  { path: 'students/:id/edit', component: StudentFormComponent, canActivate: [tpoGuard] },
  { path: 'students/:id/recommendations', component: StudentRecommendationsComponent },

  { path: 'companies', component: CompanyListComponent },
  { path: 'companies/new', component: CompanyFormComponent, canActivate: [tpoGuard] },
  { path: 'companies/:id/edit', component: CompanyFormComponent, canActivate: [tpoGuard] },

  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/new', component: JobFormComponent, canActivate: [tpoGuard] },
  { path: 'jobs/:id/edit', component: JobFormComponent, canActivate: [tpoGuard] },

  { path: 'applications', component: ApplicationListComponent, canActivate: [authGuard] },
  { path: 'placements', component: PlacementListComponent },
  { path: 'notices', component: NoticesComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [tpoGuard] },
];
