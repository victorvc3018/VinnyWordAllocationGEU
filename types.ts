
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

export interface Submission {
  studentRollNo: string;
  studentName: string;
  videoLink: string;
  submittedAt: string; // ISO string
}

export interface StudentRecord {
  rollNo: string;
  name: string;
}

// Added back to resolve build errors from leftover components
export interface Word {
  id: number;
  text: string;
  category: string;
  takenBy?: User;
}
