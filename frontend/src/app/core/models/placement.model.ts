import { JobApplication } from './application.model';

export interface Placement {
  id?: number;
  application: JobApplication;
  applicationId?: number; // used only when creating
  packageLpa?: number;
  offerDate?: string;
  joiningDate?: string;
}
