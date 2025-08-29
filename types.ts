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

export type Category = string;

export interface Word {
  id: number;
  text: string;
  category: Category;
  takenBy?: {
    id: string; // Student ID
    name: string;
    rollNo: string;
  };
}
