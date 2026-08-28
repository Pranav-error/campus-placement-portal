import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { StudentListComponent } from './features/students/student-list/student-list.component';
import { StudentFormComponent } from './features/students/student-form/student-form.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'students', component: StudentListComponent },
  { path: 'students/new', component: StudentFormComponent },
  { path: 'students/:id/edit', component: StudentFormComponent },
];
