export enum AppStep {
  SETUP = 'SETUP',
  CAPTURE = 'CAPTURE',
  VERIFY = 'VERIFY',
  RESULT = 'RESULT'
}

export interface Student {
  id: string;
  name: string;
  phone: string;
}

export interface AttendanceData {
  classStudents: Student[];
  presentees: string[]; // IDs of present students
  absentees: Student[]; 
  image: string | null;
}

export interface ExtractedData {
  rollNumbers: string[];
}