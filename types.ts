export enum Role {
  Student = 'student',
  CR = 'cr',
}

export interface User {
  id: string; // Student ID
  name: string;
  role: Role;
}

export type Category = 'Politics' | 'Music' | 'Science' | 'Philosophy';

export interface Word {
  id: number;
  text: string;
  category: Category;
  takenBy?: {
    id: string; // Student ID
    name: string;
  };
}
