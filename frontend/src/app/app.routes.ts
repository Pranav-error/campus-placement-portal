import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { StudentListComponent } from './features/students/student-list/student-list.component';
import { StudentFormComponent } from './features/students/student-form/student-form.component';
import { ComingSoonComponent } from './shared/components/coming-soon/coming-soon.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'students', component: StudentListComponent },
  { path: 'students/new', component: StudentFormComponent },
  { path: 'students/:id/edit', component: StudentFormComponent },
  { path: 'companies', component: ComingSoonComponent, data: { title: 'Companies' } },
  { path: 'jobs', component: ComingSoonComponent, data: { title: 'Jobs' } },
  { path: 'applications', component: ComingSoonComponent, data: { title: 'Applications' } },
];
