
export enum Role {
  Student = 'student',
  CR = 'cr',
}

export interface User {
  id: string; // Student ID
  name: string;
  rollNo: string;
  role: Role;
}

// FIX: Added missing Word interface.
export interface Word {
  id: number;
  text: string;
  category: string;
  takenBy?: User;
}

export interface Submission {
  studentRollNo: string;
  studentName: string;
  videoLink: string;
  submittedAt: string; // ISO string
}
