export interface Student {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  backlogs?: number;
  skills?: string[];
  resumeUrl?: string;
}
