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

// This interface defines the structure of our single document in Firestore
export interface AppData {
  submissions: Submission[];
  studentList: StudentRecord[];
  isLocked: boolean;
}
